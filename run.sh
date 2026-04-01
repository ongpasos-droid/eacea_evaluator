#!/bin/bash
# =============================================================================
# EACEA Evaluator - Cascade Orchestrator
# =============================================================================
# This script runs Claude Code tasks sequentially, tracks progress,
# handles credit exhaustion, and auto-resumes after cooldown.
#
# Usage:
#   ./run.sh              # Start from beginning or resume from last checkpoint
#   ./run.sh --from 015   # Start from cascade 015
#   ./run.sh --retry      # Retry the last failed cascade
#   ./run.sh --status     # Show current progress
#   ./run.sh --reset      # Reset progress (CAREFUL!)
# =============================================================================

set -euo pipefail

# === CONFIGURATION ===
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CASCADES_DIR="$PROJECT_DIR/cascades"
STATE_FILE="$PROJECT_DIR/.cascade_state"
LOG_FILE="$PROJECT_DIR/cascade.log"
PROGRESS_FILE="$PROJECT_DIR/PROGRESS.md"
COOLDOWN_HOURS=4
MAX_RETRIES=2
TIMEOUT_SECONDS=180  # 3 minutes per cascade

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# === LOGGING ===
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${CYAN}[$timestamp]${NC} $1"
  echo "[$timestamp] $(echo "$1" | sed 's/\x1b\[[0-9;]*m//g')" >> "$LOG_FILE"
}

log_success() { log "${GREEN}OK${NC} $1"; }
log_warning() { log "${YELLOW}WARN${NC} $1"; }
log_error() { log "${RED}ERROR${NC} $1"; }

# === STATE MANAGEMENT ===
save_state() {
  local cascade_id="$1"
  local status="$2"  # running, completed, failed, credit_exhausted
  local retries="${3:-0}"
  cat > "$STATE_FILE" << EOF
CURRENT_CASCADE=$cascade_id
STATUS=$status
RETRIES=$retries
TIMESTAMP=$(date -Iseconds)
LAST_COMPLETED=$(get_last_completed)
EOF
}

get_state() {
  if [[ -f "$STATE_FILE" ]]; then
    source "$STATE_FILE"
    echo "$CURRENT_CASCADE|$STATUS|$RETRIES|$LAST_COMPLETED"
  else
    echo "000|fresh|0|none"
  fi
}

get_last_completed() {
  if [[ -f "$STATE_FILE" ]]; then
    source "$STATE_FILE"
    if [[ "$STATUS" == "completed" ]]; then
      echo "$CURRENT_CASCADE"
    else
      echo "${LAST_COMPLETED:-none}"
    fi
  else
    echo "none"
  fi
}

# === CASCADE DISCOVERY ===
get_cascade_files() {
  find "$CASCADES_DIR" -name "*.md" -type f | sort
}

get_cascade_id() {
  basename "$1" .md
}

get_next_cascade() {
  local current="$1"
  local found_current=false

  for file in $(get_cascade_files); do
    local id=$(get_cascade_id "$file")
    if [[ "$found_current" == true ]]; then
      echo "$file"
      return 0
    fi
    if [[ "$id" == "$current" ]]; then
      found_current=true
    fi
  done

  # If current is "000" or "none", return the first cascade
  if [[ "$current" == "000" || "$current" == "none" ]]; then
    get_cascade_files | head -1
    return 0
  fi

  echo ""  # No more cascades
}

# === CREDIT EXHAUSTION DETECTION ===
is_credit_error() {
  local output="$1"
  # Check for common credit/rate limit error patterns
  if echo "$output" | grep -qiE "(rate.?limit|credit|quota|exceeded|billing|overloaded|capacity|529|503)"; then
    return 0  # Is a credit error
  fi
  return 1  # Not a credit error
}

# === COOLDOWN & AUTO-RESUME ===
schedule_resume() {
  local hours="$COOLDOWN_HOURS"
  local resume_time=$(date -d "+${hours} hours" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -v+${hours}H '+%Y-%m-%d %H:%M:%S')

  log_warning "Credits exhausted. Scheduling resume in ${hours} hours (at $resume_time)"

  # Create a one-shot systemd timer or use at command
  if command -v at &> /dev/null; then
    echo "cd $PROJECT_DIR && ./run.sh --retry >> $LOG_FILE 2>&1" | at now + ${hours} hours 2>/dev/null || true
    log "Scheduled resume via 'at' command"
  else
    # Fallback: simple sleep loop in background
    log "Using sleep fallback for resume (${hours}h = $((hours * 3600))s)"
    nohup bash -c "sleep $((hours * 3600)) && cd $PROJECT_DIR && ./run.sh --retry >> $LOG_FILE 2>&1" &
    local bg_pid=$!
    echo "$bg_pid" > "$PROJECT_DIR/.resume_pid"
    log "Background resume process started (PID: $bg_pid)"
  fi

  # Also save a human-readable status
  cat > "$PROJECT_DIR/PAUSED.md" << EOF
# Cascade Paused - Credit Exhaustion

**Paused at**: $(date '+%Y-%m-%d %H:%M:%S')
**Resume scheduled**: $resume_time
**Last completed cascade**: $(get_last_completed)
**Next cascade to run**: $(source "$STATE_FILE" && echo "$CURRENT_CASCADE")

The orchestrator will automatically resume. If it doesn't, run:
\`\`\`bash
cd $PROJECT_DIR && ./run.sh --retry
\`\`\`
EOF
}

# === RUN A SINGLE CASCADE ===
run_cascade() {
  local cascade_file="$1"
  local cascade_id=$(get_cascade_id "$cascade_file")
  local is_test=$(echo "$cascade_id" | grep -c "TEST" || true)

  log "${BLUE}=== Starting cascade: $cascade_id ===${NC}"
  save_state "$cascade_id" "running" "0"

  # Read the cascade prompt
  local prompt
  prompt=$(cat "$cascade_file")

  # Run Claude Code
  local output_file="$PROJECT_DIR/.cascade_output_${cascade_id}"
  local exit_code=0

  # Execute with timeout
  timeout "$TIMEOUT_SECONDS" claude -p "$prompt" \
    --output-format text \
    2>&1 | tee "$output_file" || exit_code=$?

  # Check for timeout (exit code 124)
  if [[ $exit_code -eq 124 ]]; then
    log_warning "Cascade $cascade_id timed out after ${TIMEOUT_SECONDS}s"
    # For non-test cascades, timeout might mean it's doing complex work
    # Give it one more chance with double timeout
    log "Retrying with extended timeout..."
    timeout $((TIMEOUT_SECONDS * 2)) claude -p "$prompt" \
      --output-format text \
      2>&1 | tee "$output_file" || exit_code=$?
  fi

  local output
  output=$(cat "$output_file" 2>/dev/null || echo "")
  rm -f "$output_file"

  # Check for credit exhaustion
  if is_credit_error "$output"; then
    save_state "$cascade_id" "credit_exhausted" "0"
    schedule_resume
    return 2  # Special code for credit exhaustion
  fi

  # Check for other errors
  if [[ $exit_code -ne 0 ]]; then
    log_error "Cascade $cascade_id failed (exit code: $exit_code)"
    save_state "$cascade_id" "failed" "0"
    return 1
  fi

  # If it's a test cascade, check the output for PASS/FAIL signals
  if [[ $is_test -gt 0 ]]; then
    if echo "$output" | grep -qiE "(FAIL|ERROR|BROKEN|CRITICAL)"; then
      log_warning "Test cascade $cascade_id reported issues"
      # Don't fail - the test cascade should have created fix tasks
      # Continue but log the warning
    fi
    log_success "Test cascade $cascade_id completed (check output for details)"
  else
    log_success "Cascade $cascade_id completed successfully"
  fi

  save_state "$cascade_id" "completed" "0"

  # Update progress file
  echo "- [x] $cascade_id - DONE ($(date '+%H:%M:%S'))" >> "$PROGRESS_FILE"

  # Brief pause between cascades to avoid rate limits
  sleep 5

  return 0
}

# === RETRY LOGIC ===
retry_cascade() {
  local cascade_file="$1"
  local cascade_id=$(get_cascade_id "$cascade_file")
  local max_retries=$MAX_RETRIES
  local retry=0

  while [[ $retry -lt $max_retries ]]; do
    local result=0
    run_cascade "$cascade_file" || result=$?

    case $result in
      0) return 0 ;;           # Success
      2) return 2 ;;           # Credit exhaustion - don't retry
      *)                        # Other failure - retry
        retry=$((retry + 1))
        if [[ $retry -lt $max_retries ]]; then
          log_warning "Retry $retry/$max_retries for cascade $cascade_id"
          save_state "$cascade_id" "failed" "$retry"
          sleep 15  # Brief cooldown before retry
        fi
        ;;
    esac
  done

  log_error "Cascade $cascade_id failed after $max_retries retries"
  save_state "$cascade_id" "failed" "$max_retries"
  return 1
}

# === MAIN ORCHESTRATION ===
run_all() {
  local start_from="${1:-000}"
  local started=false

  log "${GREEN}=== EACEA Cascade Orchestrator Started ===${NC}"
  log "Starting from cascade: $start_from"
  log "Project directory: $PROJECT_DIR"

  # Initialize progress file if needed
  if [[ ! -f "$PROGRESS_FILE" ]]; then
    cat > "$PROGRESS_FILE" << 'EOF'
# EACEA Evaluator - Build Progress

## Cascade Execution Log
EOF
  fi

  # Remove pause file if exists
  rm -f "$PROJECT_DIR/PAUSED.md"

  for cascade_file in $(get_cascade_files); do
    local cascade_id=$(get_cascade_id "$cascade_file")

    # Skip until we reach our starting point
    if [[ "$started" == false ]]; then
      if [[ "$start_from" == "000" || "$start_from" == "none" || "$cascade_id" == "$start_from" ]]; then
        started=true
      else
        continue
      fi
    fi

    # Run the cascade with retry logic
    local result=0
    retry_cascade "$cascade_file" || result=$?

    case $result in
      0)  # Success - continue to next
        ;;
      2)  # Credit exhaustion - stop and schedule resume
        log_warning "Stopping due to credit exhaustion. Auto-resume scheduled."
        exit 2
        ;;
      *)  # Failed after retries - log and continue to next
        log_error "Cascade $cascade_id permanently failed. Continuing to next..."
        echo "- [ ] $cascade_id - FAILED ($(date '+%H:%M:%S'))" >> "$PROGRESS_FILE"
        ;;
    esac
  done

  log "${GREEN}=== ALL CASCADES COMPLETED ===${NC}"

  # Final summary
  local total=$(get_cascade_files | wc -l)
  local completed=$(grep -c "\[x\]" "$PROGRESS_FILE" 2>/dev/null || echo 0)
  local failed=$(grep -c "\[ \]" "$PROGRESS_FILE" 2>/dev/null || echo 0)

  log "Summary: $completed completed, $failed failed, $total total"

  # Clean up
  rm -f "$PROJECT_DIR/PAUSED.md"
  rm -f "$PROJECT_DIR/.resume_pid"
}

# === CLI INTERFACE ===
case "${1:-}" in
  --from)
    run_all "${2:?Please specify cascade ID, e.g. --from 015}"
    ;;
  --retry)
    # Resume from last failed/paused cascade
    IFS='|' read -r cascade status retries last_completed <<< "$(get_state)"
    if [[ "$status" == "credit_exhausted" || "$status" == "failed" ]]; then
      log "Resuming from cascade: $cascade"
      run_all "$cascade"
    else
      log "No failed or paused cascade found. Running from start."
      run_all "000"
    fi
    ;;
  --status)
    echo ""
    echo "=== Cascade Status ==="
    if [[ -f "$STATE_FILE" ]]; then
      source "$STATE_FILE"
      echo "Current cascade: $CURRENT_CASCADE"
      echo "Status: $STATUS"
      echo "Retries: $RETRIES"
      echo "Last completed: $LAST_COMPLETED"
      echo "Timestamp: $TIMESTAMP"
    else
      echo "No state file found. Run hasn't started yet."
    fi
    echo ""
    if [[ -f "$PROGRESS_FILE" ]]; then
      echo "=== Progress ==="
      cat "$PROGRESS_FILE"
    fi
    ;;
  --reset)
    read -p "Are you sure you want to reset all progress? (yes/no) " confirm
    if [[ "$confirm" == "yes" ]]; then
      rm -f "$STATE_FILE" "$PROGRESS_FILE" "$PROJECT_DIR/PAUSED.md" "$PROJECT_DIR/.resume_pid"
      rm -f "$PROJECT_DIR"/.cascade_output_*
      echo "Progress reset."
    fi
    ;;
  --help|-h)
    echo "EACEA Cascade Orchestrator"
    echo ""
    echo "Usage:"
    echo "  ./run.sh              Start from beginning or resume"
    echo "  ./run.sh --from 015   Start from specific cascade"
    echo "  ./run.sh --retry      Resume from last failure"
    echo "  ./run.sh --status     Show current progress"
    echo "  ./run.sh --reset      Reset all progress"
    echo "  ./run.sh --help       Show this help"
    ;;
  *)
    # Default: resume from where we left off, or start fresh
    IFS='|' read -r cascade status retries last_completed <<< "$(get_state)"
    if [[ "$status" == "completed" && "$cascade" != "" ]]; then
      # Find next cascade after the last completed one
      next_file=$(get_next_cascade "$cascade")
      if [[ -n "$next_file" ]]; then
        next_id=$(get_cascade_id "$next_file")
        log "Resuming from cascade: $next_id (after completed $cascade)"
        run_all "$next_id"
      else
        log "All cascades already completed!"
      fi
    elif [[ "$status" == "failed" || "$status" == "credit_exhausted" ]]; then
      log "Resuming failed cascade: $cascade"
      run_all "$cascade"
    else
      run_all "000"
    fi
    ;;
esac

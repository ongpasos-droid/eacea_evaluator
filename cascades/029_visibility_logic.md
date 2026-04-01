Implement the correct visibility logic for UI panels.

The main content area should show different things based on the active section:

When activeSectionIndex === 0 (Intake):
- Show: intake card, versions list
- Hide: question config shell, criteria shell

When activeSectionIndex > 0 (evaluation sections):
- Hide: intake card
- Show: question config shell, criteria shell

The scoring panel (right sidebar) should:
- Show placeholder message when on Intake
- Show scoring for active question when on evaluation sections

Review all render functions and ensure this logic is correct:

1. `renderIntake()`: show/hide based on activeSectionIndex
2. `renderQuestionConfig()`: show/hide the shell
3. `renderCriteria()`: show/hide the shell
4. `renderScoring()`: show placeholder or scores
5. `renderVersions()`: only fetch/render when on intake

Also ensure that when switching from intake to a question:
- The intake card fades out
- Question config and criteria appear
- Scoring panel populates

And when switching between questions:
- All fields update to new question's data
- Scoring panel updates
- Sidebar shows correct active question

Fix any issues with stale data or incorrect show/hide states.

Commit: "029: Fix visibility logic for all UI panels"

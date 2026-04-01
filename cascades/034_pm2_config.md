Create PM2 configuration for production deployment.

1. Create `ecosystem.config.js` at the project root:
```javascript
module.exports = {
  apps: [{
    name: 'eacea-evaluator',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
};
```

2. Create the `logs/` directory
3. Add `logs/` to `.gitignore`

4. Create a `scripts/deploy.sh` helper:
```bash
#!/bin/bash
# Deploy script for EACEA Evaluator
cd "$(dirname "$0")/.."
git pull origin main
npm install --production
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
echo "Deployed at $(date)"
```

5. Make deploy.sh executable: `chmod +x scripts/deploy.sh`

Test:
1. Verify ecosystem.config.js is valid: `node -e "require('./ecosystem.config.js')"`
2. If pm2 is available: `pm2 start ecosystem.config.js && sleep 2 && pm2 status && pm2 delete eacea-evaluator`

Commit: "034: Add PM2 configuration and deploy script"

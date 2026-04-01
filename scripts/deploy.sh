#!/bin/bash
# Deploy script for EACEA Evaluator
cd "$(dirname "$0")/.."
git pull origin main
npm install --production
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
echo "Deployed at $(date)"

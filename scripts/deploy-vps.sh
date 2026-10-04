#!/usr/bin/env bash
set -euo pipefail

revision="${1:?A tested Git commit is required}"
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid commit'; exit 1; }

# Noninteractive SSH does not load nvm by default.
export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:/usr/local/bin:$PATH"
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 22
fi

cd "$HOME/hcc-sms/server"
test -f .env
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo 'Tracked VPS files have local changes. Deployment stopped without overwriting them.'
  exit 1
fi
git fetch origin main
if [[ "$(git rev-parse origin/main)" != "$revision" ]]; then
  echo 'A newer main commit exists; this older deployment is skipped.'
  exit 0
fi
git switch main
git merge --ff-only "$revision"
npm ci --omit=dev
npm run check
pm2 restart hcc-sms-server --update-env

curl --fail --silent --show-error --retry 12 --retry-delay 2 \
  --retry-connrefused --max-time 5 http://127.0.0.1:4300/hcc-sms/api/health |
  node -e 'let s="";process.stdin.on("data",c=>s+=c);process.stdin.on("end",()=>{const h=JSON.parse(s);if(h.status!=="success"||h.failedRouteMounts!==0||h.mountedRoutes!==25)process.exit(1);console.log("Backend health passed: 25 route groups.");});'
pm2 save
echo "Deployed backend commit $revision"

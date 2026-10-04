# GitHub Actions deployment

The workflow tests pushes and pull requests. Successful `main` pushes and manual
`main` runs deploy only when all four repository secrets are configured.
Pull requests never use deployment credentials.

Add in Settings → Secrets and variables → Actions:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS IPv4 address |
| `VPS_USER` | `evans` |
| `VPS_SSH_KEY` | Dedicated deployment private key, including header/footer |
| `VPS_KNOWN_HOSTS` | Known-hosts entry created from the VPS's own public SSH host key |

Optional repository variable: `VPS_SSH_PORT` (default `22`).

Authorize the matching public deployment key in `/home/evans/.ssh/authorized_keys`.
The workflow updates `/home/evans/hcc-sms/server` to the tested commit using a
fast-forward merge, installs locked dependencies, runs the offline checks,
restarts only `hcc-sms-server`, verifies health on port 4300, and saves PM2 state.
Tracked source modifications on the VPS stop the deployment rather than being
overwritten. An outdated run is skipped if a newer commit exists on `main`.

Server `.env` stays on the VPS. Atlas, JWT, email and upload credentials do not
need to be stored in GitHub Actions. The existing PM2 process and `.env` must
already be configured. A failed health check marks the run failed; it does not
automatically roll back the server. Check the Actions output and PM2 logs.

Without secrets the checks run normally, but deployment is explicitly skipped.
After setup, use Actions → Test and deploy HCC backend → Run workflow to test
the first deployment without needing a code change.

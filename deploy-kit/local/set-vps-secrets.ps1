<#
  deploy-kit — copy the shared VPS secrets into one or more GitHub repos.
  Personal accounts have no account-wide Actions secrets, so this pushes the
  same values to each repo. Re-run it after changing a value or adding a repo.

  Needs the GitHub CLI, signed in once:  winget install GitHub.cli ; gh auth login

  Keep the source files OUTSIDE any repo, e.g. C:\Users\kevin\.vps\ :
    vps.env      VPS_HOST=102.212.246.224
                 VPS_PORT=22
                 VPS_USER=dev
    deploy_key   the private deploy key (same as VPS_SSH_KEY)
    known_hosts  output of:  ssh-keyscan -p 22 102.212.246.224

  Usage:
    .\set-vps-secrets.ps1 -Repos Juniortambo2628/TFE, Juniortambo2628/OKJT
    .\set-vps-secrets.ps1 -Repos Juniortambo2628/NewApp -Dir D:\secrets\vps
#>
param(
  [Parameter(Mandatory = $true)][string[]]$Repos,
  [string]$Dir = "$HOME\.vps"
)
$ErrorActionPreference = 'Stop'

foreach ($f in 'vps.env', 'deploy_key', 'known_hosts') {
  if (-not (Test-Path (Join-Path $Dir $f))) { throw "Missing $Dir\$f (see the header of this script)" }
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw "GitHub CLI not found: winget install GitHub.cli ; gh auth login" }

foreach ($repo in $Repos) {
  Write-Host "→ $repo" -ForegroundColor Cyan
  gh secret set -f (Join-Path $Dir 'vps.env') -R $repo
  Get-Content -Raw (Join-Path $Dir 'deploy_key')  | gh secret set VPS_SSH_KEY     -R $repo
  Get-Content -Raw (Join-Path $Dir 'known_hosts') | gh secret set VPS_KNOWN_HOSTS -R $repo
  gh secret list -R $repo
}
Write-Host "Done. Per-app env secrets (PROD_ENV / BACKEND_ENV / FRONTEND_ENV) are still set per repo." -ForegroundColor Green

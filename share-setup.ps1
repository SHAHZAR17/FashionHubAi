# FashionHub Backend - Git setup and GitHub push script
# Run this from INSIDE the fashionhub-backend project folder in PowerShell:
#   .\share-setup.ps1
#
# If you get a "running scripts is disabled" error, run this once first:
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

Write-Host "=== FashionHub backend - Git setup ===" -ForegroundColor Cyan

# 1. Create .gitignore if it doesn't exist (protects .env from ever being pushed)
if (-not (Test-Path ".gitignore")) {
    "node_modules" | Out-File -FilePath ".gitignore" -Encoding ascii
    ".env" | Out-File -FilePath ".gitignore" -Append -Encoding ascii
    Write-Host "Created .gitignore (node_modules + .env excluded)" -ForegroundColor Green
} else {
    Write-Host ".gitignore already exists - leaving it as is" -ForegroundColor Yellow
}

# 2. Initialize git if this folder isn't already a repo
if (-not (Test-Path ".git")) {
    git init
    Write-Host "Initialized git repository" -ForegroundColor Green
} else {
    Write-Host "Git already initialized - skipping" -ForegroundColor Yellow
}

# 3. Stage and commit everything (except what's in .gitignore)
git add .
git commit -m "Initial backend setup"

# 4. Safety check - make sure .env was NOT staged
$tracked = git ls-files | Select-String -Pattern "^\.env$"
if ($tracked) {
    Write-Host "WARNING: .env is being tracked by git! Stop and fix .gitignore before pushing." -ForegroundColor Red
    exit
} else {
    Write-Host ".env confirmed NOT tracked - safe to push" -ForegroundColor Green
}

# 5. Connect to GitHub
# First create an EMPTY repo at github.com/new (do NOT initialize it with a README),
# then paste its URL below when prompted.
$repoUrl = Read-Host "Paste your GitHub repo URL (e.g. https://github.com/username/fashionhub-backend.git)"

if ($repoUrl) {
    git remote remove origin 2>$null
    git remote add origin $repoUrl
    git branch -M main
    git push -u origin main
    Write-Host "Pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "No URL entered. Run these manually when you're ready:" -ForegroundColor Yellow
    Write-Host "  git remote add origin <your-repo-url>"
    Write-Host "  git branch -M main"
    Write-Host "  git push -u origin main"
}

Write-Host ""
Write-Host "Next: on GitHub, go to your repo -> Settings -> Collaborators -> Add people," -ForegroundColor Cyan
Write-Host "and invite your two teammates by their GitHub username or email." -ForegroundColor Cyan

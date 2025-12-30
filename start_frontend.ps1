# Script to start Frontend Next.js
Write-Host "Starting Frontend Next.js..." -ForegroundColor Green
Set-Location $PSScriptRoot\frontend

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start dev server
Write-Host "Starting Next.js dev server..." -ForegroundColor Yellow
npm run dev

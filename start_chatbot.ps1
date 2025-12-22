# Script to start Python Chatbot
Write-Host "Starting Python Chatbot with Gemini 2.5 Flash..." -ForegroundColor Green

# Navigate to project directory
$projectPath = "C:\Users\Admin\Downloads\ĐATN"
Set-Location $projectPath

# Set encoding for Python
$env:PYTHONIOENCODING = "utf-8"

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ Found .env file" -ForegroundColor Green
    $content = Get-Content ".env" -Raw
    if ($content -match "GEMINI_API_KEY") {
        Write-Host "✓ GEMINI_API_KEY is configured" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARNING: GEMINI_API_KEY not found in .env" -ForegroundColor Yellow
    }
    if ($content -match "GEMINI_MODEL") {
        $model = ($content | Select-String "GEMINI_MODEL=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
        Write-Host "✓ Model configured: $model" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ WARNING: .env not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting chatbot server on http://localhost:8000" -ForegroundColor Cyan
Write-Host "API docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

python simple_chatbot.py


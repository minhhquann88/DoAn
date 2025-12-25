# Script to start Backend Spring Boot
Write-Host "Starting Backend Spring Boot..." -ForegroundColor Green
Set-Location $PSScriptRoot\backend

# Check if Maven wrapper exists
if (Test-Path ".\mvnw.cmd") {
    Write-Host "Using Maven wrapper..." -ForegroundColor Yellow
    .\mvnw.cmd spring-boot:run
} else {
    Write-Host "Using system Maven..." -ForegroundColor Yellow
    mvn spring-boot:run
}


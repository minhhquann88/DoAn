# Script de build va chay backend bang JAR file
Write-Host "Dang build JAR file..." -ForegroundColor Cyan
.\mvnw.cmd clean package -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build thanh cong!" -ForegroundColor Green
    Write-Host "Dang khoi dong backend..." -ForegroundColor Cyan
    Write-Host ""
    
    java -jar target\course-management-system-0.0.1-SNAPSHOT.jar
} else {
    Write-Host ""
    Write-Host "❌ Build that bai!" -ForegroundColor Red
    Write-Host "Vui long kiem tra loi o tren" -ForegroundColor Yellow
}



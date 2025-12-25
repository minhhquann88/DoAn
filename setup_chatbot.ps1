# ============================================
# Script cài đặt Chatbot AI (Python/FastAPI)
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CAI DAT CHATBOT AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$venvPath = Join-Path $projectRoot ".venv"

# Kiểm tra Python
Write-Host "Dang kiem tra Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python chua duoc cai dat!" -ForegroundColor Red
    Write-Host "   Vui long cai dat Python 3.9+ tu https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra pip
Write-Host "`nDang kiem tra pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip chua duoc cai dat!" -ForegroundColor Red
    exit 1
}

# Tạo virtual environment nếu chưa có
Write-Host "`nDang kiem tra virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path $venvPath)) {
    Write-Host "Tao virtual environment..." -ForegroundColor Cyan
    python -m venv $venvPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Khong the tao virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Da tao virtual environment" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment da ton tai" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "`nDang kich hoat virtual environment..." -ForegroundColor Yellow
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript
    Write-Host "✅ Da kich hoat virtual environment" -ForegroundColor Green
} else {
    Write-Host "❌ Khong tim thay script kich hoat" -ForegroundColor Red
    exit 1
}

# Upgrade pip
Write-Host "`nDang nang cap pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Da nang cap pip" -ForegroundColor Green
}

# Cài đặt dependencies
Write-Host "`nDang cai dat dependencies..." -ForegroundColor Yellow
Write-Host "  (Co the mat 2-5 phut, vui long doi...)" -ForegroundColor Gray

pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Da cai dat thanh cong tat ca dependencies!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Co loi khi cai dat dependencies" -ForegroundColor Red
    Write-Host "   Vui long kiem tra file requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra các package quan trọng
Write-Host "`nDang kiem tra cac package quan trong..." -ForegroundColor Yellow
$packages = @("fastapi", "uvicorn", "google-generativeai", "chromadb", "sentence-transformers")
$allOk = $true

foreach ($package in $packages) {
    $result = pip show $package 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $package" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $package" -ForegroundColor Red
        $allOk = $false
    }
}

if (-not $allOk) {
    Write-Host "`n⚠️  Mot so package chua duoc cai dat dung" -ForegroundColor Yellow
    Write-Host "   Thu chay lai: pip install -r requirements.txt" -ForegroundColor White
}

# Tạo thư mục cần thiết
Write-Host "`nDang tao thu muc can thiet..." -ForegroundColor Yellow
$dirs = @("logs", "chroma_db")
foreach ($dir in $dirs) {
    $dirPath = Join-Path $projectRoot $dir
    if (-not (Test-Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
        Write-Host "  ✅ Da tao thu muc: $dir" -ForegroundColor Green
    } else {
        Write-Host "  ✅ Thu muc da ton tai: $dir" -ForegroundColor Green
    }
}

# Kiểm tra API key
Write-Host "`nDang kiem tra cau hinh..." -ForegroundColor Yellow
$configFile = Join-Path $projectRoot "src\core\config.py"
if (Test-Path $configFile) {
    $configContent = Get-Content $configFile -Raw
    if ($configContent -match 'GEMINI_API_KEY.*=.*"([^"]+)"') {
        $apiKey = $matches[1]
        if ($apiKey -and $apiKey.Length -gt 20) {
            Write-Host "  ✅ API key da duoc cau hinh" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  API key co ve khong hop le" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️  Khong tim thay API key trong config" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CAI DAT HOAN TAT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "De khoi dong chatbot, chay:" -ForegroundColor Yellow
Write-Host "  .\start_chatbot.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Hoac:" -ForegroundColor Yellow
Write-Host "  .\.venv\Scripts\activate" -ForegroundColor White
Write-Host "  python start_chatbot.py" -ForegroundColor White
Write-Host ""


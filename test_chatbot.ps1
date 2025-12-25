# ============================================
# Script test Chatbot API
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST CHATBOT API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"

# Test 1: Health check
Write-Host "[Test 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -ErrorAction Stop
    Write-Host "  ✅ Health check passed: $($response | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Health check failed: $_" -ForegroundColor Red
    Write-Host "     Vui long kiem tra chatbot co dang chay khong" -ForegroundColor Yellow
    exit 1
}

# Test 2: Send message
Write-Host "`n[Test 2] Send Message..." -ForegroundColor Yellow
$testMessage = @{
    message = "Tôi muốn học lập trình Java"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/chat/send" `
        -Method Post `
        -Body $testMessage `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "  ✅ Message sent successfully!" -ForegroundColor Green
    Write-Host "  Response:" -ForegroundColor Cyan
    Write-Host "    Session ID: $($response.session_id)" -ForegroundColor White
    Write-Host "    Confidence: $($response.confidence)" -ForegroundColor White
    Write-Host "    Response: $($response.response.Substring(0, [Math]::Min(100, $response.response.Length)))..." -ForegroundColor White
    if ($response.suggestions.Count -gt 0) {
        Write-Host "    Suggestions: $($response.suggestions -join ', ')" -ForegroundColor White
    }
} catch {
    Write-Host "  ❌ Send message failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "    Response: $responseBody" -ForegroundColor Yellow
    }
}

# Test 3: Get sessions
Write-Host "`n[Test 3] Get Sessions..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/chat/sessions" `
        -Method Get `
        -Headers @{"Authorization" = "Bearer test_token"} `
        -ErrorAction Stop
    
    Write-Host "  ✅ Sessions retrieved: $($response.Count) session(s)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Get sessions failed (co the can token): $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST HOAN TAT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""


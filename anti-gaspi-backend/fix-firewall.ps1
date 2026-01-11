# Run this script as Administrator
# Right-click PowerShell -> Run as Administrator
# Then execute: .\fix-firewall.ps1

Write-Host "Adding Windows Firewall rule for Anti-Gaspi Backend..." -ForegroundColor Yellow

try {
    New-NetFirewallRule `
        -DisplayName "Anti-Gaspi Backend (Node.js)" `
        -Direction Inbound `
        -Program "C:\Program Files\nodejs\node.exe" `
        -Action Allow `
        -Protocol TCP `
        -LocalPort 3000 `
        -ErrorAction Stop
    
    Write-Host "✅ Firewall rule added successfully!" -ForegroundColor Green
    Write-Host "You can now connect from the Android emulator." -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "✅ Firewall rule already exists!" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Make sure you're running PowerShell as Administrator!" -ForegroundColor Yellow
    }
}

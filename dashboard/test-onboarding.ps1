# DevOS Onboarding Test Toggle
# Run this script to safely toggle the onboarding screen for testing.
# Your real settings are NEVER deleted - just temporarily hidden.

$settingsPath = "$env:USERPROFILE\.dev-cli\settings.json"
$backupPath   = "$env:USERPROFILE\.dev-cli\settings.json.onboarding-test-bak"

if (Test-Path $backupPath) {
    # Backup exists → restore real settings
    Move-Item $backupPath $settingsPath -Force
    Write-Host ""
    Write-Host "  ✅ Settings RESTORED. Your real data is back." -ForegroundColor Green
    Write-Host "  Launch the app normally - dashboard will load directly." -ForegroundColor Cyan
    Write-Host ""
} elseif (Test-Path $settingsPath) {
    # Real settings exist → hide them
    Move-Item $settingsPath $backupPath -Force
    Write-Host ""
    Write-Host "  🚀 Onboarding mode ENABLED. Real settings safely backed up." -ForegroundColor Yellow
    Write-Host "  Launch the app now to see the onboarding screen." -ForegroundColor Cyan
    Write-Host "  Run this script again after testing to restore your settings." -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  ℹ️  No settings.json found - app is already in fresh-install state." -ForegroundColor Cyan
    Write-Host "  Just launch the app to see the onboarding screen." -ForegroundColor Gray
    Write-Host ""
}

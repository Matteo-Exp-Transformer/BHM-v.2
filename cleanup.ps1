# Simple cleanup script for Windows
# Usage: .\cleanup.ps1

Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow

# Clean directories
$dirs = @("dist", "node_modules\.vite", ".vercel")
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        try {
            Remove-Item -Recurse -Force $dir -ErrorAction Stop
            Write-Host "Removed: $dir" -ForegroundColor Green
        } catch {
            Write-Host "Could not remove: $dir - $($_.Exception.Message)" -ForegroundColor Yellow
            # Non bloccare il processo se non riesce a rimuovere
        }
    }
}

# Clean files (opzionale - non rimuoviamo package-lock.json per sicurezza)
# $files = @("package-lock.json")
# foreach ($file in $files) {
#     if (Test-Path $file) {
#         try {
#             Remove-Item -Force $file -ErrorAction Stop
#             Write-Host "Removed: $file" -ForegroundColor Green
#         } catch {
#             Write-Host "Could not remove: $file - $($_.Exception.Message)" -ForegroundColor Yellow
#         }
#     }
# }

Write-Host "Cleanup completed!" -ForegroundColor Green

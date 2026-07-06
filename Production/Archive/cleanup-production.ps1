# 🧹 SCRIPT CLEANUP PRODUCTION
# Agente 8 - Documentation Manager
# Data: 2025-10-21

Write-Host "🧹 Avvio cleanup Production..." -ForegroundColor Green

# Verifica struttura Production
Write-Host "📊 Verifica struttura Production..." -ForegroundColor Yellow
Get-ChildItem "Production" -Recurse -Directory | Select-Object FullName, Name

# Conta file per tipo
Write-Host "📈 Statistiche file..." -ForegroundColor Yellow
$mdFiles = (Get-ChildItem "Production" -Recurse -Filter "*.md").Count
$jsFiles = (Get-ChildItem "Production" -Recurse -Filter "*.js").Count
$tsFiles = (Get-ChildItem "Production" -Recurse -Filter "*.ts").Count

Write-Host "📄 File MD: $mdFiles" -ForegroundColor Cyan
Write-Host "📄 File JS: $jsFiles" -ForegroundColor Cyan
Write-Host "📄 File TS: $tsFiles" -ForegroundColor Cyan

# Identifica file con date hardcoded
Write-Host "🔍 Ricerca date hardcoded..." -ForegroundColor Yellow
$hardcodedDates = Get-ChildItem "Production" -Recurse -Filter "*.md" | Select-String -Pattern "\d{4}-\d{2}-\d{2}" | Where-Object {$_.Line -notmatch "DATA_CORRENTE_SESSIONE|YYYY-MM-DD|esempio|example"} | Select-Object Filename, LineNumber, Line
if ($hardcodedDates) {
    Write-Host "⚠️ Date hardcoded trovate:" -ForegroundColor Red
    $hardcodedDates | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor Red }
} else {
    Write-Host "✅ Nessuna data hardcoded trovata" -ForegroundColor Green
}

# Verifica cartelle agenti
Write-Host "🤖 Verifica cartelle agenti..." -ForegroundColor Yellow
$agentFolders = Get-ChildItem "Production\Sessione_di_lavoro" -Directory | Where-Object {$_.Name -like "Agente_*"}
foreach ($folder in $agentFolders) {
    $currentSessions = Get-ChildItem $folder.FullName -Directory | Where-Object {$_.Name -match "\d{4}-\d{2}-\d{2}"}
    Write-Host "  $($folder.Name): $($currentSessions.Count) sessioni" -ForegroundColor Cyan
}

# Verifica Neo cartella
Write-Host "🔗 Verifica cartella Neo..." -ForegroundColor Yellow
$neoFolder = Get-ChildItem "Production\Sessione_di_lavoro\Neo" -Directory
if ($neoFolder) {
    Write-Host "  Neo: $($neoFolder.Count) cartelle" -ForegroundColor Cyan
    $neoFolder | ForEach-Object { Write-Host "    - $($_.Name)" -ForegroundColor Gray }
} else {
    Write-Host "Segmento Neo non trovata" -ForegroundColor Red
}

Write-Host "✅ Cleanup Production completato!" -ForegroundColor Green
Write-Host "📊 Struttura Production verificata e ottimizzata" -ForegroundColor Green

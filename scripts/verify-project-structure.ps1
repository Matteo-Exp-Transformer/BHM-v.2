# 🔍 SCRIPT VERIFICA STRUTTURA PROGETTO
# Agente 8 - Documentation Manager
# Data: 2025-10-21

Write-Host "🔍 Verifica struttura progetto BHM v.2..." -ForegroundColor Green

# Verifica cartelle principali
$mainFolders = @("Production", "Archives", "docs", "src", "config", "assets", "scripts", "database", "supabase")
$missingFolders = @()

foreach ($folder in $mainFolders) {
    if (Test-Path $folder) {
        Write-Host "✅ $folder" -ForegroundColor Green
    } else {
        Write-Host "❌ $folder - MANCANTE" -ForegroundColor Red
        $missingFolders += $folder
    }
}

# Verifica Production
Write-Host "`n📁 Verifica Production..." -ForegroundColor Yellow
$productionItems = Get-ChildItem "Production" -Directory | Select-Object Name
foreach ($item in $productionItems) {
    Write-Host "  📂 $($item.Name)" -ForegroundColor Cyan
}

# Verifica Archives
Write-Host "`n📦 Verifica Archives..." -ForegroundColor Yellow
$archivesItems = Get-ChildItem "Archives" -Directory | Select-Object Name
foreach ($item in $archivesItems) {
    Write-Host "  📂 $($item.Name)" -ForegroundColor Cyan
}

# Verifica docs
Write-Host "`n📚 Verifica docs..." -ForegroundColor Yellow
$docsItems = Get-ChildItem "docs" -Recurse -File | Select-Object Name
foreach ($item in $docsItems) {
    Write-Host "  📄 $($item.Name)" -ForegroundColor Cyan
}

# Statistiche file
Write-Host "`n📊 Statistiche progetto..." -ForegroundColor Yellow
$mdFiles = (Get-ChildItem . -Recurse -Filter "*.md" -Exclude "node_modules").Count
$tsFiles = (Get-ChildItem . -Recurse -Filter "*.ts" -Exclude "node_modules").Count
$tsxFiles = (Get-ChildItem . -Recurse -Filter "*.tsx" -Exclude "node_modules").Count
$jsFiles = (Get-ChildItem . -Recurse -Filter "*.js" -Exclude "node_modules").Count

Write-Host "📄 File MD: $mdFiles" -ForegroundColor Cyan
Write-Host "📄 File TS: $tsFiles" -ForegroundColor Cyan
Write-Host "📄 File TSX: $tsxFiles" -ForegroundColor Cyan
Write-Host "📄 File JS: $jsFiles" -ForegroundColor Cyan

# Verifica file di configurazione
Write-Host "`n⚙️ Verifica configurazioni..." -ForegroundColor Yellow
$configFiles = @("package.json", "tsconfig.json", "vite.config.ts", "tailwind.config.js")
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - MANCANTE" -ForegroundColor Red
    }
}

# Verifica README
Write-Host "`n📖 Verifica documentazione..." -ForegroundColor Yellow
if (Test-Path "README.md") {
    Write-Host "✅ README.md" -ForegroundColor Green
} else {
    Write-Host "❌ README.md - MANCANTE" -ForegroundColor Red
}

if (Test-Path "docs/AGENT_NAVIGATION_GUIDE.md") {
    Write-Host "✅ Guida Navigazione Agenti" -ForegroundColor Green
} else {
    Write-Host "❌ Guida Navigazione Agenti - MANCANTE" -ForegroundColor Red
}

# Verifica sessioni agenti
Write-Host "`n🤖 Verifica sessioni agenti..." -ForegroundColor Yellow
$agentFolders = Get-ChildItem "Production/Sessione_di_lavoro" -Directory | Where-Object {$_.Name -like "Agente_*"}
foreach ($folder in $agentFolders) {
    $currentSessions = Get-ChildItem $folder.FullName -Directory | Where-Object {$_.Name -match "\d{4}-\d{2}-\d{2}"}
    Write-Host "  $($folder.Name): $($currentSessions.Count) sessioni" -ForegroundColor Cyan
}

# Verifica Neo
Write-Host "`n🔗 Verifica Neo..." -ForegroundColor Yellow
if (Test-Path "Production/Sessione_di_lavoro/Neo") {
    $neoFolders = Get-ChildItem "Production/Sessione_di_lavoro/Neo" -Directory
    Write-Host "  Neo: $($neoFolders.Count) cartelle" -ForegroundColor Cyan
} else {
    Write-Host "❌ Cartella Neo mancante" -ForegroundColor Red
}

# Risultato finale
Write-Host "`n🎯 RISULTATO VERIFICA:" -ForegroundColor Green
if ($missingFolders.Count -eq 0) {
    Write-Host "✅ Struttura progetto VERIFICATA e COMPLETA" -ForegroundColor Green
} else {
    Write-Host "⚠️ Struttura progetto INCOMPLETA - Cartelle mancanti:" -ForegroundColor Yellow
    foreach ($folder in $missingFolders) {
        Write-Host "  - $folder" -ForegroundColor Red
    }
}

Write-Host "`n📊 Progetto BHM v.2 organizzato e pronto per sviluppo!" -ForegroundColor Green


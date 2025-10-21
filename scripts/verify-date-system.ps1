# 🔍 SCRIPT VERIFICA SISTEMA DATE DINAMICO
# Agente 8 - Documentation Manager
# Data: 2025-10-21

Write-Host "🔍 Verifica sistema date dinamico..." -ForegroundColor Green

# Verifica date hardcoded rimanenti
Write-Host "`n📅 Verifica date hardcoded..." -ForegroundColor Yellow
$hardcodedDates = Get-ChildItem . -Recurse -Filter "*.md" -Exclude "node_modules" | Select-String -Pattern "\d{4}-\d{2}-\d{2}" | Where-Object {$_.Line -notmatch "DATA_CORRENTE_SESSIONE|YYYY-MM-DD|esempio|example"} | Select-Object Filename, LineNumber, Line
if ($hardcodedDates) {
    Write-Host "⚠️ Date hardcoded trovate:" -ForegroundColor Red
    $hardcodedDates | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor Red }
} else {
    Write-Host "✅ Nessuna data hardcoded trovata" -ForegroundColor Green
}

# Verifica struttura cartelle agenti
Write-Host "`n🤖 Verifica cartelle agenti..." -ForegroundColor Yellow
$currentSessionDate = "2025-10-21"
$agentFolders = Get-ChildItem "Production\Sessione_di_lavoro" -Directory | Where-Object {$_.Name -like "Agente_*"}
$correctDateCount = 0
$totalAgents = 0

foreach ($folder in $agentFolders) {
    $totalAgents++
    $currentSessionFolder = Get-ChildItem $folder.FullName -Directory | Where-Object {$_.Name -eq $currentSessionDate}
    if ($currentSessionFolder) {
        Write-Host "  ✅ $($folder.Name): Data corrente ($currentSessionDate)" -ForegroundColor Green
        $correctDateCount++
    } else {
        $oldFolders = Get-ChildItem $folder.FullName -Directory | Where-Object {$_.Name -match "\d{4}-\d{2}-\d{2}"}
        Write-Host "  ❌ $($folder.Name): Data sbagliata o mancante" -ForegroundColor Red
        $oldFolders | ForEach-Object { Write-Host "    - $($_.Name)" -ForegroundColor Gray }
    }
}

# Verifica Neo
Write-Host "`n🔗 Verifica Neo..." -ForegroundColor Yellow
$neoFolder = Get-ChildItem "Production\Sessione_di_lavoro\Neo" -Directory | Where-Object {$_.Name -eq $currentSessionDate}
if ($neoFolder) {
    Write-Host "  ✅ Neo: Data corrente ($currentSessionDate)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Neo: Data sbagliata o mancante" -ForegroundColor Red
}

# Verifica prompt agenti
Write-Host "`n📋 Verifica prompt agenti..." -ForegroundColor Yellow
$promptFiles = Get-ChildItem "Production\Last_Info\Multi agent\Prompt_Inizio_Agenti" -Filter "Agente *.md"
$updatedPrompts = 0

foreach ($file in $promptFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "DATA_CORRENTE_SESSIONE") {
        Write-Host "  ✅ $($file.Name): Sistema dinamico implementato" -ForegroundColor Green
        $updatedPrompts++
    } else {
        Write-Host "  ❌ $($file.Name): Sistema dinamico mancante" -ForegroundColor Red
    }
}

# Verifica documentazione
Write-Host "`n📚 Verifica documentazione..." -ForegroundColor Yellow
$docsFiles = @("docs\AGENT_NAVIGATION_GUIDE.md", "Production\Last_Info\Multi agent\Prompt_Inizio_Agenti\00_PANORAMICA_SISTEMA_7_AGENTI.md")
$updatedDocs = 0

foreach ($file in $docsFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "DATA_CORRENTE_SESSIONE") {
            Write-Host "  ✅ $(Split-Path $file -Leaf): Sistema dinamico documentato" -ForegroundColor Green
            $updatedDocs++
        } else {
            Write-Host "  ❌ $(Split-Path $file -Leaf): Sistema dinamico non documentato" -ForegroundColor Red
        }
    }
}

# Risultato finale
Write-Host "`n🎯 RISULTATO VERIFICA SISTEMA DATE:" -ForegroundColor Green
Write-Host "📅 Date hardcoded: $(if ($hardcodedDates) { '❌ TROVATE' } else { '✅ CORRETTE' })" -ForegroundColor $(if ($hardcodedDates) { 'Red' } else { 'Green' })
Write-Host "🤖 Cartelle agenti: $correctDateCount/$totalAgents con data corretta" -ForegroundColor $(if ($correctDateCount -eq $totalAgents) { 'Green' } else { 'Yellow' })
Write-Host "📋 Prompt agenti: $updatedPrompts/$($promptFiles.Count) aggiornati" -ForegroundColor $(if ($updatedPrompts -eq $promptFiles.Count) { 'Green' } else { 'Yellow' })
Write-Host "📚 Documentazione: $updatedDocs/$($docsFiles.Count) aggiornate" -ForegroundColor $(if ($updatedDocs -eq $docsFiles.Count) { 'Green' } else { 'Yellow' })

if (-not $hardcodedDates -and $correctDateCount -eq $totalAgents -and $updatedPrompts -eq $promptFiles.Count -and $updatedDocs -eq $docsFiles.Count) {
    Write-Host "`n✅ SISTEMA DATE DINAMICO COMPLETAMENTE IMPLEMENTATO!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ SISTEMA DATE DINAMICO PARZIALMENTE IMPLEMENTATO" -ForegroundColor Yellow
}

Write-Host "`n📊 Data corrente sessione: $currentSessionDate" -ForegroundColor Cyan

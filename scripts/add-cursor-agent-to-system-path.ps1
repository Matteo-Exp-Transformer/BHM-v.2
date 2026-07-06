# Aggiunge cursor-agent al PATH di sistema (necessario per Vibe Kanban e altri processi che non ereditano il PATH utente).
# Eseguire come Amministratore: click destro su PowerShell -> "Esegui come amministratore", poi:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
#   & "C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\scripts\add-cursor-agent-to-system-path.ps1"

$cursorAgentPath = "C:\Users\matte.MIO\AppData\Local\cursor-agent"

if (-not (Test-Path $cursorAgentPath)) {
    Write-Error "Cartella non trovata: $cursorAgentPath. Installa prima Cursor Agent CLI con: irm 'https://cursor.com/install?win32=true' | iex"
    exit 1
}

$machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($machinePath -like "*$cursorAgentPath*") {
    Write-Host "cursor-agent e' gia' nel PATH di sistema." -ForegroundColor Green
    exit 0
}

[Environment]::SetEnvironmentVariable("Path", "$machinePath;$cursorAgentPath", "Machine")
Write-Host "Aggiunto al PATH di sistema: $cursorAgentPath" -ForegroundColor Green
Write-Host "Riavvia Vibe Kanban (e il PC se necessario) affinche' veda il nuovo PATH."

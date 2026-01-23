# 📖 MCP Configuration - Quick Reference

## 📁 File Struttura

```
.cursor/
├── mcp.json                    # ❌ NON committare (contiene token)
├── mcp.json.template           # ✅ Template da copiare
├── MCP_SETUP_INSTRUCTIONS.md   # 📚 Guida setup completa
└── README_MCP.md              # 📖 Questo file
```

## 🚀 Setup in 3 Step

### 1️⃣ Copia Template
```powershell
Copy-Item .cursor\mcp.json.template .cursor\mcp.json
```

### 2️⃣ Ottieni Token
- **Supabase PAT**: https://supabase.com/dashboard/account/tokens
- **GitHub Token**: https://github.com/settings/tokens

### 3️⃣ Configura & Riavvia
1. Apri `.cursor/mcp.json`
2. Sostituisci i placeholder con i tuoi token
3. Riavvia Cursor

## ✅ Verifica Setup

**Settings → MCP** → Tutti i server devono essere 🟢

## 🔧 MCP Configurati

| Server | Descrizione |
|--------|-------------|
| **supabase** | Database queries, migrazioni, Edge Functions |
| **playwright** | Browser automation, E2E testing |
| **github** | Repository management, issues, PRs |
| **filesystem** | File operations (limitato a BHM-v.2) |

## 📚 Documentazione

- **Setup Completo**: `MCP_SETUP_INSTRUCTIONS.md`
- **Config Supabase**: `../SUPABASE_MCP_CONFIGURATION.md` (root progetto)

## 🆘 Troubleshooting

### MCP non si connette
```powershell
# Verifica Node.js >= 18
node --version

# Verifica npx disponibile
npx --version
```

### Token non funziona
- Verifica scadenza token
- Controlla permessi corretti
- Rigenera se necessario

## 🔐 Sicurezza

- ✅ `.cursor/mcp.json` è in `.gitignore`
- ✅ Read-only mode per Supabase
- ✅ Project-scoped per limitare accesso
- ❌ MAI committare token su git

---

**Per istruzioni dettagliate**: Vedi `MCP_SETUP_INSTRUCTIONS.md`






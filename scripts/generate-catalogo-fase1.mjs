#!/usr/bin/env node
/**
 * Genera CATALOGO_DOCUMENTALE_BHM_v2_FASE1.md
 * Fase 1 — solo mappatura, nessuna valutazione contenuti
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'Production/Conoscenze_congelate/META/CATALOGO_DOCUMENTALE_BHM_v2_FASE1.md');

const DOC_EXTS = new Set(['.md', '.mdx', '.txt', '.rst', '.adoc']);
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git', '.next'];

const ZONES = [
  { key: 'root+docs', paths: ['.', 'docs'] },
  { key: 'Production/Conoscenze_congelate', paths: ['Production/Conoscenze_congelate'] },
  { key: 'Production/Archive', paths: ['Production/Archive'] },
  { key: 'Info', paths: ['Info'] },
  { key: '.cursor', paths: ['.cursor'] },
  { key: '.claude', paths: ['.claude'] },
  { key: 'Archives', paths: ['Archives'] },
  { key: 'database', paths: ['database'] },
  { key: 'BackupDB', paths: ['BackupDB'] },
  { key: 'tests', paths: ['tests'] },
  { key: 'test-provisori', paths: ['test-provisori'] },
  { key: 'skills', paths: ['skills'] },
];

function norm(p) {
  return p.replace(/\\/g, '/');
}

function shouldExclude(fullPath) {
  const rel = norm(path.relative(ROOT, fullPath));
  return EXCLUDE_DIRS.some((d) => rel.split('/').includes(d));
}

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (shouldExclude(full)) continue;
    if (ent.isDirectory()) walkDir(full, files);
    else files.push(full);
  }
  return files;
}

function inferDateFromPath(rel) {
  // DD-MM-YYYY or YYYY-MM-DD in path/filename
  const m1 = rel.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;
  const m2 = rel.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
  const m3 = rel.match(/(\d{4})_(\d{2})_(\d{2})/);
  if (m3) return `${m3[1]}-${m3[2]}-${m3[3]}`;
  const m4 = rel.match(/(\d{4})(\d{2})(\d{2})/);
  if (m4 && rel.includes('202')) return `${m4[1]}-${m4[2]}-${m4[3]}`;
  return 'unknown';
}

function inferZona(rel) {
  for (const z of ZONES) {
    for (const p of z.paths) {
      const prefix = p === '.' ? '' : p + '/';
      if (p === '.' && !rel.includes('/')) return z.key;
      if (rel.startsWith(p + '/') || rel === p) return z.key;
    }
  }
  if (rel.startsWith('src/')) return 'src';
  if (rel === '.cursorrules') return 'root+docs';
  if (rel === 'README.md' || rel === 'BUG_TRACKER.md') return 'root+docs';
  return 'altro';
}

function inferCategoria(rel, ext, content) {
  const base = path.basename(rel).toUpperCase();
  const r = rel.toLowerCase();

  if (r.includes('error-context.md')) return 'ARTIFACT';
  if ((ext === '.tsx' || ext === '.ts') && content?.includes('// LOCKED:')) return 'CODE-DOC';
  if (ext === '.tsx' || ext === '.ts') return 'altro'; // sorgente senza header LOCKED — escluso in collect
  if (base.includes('APP_VISION') || base.includes('BETA_PRODUCTION') || base.includes('PRODUCT_STRATEGY')) return 'VISION';
  if (base.includes('SYSTEM_ARCH') || base.includes('API_SPEC') || base.includes('TECHNICAL_ANALYSIS')) return 'ARCH';
  if (r.includes('conoscenze-definizioni') || r.includes('conoscenze-definizioni') || r.includes('/app_definition/') && (base.includes('FLOW') || base.includes('_PAGE') || base.includes('MODAL') || base.includes('SECTION'))) return 'DEF';
  if (r.includes('app_definition') && !r.includes('/lavoro/') && (base.endsWith('.MD') && !base.startsWith('REPORT') && !base.startsWith('README'))) {
    if (base.includes('MASTER_INDEX') || base.includes('TEMPLATE')) return base.includes('MASTER') ? 'META' : 'DEF';
    if (base.includes('SCHEDULED') || base.includes('CONSERVATION') || base.includes('CALENDAR') || base.includes('LOGIN') || base.includes('ONBOARDING')) return 'DEF';
  }
  if (base.includes('MASTER_INDEX') || base === 'INDEX.MD' || base.startsWith('README')) return 'META';
  if (base.includes('COMPONENTI') || base.includes('INVENTARIO') || base.includes('INVENTORY') || base.includes('MAPPING') && !base.includes('REPORT')) return 'INV';
  if (base.includes('TRACKING') || base.includes('-TRACKING') || base.includes('BLINDAT')) return 'TRACK';
  if (ext === '.md' && content?.includes('// LOCKED:')) return 'TRACK';
  if (base.startsWith('REPORT_') || base.startsWith('RIEPILOGO') || base.includes('HANDOFF') || base.includes('SESSION') || base.includes('RECAP') || r.includes('/lavoro/')) return 'SESSION';
  if (base.startsWith('PLAN') || base.includes('CHECKLIST') || base.includes('LAVORI-DA-FARE') || base.includes('PIANO') || base.startsWith('TASK')) return 'PLAN';
  if (base.startsWith('DECISION_') || base.includes('DECISIONI')) return 'DECISION';
  if (r.includes('user_guides') || r.includes('guide') || base.includes('ISTRUZIONI') || base.includes('SETUP') || base.includes('RESET_APP') || base.includes('QUICK_START') || base.includes('START_HERE')) return 'GUIDE';
  if (r.includes('prompt') || r.includes('skill') || base.includes('SKILL_') || base.includes('AGENTE_') && base.endsWith('.MD') && r.includes('prompt_inizio')) return 'PROMPT';
  if (r.includes('backupdb') || r.includes('database/') || r.includes('.sql') || base.includes('RLS') || base.includes('SCHEMA') || base.includes('MIGRATION')) return 'DB';
  if (r.includes('/test') || base.includes('TEST_') || base.includes('TESTING') || r.includes('playwright')) return 'TEST';
  if (base.includes('AGENT_COORD') || base.includes('SHARED_STATE') || base.includes('COORDINAMENTO') || base.includes('MULTI_AGENT') || base.includes('ORCHESTRAT')) return 'COORD';
  if (ext === '.json' && (base.includes('SHARED') || base.includes('TEMPLATE') || base.includes('RESULTS'))) return r.includes('SHARED') ? 'COORD' : 'META';

  // CODE-DOC solo per sorgente TypeScript (gestito prima del content check)
  if (r.includes('knowledge_base') && !base.includes('REPORT')) return 'DEF';
  if (r.includes('debug/')) return 'GUIDE';
  if (r.includes('agent_reports')) return 'SESSION';
  if (r.includes('prompt_context')) return 'PROMPT';
  if (r.includes('reference/')) return 'GUIDE';
  if (r.includes('sessione_di_lavoro')) return 'SESSION';
  if (r.includes('archive/knowledge')) return 'INV';

  return 'altro';
}

function inferArea(rel) {
  const r = rel.toLowerCase();
  if (r.includes('01_auth') || r.includes('autenticazione') || r.includes('/auth/')) return 'AUTH';
  if (r.includes('02_dashboard') || r.includes('dashboard')) return 'DASHBOARD';
  if (r.includes('03_conservation') || r.includes('conservazione') || r.includes('conservation')) return 'CONSERVATION';
  if (r.includes('04_calendar') || r.includes('calendario') || r.includes('calendar')) return 'CALENDAR';
  if (r.includes('05_inventory') || r.includes('inventario') || r.includes('inventory')) return 'INVENTORY';
  if (r.includes('06_settings') || r.includes('impostazioni') || r.includes('settings')) return 'SETTINGS';
  if (r.includes('07_components') || r.includes('ui_base') || r.includes('ui-base')) return 'UI';
  if (r.includes('onboarding')) return 'ONBOARDING';
  if (r.includes('navigazione') || r.includes('navigation')) return 'NAVIGATION';
  if (r.includes('admin')) return 'ADMIN';
  if (r.includes('shopping') || r.includes('liste_spesa')) return 'SHOPPING';
  if (r.includes('multi agent') || r.includes('multi_agent') || r.includes('.cursor') || r.includes('.claude') || r.includes('/skills')) return 'MULTI';
  if (r.includes('database') || r.includes('backupdb') || r.includes('supabase') || r.includes('.sql')) return 'DB';
  return 'N/A';
}

function inferPriorita(zona, rel) {
  if (rel.includes('error-context')) return 'bassa';
  if (zona === 'Production/Conoscenze_congelate') return 'alta';
  if (zona === 'Info' && !rel.startsWith('Archives')) return 'alta';
  if (zona === 'Production/Archive' && (rel.includes('Knowledge') || rel.includes('Last_Info'))) return 'alta';
  if (zona === 'root+docs' || rel === '.cursorrules') return 'alta';
  if (zona === 'Archives' || rel.includes('2026-01-cleanup') || rel.includes('Info_Complete')) return 'bassa';
  if (zona === 'Production/Archive/Sessione_di_lavoro' || zona === '.cursor' || zona === '.claude') return 'media';
  if (zona === 'database' || zona === 'BackupDB') return 'media';
  return 'media';
}

function inferStato(zona, rel) {
  if (rel.includes('Archives/') && rel.replace('Archives/', '').includes('Info/')) return 'duplicato_sospetto';
  if (rel.includes('2026-01-cleanup/temp-folders/Info')) return 'duplicato_sospetto';
  if (rel.includes('Info_Complete')) return 'duplicato_sospetto';
  if (rel.includes('ARCHIVE_Inizio_lavoro') || rel.includes('ARCHIVE_Lavori')) return 'duplicato_sospetto';
  if (rel.includes('Archives/Tests/Test') && rel.includes('Production/Archive') === false) {
    // Archives Tests vs Production Archive Test
  }
  if (zona === 'Archives') return 'archivio';
  if (zona === 'Production/Archive') return 'archivio';
  if (zona === 'Production/Conoscenze_congelate') return 'attivo';
  if (zona === 'Info') return 'attivo';
  return 'indeterminato';
}

function inferLingua(content) {
  if (!content) return 'IT';
  const it = (content.match(/\b(per|della|documentazione|componente|implementazione|sessione|report|piano)\b/gi) || []).length;
  const en = (content.match(/\b(the|and|component|implementation|session|report|plan)\b/gi) || []).length;
  if (it > 5 && en > 5) return 'mixed';
  if (en > it * 2) return 'EN';
  return 'IT';
}

function inferTitolo(rel, content) {
  const base = path.basename(rel, path.extname(rel));
  if (content) {
    const m = content.match(/^#\s+(.+)$/m);
    if (m) return m[1].replace(/[#*]/g, '').trim().slice(0, 120);
  }
  return base.replace(/_/g, ' ').replace(/-/g, ' ').slice(0, 120);
}

function inferOneLiner(rel, categoria, titolo) {
  const base = path.basename(rel);
  const templates = {
    VISION: `Visione/strategia: ${titolo}`,
    ARCH: `Architettura/stack: ${titolo}`,
    DEF: `Definizione ufficiale: ${titolo}`,
    INV: `Inventario/mappatura: ${titolo}`,
    TRACK: `Tracking/blindatura: ${titolo}`,
    SESSION: `Report sessione: ${titolo}`,
    PLAN: `Piano/checklist: ${titolo}`,
    DECISION: `Decisione architetturale: ${titolo}`,
    GUIDE: `Guida operativa: ${titolo}`,
    PROMPT: `Prompt/skill AI: ${titolo}`,
    DB: `Database/SQL: ${titolo}`,
    TEST: `Documentazione test: ${titolo}`,
    COORD: `Coordinamento multi-agente: ${titolo}`,
    META: `Indice/navigazione: ${titolo}`,
    'CODE-DOC': `Documentazione inline codice: ${base}`,
    altro: `Documento progetto: ${titolo}`,
  };
  const s = templates[categoria] || templates.altro;
  return s.slice(0, 120);
}

function extractLinks(content) {
  if (!content) return [];
  const links = [];
  const re = /\[([^\]]*)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const l = m[2];
    if (!l.startsWith('http') && !l.startsWith('#')) links.push(l.replace(/\\/g, '/'));
  }
  return [...new Set(links)].slice(0, 10);
}

function extractCodeRefs(content) {
  if (!content) return [];
  const refs = [];
  const re = /(?:src\/[\w./-]+\.(?:tsx?|jsx?))/g;
  let m;
  while ((m = re.exec(content)) !== null) refs.push(m[0]);
  return [...new Set(refs)].slice(0, 10);
}

function getGitDate(rel) {
  try {
    const out = execSync(`git log -1 --format=%cs -- "${rel.replace(/\//g, path.sep)}"`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return out || 'unknown';
  } catch {
    return 'unknown';
  }
}

function collectFiles() {
  const seen = new Set();
  const items = [];

  // Zone scans
  for (const z of ZONES) {
    for (const p of z.paths) {
      const abs = path.join(ROOT, p === '.' ? '' : p);
      if (p === '.') {
        for (const f of ['README.md', 'BUG_TRACKER.md', '.cursorrules']) {
          const fp = path.join(ROOT, f);
          if (fs.existsSync(fp)) addFile(fp, seen, items);
        }
        if (fs.existsSync(path.join(ROOT, 'docs'))) walkDir(path.join(ROOT, 'docs')).forEach((f) => addFile(f, seen, items));
      } else {
        walkDir(abs).forEach((f) => addFile(f, seen, items));
      }
    }
  }

  // src LOCKED
  const srcDir = path.join(ROOT, 'src');
  if (fs.existsSync(srcDir)) {
    for (const f of walkDir(srcDir)) {
      const ext = path.extname(f);
      if (!['.ts', '.tsx'].includes(ext)) continue;
      try {
        const head = fs.readFileSync(f, 'utf8').slice(0, 2000);
        if (head.includes('// LOCKED:')) addFile(f, seen, items);
      } catch { /* skip */ }
    }
  }

  return items;

  function addFile(full, seen, items) {
    const rel = norm(path.relative(ROOT, full));
    if (seen.has(rel)) return;
    // Escludi il deliverable stesso
    if (rel === 'Production/Conoscenze_congelate/META/CATALOGO_DOCUMENTALE_BHM_v2_FASE1.md') return;
    const ext = path.extname(full).toLowerCase();
    const base = path.basename(full);

    // Artifacts - catalog separately but mark
    if (base === 'error-context.md') {
      seen.add(rel);
      items.push({ full, rel, ext, artifact: true });
      return;
    }

    if (base.endsWith('.backup')) return;

    const isDocExt = DOC_EXTS.has(ext);
    const isJsonMeta = ext === '.json' && (
      base.includes('SHARED_STATE') || base.includes('TEMPLATE') || base.includes('results.json')
    );
    const isSql = ext === '.sql';
    const isCursorrules = base === '.cursorrules';
    const isCodeDoc = ['.ts', '.tsx'].includes(ext);

    if (!isDocExt && !isJsonMeta && !isSql && !isCursorrules && !isCodeDoc) return;

    // SQL: solo zone documentali esplicite (BackupDB, database, Info Scripts)
    if (isSql) {
      const sqlOk =
        rel.startsWith('BackupDB/') ||
        rel.startsWith('database/') ||
        rel.includes('Info/Scripts/SQL') ||
        rel.includes('Agent_Reports/Archive/');
      if (!sqlOk) return;
      try {
        const c = fs.readFileSync(full, 'utf8');
        if (!c.includes('--') && !rel.startsWith('BackupDB/')) return;
      } catch { return; }
    }

    // tests/: solo .md/.txt documentazione, non sorgenti test
    if (rel.startsWith('tests/') && !isDocExt) return;

    seen.add(rel);
    items.push({ full, rel, ext, artifact: false });
  }
}

function findDuplicateNote(rel, allRels) {
  const notes = [];
  const base = path.basename(rel);
  const candidates = allRels.filter((r) => r !== rel && path.basename(r) === base);
  if (candidates.length) {
    const arch = candidates.find((c) => c.includes('Archives/') || c.includes('Info_Complete'));
    if (arch && rel.startsWith('Info/')) notes.push(`possibile copia di ${arch}`);
    if (rel.includes('Archives/Tests') && candidates.some((c) => c.includes('Production/Archive/Test'))) {
      notes.push(`gemello Production/Archive/Test/${base}`);
    }
  }
  if (rel.includes('SCHEDULED_MAINTENANCE') && rel.includes('03_CONSERVATION/SCHEDULED') && !rel.includes('Conoscenze-Definizioni')) {
    notes.push('duplicato Conoscenze-Definizioni/SCHEDULED_MAINTENANCE_SECTION.md');
  }
  return notes.join('; ');
}

function buildEntry(id, item, allRels) {
  const { rel, ext, artifact } = item;
  let content = '';
  try { content = fs.readFileSync(item.full, 'utf8').slice(0, 8000); } catch { content = ''; }

  const zona = inferZona(rel);
  const categoria = artifact ? 'ARTIFACT' : inferCategoria(rel, ext, content);
  const area_app = inferArea(rel);
  const data_documento = inferDateFromPath(rel);
  const data_git = getGitDate(rel);
  const priorita = inferPriorita(zona, rel);
  let stato = inferStato(zona, rel);
  const note = findDuplicateNote(rel, allRels);
  if (note) stato = 'duplicato_sospetto';
  const titolo = inferTitolo(rel, content);
  const one_liner = inferOneLiner(rel, categoria, titolo);
  const lingua = inferLingua(content);
  const collegamenti = extractLinks(content);
  const codeRefs = extractCodeRefs(content);

  const tipoMap = {
    DEF: 'definizione', INV: 'inventario', TRACK: 'tracking', SESSION: 'report', PLAN: 'piano',
    GUIDE: 'guida', PROMPT: 'prompt', VISION: 'visione', ARCH: 'altro', DB: 'sql-doc',
    TEST: 'altro', COORD: 'altro', META: 'altro', DECISION: 'altro', 'CODE-DOC': 'altro', ARTIFACT: 'altro', altro: 'altro',
  };

  return {
    id: `DOC-${String(id).padStart(4, '0')}`,
    path: rel,
    filename: path.basename(rel),
    zona,
    categoria,
    area_app,
    tipo_contenuto: tipoMap[categoria] || 'altro',
    data_documento,
    data_ultima_modifica_git: data_git,
    lingua,
    stato_percepito: artifact ? 'indeterminato' : stato,
    priorita_fonte: artifact ? 'bassa' : priorita,
    collegamenti_interni: collegamenti,
    file_correlati_codice: codeRefs,
    titolo_inferito: titolo,
    one_liner,
    note_catalogatore: note || (content ? '' : 'illeggibile o file binario/vuoto'),
    artifact,
  };
}

// --- main ---
console.log('Scansione repository...');
const rawItems = collectFiles();
const catalogItems = rawItems.filter((i) => !i.artifact);
const artifacts = rawItems.filter((i) => i.artifact);

// Sort: zone order then path
const zoneOrder = [...ZONES.map((z) => z.key), 'src', 'altro'];
catalogItems.sort((a, b) => {
  const za = zoneOrder.indexOf(inferZona(a.rel));
  const zb = zoneOrder.indexOf(inferZona(b.rel));
  if (za !== zb) return (za === -1 ? 99 : za) - (zb === -1 ? 99 : zb);
  return a.rel.localeCompare(b.rel);
});

const allRels = catalogItems.map((i) => i.rel);
const entries = catalogItems.map((item, idx) => buildEntry(idx + 1, item, allRels));

// Pad to DOC-1122 if user requested fixed range - use actual count
const TARGET = 1122;
const actualCount = entries.length;

// Indices
const byZona = {};
const byCat = {};
const byArea = {};
const byPriorita = {};
const byDate = {};

for (const e of entries) {
  (byZona[e.zona] ||= []).push(e.id);
  (byCat[e.categoria] ||= []).push(e.id);
  (byArea[e.area_app] ||= []).push(e.id);
  (byPriorita[e.priorita_fonte] ||= []).push(e.id);
  const d = e.data_documento;
  (byDate[d] ||= []).push(e.id);
}

// Duplicates groups
const duplicati = entries.filter((e) => e.stato_percepito === 'duplicato_sospetto');

// Hub files
const hubs = entries.filter((e) =>
  e.filename.match(/^(README|MASTER_INDEX|INDEX|00_MASTER)/i) ||
  e.path.endsWith('.cursorrules') ||
  e.path.includes('MASTER_TRACKING.md')
);

// Gap (static from analysis)
const gaps = [
  'APP_DEFINITION/02_DASHBOARD — cartella vuota (0 definizioni)',
  'APP_DEFINITION/05_INVENTORY — cartella vuota',
  'APP_DEFINITION/06_SETTINGS — cartella vuota',
  'APP_DEFINITION/08_INTERACTIONS — cartella vuota',
  'AUTH — mancano REGISTER, FORGOT_PASSWORD, ACCEPT_INVITE in APP_DEFINITION',
  'Nessun documento unificato STATO_CORRENTE_PROGETTO',
  'Production/Conoscenze_congelate/META/ — creato con questo catalogo',
  'Sessione_di_lavoro/Agente_2 — alta densità senza INDEX locale',
  'ONBOARDING — doc sparsa tra Archive/Knowledge e APP_DEFINITION',
  'Test doc frammentata in 4 zone senza indice unico',
];

// Top 30 alta
const top30 = entries.filter((e) => e.priorita_fonte === 'alta').slice(0, 30);

// Tree
const treeDirs = new Set();
for (const e of entries) {
  const parts = e.path.split('/');
  for (let i = 1; i <= Math.min(parts.length, 4); i++) {
    treeDirs.add(parts.slice(0, i).join('/'));
  }
}

function yamlBlock(e) {
  return `\`\`\`yaml
id: ${e.id}
path: ${e.path}
filename: ${e.filename}
zona: ${e.zona}
categoria: ${e.categoria}
area_app: ${e.area_app}
tipo_contenuto: ${e.tipo_contenuto}
data_documento: ${e.data_documento}
data_ultima_modifica_git: ${e.data_ultima_modifica_git}
lingua: ${e.lingua}
stato_percepito: ${e.stato_percepito}
priorita_fonte: ${e.priorita_fonte}
collegamenti_interni: [${e.collegamenti_interni.map((x) => `"${x}"`).join(', ')}]
file_correlati_codice: [${e.file_correlati_codice.map((x) => `"${x}"`).join(', ')}]
titolo_inferito: "${e.titolo_inferito.replace(/"/g, "'")}"
one_liner: "${e.one_liner.replace(/"/g, "'")}"
note_catalogatore: "${(e.note_catalogatore || '').replace(/"/g, "'")}"
\`\`\``;
}

let md = `# CATALOGO DOCUMENTALE BHM v.2 — FASE 1 (Mappatura)

> **Generato**: ${new Date().toISOString().slice(0, 10)}  
> **Agente**: Catalogatore Documentale Fase 1  
> **Regola**: classificazione + metadati leggeri — **nessuna valutazione** di correttezza/aggiornamento

---

## Executive Summary

| Metrica | Valore |
|---------|--------|
| **TOTALE_CATALOGATO** | **${actualCount}** |
| **TOTALE_ESCLUSO (artifact + binari)** | **${artifacts.length + 1}** |
| File .md/.txt/.rst/.adoc | ${entries.filter((e) => DOC_EXTS.has(path.extname(e.path))).length} |
| File SQL documentali | ${entries.filter((e) => e.path.endsWith('.sql')).length} |
| File JSON metadati | ${entries.filter((e) => e.path.endsWith('.json')).length} |
| CODE-DOC (LOCKED) | ${entries.filter((e) => e.categoria === 'CODE-DOC').length} |
| Artefatti error-context | ${artifacts.length} |

### Conteggi per zona

| Zona | N |
|------|---|
${Object.entries(byZona).sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `| ${k} | ${v.length} |`).join('\n')}

### Conteggi per categoria

| Categoria | N |
|-----------|---|
${Object.entries(byCat).sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `| ${k} | ${v.length} |`).join('\n')}

---

## Mappa ad albero (cartelle con ≥1 file catalogato — profondità ≤4)

\`\`\`
${[...treeDirs].sort().slice(0, 200).join('\n')}
${treeDirs.size > 200 ? `\n... e altre ${treeDirs.size - 200} cartelle` : ''}
\`\`\`

---

## Tabella Master

| id | path | categoria | area_app | priorita | data | one_liner |
|----|------|-----------|----------|----------|------|-----------|
${entries.map((e) => `| ${e.id} | ${e.path} | ${e.categoria} | ${e.area_app} | ${e.priorita_fonte} | ${e.data_documento} | ${e.one_liner.replace(/\|/g, '/')} |`).join('\n')}

---

## Metadati YAML completi (per file)

${entries.map((e) => `### ${e.id} — ${e.path}\n\n${yamlBlock(e)}`).join('\n\n')}

---

## Indici derivati

### Per zona
${Object.entries(byZona).sort().map(([k, v]) => `- **${k}** (${v.length}): ${v.slice(0, 15).join(', ')}${v.length > 15 ? ` … +${v.length - 15}` : ''}`).join('\n')}

### Per categoria
${Object.entries(byCat).sort().map(([k, v]) => `- **${k}** (${v.length}): ${v.slice(0, 10).join(', ')}${v.length > 10 ? ` … +${v.length - 10}` : ''}`).join('\n')}

### Per area_app
${Object.entries(byArea).sort().map(([k, v]) => `- **${k}** (${v.length})`).join('\n')}

### Per priorita_fonte
${Object.entries(byPriorita).map(([k, v]) => `- **${k}** (${v.length})`).join('\n')}

### Cronologico (data_documento)
${Object.entries(byDate).filter(([d]) => d !== 'unknown').sort((a, b) => b[0].localeCompare(a[0])).slice(0, 30).map(([d, v]) => `- **${d}** (${v.length} file)`).join('\n')}

---

## Hub di navigazione

| Hub | Path | ID |
|-----|------|-----|
${hubs.slice(0, 25).map((h) => `| ${h.titolo_inferito.slice(0, 50)} | ${h.path} | ${h.id} |`).join('\n')}

---

## GRUPPI_DUPLICATI_SOSPETTI

| ID | Path | Note |
|----|------|------|
${duplicati.slice(0, 50).map((d) => `| ${d.id} | ${d.path} | ${d.note_catalogatore || 'archivio/duplicato strutturale'} |`).join('\n')}
${duplicati.length > 50 ? `\n*… e altri ${duplicati.length - 50} file con stato duplicato_sospetto*` : ''}

---

## Artefatti esclusi

| Tipo | Conteggio |
|------|-----------|
| test-results error-context.md | ${artifacts.length} |
| BackupDB/*.backup (binario) | 1 |

${artifacts.slice(0, 20).map((a) => `- \`${a.rel}\``).join('\n')}
${artifacts.length > 20 ? `\n… +${artifacts.length - 20} altri error-context in Archives/` : ''}

---

## Gap analysis documentale

${gaps.map((g, i) => `${i + 1}. ${g}`).join('\n')}

---

## PER_AGENTE_VALUTAZIONE (Handoff Fase 2)

### Top 30 — priorita_fonte: alta

${top30.map((e, i) => `${i + 1}. \`${e.path}\` (${e.id})`).join('\n')}

### Top 20 — duplicato_sospetto

${duplicati.slice(0, 20).map((e, i) => `${i + 1}. \`${e.path}\``).join('\n')}

### 10 hub di partenza

1. \`Production/Conoscenze_congelate/APP_DEFINITION/00_MASTER_INDEX.md\`
2. \`Production/Conoscenze_congelate/APP_VISION_CAPTURE.md\`
3. \`Production/Conoscenze_congelate/BETA_PRODUCTION_SPEC.md\`
4. \`Production/Archive/Knowledge/MASTER_INDEX.md\`
5. \`Production/Archive/Last_Info/Multi agent/MASTER_TRACKING.md\`
6. \`README.md\`
7. \`.cursorrules\`
8. \`Info/Knowledge_Base/Database/SCHEMA_ATTUALE.md\`
9. \`Info/User_Guides/Development/CURSOR-INSTRUCTIONS-CURRENT.md\`
10. \`Production/Conoscenze_congelate/APP_DEFINITION/README.md\`

---

**TOTALE_CATALOGATO: ${actualCount}**  
**TOTALE_ESCLUSO: ${artifacts.length + 1}**
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md, 'utf8');
console.log(`Scritto: ${OUT}`);
console.log(`Voci catalogo: ${actualCount}, artifact: ${artifacts.length}`);
console.log(`Dimensione file: ${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB`);

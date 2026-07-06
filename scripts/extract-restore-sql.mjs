#!/usr/bin/env node
/**
 * Estrae da cluster dump Supabase solo schema public + auth users,
 * convertendo COPY ... FROM stdin in INSERT per compatibilità Supabase CLI.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const input = path.join(root, 'BackupDB', 'db_cluster-04-11-2025@23-01-36.backup')
const output = path.join(root, 'BackupDB', 'restore-bhm-public.sql')

const lines = fs.readFileSync(input, 'utf8').split(/\r?\n/)
const out = []

out.push(`-- BHM v.2 restore (public schema + auth users)
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET row_security = off;
`)

function skipLine(line) {
  if (!line.trim()) return false
  if (line.startsWith('\\restrict') || line.startsWith('\\unrestrict')) return true
  if (/^ALTER (TABLE|FUNCTION|SEQUENCE) .* OWNER TO/.test(line)) return true
  if (line.startsWith('COMMENT ON')) return true
  return false
}

function pushBlock(blockLines) {
  for (const line of blockLines) {
    if (!skipLine(line)) out.push(line)
  }
  if (blockLines.length) out.push('')
}

function parseCopyHeader(line) {
  const m = line.match(/^COPY ([\w.]+) \((.+)\) FROM stdin;$/)
  if (!m) return null
  const table = m[1]
  const columns = m[2].split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
  return { table, columns }
}

function tabValueToSql(value) {
  if (value === '\\N') return 'NULL'
  // Escape single quotes
  const escaped = value.replace(/'/g, "''")
  return `'${escaped}'`
}

function copyBlockToInserts(blockLines) {
  const header = blockLines[0]
  const parsed = parseCopyHeader(header)
  if (!parsed) return []

  const inserts = []
  for (let i = 1; i < blockLines.length; i++) {
    const line = blockLines[i]
    if (line === '\\.' || line === '') continue
    const parts = line.split('\t')
    if (parts.length !== parsed.columns.length) {
      console.warn(`⚠️ Column count mismatch for ${parsed.table} line ${i}: expected ${parsed.columns.length}, got ${parts.length}`)
      continue
    }
    const values = parts.map(tabValueToSql).join(', ')
    const cols = parsed.columns.map((c) => (c.includes('"') ? c : `"${c}"`)).join(', ')
    inserts.push(`INSERT INTO ${parsed.table} (${cols}) VALUES (${values}) ON CONFLICT DO NOTHING;`)
  }
  return inserts
}

// --- 1. Public functions ---
{
  let block = []
  let inFn = false
  for (const line of lines) {
    if (line.startsWith('CREATE FUNCTION public.')) {
      inFn = true
      block = [line]
      continue
    }
    if (inFn) {
      block.push(line)
      if (line === '$$;') {
        pushBlock(block)
        inFn = false
        block = []
      }
    }
  }
}

// --- 2. Public tables ---
{
  let block = []
  let inTable = false
  for (const line of lines) {
    if (line.startsWith('CREATE TABLE public.')) {
      inTable = true
      block = [line]
      continue
    }
    if (inTable) {
      if (line.startsWith('CREATE TABLE ') && !line.startsWith('CREATE TABLE public.')) {
        pushBlock(block)
        inTable = false
        block = []
        continue
      }
      if (line.startsWith('ALTER TABLE public.') && line.includes(' OWNER TO')) {
        pushBlock(block)
        inTable = false
        block = []
        continue
      }
      block.push(line)
    }
  }
  if (block.length) pushBlock(block)
}

// --- 3. PK / UNIQUE ---
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  if (line.startsWith('ALTER TABLE ONLY public.')) {
    const next = lines[i + 1]
    if (next?.trim().startsWith('ADD CONSTRAINT') && !next.includes('FOREIGN KEY')) {
      pushBlock([line, next])
      i++
    }
  }
}

// --- 4. FK (public) ---
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  if (line.includes('FK CONSTRAINT; Schema: public')) {
    for (let j = i; j < Math.min(i + 6, lines.length); j++) {
      if (lines[j].startsWith('ALTER TABLE ONLY public.')) {
        const next = lines[j + 1]
        if (next?.includes('FOREIGN KEY')) pushBlock([lines[j], next])
        break
      }
    }
  }
}

// --- 5. Indexes ---
for (const line of lines) {
  if (/^CREATE (UNIQUE )?INDEX/.test(line) && line.includes(' ON public.')) {
    out.push(line)
    out.push('')
  }
}

// --- 6. Triggers ---
for (const line of lines) {
  if (line.startsWith('CREATE TRIGGER') && line.includes(' ON public.')) {
    out.push(line)
    out.push('')
  }
}

// --- 7. Data as INSERT ---
out.push('SET session_replication_role = replica;')
out.push('')

function extractAndConvertCopy(predicate) {
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('COPY ') && predicate(line)) {
      const block = [line]
      i++
      while (i < lines.length && lines[i] !== '\\.') {
        block.push(lines[i])
        i++
      }
      const inserts = copyBlockToInserts(block)
      out.push(...inserts)
      out.push('')
    }
    i++
  }
}

extractAndConvertCopy((l) => l.startsWith('COPY auth.users '))
extractAndConvertCopy((l) => l.startsWith('COPY auth.identities '))
extractAndConvertCopy((l) => l.startsWith('COPY public.'))

out.push('SET session_replication_role = DEFAULT;')
out.push('')

// RLS policies applied separately via database/policies + restore-bhm-rls-extended.sql

fs.writeFileSync(output, out.join('\n'), 'utf8')
console.log(`✅ Written ${output}`)
console.log(`   Lines: ${out.length}`)
console.log(`   Size: ${(fs.statSync(output).size / 1024).toFixed(1)} KB`)

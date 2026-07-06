#!/usr/bin/env node
/** Estrae CREATE POLICY multiline + ENABLE RLS per tabelle extended dal backup */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const input = path.join(root, 'BackupDB', 'db_cluster-04-11-2025@23-01-36.backup')
const output = path.join(root, 'BackupDB', 'restore-bhm-rls-extended.sql')

const lines = fs.readFileSync(input, 'utf8').split(/\r?\n/)
const out = ['-- Extended table RLS from backup\n']

let block = []
let inPolicy = false

for (const line of lines) {
  if (line.startsWith('CREATE POLICY') && line.includes(' ON public.')) {
    inPolicy = true
    block = [line]
    if (line.trimEnd().endsWith(');')) {
      out.push(...block, '')
      inPolicy = false
      block = []
    }
    continue
  }
  if (inPolicy) {
    block.push(line)
    if (line.trimEnd().endsWith(');')) {
      out.push(...block, '')
      inPolicy = false
      block = []
    }
  }
}

for (const line of lines) {
  if (line.startsWith('ALTER TABLE public.') && line.includes('ENABLE ROW LEVEL SECURITY')) {
    out.push(line, '')
  }
}

fs.writeFileSync(output, out.join('\n'), 'utf8')
console.log(`✅ ${output} (${out.length} lines)`)

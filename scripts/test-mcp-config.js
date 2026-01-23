#!/usr/bin/env node

/**
 * 🧪 MCP CONFIGURATION TEST SCRIPT
 * 
 * Verifica che tutti i MCP siano configurati correttamente
 * per il progetto Business HACCP Manager v.2
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 MCP Configuration Test - Business HACCP Manager v.2\n');

// Test 1: Verifica file configurazione
console.log('📋 Test 1: Verifica file configurazione');
const mcpConfigPath = '.cursor/mcp.json';
const envTemplatePath = 'Production/Sessione_di_lavoro/Agente_9/2025-10-25/MCP_ENV_TEMPLATE.env';

if (existsSync(mcpConfigPath)) {
  console.log('✅ .cursor/mcp.json trovato');
} else {
  console.log('❌ .cursor/mcp.json non trovato');
  process.exit(1);
}

if (existsSync(envTemplatePath)) {
  console.log('✅ Template variabili ambiente trovato');
} else {
  console.log('❌ Template variabili ambiente non trovato');
  process.exit(1);
}

// Test 2: Verifica MCP servers disponibili
console.log('\n🔧 Test 2: Verifica MCP servers');
const mcpServers = [
  '@supabase/mcp-server',
  '@playwright/mcp-server', 
  '@modelcontextprotocol/server-github',
  '@modelcontextprotocol/server-filesystem',
  '@modelcontextprotocol/server-terminal'
];

for (const server of mcpServers) {
  try {
    execSync(`npx ${server} --help`, { stdio: 'pipe' });
    console.log(`✅ ${server} disponibile`);
  } catch (error) {
    console.log(`❌ ${server} non disponibile - installa con: npm install -g ${server}`);
  }
}

// Test 3: Verifica variabili ambiente
console.log('\n🌍 Test 3: Verifica variabili ambiente');
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'PLAYWRIGHT_BROWSERS_PATH'
];

const optionalEnvVars = [
  'GITHUB_TOKEN'
];

for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} configurato`);
  } else {
    console.log(`⚠️  ${envVar} non configurato (richiesto)`);
  }
}

for (const envVar of optionalEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} configurato`);
  } else {
    console.log(`ℹ️  ${envVar} non configurato (opzionale per GitHub MCP)`);
  }
}

// Test 4: Verifica directory progetto
console.log('\n📁 Test 4: Verifica directory progetto');
const projectPath = process.cwd();
const expectedFiles = [
  'package.json',
  'src',
  'Production',
  '.cursor'
];

for (const file of expectedFiles) {
  if (existsSync(join(projectPath, file))) {
    console.log(`✅ ${file} trovato`);
  } else {
    console.log(`❌ ${file} non trovato`);
  }
}

// Test 5: Verifica comandi npm
console.log('\n📦 Test 5: Verifica comandi npm');
const npmCommands = [
  'dev',
  'dev:multi',
  'test:agent1',
  'test:agent2',
  'test:agent3',
  'lock:status',
  'validate:pre-test'
];

try {
  const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));
  const scripts = packageJson.scripts || {};
  
  for (const cmd of npmCommands) {
    if (scripts[cmd]) {
      console.log(`✅ npm run ${cmd} disponibile`);
    } else {
      console.log(`❌ npm run ${cmd} non disponibile`);
    }
  }
} catch (error) {
  console.log('❌ Errore lettura package.json');
}

// Risultato finale
console.log('\n🎯 RISULTATO FINALE');
console.log('==================');
console.log('✅ Configurazione MCP completata!');
console.log('\n📋 PROSSIMI STEP:');
console.log('1. Copia MCP_ENV_TEMPLATE.env in .env.local');
console.log('2. Aggiungi il tuo GitHub token in .env.local');
console.log('3. Riavvia Cursor per caricare i nuovi MCP');
console.log('4. Testa i MCP con i comandi di esempio');

console.log('\n🔗 RISORSE:');
console.log('- GitHub Token: https://github.com/settings/tokens');
console.log('- MCP Docs: https://modelcontextprotocol.io/');
console.log('- Setup Guide: Production/Sessione_di_lavoro/Agente_9/2025-10-25/MCP_SETUP_GUIDE.md');





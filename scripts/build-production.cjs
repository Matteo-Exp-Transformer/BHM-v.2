#!/usr/bin/env node

/**
 * 🏗️ BUILD PRODUCTION
 * 
 * Script robusto per build di produzione con gestione errori e timeout
 * Gestisce cleanup, build e errori senza interrompere il processo
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

// Timeout per operazioni (5 minuti)
const BUILD_TIMEOUT = 5 * 60 * 1000;

/**
 * Esegue cleanup in modo sicuro
 */
async function runCleanup() {
  console.log('🧹 Running cleanup...');
  
  const cleanupScript = path.join(__dirname, '..', 'cleanup.ps1');
  
  try {
    // Verifica se il file esiste
    await fs.access(cleanupScript);
    
    // Esegui cleanup con timeout
    const { stdout, stderr } = await execAsync(
      `powershell -ExecutionPolicy Bypass -File "${cleanupScript}"`,
      { timeout: 30000 } // 30 secondi per cleanup
    );
    
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    // Non bloccare il build se cleanup fallisce
    console.warn('⚠️  Cleanup script warning (continuing build):', error.message);
  }
}

/**
 * Esegue build Vite
 */
async function runBuild() {
  console.log('🏗️  Starting production build...');
  
  return new Promise((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });
    
    // Timeout per il build
    const timeout = setTimeout(() => {
      buildProcess.kill();
      reject(new Error('Build timeout: processo interrotto dopo 5 minuti'));
    }, BUILD_TIMEOUT);
    
    buildProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        console.log('✅ Build completed successfully');
        resolve();
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
    
    buildProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    // Gestione SIGINT per cleanup graceful
    process.on('SIGINT', () => {
      console.log('\n⚠️  Build interrupted by user');
      buildProcess.kill();
      process.exit(1);
    });
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Step 1: Cleanup
    await runCleanup();
    
    // Step 2: Build
    await runBuild();
    
    console.log('🎉 Production build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Esegui
main();

#!/usr/bin/env node

/**
 * Bootstrap Admin Script
 * 
 * Creates the initial admin user for the Business HACCP Manager system.
 * This script should be run once during initial setup.
 * 
 * Usage:
 *   node scripts/bootstrap-admin.js
 *   node scripts/bootstrap-admin.js --email admin@company.com --name "Admin User"
 * 
 * Environment Variables:
 *   - DATABASE_URL: PostgreSQL connection string
 *   - ADMIN_EMAIL: Admin email (default: admin@bhm.local)
 *   - ADMIN_NAME: Admin name (default: "System Administrator")
 *   - ADMIN_PASSWORD: Admin password (default: generated)
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const readline = require('readline');

// Configuration
const config = {
  database: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/bhm_auth'
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@bhm.local',
    name: process.env.ADMIN_NAME || 'System Administrator',
    password: process.env.ADMIN_PASSWORD,
    tenantName: process.env.TENANT_NAME || 'Default Organization',
    tenantSlug: process.env.TENANT_SLUG || 'default-org'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecurePassword() {
  const length = 16;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required set
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Symbol
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function promptForInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function validatePassword(password) {
  const minLength = 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return {
    valid: password.length >= minLength && hasUppercase && hasLowercase && hasNumber && hasSymbol,
    errors: [
      ...(password.length < minLength ? [`Password must be at least ${minLength} characters long`] : []),
      ...(!hasUppercase ? ['Password must contain at least one uppercase letter'] : []),
      ...(!hasLowercase ? ['Password must contain at least one lowercase letter'] : []),
      ...(!hasNumber ? ['Password must contain at least one number'] : []),
      ...(!hasSymbol ? ['Password must contain at least one symbol'] : [])
    ]
  };
}

async function bootstrapAdmin() {
  log('🚀 Starting Bootstrap Admin Setup', 'cyan');
  log('=====================================', 'cyan');
  
  try {
    // Connect to database
    log('📡 Connecting to database...', 'blue');
    const client = new Client(config.database);
    await client.connect();
    log('✅ Database connected successfully', 'green');
    
    // Check if admin already exists
    log('🔍 Checking for existing admin user...', 'blue');
    const existingAdmin = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [config.admin.email]
    );
    
    if (existingAdmin.rows.length > 0) {
      log(`⚠️  Admin user already exists: ${config.admin.email}`, 'yellow');
      const overwrite = await promptForInput('Do you want to overwrite it? (y/N): ');
      
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        log('❌ Bootstrap cancelled', 'red');
        await client.end();
        process.exit(0);
      }
      
      // Delete existing admin
      await client.query('DELETE FROM users WHERE email = $1', [config.admin.email]);
      log('🗑️  Existing admin user removed', 'yellow');
    }
    
    // Get admin details
    let email = config.admin.email;
    let name = config.admin.name;
    let password = config.admin.password;
    
    // Prompt for email if not provided
    if (!email || email === 'admin@bhm.local') {
      email = await promptForInput('Enter admin email: ');
      if (!email) {
        log('❌ Email is required', 'red');
        await client.end();
        process.exit(1);
      }
    }
    
    // Validate email
    if (!await validateEmail(email)) {
      log('❌ Invalid email format', 'red');
      await client.end();
      process.exit(1);
    }
    
    // Prompt for name if not provided
    if (!name || name === 'System Administrator') {
      name = await promptForInput('Enter admin name: ');
      if (!name) {
        name = 'System Administrator';
      }
    }
    
    // Prompt for password if not provided
    if (!password) {
      const useGenerated = await promptForInput('Generate secure password? (Y/n): ');
      
      if (useGenerated.toLowerCase() === 'n' || useGenerated.toLowerCase() === 'no') {
        password = await promptForInput('Enter admin password: ');
        if (!password) {
          log('❌ Password is required', 'red');
          await client.end();
          process.exit(1);
        }
        
        // Validate password
        const validation = await validatePassword(password);
        if (!validation.valid) {
          log('❌ Password validation failed:', 'red');
          validation.errors.forEach(error => log(`   - ${error}`, 'red'));
          await client.end();
          process.exit(1);
        }
      } else {
        password = generateSecurePassword();
        log(`🔐 Generated secure password: ${password}`, 'green');
      }
    }
    
    // Hash password
    log('🔒 Hashing password...', 'blue');
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate user ID
    const userId = crypto.randomUUID();
    
    // Start transaction
    await client.query('BEGIN');
    
    try {
      // Create admin user
      log('👤 Creating admin user...', 'blue');
      await client.query(`
        INSERT INTO users (
          id, email, password_hash, email_verified, 
          created_at, updated_at, status, profile
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        userId,
        email,
        passwordHash,
        true, // Email verified for bootstrap
        new Date(),
        new Date(),
        'active',
        JSON.stringify({ name, first_name: name.split(' ')[0], last_name: name.split(' ').slice(1).join(' ') })
      ]);
      
      // Get or create default tenant
      log('🏢 Setting up default tenant...', 'blue');
      let tenantId = 'tenant-default';
      
      const existingTenant = await client.query(
        'SELECT id FROM tenants WHERE slug = $1',
        [config.admin.tenantSlug]
      );
      
      if (existingTenant.rows.length === 0) {
        await client.query(`
          INSERT INTO tenants (id, name, slug, created_at, updated_at, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          tenantId,
          config.admin.tenantName,
          config.admin.tenantSlug,
          new Date(),
          new Date(),
          'active'
        ]);
      } else {
        tenantId = existingTenant.rows[0].id;
      }
      
      // Get owner role
      const ownerRole = await client.query(
        'SELECT id FROM roles WHERE name = $1',
        ['owner']
      );
      
      if (ownerRole.rows.length === 0) {
        throw new Error('Owner role not found. Please run database migrations first.');
      }
      
      // Assign owner role to admin
      log('👑 Assigning owner role...', 'blue');
      await client.query(`
        INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_by, assigned_at, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId,
        ownerRole.rows[0].id,
        tenantId,
        userId, // Self-assigned
        new Date(),
        true
      ]);
      
      // Commit transaction
      await client.query('COMMIT');
      
      // Log success
      log('✅ Bootstrap completed successfully!', 'green');
      log('=====================================', 'green');
      log(`📧 Admin Email: ${email}`, 'cyan');
      log(`👤 Admin Name: ${name}`, 'cyan');
      log(`🔐 Password: ${password}`, 'cyan');
      log(`🏢 Tenant: ${config.admin.tenantName}`, 'cyan');
      log(`🆔 User ID: ${userId}`, 'cyan');
      log('=====================================', 'green');
      log('⚠️  IMPORTANT: Save these credentials securely!', 'yellow');
      log('⚠️  Change the password on first login!', 'yellow');
      
      // Log audit event
      await client.query(`
        INSERT INTO audit_log (
          action, outcome, reason, metadata, timestamp
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        'bootstrap_admin',
        'success',
        'Initial admin user created',
        JSON.stringify({
          admin_email: email,
          admin_name: name,
          tenant_name: config.admin.tenantName,
          bootstrap_timestamp: new Date()
        }),
        new Date()
      ]);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
    await client.end();
    
  } catch (error) {
    log(`❌ Bootstrap failed: ${error.message}`, 'red');
    log(`📋 Error details: ${error.stack}`, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--email':
        config.admin.email = value;
        break;
      case '--name':
        config.admin.name = value;
        break;
      case '--password':
        config.admin.password = value;
        break;
      case '--tenant-name':
        config.admin.tenantName = value;
        break;
      case '--tenant-slug':
        config.admin.tenantSlug = value;
        break;
      case '--help':
        log('Bootstrap Admin Script', 'cyan');
        log('=====================', 'cyan');
        log('Usage: node scripts/bootstrap-admin.js [options]', 'blue');
        log('', 'reset');
        log('Options:', 'yellow');
        log('  --email <email>        Admin email address', 'blue');
        log('  --name <name>          Admin full name', 'blue');
        log('  --password <password>  Admin password', 'blue');
        log('  --tenant-name <name>   Default tenant name', 'blue');
        log('  --tenant-slug <slug>   Default tenant slug', 'blue');
        log('  --help                 Show this help message', 'blue');
        log('', 'reset');
        log('Environment Variables:', 'yellow');
        log('  DATABASE_URL           PostgreSQL connection string', 'blue');
        log('  ADMIN_EMAIL            Admin email address', 'blue');
        log('  ADMIN_NAME             Admin full name', 'blue');
        log('  ADMIN_PASSWORD         Admin password', 'blue');
        log('  TENANT_NAME            Default tenant name', 'blue');
        log('  TENANT_SLUG            Default tenant slug', 'blue');
        process.exit(0);
 workers
    }
  }
  
  bootstrapAdmin();
}

module.exports = { bootstrapAdmin, generateSecurePassword, validateEmail, validatePassword };

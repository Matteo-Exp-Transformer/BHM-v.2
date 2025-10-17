#!/usr/bin/env node
/**
 * 🔍 Check DB State - Verifica stato database prima/dopo test
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tucqgcfrlzmwyfadiodo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY0ODksImV4cCI6MjA3NTUzMjQ4OX0.7m3bdxW8QMHO6YNQ4cxoxlzzgzq7DjTzufv89YAcHA4'
);

async function checkDBState() {
  console.log('🔍 Verifica stato database Supabase...\n');

  try {
    // 1. Test connessione
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'matteo.cavallaro.work@gmail.com',
      password: 'cavallaro'
    });

    if (authError) {
      console.error('❌ Errore autenticazione:', authError.message);
      return;
    }

    console.log('✅ Connessione Supabase OK');
    console.log('👤 User ID:', user.id);

    // 2. Get Company ID
    const { data: companyMember } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!companyMember) {
      console.error('❌ Company non trovata');
      return;
    }

    const companyId = companyMember.company_id;
    console.log('🏢 Company ID:', companyId);

    // 3. Count tabelle principali
    const tables = [
      'staff',
      'departments',
      'conservation_points',
      'products',
      'tasks',
      'maintenance_tasks',
      'temperature_readings',
      'events'
    ];

    console.log('\n📊 Stato tabelle:');
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      if (error) {
        console.log(`  ❌ ${table}: errore query`);
      } else {
        console.log(`  📋 ${table}: ${count} record`);
      }
    }

    // 4. Verifica dati Precompila
    console.log('\n🔍 Verifica dati Precompila:');

    const { data: staff } = await supabase
      .from('staff')
      .select('name, email')
      .eq('company_id', companyId);

    if (staff?.length) {
      console.log('  👥 Staff:');
      staff.forEach(s => console.log(`    - ${s.name} (${s.email})`));
    }

    const { data: departments } = await supabase
      .from('departments')
      .select('name')
      .eq('company_id', companyId);

    if (departments?.length) {
      console.log('  🏢 Departments:');
      departments.forEach(d => console.log(`    - ${d.name}`));
    }

    const { data: points } = await supabase
      .from('conservation_points')
      .select('name, type')
      .eq('company_id', companyId);

    if (points?.length) {
      console.log('  🌡️ Conservation Points:');
      points.forEach(p => console.log(`    - ${p.name} (${p.type})`));
    }

    console.log('\n✅ Verifica completata!');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

checkDBState();

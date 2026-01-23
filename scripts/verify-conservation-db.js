#!/usr/bin/env node
/**
 * Script di verifica database Conservation - Supervisor Check
 *
 * Esegui con: node scripts/verify-conservation-db.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carica .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRORE: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non trovati in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 SUPERVISOR CHECK - Conservation Database Verification\n')
console.log('='.repeat(80))

// 1. Check orphan conservation points
async function checkOrphanPoints() {
  console.log('\n\n📋 1. ORPHAN CONSERVATION POINTS')
  console.log('-'.repeat(80))

  try {
    const { data, error, count } = await supabase
      .from('conservation_points')
      .select('id, name, type, department_id', { count: 'exact' })
      .is('maintenance_tasks.id', null)

    if (error) {
      console.error('❌ Error:', error.message)
      // Try alternative query
      const { data: allPoints, error: err1 } = await supabase
        .from('conservation_points')
        .select('id, name, type, department_id')

      if (err1) {
        console.error('❌ Alternative query failed:', err1.message)
        return { orphanCount: 'UNKNOWN', data: null }
      }

      // Check manually for orphans
      const orphans = []
      for (const point of allPoints) {
        const { data: tasks, error: err2 } = await supabase
          .from('maintenance_tasks')
          .select('id')
          .eq('conservation_point_id', point.id)

        if (!err2 && (!tasks || tasks.length === 0)) {
          orphans.push(point)
        }
      }

      console.log(`✅ Orphan points count: ${orphans.length}`)
      if (orphans.length > 0) {
        console.table(orphans)
      }
      return { orphanCount: orphans.length, data: orphans }
    }

    console.log(`✅ Orphan points count: ${count || 0}`)
    if (data && data.length > 0) {
      console.table(data)
    }
    return { orphanCount: count || 0, data }
  } catch (err) {
    console.error('❌ Exception:', err.message)
    return { orphanCount: 'ERROR', data: null }
  }
}

// 2. Check orphan temperature readings
async function checkOrphanReadings() {
  console.log('\n\n🌡️  2. ORPHAN TEMPERATURE READINGS')
  console.log('-'.repeat(80))

  try {
    const { data: allReadings, error: err1 } = await supabase
      .from('temperature_readings')
      .select('id, temperature, conservation_point_id, recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(1000)

    if (err1) {
      console.error('❌ Error fetching readings:', err1.message)
      return { orphanCount: 'ERROR', data: null }
    }

    // Check for orphans manually
    const orphans = []
    for (const reading of allReadings) {
      const { data: point, error: err2 } = await supabase
        .from('conservation_points')
        .select('id')
        .eq('id', reading.conservation_point_id)
        .single()

      if (err2 || !point) {
        orphans.push(reading)
      }
    }

    console.log(`✅ Orphan readings count: ${orphans.length}`)
    if (orphans.length > 0) {
      console.table(orphans.slice(0, 10))
      if (orphans.length > 10) {
        console.log(`  ... and ${orphans.length - 10} more`)
      }
    }
    return { orphanCount: orphans.length, data: orphans }
  } catch (err) {
    console.error('❌ Exception:', err.message)
    return { orphanCount: 'ERROR', data: null }
  }
}

// 3. Check migration 015 applied (temperature_readings fields)
async function checkMigration015() {
  console.log('\n\n📦 3. MIGRATION 015 STATUS (temperature_readings fields)')
  console.log('-'.repeat(80))

  try {
    // Try to select the new fields
    const { data, error } = await supabase
      .from('temperature_readings')
      .select('id, method, notes, photo_evidence, recorded_by')
      .limit(1)

    if (error) {
      console.error('❌ Migration 015 NOT APPLIED')
      console.error('   Error:', error.message)
      return { applied: false, fields: [] }
    }

    console.log('✅ Migration 015 APPLIED')
    console.log('   Fields present: method, notes, photo_evidence, recorded_by')

    // Count how many readings have these fields populated
    const { data: populated, error: err2 } = await supabase
      .from('temperature_readings')
      .select('method, notes, photo_evidence, recorded_by')
      .not('method', 'is', null)

    if (!err2) {
      console.log(`   Readings with method populated: ${populated?.length || 0}`)
    }

    return { applied: true, fields: ['method', 'notes', 'photo_evidence', 'recorded_by'] }
  } catch (err) {
    console.error('❌ Exception:', err.message)
    return { applied: false, fields: [] }
  }
}

// 4. Check migration 016 applied (maintenance_completions table)
async function checkMigration016() {
  console.log('\n\n📦 4. MIGRATION 016 STATUS (maintenance_completions table)')
  console.log('-'.repeat(80))

  try {
    // Try to select from maintenance_completions
    const { data, error } = await supabase
      .from('maintenance_completions')
      .select('id, maintenance_task_id, completed_by, completed_at')
      .limit(1)

    if (error) {
      console.error('❌ Migration 016 NOT APPLIED')
      console.error('   Error:', error.message)
      console.error('   Table maintenance_completions does NOT exist')
      return { applied: false, count: 0 }
    }

    console.log('✅ Migration 016 APPLIED')
    console.log('   Table maintenance_completions exists')

    // Count completions
    const { count, error: err2 } = await supabase
      .from('maintenance_completions')
      .select('*', { count: 'exact', head: true })

    if (!err2) {
      console.log(`   Total completions: ${count || 0}`)
    }

    return { applied: true, count: count || 0 }
  } catch (err) {
    console.error('❌ Exception:', err.message)
    return { applied: false, count: 0 }
  }
}

// Main execution
async function main() {
  const results = {}

  results.orphanPoints = await checkOrphanPoints()
  results.orphanReadings = await checkOrphanReadings()
  results.migration015 = await checkMigration015()
  results.migration016 = await checkMigration016()

  // Summary
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 SUMMARY')
  console.log('='.repeat(80))
  console.log(`Orphan Conservation Points: ${results.orphanPoints.orphanCount}`)
  console.log(`Orphan Temperature Readings: ${results.orphanReadings.orphanCount}`)
  console.log(`Migration 015 (temperature fields): ${results.migration015.applied ? '✅ APPLIED' : '❌ NOT APPLIED'}`)
  console.log(`Migration 016 (completions table): ${results.migration016.applied ? '✅ APPLIED' : '❌ NOT APPLIED'}`)

  // Verdict
  console.log('\n' + '='.repeat(80))
  console.log('🏁 VERDICT')
  console.log('='.repeat(80))

  const criticalIssues = []

  if (typeof results.orphanPoints.orphanCount === 'number' && results.orphanPoints.orphanCount > 0) {
    criticalIssues.push(`⚠️  ${results.orphanPoints.orphanCount} orphan conservation points`)
  }

  if (typeof results.orphanReadings.orphanCount === 'number' && results.orphanReadings.orphanCount > 0) {
    criticalIssues.push(`⚠️  ${results.orphanReadings.orphanCount} orphan temperature readings`)
  }

  if (!results.migration015.applied) {
    criticalIssues.push('❌ Migration 015 NOT applied')
  }

  if (!results.migration016.applied) {
    criticalIssues.push('❌ Migration 016 NOT applied')
  }

  if (criticalIssues.length === 0) {
    console.log('✅ ALL CHECKS PASSED')
  } else {
    console.log('❌ CRITICAL ISSUES FOUND:')
    criticalIssues.forEach(issue => console.log('   ' + issue))
  }

  console.log('\n')
  process.exit(criticalIssues.length > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
})

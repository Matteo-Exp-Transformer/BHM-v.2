#!/usr/bin/env node
/**
 * Script di test per BUG-008: Form Alignment
 *
 * Verifica che TasksStep.tsx e GenericTaskForm.tsx siano allineati
 * Esegui con: node scripts/test-form-alignment.js
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = join(__dirname, '..')

console.log('🔍 Test BUG-008: Form Alignment\n')
console.log('=' .repeat(80))

// Campi richiesti nel form
const requiredFields = [
  { name: 'name', label: 'Nome attività' },
  { name: 'frequenza', label: 'Frequenza' },
  { name: 'assegnatoARuolo', label: 'Ruolo' },
  { name: 'assegnatoACategoria', label: 'Categoria' },
  { name: 'departmentId', label: 'Reparto' },
  { name: 'assegnatoADipendenteSpecifico', label: 'Dipendente specifico' },
  { name: 'giorniCustom', label: 'Giorni della settimana' },
  { name: 'giornoMese', label: 'Giorno del mese' },
  { name: 'dataInizio', label: 'Data Inizio' },
  { name: 'dataFine', label: 'Data Fine' },
  { name: 'timeManagement', label: 'Gestione Orario' },
  { name: 'note', label: 'Note' },
]

// Leggi i file
const tasksStepPath = join(projectRoot, 'src', 'components', 'onboarding-steps', 'TasksStep.tsx')
const genericTaskFormPath = join(projectRoot, 'src', 'features', 'calendar', 'components', 'GenericTaskForm.tsx')

let tasksStepContent, genericTaskFormContent

try {
  tasksStepContent = readFileSync(tasksStepPath, 'utf-8')
  genericTaskFormContent = readFileSync(genericTaskFormPath, 'utf-8')
} catch (error) {
  console.error('❌ Errore lettura file:', error.message)
  process.exit(1)
}

console.log('\n📋 1. VERIFICA PRESENZA CAMPI')
console.log('-'.repeat(80))

const results = []

requiredFields.forEach(field => {
  const inTasksStep = tasksStepContent.includes(field.name)
  const inGenericForm = genericTaskFormContent.includes(field.name)

  const status = inTasksStep && inGenericForm ? '✅' : '❌'
  const alignment = inTasksStep === inGenericForm ? 'ALLINEATO' : 'NON ALLINEATO'

  results.push({
    campo: field.label,
    onboarding: inTasksStep ? '✅' : '❌',
    attivita: inGenericForm ? '✅' : '❌',
    status: alignment
  })

  if (!inGenericForm && inTasksStep) {
    console.log(`⚠️  ${field.label} (${field.name}): Presente in onboarding ma MANCANTE in /Attività`)
  }
})

console.table(results)

// Verifica specifica per dataInizio e dataFine
console.log('\n📋 2. VERIFICA DETTAGLIATA dataInizio/dataFine')
console.log('-'.repeat(80))

const dataInizioChecks = {
  'Input UI in GenericForm': genericTaskFormContent.includes('Data Inizio (Opzionale)'),
  'value={formData.dataInizio}': genericTaskFormContent.includes('value={formData.dataInizio'),
  'updateField({ dataInizio': genericTaskFormContent.includes('updateField({ dataInizio'),
  'Validazione dataFine > dataInizio': genericTaskFormContent.includes('Data fine deve essere successiva'),
}

console.log('\n✅ GenericTaskForm.tsx:')
Object.entries(dataInizioChecks).forEach(([check, passed]) => {
  console.log(`   ${passed ? '✅' : '❌'} ${check}`)
})

const dataInizioOnboarding = {
  'Input UI in TasksStep': tasksStepContent.includes('Data Inizio (Opzionale)'),
  'value={task.dataInizio}': tasksStepContent.includes('task.dataInizio'),
  'updateTask({ dataInizio': tasksStepContent.includes('dataInizio'),
}

console.log('\n✅ TasksStep.tsx (onboarding):')
Object.entries(dataInizioOnboarding).forEach(([check, passed]) => {
  console.log(`   ${passed ? '✅' : '❌'} ${check}`)
})

// Verifica gestione nel backend
console.log('\n📋 3. VERIFICA BACKEND HANDLING')
console.log('-'.repeat(80))

const useGenericTasksPath = join(projectRoot, 'src', 'features', 'calendar', 'hooks', 'useGenericTasks.ts')
const calendarPagePath = join(projectRoot, 'src', 'features', 'calendar', 'CalendarPage.tsx')
const onboardingHelpersPath = join(projectRoot, 'src', 'utils', 'onboardingHelpers.ts')

try {
  const useGenericTasksContent = readFileSync(useGenericTasksPath, 'utf-8')
  const calendarPageContent = readFileSync(calendarPagePath, 'utf-8')
  const onboardingHelpersContent = readFileSync(onboardingHelpersPath, 'utf-8')

  const backendChecks = {
    'useGenericTasks: end_date in description': useGenericTasksContent.includes('[END_DATE:'),
    'useGenericTasks: start_date handling': useGenericTasksContent.includes('start_date'),
    'CalendarPage: passa start_date': calendarPageContent.includes('start_date: taskData.dataInizio'),
    'CalendarPage: passa end_date': calendarPageContent.includes('end_date: taskData.dataFine'),
    'onboardingHelpers: end_date in description': onboardingHelpersContent.includes('[END_DATE:'),
  }

  console.log('\n✅ Backend handling:')
  Object.entries(backendChecks).forEach(([check, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${check}`)
  })

} catch (error) {
  console.error('⚠️  Impossibile verificare backend:', error.message)
}

// Summary
console.log('\n\n' + '='.repeat(80))
console.log('📊 RIEPILOGO')
console.log('='.repeat(80))

const missingFields = results.filter(r => r.status !== 'ALLINEATO')
const allDataInizioChecks = [...Object.values(dataInizioChecks), ...Object.values(dataInizioOnboarding)]
const dataInizioOk = allDataInizioChecks.every(check => check === true)

console.log(`\n✅ Campi allineati: ${results.length - missingFields.length}/${results.length}`)
console.log(`${dataInizioOk ? '✅' : '❌'} dataInizio/dataFine: ${dataInizioOk ? 'OK' : 'PROBLEMI'}`)

if (missingFields.length === 0 && dataInizioOk) {
  console.log('\n🎉 BUG-008 RISOLTO: Form completamente allineati!')
} else {
  console.log('\n⚠️  AZIONE RICHIESTA:')
  if (missingFields.length > 0) {
    console.log(`   Campi non allineati: ${missingFields.map(f => f.campo).join(', ')}`)
  }
  if (!dataInizioOk) {
    console.log('   dataInizio/dataFine non correttamente implementati')
  }
}

console.log('\n')

process.exit(missingFields.length === 0 && dataInizioOk ? 0 : 1)

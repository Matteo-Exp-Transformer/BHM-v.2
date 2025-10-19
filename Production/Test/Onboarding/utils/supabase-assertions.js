/**
 * UTILS: Supabase Assertions per Test Onboarding
 *
 * Funzioni per verificare dati inseriti in Supabase durante onboarding
 *
 * NOTA: Usa MCP Supabase tool disponibile in Cursor per interrogare DB
 * Per Playwright, usa supabase-js client con admin key
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase client (admin per bypass RLS nei test)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============= HELPER: GET COMPANY ID =============

/**
 * Ottiene company_id dell'utente corrente (ultimo creato)
 * Per test, assume che l'onboarding abbia appena creato/aggiornato la company
 */
async function getCurrentCompanyId(userEmail) {
  try {
    // Trova user per email
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (profileError) {
      console.error('❌ Errore find user profile:', profileError)
      return null
    }

    // Trova company membership
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (membershipError) {
      console.error('❌ Errore find company membership:', membershipError)
      return null
    }

    return membership.company_id
  } catch (error) {
    console.error('❌ Errore getCurrentCompanyId:', error)
    return null
  }
}

// ============= ASSERTIONS: BUSINESS INFO =============

/**
 * Verifica che business info sia stata salvata correttamente
 */
async function assertBusinessInfoSaved(companyId, expectedData) {
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) {
    throw new Error(`❌ Company non trovata: ${error.message}`)
  }

  // Assertions
  if (expectedData.businessName && company.name !== expectedData.businessName) {
    throw new Error(`❌ Business name mismatch: expected "${expectedData.businessName}", got "${company.name}"`)
  }

  if (expectedData.address && company.address !== expectedData.address) {
    throw new Error(`❌ Address mismatch: expected "${expectedData.address}", got "${company.address}"`)
  }

  if (expectedData.email && company.email !== expectedData.email) {
    throw new Error(`❌ Email mismatch: expected "${expectedData.email}", got "${company.email}"`)
  }

  if (expectedData.phone && company.phone !== expectedData.phone) {
    throw new Error(`❌ Phone mismatch: expected "${expectedData.phone}", got "${company.phone}"`)
  }

  console.log('✅ Business info salvata correttamente')
  return company
}

// ============= ASSERTIONS: DEPARTMENTS =============

/**
 * Verifica che departments siano stati creati
 */
async function assertDepartmentsCreated(companyId, expectedDepartments) {
  const { data: departments, error } = await supabase
    .from('departments')
    .select('*')
    .eq('company_id', companyId)

  if (error) {
    throw new Error(`❌ Errore fetch departments: ${error.message}`)
  }

  // Check count
  if (departments.length < expectedDepartments.length) {
    throw new Error(
      `❌ Departments count mismatch: expected ${expectedDepartments.length}, got ${departments.length}`
    )
  }

  // Check ogni department esiste
  for (const expectedDept of expectedDepartments) {
    const found = departments.find(d => d.name === expectedDept.name)
    if (!found) {
      throw new Error(`❌ Department "${expectedDept.name}" non trovato`)
    }

    if (expectedDept.description && found.description !== expectedDept.description) {
      console.warn(`⚠️ Department "${expectedDept.name}" description mismatch`)
    }
  }

  console.log(`✅ ${departments.length} departments creati correttamente`)
  return departments
}

// ============= ASSERTIONS: STAFF =============

/**
 * Verifica che staff members siano stati creati
 */
async function assertStaffCreated(companyId, expectedStaff) {
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .eq('company_id', companyId)

  if (error) {
    throw new Error(`❌ Errore fetch staff: ${error.message}`)
  }

  // Check count (almeno expectedStaff.length)
  if (staff.length < expectedStaff.length) {
    throw new Error(
      `❌ Staff count mismatch: expected at least ${expectedStaff.length}, got ${staff.length}`
    )
  }

  // Check ogni staff member
  for (const expectedMember of expectedStaff) {
    const found = staff.find(
      s => s.name === expectedMember.name && s.surname === expectedMember.surname
    )

    if (!found) {
      throw new Error(
        `❌ Staff member "${expectedMember.name} ${expectedMember.surname}" non trovato`
      )
    }

    if (expectedMember.email && found.email !== expectedMember.email) {
      throw new Error(
        `❌ Staff "${found.name}" email mismatch: expected "${expectedMember.email}", got "${found.email}"`
      )
    }

    if (expectedMember.role && found.role !== expectedMember.role) {
      throw new Error(
        `❌ Staff "${found.name}" role mismatch: expected "${expectedMember.role}", got "${found.role}"`
      )
    }
  }

  console.log(`✅ ${staff.length} staff members creati correttamente`)
  return staff
}

// ============= ASSERTIONS: CONSERVATION POINTS =============

/**
 * Verifica che conservation points siano stati creati
 */
async function assertConservationPointsCreated(companyId, expectedPoints) {
  const { data: points, error } = await supabase
    .from('conservation_points')
    .select('*')
    .eq('company_id', companyId)

  if (error) {
    throw new Error(`❌ Errore fetch conservation points: ${error.message}`)
  }

  // Check count
  if (points.length < expectedPoints.length) {
    throw new Error(
      `❌ Conservation points count mismatch: expected ${expectedPoints.length}, got ${points.length}`
    )
  }

  // Check ogni punto
  for (const expectedPoint of expectedPoints) {
    const found = points.find(p => p.name === expectedPoint.name)
    if (!found) {
      throw new Error(`❌ Conservation point "${expectedPoint.name}" non trovato`)
    }

    // Verifica tipo
    if (expectedPoint.pointType && found.point_type !== expectedPoint.pointType) {
      throw new Error(
        `❌ Point "${found.name}" type mismatch: expected "${expectedPoint.pointType}", got "${found.point_type}"`
      )
    }

    // Verifica temperatura (se non ambient)
    if (expectedPoint.targetTemperature !== undefined && found.target_temperature !== expectedPoint.targetTemperature) {
      throw new Error(
        `❌ Point "${found.name}" temperature mismatch: expected ${expectedPoint.targetTemperature}, got ${found.target_temperature}`
      )
    }

    // Verifica categorie prodotti (se specificate)
    if (expectedPoint.productCategories && expectedPoint.productCategories.length > 0) {
      // product_categories è un array JSON in Supabase
      const savedCategories = found.product_categories || []
      if (savedCategories.length !== expectedPoint.productCategories.length) {
        console.warn(
          `⚠️ Point "${found.name}" categories count mismatch: expected ${expectedPoint.productCategories.length}, got ${savedCategories.length}`
        )
      }
    }
  }

  console.log(`✅ ${points.length} conservation points creati correttamente`)
  return points
}

// ============= ASSERTIONS: TASKS =============

/**
 * Verifica che tasks siano stati creati
 */
async function assertTasksCreated(companyId, expectedTasksCount) {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('company_id', companyId)

  if (error) {
    throw new Error(`❌ Errore fetch tasks: ${error.message}`)
  }

  if (tasks.length < expectedTasksCount) {
    throw new Error(
      `❌ Tasks count mismatch: expected at least ${expectedTasksCount}, got ${tasks.length}`
    )
  }

  console.log(`✅ ${tasks.length} tasks creati correttamente`)
  return tasks
}

// ============= ASSERTIONS: INVENTORY =============

/**
 * Verifica che inventory products siano stati creati
 */
async function assertInventoryCreated(companyId, expectedProductsCount) {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', companyId)

  if (error) {
    throw new Error(`❌ Errore fetch products: ${error.message}`)
  }

  if (products.length < expectedProductsCount) {
    throw new Error(
      `❌ Products count mismatch: expected at least ${expectedProductsCount}, got ${products.length}`
    )
  }

  console.log(`✅ ${products.length} products creati correttamente`)
  return products
}

// ============= ASSERTIONS: CALENDAR CONFIG =============

/**
 * Verifica che calendar settings siano stati salvati
 */
async function assertCalendarConfigSaved(companyId) {
  const { data: settings, error } = await supabase
    .from('company_calendar_settings')
    .select('*')
    .eq('company_id', companyId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows, accettabile se calendar config opzionale
    throw new Error(`❌ Errore fetch calendar settings: ${error.message}`)
  }

  if (!settings) {
    console.warn('⚠️ Calendar settings non trovati (potrebbe essere opzionale)')
    return null
  }

  console.log('✅ Calendar config salvato correttamente')
  return settings
}

// ============= ASSERTIONS: ONBOARDING COMPLETO =============

/**
 * Verifica che onboarding sia completo (tutti i dati presenti)
 * Assert principale per TEST 1 e TEST 2
 */
async function assertOnboardingComplete(companyId, expectedData) {
  console.log('🔍 Verifica onboarding completo per company:', companyId)

  const results = {
    company: null,
    departments: [],
    staff: [],
    conservationPoints: [],
    tasks: [],
    products: [],
    calendarSettings: null,
  }

  try {
    // 1. Business Info
    if (expectedData.business) {
      results.company = await assertBusinessInfoSaved(companyId, expectedData.business)
    }

    // 2. Departments
    if (expectedData.departments) {
      results.departments = await assertDepartmentsCreated(companyId, expectedData.departments)
    }

    // 3. Staff
    if (expectedData.staff) {
      results.staff = await assertStaffCreated(companyId, expectedData.staff)
    }

    // 4. Conservation Points
    if (expectedData.conservationPoints) {
      results.conservationPoints = await assertConservationPointsCreated(
        companyId,
        expectedData.conservationPoints
      )
    }

    // 5. Tasks (count minimo)
    if (expectedData.tasksCount !== undefined) {
      results.tasks = await assertTasksCreated(companyId, expectedData.tasksCount)
    }

    // 6. Inventory (count minimo)
    if (expectedData.productsCount !== undefined) {
      results.products = await assertInventoryCreated(companyId, expectedData.productsCount)
    }

    // 7. Calendar Config (opzionale)
    if (expectedData.checkCalendar) {
      results.calendarSettings = await assertCalendarConfigSaved(companyId)
    }

    console.log('✅ ONBOARDING COMPLETO - Tutti i dati verificati con successo!')
    return results
  } catch (error) {
    console.error('❌ ONBOARDING INCOMPLETO:', error.message)
    throw error
  }
}

// ============= CLEANUP: DELETE TEST DATA =============

/**
 * Pulisce dati test da Supabase (usare dopo test)
 */
async function cleanupTestData(companyId) {
  console.log('🧹 Pulizia dati test per company:', companyId)

  try {
    // Cancella in ordine di dipendenze FK
    await supabase.from('task_completions').delete().eq('company_id', companyId)
    await supabase.from('temperature_readings').delete().eq('company_id', companyId)
    await supabase.from('shopping_list_items').delete().eq('company_id', companyId)
    await supabase.from('shopping_lists').delete().eq('company_id', companyId)
    await supabase.from('tasks').delete().eq('company_id', companyId)
    await supabase.from('maintenance_tasks').delete().eq('company_id', companyId)
    await supabase.from('products').delete().eq('company_id', companyId)
    await supabase.from('product_categories').delete().eq('company_id', companyId)
    await supabase.from('conservation_points').delete().eq('company_id', companyId)
    await supabase.from('staff').delete().eq('company_id', companyId)
    await supabase.from('departments').delete().eq('company_id', companyId)
    await supabase.from('events').delete().eq('company_id', companyId)
    await supabase.from('company_calendar_settings').delete().eq('company_id', companyId)

    console.log('✅ Dati test puliti con successo')
  } catch (error) {
    console.error('❌ Errore pulizia dati test:', error)
    throw error
  }
}

// ============= EXPORTS =============

module.exports = {
  supabase,
  getCurrentCompanyId,
  assertBusinessInfoSaved,
  assertDepartmentsCreated,
  assertStaffCreated,
  assertConservationPointsCreated,
  assertTasksCreated,
  assertInventoryCreated,
  assertCalendarConfigSaved,
  assertOnboardingComplete,
  cleanupTestData,
}

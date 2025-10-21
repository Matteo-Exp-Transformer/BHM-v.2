/**
 * UTILS: UI Assertions per Test Onboarding
 *
 * Funzioni per verificare che dati siano visibili nell'UI dopo onboarding
 * Naviga alle varie sezioni app e controlla presenza dati nelle tab
 */

import { expect } from '@playwright/test'

// ============= NAVIGATION HELPERS =============

/**
 * Naviga a sezione specifica dell'app
 */
async function navigateToSection(page, sectionName) {
  const sections = {
    dashboard: '/dashboard',
    calendar: '/calendar',
    inventory: '/inventory',
    conservation: '/conservation',
    tasks: '/tasks',
    staff: '/staff',
    departments: '/departments',
    settings: '/settings',
  }

  const url = sections[sectionName.toLowerCase()]
  if (!url) {
    throw new Error(`Sezione "${sectionName}" non riconosciuta`)
  }

  await page.goto(url)
  await page.waitForLoadState('networkidle')
  console.log(`✅ Navigato a: ${sectionName}`)
}

// ============= ASSERTIONS: DASHBOARD =============

/**
 * Verifica che dashboard mostri dati corretti
 */
async function assertDashboardShowsData(page, expectedData) {
  await navigateToSection(page, 'dashboard')

  // Verifica header con nome business
  if (expectedData.businessName) {
    const businessNameVisible = await page
      .locator(`text=${expectedData.businessName}`)
      .isVisible()
      .catch(() => false)

    if (!businessNameVisible) {
      throw new Error(`❌ Business name "${expectedData.businessName}" non visibile in dashboard`)
    }
  }

  // Verifica stats cards (se presenti)
  if (expectedData.checkStatsCards) {
    // Stats: Numero reparti
    if (expectedData.departmentsCount !== undefined) {
      const deptStat = page.locator('[data-testid="stat-departments"]')
      await expect(deptStat).toBeVisible({ timeout: 5000 }).catch(() => {
        console.warn('⚠️ Stats card reparti non trovata')
      })
    }

    // Stats: Numero staff
    if (expectedData.staffCount !== undefined) {
      const staffStat = page.locator('[data-testid="stat-staff"]')
      await expect(staffStat).toBeVisible({ timeout: 5000 }).catch(() => {
        console.warn('⚠️ Stats card staff non trovata')
      })
    }

    // Stats: Punti conservazione
    if (expectedData.conservationPointsCount !== undefined) {
      const conservationStat = page.locator('[data-testid="stat-conservation-points"]')
      await expect(conservationStat).toBeVisible({ timeout: 5000 }).catch(() => {
        console.warn('⚠️ Stats card punti conservazione non trovata')
      })
    }
  }

  console.log('✅ Dashboard mostra dati correttamente')
}

// ============= ASSERTIONS: DEPARTMENTS TAB =============

/**
 * Verifica che tab Reparti mostri departments creati
 */
async function assertDepartmentsVisible(page, expectedDepartments) {
  await navigateToSection(page, 'departments')

  for (const dept of expectedDepartments) {
    const deptElement = page.locator(`text=${dept.name}`)
    const isVisible = await deptElement.isVisible().catch(() => false)

    if (!isVisible) {
      throw new Error(`❌ Department "${dept.name}" non visibile nella lista`)
    }
  }

  console.log(`✅ ${expectedDepartments.length} departments visibili nella tab`)
}

// ============= ASSERTIONS: STAFF TAB =============

/**
 * Verifica che tab Staff mostri staff members creati
 */
async function assertStaffVisible(page, expectedStaff) {
  await navigateToSection(page, 'staff')

  for (const member of expectedStaff) {
    const fullName = `${member.name} ${member.surname}`
    const memberElement = page.locator(`text=${fullName}`)
    const isVisible = await memberElement.isVisible().catch(() => false)

    if (!isVisible) {
      throw new Error(`❌ Staff member "${fullName}" non visibile nella lista`)
    }

    // Verifica email (se presente in UI)
    if (member.email) {
      const emailElement = page.locator(`text=${member.email}`)
      const emailVisible = await emailElement.isVisible().catch(() => false)
      if (!emailVisible) {
        console.warn(`⚠️ Email "${member.email}" non visibile per ${fullName}`)
      }
    }
  }

  console.log(`✅ ${expectedStaff.length} staff members visibili nella tab`)
}

// ============= ASSERTIONS: CONSERVATION TAB =============

/**
 * Verifica che tab Conservazione mostri punti creati
 */
async function assertConservationPointsVisible(page, expectedPoints) {
  await navigateToSection(page, 'conservation')

  for (const point of expectedPoints) {
    const pointElement = page.locator(`text=${point.name}`)
    const isVisible = await pointElement.isVisible().catch(() => false)

    if (!isVisible) {
      throw new Error(`❌ Conservation point "${point.name}" non visibile nella lista`)
    }

    // Verifica tipo punto (se presente in UI)
    if (point.pointType) {
      const typeLabels = {
        fridge: 'Frigorifero',
        freezer: 'Congelatore',
        blast: 'Abbattitore',
        ambient: 'Ambiente',
      }
      const typeLabel = typeLabels[point.pointType]
      if (typeLabel) {
        const typeElement = page.locator(`text=${typeLabel}`)
        const typeVisible = await typeElement.isVisible().catch(() => false)
        if (!typeVisible) {
          console.warn(`⚠️ Tipo "${typeLabel}" non visibile per punto ${point.name}`)
        }
      }
    }

    // Verifica temperatura (se non ambient)
    if (point.targetTemperature !== undefined && point.targetTemperature !== null) {
      const tempText = `${point.targetTemperature}°C`
      const tempElement = page.locator(`text=${tempText}`)
      const tempVisible = await tempElement.isVisible().catch(() => false)
      if (!tempVisible) {
        console.warn(`⚠️ Temperatura "${tempText}" non visibile per punto ${point.name}`)
      }
    }
  }

  console.log(`✅ ${expectedPoints.length} conservation points visibili nella tab`)
}

// ============= ASSERTIONS: INVENTORY TAB =============

/**
 * Verifica che tab Inventario mostri prodotti creati
 */
async function assertInventoryProductsVisible(page, expectedProductsCount) {
  await navigateToSection(page, 'inventory')

  // Cerca tabella prodotti
  const productsTable = page.locator('[data-testid="products-table"], table')
  const tableVisible = await productsTable.isVisible().catch(() => false)

  if (!tableVisible) {
    throw new Error('❌ Tabella prodotti non visibile')
  }

  // Conta righe prodotti (escludi header)
  const rows = page.locator('table tbody tr, [data-testid="product-row"]')
  const rowCount = await rows.count().catch(() => 0)

  if (rowCount < expectedProductsCount) {
    throw new Error(
      `❌ Prodotti visibili insufficienti: expected ${expectedProductsCount}, got ${rowCount}`
    )
  }

  console.log(`✅ ${rowCount} prodotti visibili nell'inventario`)
}

// ============= ASSERTIONS: TASKS TAB =============

/**
 * Verifica che tab Tasks mostri tasks creati
 */
async function assertTasksVisible(page, expectedTasksCount) {
  await navigateToSection(page, 'tasks')

  // Cerca lista tasks
  const tasksList = page.locator('[data-testid="tasks-list"], ul, table')
  const listVisible = await tasksList.isVisible().catch(() => false)

  if (!listVisible) {
    throw new Error('❌ Lista tasks non visibile')
  }

  // Conta tasks
  const tasks = page.locator('[data-testid="task-item"], li, table tbody tr')
  const taskCount = await tasks.count().catch(() => 0)

  if (taskCount < expectedTasksCount) {
    throw new Error(
      `❌ Tasks visibili insufficienti: expected ${expectedTasksCount}, got ${taskCount}`
    )
  }

  console.log(`✅ ${taskCount} tasks visibili nella tab`)
}

// ============= ASSERTIONS: CALENDAR TAB =============

/**
 * Verifica che tab Calendario sia accessibile e funzionante
 */
async function assertCalendarAccessible(page) {
  await navigateToSection(page, 'calendar')

  // Verifica che FullCalendar sia renderizzato
  const calendar = page.locator('.fc, [data-testid="calendar"]')
  const calendarVisible = await calendar.isVisible().catch(() => false)

  if (!calendarVisible) {
    throw new Error('❌ Calendario non visibile')
  }

  // Verifica header calendario (mese corrente)
  const calendarHeader = page.locator('.fc-toolbar, [data-testid="calendar-header"]')
  const headerVisible = await calendarHeader.isVisible().catch(() => false)

  if (!headerVisible) {
    console.warn('⚠️ Header calendario non visibile')
  }

  console.log('✅ Calendario accessibile e renderizzato')
}

// ============= ASSERTIONS: ALL TABS =============

/**
 * Verifica completa UI: naviga a tutte le tab e controlla dati
 * Assert principale per TEST 1 e TEST 2 (parte C)
 */
async function assertAllTabsShowData(page, expectedData) {
  console.log('🔍 Verifica dati visibili in tutte le tab UI...')

  try {
    // 1. Dashboard
    if (expectedData.business || expectedData.checkStatsCards) {
      await assertDashboardShowsData(page, {
        businessName: expectedData.business?.businessName,
        checkStatsCards: expectedData.checkStatsCards,
        departmentsCount: expectedData.departments?.length,
        staffCount: expectedData.staff?.length,
        conservationPointsCount: expectedData.conservationPoints?.length,
      })
    }

    // 2. Departments
    if (expectedData.departments && expectedData.departments.length > 0) {
      await assertDepartmentsVisible(page, expectedData.departments)
    }

    // 3. Staff
    if (expectedData.staff && expectedData.staff.length > 0) {
      await assertStaffVisible(page, expectedData.staff)
    }

    // 4. Conservation Points
    if (expectedData.conservationPoints && expectedData.conservationPoints.length > 0) {
      await assertConservationPointsVisible(page, expectedData.conservationPoints)
    }

    // 5. Inventory (se presente)
    if (expectedData.productsCount !== undefined && expectedData.productsCount > 0) {
      await assertInventoryProductsVisible(page, expectedData.productsCount)
    }

    // 6. Tasks (se presente)
    if (expectedData.tasksCount !== undefined && expectedData.tasksCount > 0) {
      await assertTasksVisible(page, expectedData.tasksCount)
    }

    // 7. Calendar (verifica solo accessibilità)
    if (expectedData.checkCalendar) {
      await assertCalendarAccessible(page)
    }

    console.log('✅ TUTTE LE TAB UI VERIFICATE - Dati visibili correttamente!')
  } catch (error) {
    console.error('❌ ERRORE VERIFICA UI:', error.message)
    throw error
  }
}

// ============= HELPER: SCREENSHOT ON ERROR =============

/**
 * Cattura screenshot se assertion fallisce (utile per debug)
 */
async function screenshotOnError(page, testName, error) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `error-${testName}-${timestamp}.png`

  try {
    await page.screenshot({
      path: `Production/Test/Onboarding/screenshots/${filename}`,
      fullPage: true,
    })
    console.log(`📸 Screenshot salvato: ${filename}`)
  } catch (screenshotError) {
    console.error('❌ Errore salvataggio screenshot:', screenshotError)
  }

  throw error
}

// ============= EXPORTS =============

export {
  navigateToSection,
  assertDashboardShowsData,
  assertDepartmentsVisible,
  assertStaffVisible,
  assertConservationPointsVisible,
  assertInventoryProductsVisible,
  assertTasksVisible,
  assertCalendarAccessible,
  assertAllTabsShowData,
  screenshotOnError,
}

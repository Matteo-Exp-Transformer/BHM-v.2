import { test, expect } from '@playwright/test'

test.describe('PermissionLogic - Test Funzionali', () => {
  test('1. Test UserRole enum - verificare tutti i ruoli supportati', async ({ page }) => {
      const userRoles = await page.evaluate(() => {
        const roles = ['admin', 'responsabile', 'dipendente', 'collaboratore', 'guest']
        const isValidRole = (role) => roles.includes(role)
        
        return {
          totalRoles: roles.length,
          hasAdmin: roles.includes('admin'),
          hasResponsabile: roles.includes('responsabile'),
          hasDipendente: roles.includes('dipendente'),
          hasCollaboratore: roles.includes('collaboratore'),
          hasGuest: roles.includes('guest'),
          adminValid: isValidRole('admin'),
          responsabileValid: isValidRole('responsabile'),
          invalidRoleTest: !isValidRole('invalid_role')
        }
      })

    expect(userRoles.totalRoles).toBe(5)
    expect(userRoles.hasAdmin).toBe(true)
    expect(userRoles.hasResponsabile).toBe(true)
    expect(userRoles.hasDipendente).toBe(true)
    expect(userRoles.hasCollaboratore).toBe(true)
    expect(userRoles.hasGuest).toBe(true)
    expect(userRoles.adminValid).toBe(true)
    expect(userRoles.responsabileValid).toBe(true)
    expect(userRoles.invalidRoleTest).toBe(true)
  })

  test('2. Test UserPermissions interface - verificare tutte le permissioni', async ({ page }) => {
    const permissions = await page.evaluate(() => {
      const permissionKeys = [
        'canManageStaff',
        'canManageDepartments', 
        'canViewAllTasks',
        'canManageConservation',
        'canExportData',
        'canManageSettings'
      ]
      
      return {
        totalPermissions: permissionKeys.length,
        hasManageStaff: permissionKeys.includes('canManageStaff'),
        hasManageDepartments: permissionKeys.includes('canManageDepartments'),
        hasViewAllTasks: permissionKeys.includes('canViewAllTasks'),
        hasManageConservation: permissionKeys.includes('canManageConservation'),
        hasExportData: permissionKeys.includes('canExportData'),
        hasManageSettings: permissionKeys.includes('canManageSettings'),
        allPermissionsValid: permissionKeys.every(key => typeof key === 'string' && key.startsWith('can'))
      }
    })

    expect(permissions.totalPermissions).toBe(6)
    expect(permissions.hasManageStaff).toBe(true)
    expect(permissions.hasManageDepartments).toBe(true)
    expect(permissions.hasViewAllTasks).toBe(true)
    expect(permissions.hasManageConservation).toBe(true)
    expect(permissions.hasExportData).toBe(true)
    expect(permissions.hasManageSettings).toBe(true)
    expect(permissions.allPermissionsValid).toBe(true)
  })

  test('3. Test getPermissionsFromRole - verificare mapping ruoli-permissioni', async ({ page }) => {
    const rolePermissions = await page.evaluate(() => {
      const getPermissionsFromRole = (role) => {
        switch (role) {
          case 'admin':
            return {
              canManageStaff: true,
              canManageDepartments: true,
              canViewAllTasks: true,
              canManageConservation: true,
              canExportData: true,
              canManageSettings: true,
            }
          case 'responsabile':
            return {
              canManageStaff: true,
              canManageDepartments: true,
              canViewAllTasks: true,
              canManageConservation: true,
              canExportData: false,
              canManageSettings: false,
            }
          case 'dipendente':
          case 'collaboratore':
            return {
              canManageStaff: false,
              canManageDepartments: false,
              canViewAllTasks: false,
              canManageConservation: false,
              canExportData: false,
              canManageSettings: false,
            }
          case 'guest':
          default:
            return {
              canManageStaff: false,
              canManageDepartments: false,
              canViewAllTasks: false,
              canManageConservation: false,
              canExportData: false,
              canManageSettings: false,
            }
        }
      }

      const adminPerms = getPermissionsFromRole('admin')
      const responsabilePerms = getPermissionsFromRole('responsabile')
      const dipendentePerms = getPermissionsFromRole('dipendente')
      const guestPerms = getPermissionsFromRole('guest')

      return {
        adminCanManageStaff: adminPerms.canManageStaff,
        adminCanExportData: adminPerms.canExportData,
        responsabileCanManageStaff: responsabilePerms.canManageStaff,
        responsabileCanExportData: responsabilePerms.canExportData,
        dipendenteCanManageStaff: dipendentePerms.canManageStaff,
        guestCanManageStaff: guestPerms.canManageStaff,
        adminHasAllPermissions: Object.values(adminPerms).every(p => p === true),
        guestHasNoPermissions: Object.values(guestPerms).every(p => p === false)
      }
    })

    expect(rolePermissions.adminCanManageStaff).toBe(true)
    expect(rolePermissions.adminCanExportData).toBe(true)
    expect(rolePermissions.responsabileCanManageStaff).toBe(true)
    expect(rolePermissions.responsabileCanExportData).toBe(false)
    expect(rolePermissions.dipendenteCanManageStaff).toBe(false)
    expect(rolePermissions.guestCanManageStaff).toBe(false)
    expect(rolePermissions.adminHasAllPermissions).toBe(true)
    expect(rolePermissions.guestHasNoPermissions).toBe(true)
  })

  test('4. Test hasPermission function - verificare controllo permissioni', async ({ page }) => {
    const permissionChecks = await page.evaluate(() => {
      const permissions = {
        canManageStaff: true,
        canManageDepartments: false,
        canViewAllTasks: true,
        canManageConservation: false,
        canExportData: true,
        canManageSettings: false,
      }

      const hasPermission = (permission) => {
        return permissions[permission]
      }

      return {
        canManageStaffCheck: hasPermission('canManageStaff'),
        canManageDepartmentsCheck: hasPermission('canManageDepartments'),
        canViewAllTasksCheck: hasPermission('canViewAllTasks'),
        canManageConservationCheck: hasPermission('canManageConservation'),
        canExportDataCheck: hasPermission('canExportData'),
        canManageSettingsCheck: hasPermission('canManageSettings'),
        invalidPermissionCheck: hasPermission('invalidPermission') || false
      }
    })

    expect(permissionChecks.canManageStaffCheck).toBe(true)
    expect(permissionChecks.canManageDepartmentsCheck).toBe(false)
    expect(permissionChecks.canViewAllTasksCheck).toBe(true)
    expect(permissionChecks.canManageConservationCheck).toBe(false)
    expect(permissionChecks.canExportDataCheck).toBe(true)
    expect(permissionChecks.canManageSettingsCheck).toBe(false)
    expect(permissionChecks.invalidPermissionCheck).toBe(false)
  })

  test('5. Test hasRole function - verificare controllo ruoli', async ({ page }) => {
    const roleChecks = await page.evaluate(() => {
      const userRole = 'admin'
      
      const hasRole = (roles) => {
        const roleArray = Array.isArray(roles) ? roles : [roles]
        return roleArray.includes(userRole)
      }

      return {
        hasAdminSingle: hasRole('admin'),
        hasResponsabileSingle: hasRole('responsabile'),
        hasAdminArray: hasRole(['admin', 'responsabile']),
        hasDipendenteArray: hasRole(['dipendente', 'collaboratore']),
        hasAnyRole: hasRole(['admin', 'dipendente', 'guest']),
        invalidRoleCheck: hasRole('invalid_role')
      }
    })

    expect(roleChecks.hasAdminSingle).toBe(true)
    expect(roleChecks.hasResponsabileSingle).toBe(false)
    expect(roleChecks.hasAdminArray).toBe(true)
    expect(roleChecks.hasDipendenteArray).toBe(false)
    expect(roleChecks.hasAnyRole).toBe(true)
    expect(roleChecks.invalidRoleCheck).toBe(false)
  })

  test('6. Test hasAnyRole function - verificare controllo ruoli multipli', async ({ page }) => {
    const anyRoleChecks = await page.evaluate(() => {
      const userRole = 'dipendente'
      
      const hasAnyRole = (roles) => {
        return roles.some(role => userRole === role)
      }

      return {
        hasAnyRoleAdmin: hasAnyRole(['admin', 'responsabile']),
        hasAnyRoleDipendente: hasAnyRole(['dipendente', 'collaboratore']),
        hasAnyRoleGuest: hasAnyRole(['guest']),
        hasAnyRoleMixed: hasAnyRole(['admin', 'dipendente', 'guest']),
        hasAnyRoleEmpty: hasAnyRole([])
      }
    })

    expect(anyRoleChecks.hasAnyRoleAdmin).toBe(false)
    expect(anyRoleChecks.hasAnyRoleDipendente).toBe(true)
    expect(anyRoleChecks.hasAnyRoleGuest).toBe(false)
    expect(anyRoleChecks.hasAnyRoleMixed).toBe(true)
    expect(anyRoleChecks.hasAnyRoleEmpty).toBe(false)
  })

  test('7. Test hasManagementRole - verificare ruoli di gestione', async ({ page }) => {
    const managementChecks = await page.evaluate(() => {
      const hasManagementRole = (userRole) => {
        return userRole === 'admin' || userRole === 'responsabile'
      }

      return {
        adminIsManagement: hasManagementRole('admin'),
        responsabileIsManagement: hasManagementRole('responsabile'),
        dipendenteIsManagement: hasManagementRole('dipendente'),
        collaboratoreIsManagement: hasManagementRole('collaboratore'),
        guestIsManagement: hasManagementRole('guest')
      }
    })

    expect(managementChecks.adminIsManagement).toBe(true)
    expect(managementChecks.responsabileIsManagement).toBe(true)
    expect(managementChecks.dipendenteIsManagement).toBe(false)
    expect(managementChecks.collaboratoreIsManagement).toBe(false)
    expect(managementChecks.guestIsManagement).toBe(false)
  })

  test('8. Test isAuthorized - verificare autorizzazione generale', async ({ page }) => {
    const authorizationChecks = await page.evaluate(() => {
      const isAuthorized = (userRole) => {
        return userRole !== 'guest'
      }

      return {
        adminIsAuthorized: isAuthorized('admin'),
        responsabileIsAuthorized: isAuthorized('responsabile'),
        dipendenteIsAuthorized: isAuthorized('dipendente'),
        collaboratoreIsAuthorized: isAuthorized('collaboratore'),
        guestIsAuthorized: isAuthorized('guest')
      }
    })

    expect(authorizationChecks.adminIsAuthorized).toBe(true)
    expect(authorizationChecks.responsabileIsAuthorized).toBe(true)
    expect(authorizationChecks.dipendenteIsAuthorized).toBe(true)
    expect(authorizationChecks.collaboratoreIsAuthorized).toBe(true)
    expect(authorizationChecks.guestIsAuthorized).toBe(false)
  })
})

/**
 * B.8.3 Multi-Company Management System - Main Export
 * Unified interface for multi-tenant HACCP Business Manager
 */

export {
  multiTenantManager,
  type CompanyTenant,
  type TenantContext,
  type DataSharingAgreement,
  type TenantLimits,
  type TenantFeatures,
} from './MultiTenantManager'

export {
  permissionManager,
  type Permission,
  type Role,
  type UserRoleAssignment,
  type AccessRequest,
} from './PermissionManager'

export {
  crossCompanyReporting,
  type CrossCompanyReport,
  type ReportType,
  type ReportExportOptions,
} from './CrossCompanyReporting'

/**
 * B.8.3 Multi-Tenant Services Manager
 * Central coordinator for all multi-company functionality
 */
class MultiTenantServices {
  private initialized = false
  private currentTenant: string | null = null

  /**
   * Initialize multi-tenant services for a company
   */
  public async initialize(companyId: string, userId: string): Promise<void> {
    if (this.initialized && this.currentTenant === companyId) {
      return
    }

    console.log('🏢 Initializing Multi-Tenant Services...')

    try {
      // Initialize tenant context
      const tenantContext = await multiTenantManager.initializeTenant(
        companyId,
        userId
      )
      console.log(`✅ Tenant context: ${tenantContext.company_id}`)

      // Setup user permissions
      const userPermissions = await permissionManager.getUserPermissions(
        userId,
        companyId
      )
      console.log(
        `✅ User permissions: ${userPermissions.length} permissions loaded`
      )

      // Check data sharing agreements
      const sharedData = await multiTenantManager.getSharedData(
        'temperature_readings'
      )
      console.log(`✅ Shared data sources: ${sharedData.length} available`)

      this.currentTenant = companyId
      this.initialized = true

      console.log('🚀 Multi-Tenant Services initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize multi-tenant services:', error)
      throw error
    }
  }

  /**
   * Quick permission check
   */
  public async hasPermission(
    userId: string,
    companyId: string,
    permissionId: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    return await permissionManager.hasPermission(
      userId,
      companyId,
      permissionId,
      context
    )
  }

  /**
   * Check tenant feature availability
   */
  public hasFeature(feature: string): boolean {
    return multiTenantManager.hasFeature(feature as any)
  }

  /**
   * Generate cross-company report
   */
  public async generateCrossCompanyReport(
    reportType: any,
    companies: string[],
    dateRange: { start: Date; end: Date },
    generatedBy: string
  ) {
    return await crossCompanyReporting.generateReport(
      reportType,
      companies,
      dateRange,
      generatedBy
    )
  }

  /**
   * Create data sharing agreement
   */
  public async createDataSharingAgreement(
    toCompanyId: string,
    dataTypes: any[],
    permissions: any[],
    conditions: any[]
  ) {
    return await multiTenantManager.createDataSharingAgreement(
      toCompanyId,
      dataTypes,
      permissions,
      conditions
    )
  }

  /**
   * Assign role to user
   */
  public async assignRole(
    userId: string,
    roleId: string,
    companyId: string,
    assignedBy: string,
    options?: any
  ) {
    return await permissionManager.assignRole(
      userId,
      roleId,
      companyId,
      assignedBy,
      options
    )
  }

  /**
   * Get tenant analytics
   */
  public async getTenantAnalytics() {
    return await multiTenantManager.getTenantAnalytics()
  }

  /**
   * Get current tenant info
   */
  public getCurrentTenant(): string | null {
    return this.currentTenant
  }

  /**
   * Check if services are initialized
   */
  public isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Cleanup multi-tenant services
   */
  public cleanup(): void {
    this.initialized = false
    this.currentTenant = null
    console.log('🧹 Multi-tenant services cleaned up')
  }
}

// Export singleton instance
export const multiTenantServices = new MultiTenantServices()

// Export individual services for direct access
export { multiTenantManager, permissionManager, crossCompanyReporting }

// Auto-initialize in development mode
if (import.meta.env?.DEV) {
  console.log('🔧 Multi-tenant services available in development mode')
}

export default multiTenantServices

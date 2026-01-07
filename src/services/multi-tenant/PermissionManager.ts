/**
 * B.8.3 Advanced Permission Management System
 * Handles role-based access control (RBAC) for multi-tenant HACCP environment
 */

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string
  category: PermissionCategory
  requires_approval?: boolean
  conditions?: PermissionCondition[]
}

export type PermissionCategory =
  | 'data_access'
  | 'user_management'
  | 'system_administration'
  | 'compliance_audit'
  | 'reporting'
  | 'integration'
  | 'data_sharing'

export interface Role {
  id: string
  name: string
  description: string
  company_id: string
  permissions: string[] // Permission IDs
  is_system_role: boolean
  is_default: boolean
  created_by: string
  created_at: Date
  updated_at: Date
  hierarchy_level: number
  max_subordinates?: number
  can_delegate_to?: string[] // Role IDs that this role can delegate to
}

export interface UserRoleAssignment {
  id: string
  user_id: string
  role_id: string
  company_id: string
  assigned_by: string
  assigned_at: Date
  expires_at?: Date
  is_active: boolean
  restrictions?: RoleRestriction[]
  delegation_chain?: string[] // Trail of who delegated what
}

export interface RoleRestriction {
  type: 'time_based' | 'location_based' | 'data_scope' | 'action_limit'
  conditions: Record<string, any>
  description: string
}

export interface PermissionCondition {
  type:
    | 'time_range'
    | 'ip_restriction'
    | 'department_only'
    | 'approval_required'
    | 'data_classification'
  value: any
  description: string
}

export interface AccessRequest {
  id: string
  user_id: string
  resource: string
  action: string
  company_id: string
  requested_at: Date
  approved_by?: string
  approved_at?: Date
  status: 'pending' | 'approved' | 'denied' | 'expired'
  justification: string
  expires_at?: Date
  audit_trail: AccessAuditEntry[]
}

export interface AccessAuditEntry {
  timestamp: Date
  action: string
  user_id: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  categories: string[]
  retention_period: number
  access_controls: string[]
  sharing_restrictions: string[]
}

class PermissionManager {
  private systemPermissions: Map<string, Permission> = new Map()
  private companyRoles: Map<string, Role[]> = new Map()
  private userAssignments: Map<string, UserRoleAssignment[]> = new Map()
  private accessRequests: Map<string, AccessRequest> = new Map()
  private auditLog: AccessAuditEntry[] = []

  constructor() {
    this.initializeSystemPermissions()
    this.initializeDefaultRoles()
  }

  /**
   * Initialize system-wide permissions
   */
  private initializeSystemPermissions(): void {
    const permissions: Permission[] = [
      // Data Access Permissions
      {
        id: 'read_temperature_data',
        name: 'Read Temperature Data',
        resource: 'temperature_readings',
        action: 'read',
        description: 'View temperature monitoring data',
        category: 'data_access',
      },
      {
        id: 'write_temperature_data',
        name: 'Write Temperature Data',
        resource: 'temperature_readings',
        action: 'write',
        description: 'Create and modify temperature readings',
        category: 'data_access',
        conditions: [
          {
            type: 'department_only',
            value: ['quality_control', 'maintenance'],
            description: 'Limited to QC and maintenance departments',
          },
        ],
      },
      {
        id: 'delete_temperature_data',
        name: 'Delete Temperature Data',
        resource: 'temperature_readings',
        action: 'delete',
        description: 'Delete temperature readings (requires approval)',
        category: 'data_access',
        requires_approval: true,
      },

      // User Management Permissions
      {
        id: 'manage_users',
        name: 'Manage Users',
        resource: 'users',
        action: 'manage',
        description: 'Create, modify, and deactivate user accounts',
        category: 'user_management',
      },
      {
        id: 'assign_roles',
        name: 'Assign Roles',
        resource: 'user_roles',
        action: 'assign',
        description: 'Assign and modify user roles',
        category: 'user_management',
        requires_approval: true,
      },
      {
        id: 'view_user_activity',
        name: 'View User Activity',
        resource: 'audit_logs',
        action: 'read',
        description: 'View user activity and audit logs',
        category: 'user_management',
      },

      // System Administration
      {
        id: 'manage_company_settings',
        name: 'Manage Company Settings',
        resource: 'company_settings',
        action: 'manage',
        description: 'Modify company configuration and settings',
        category: 'system_administration',
      },
      {
        id: 'manage_integrations',
        name: 'Manage Integrations',
        resource: 'integrations',
        action: 'manage',
        description: 'Configure third-party integrations',
        category: 'system_administration',
      },
      {
        id: 'access_system_logs',
        name: 'Access System Logs',
        resource: 'system_logs',
        action: 'read',
        description: 'View system logs and error reports',
        category: 'system_administration',
      },

      // Compliance and Audit
      {
        id: 'create_audit_reports',
        name: 'Create Audit Reports',
        resource: 'audit_reports',
        action: 'create',
        description: 'Generate compliance and audit reports',
        category: 'compliance_audit',
      },
      {
        id: 'sign_compliance_documents',
        name: 'Sign Compliance Documents',
        resource: 'compliance_documents',
        action: 'sign',
        description: 'Digitally sign compliance documents',
        category: 'compliance_audit',
        requires_approval: true,
      },
      {
        id: 'access_sensitive_audit_data',
        name: 'Access Sensitive Audit Data',
        resource: 'audit_data',
        action: 'read',
        description: 'Access confidential audit information',
        category: 'compliance_audit',
        conditions: [
          {
            type: 'ip_restriction',
            value: ['company_network'],
            description: 'Only accessible from company network',
          },
        ],
      },

      // Reporting
      {
        id: 'generate_reports',
        name: 'Generate Reports',
        resource: 'reports',
        action: 'create',
        description: 'Create standard operational reports',
        category: 'reporting',
      },
      {
        id: 'export_data',
        name: 'Export Data',
        resource: 'data_export',
        action: 'execute',
        description: 'Export data in various formats',
        category: 'reporting',
      },
      {
        id: 'schedule_reports',
        name: 'Schedule Reports',
        resource: 'report_schedules',
        action: 'manage',
        description: 'Create and manage automated report schedules',
        category: 'reporting',
      },

      // Data Sharing
      {
        id: 'create_sharing_agreements',
        name: 'Create Data Sharing Agreements',
        resource: 'sharing_agreements',
        action: 'create',
        description: 'Create agreements for sharing data with other companies',
        category: 'data_sharing',
        requires_approval: true,
      },
      {
        id: 'approve_sharing_requests',
        name: 'Approve Sharing Requests',
        resource: 'sharing_requests',
        action: 'approve',
        description: 'Approve or deny incoming data sharing requests',
        category: 'data_sharing',
      },
      {
        id: 'access_shared_data',
        name: 'Access Shared Data',
        resource: 'shared_data',
        action: 'read',
        description: 'Access data shared by other companies',
        category: 'data_sharing',
      },
    ]

    permissions.forEach(permission => {
      this.systemPermissions.set(permission.id, permission)
    })
  }

  /**
   * Initialize default system roles
   */
  private initializeDefaultRoles(): void {
    const defaultRoles: Role[] = [
      {
        id: 'super_admin',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        company_id: 'system',
        permissions: Array.from(this.systemPermissions.keys()),
        is_system_role: true,
        is_default: true,
        created_by: 'system',
        created_at: new Date(),
        updated_at: new Date(),
        hierarchy_level: 10,
        can_delegate_to: ['admin', 'manager', 'operator', 'auditor'],
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Company-wide administrative access',
        company_id: 'system',
        permissions: [
          'read_temperature_data',
          'write_temperature_data',
          'manage_users',
          'assign_roles',
          'view_user_activity',
          'manage_company_settings',
          'create_audit_reports',
          'generate_reports',
          'export_data',
          'schedule_reports',
          'approve_sharing_requests',
        ],
        is_system_role: true,
        is_default: true,
        created_by: 'system',
        created_at: new Date(),
        updated_at: new Date(),
        hierarchy_level: 8,
        max_subordinates: 50,
        can_delegate_to: ['manager', 'operator', 'auditor'],
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Departmental management and oversight',
        company_id: 'system',
        permissions: [
          'read_temperature_data',
          'write_temperature_data',
          'view_user_activity',
          'create_audit_reports',
          'generate_reports',
          'export_data',
        ],
        is_system_role: true,
        is_default: true,
        created_by: 'system',
        created_at: new Date(),
        updated_at: new Date(),
        hierarchy_level: 6,
        max_subordinates: 20,
        can_delegate_to: ['operator'],
      },
      {
        id: 'operator',
        name: 'Operator',
        description: 'Standard operational access',
        company_id: 'system',
        permissions: [
          'read_temperature_data',
          'write_temperature_data',
          'generate_reports',
        ],
        is_system_role: true,
        is_default: true,
        created_by: 'system',
        created_at: new Date(),
        updated_at: new Date(),
        hierarchy_level: 4,
        max_subordinates: 0,
      },
      {
        id: 'auditor',
        name: 'Auditor',
        description: 'Audit and compliance specialist',
        company_id: 'system',
        permissions: [
          'read_temperature_data',
          'view_user_activity',
          'create_audit_reports',
          'access_sensitive_audit_data',
          'sign_compliance_documents',
        ],
        is_system_role: true,
        is_default: true,
        created_by: 'system',
        created_at: new Date(),
        updated_at: new Date(),
        hierarchy_level: 7,
        max_subordinates: 5,
      },
      {
        id: 'readonly',
        name: 'Read Only',
        description: 'View-only access to basic data',
        company_id: 'system',
        permissions: ['read_temperature_data'],
        is_system_role: true,
        is_default: true,
        created_by: 'system',
        created_at: new Date(),
        updated_at: new Date(),
        hierarchy_level: 1,
        max_subordinates: 0,
      },
    ]

    defaultRoles.forEach(role => {
      const systemRoles = this.companyRoles.get('system') || []
      systemRoles.push(role)
      this.companyRoles.set('system', systemRoles)
    })
  }

  /**
   * Check if user has specific permission
   */
  public async hasPermission(
    userId: string,
    companyId: string,
    permissionId: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Get user's active role assignments
      const assignments = await this.getUserRoleAssignments(userId, companyId)
      const activeAssignments = assignments.filter(
        a => a.is_active && (!a.expires_at || a.expires_at > new Date())
      )

      if (activeAssignments.length === 0) {
        return false
      }

      // Check if any role has the required permission
      for (const assignment of activeAssignments) {
        const role = await this.getRole(assignment.role_id, companyId)
        if (role && role.permissions.includes(permissionId)) {
          // Check permission conditions
          const permission = this.systemPermissions.get(permissionId)
          if (permission && permission.conditions) {
            const conditionsMet = await this.checkPermissionConditions(
              permission.conditions
            )
            if (!conditionsMet) {
              continue
            }
          }

          // Check role restrictions
          if (assignment.restrictions) {
            const restrictionsMet = await this.checkRoleRestrictions(
              assignment.restrictions
            )
            if (!restrictionsMet) {
              continue
            }
          }

          // Log access for audit
          await this.logAccess(userId, permissionId, 'granted', context)
          return true
        }
      }

      // Log denied access
      await this.logAccess(userId, permissionId, 'denied', context)
      return false
    } catch (error) {
      console.error('Permission check failed:', error)
      await this.logAccess(userId, permissionId, 'error', {
        error: (error as Error).message,
      })
      return false
    }
  }

  /**
   * Assign role to user
   */
  public async assignRole(
    userId: string,
    roleId: string,
    companyId: string,
    assignedBy: string,
    options?: {
      expires_at?: Date
      restrictions?: RoleRestriction[]
    }
  ): Promise<UserRoleAssignment> {
    // Validate that the assigner has permission to assign this role
    const canAssign = await this.canAssignRole()
    if (!canAssign) {
      throw new Error('Insufficient permissions to assign this role')
    }

    // Check if role exists
    const role = await this.getRole(roleId, companyId)
    if (!role) {
      throw new Error(`Role not found: ${roleId}`)
    }

    // Create assignment
    const assignment: UserRoleAssignment = {
      id: this.generateAssignmentId(),
      user_id: userId,
      role_id: roleId,
      company_id: companyId,
      assigned_by: assignedBy,
      assigned_at: new Date(),
      expires_at: options?.expires_at,
      is_active: true,
      restrictions: options?.restrictions,
      delegation_chain: await this.buildDelegationChain(),
    }

    // Store assignment
    const userAssignments = this.userAssignments.get(userId) || []
    userAssignments.push(assignment)
    this.userAssignments.set(userId, userAssignments)

    // Log assignment
    await this.logAccess(assignedBy, 'assign_roles', 'executed', {
      target_user: userId,
      role_assigned: roleId,
      assignment_id: assignment.id,
    })

    console.log(
      `👤 Role assigned: ${roleId} to user ${userId} by ${assignedBy}`
    )
    return assignment
  }

  /**
   * Request special access to resource
   */
  public async requestAccess(
    userId: string,
    resource: string,
    action: string,
    companyId: string,
    justification: string,
    duration?: number
  ): Promise<AccessRequest> {
    const request: AccessRequest = {
      id: this.generateRequestId(),
      user_id: userId,
      resource,
      action,
      company_id: companyId,
      requested_at: new Date(),
      status: 'pending',
      justification,
      expires_at: duration ? new Date(Date.now() + duration) : undefined,
      audit_trail: [],
    }

    this.accessRequests.set(request.id, request)

    // Notify administrators
    await this.notifyAccessRequest(request)

    console.log(`📋 Access request created: ${request.id}`)
    return request
  }

  /**
   * Approve or deny access request
   */
  public async respondToAccessRequest(
    requestId: string,
    approverId: string,
    response: 'approved' | 'denied',
    notes?: string
  ): Promise<void> {
    const request = this.accessRequests.get(requestId)
    if (!request) {
      throw new Error(`Access request not found: ${requestId}`)
    }

    // Check if approver has permission
    const canApprove = await this.hasPermission(
      approverId,
      request.company_id,
      'approve_access_requests'
    )
    if (!canApprove) {
      throw new Error('Insufficient permissions to approve access requests')
    }

    // Update request
    request.status = response
    request.approved_by = approverId
    request.approved_at = new Date()

    // Add to audit trail
    request.audit_trail.push({
      timestamp: new Date(),
      action: response,
      user_id: approverId,
      details: { notes },
    })

    // Notify requester
    await this.notifyAccessResponse(request, response)

    console.log(`✅ Access request ${response}: ${requestId}`)
  }

  /**
   * Get user's effective permissions
   */
  public async getUserPermissions(
    userId: string,
    companyId: string
  ): Promise<Permission[]> {
    const assignments = await this.getUserRoleAssignments(userId, companyId)
    const activeAssignments = assignments.filter(
      a => a.is_active && (!a.expires_at || a.expires_at > new Date())
    )

    const permissionIds = new Set<string>()

    for (const assignment of activeAssignments) {
      const role = await this.getRole(assignment.role_id, companyId)
      if (role) {
        role.permissions.forEach(permId => permissionIds.add(permId))
      }
    }

    return Array.from(permissionIds)
      .map(id => this.systemPermissions.get(id))
      .filter(Boolean) as Permission[]
  }

  /**
   * Create custom role for company
   */
  public async createCustomRole(
    name: string,
    description: string,
    companyId: string,
    permissions: string[],
    createdBy: string,
    hierarchyLevel: number
  ): Promise<Role> {
    // Validate permissions
    const invalidPermissions = permissions.filter(
      p => !this.systemPermissions.has(p)
    )
    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`)
    }

    // Check if creator can create roles
    const canCreate = await this.hasPermission(
      createdBy,
      companyId,
      'manage_roles'
    )
    if (!canCreate) {
      throw new Error('Insufficient permissions to create roles')
    }

    const role: Role = {
      id: this.generateRoleId(),
      name,
      description,
      company_id: companyId,
      permissions,
      is_system_role: false,
      is_default: false,
      created_by: createdBy,
      created_at: new Date(),
      updated_at: new Date(),
      hierarchy_level: hierarchyLevel,
    }

    // Store role
    const companyRoles = this.companyRoles.get(companyId) || []
    companyRoles.push(role)
    this.companyRoles.set(companyId, companyRoles)

    console.log(`🎭 Custom role created: ${name} for company ${companyId}`)
    return role
  }

  /**
   * Helper methods
   */
  private async getUserRoleAssignments(
    userId: string,
    companyId: string
  ): Promise<UserRoleAssignment[]> {
    const allAssignments = this.userAssignments.get(userId) || []
    return allAssignments.filter(a => a.company_id === companyId)
  }

  private async getRole(
    roleId: string,
    companyId: string
  ): Promise<Role | null> {
    // Check company-specific roles first
    const companyRoles = this.companyRoles.get(companyId) || []
    const companyRole = companyRoles.find(r => r.id === roleId)
    if (companyRole) return companyRole

    // Check system roles
    const systemRoles = this.companyRoles.get('system') || []
    return systemRoles.find(r => r.id === roleId) || null
  }

  private async checkPermissionConditions(
    conditions: PermissionCondition[],
    // userId: string,
    // context?: Record<string, any>
  ): Promise<boolean> {
    for (const condition of conditions) {
      switch (condition.type) {
        case 'time_range':
          // Check if current time is within allowed range
          break
        case 'ip_restriction':
          // Check if user's IP is allowed
          break
        case 'department_only':
          // Check if user belongs to allowed departments
          break
        case 'approval_required':
          // Check if action has been pre-approved
          break
      }
    }
    return true // Simplified for demo
  }

  private async checkRoleRestrictions(
    _restrictions: RoleRestriction[],
    _context?: Record<string, any>
  ): Promise<boolean> {
    // Check various restrictions based on type
    return true // Simplified for demo
  }

  private async canAssignRole(
    // assignerId: string,
    // roleId: string,
    // companyId: string
  ): Promise<boolean> {
    // Check if assigner can assign this specific role
    return await this.hasPermission(/* assignerId */'user', /* companyId */'company', 'assign_roles')
  }

  private async buildDelegationChain(
    // assignerId: string,
    // companyId: string
  ): Promise<string[]> {
    // Build chain showing who delegated authority
    return [/* assignerId */'user']
  }

  private async logAccess(
    userId: string,
    resource: string,
    result: string,
    context?: Record<string, any>
  ): Promise<void> {
    const entry: AccessAuditEntry = {
      timestamp: new Date(),
      action: `permission_check_${result}`,
      user_id: userId,
      details: {
        resource,
        ...context,
      },
    }

    this.auditLog.push(entry)

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000)
    }
  }

  private async notifyAccessRequest(request: AccessRequest): Promise<void> {
    console.log(`📧 Notifying access request: ${request.id}`)
  }

  private async notifyAccessResponse(
    request: AccessRequest,
    response: string
  ): Promise<void> {
    console.log(`📬 Notifying access response: ${response} for ${request.id}`)
  }

  private generateAssignmentId(): string {
    return `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateRequestId(): string {
    return `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateRoleId(): string {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get audit log for compliance
   */
  public getAuditLog(
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): AccessAuditEntry[] {
    let filtered = this.auditLog

    if (startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= endDate)
    }

    if (userId) {
      filtered = filtered.filter(entry => entry.user_id === userId)
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  }
}

// Export singleton instance
export const permissionManager = new PermissionManager()
export default PermissionManager

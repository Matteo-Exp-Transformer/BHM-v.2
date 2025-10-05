/**
 * B.9.1 Enterprise Security Manager
 * Advanced security monitoring, threat detection, and response for HACCP systems
 */

export interface SecurityConfig {
  enableRealTimeMonitoring: boolean
  enableThreatDetection: boolean
  enableAdvancedAudit: boolean
  maxFailedAttempts: number
  sessionTimeout: number // minutes
  enableMFA: boolean
  enableIPWhitelist: boolean
  allowedIPs?: string[]
}

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: ThreatLevel
  description: string
  userId?: string
  companyId: string
  ipAddress: string
  userAgent: string
  timestamp: Date
  metadata: Record<string, any>
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
}

export type SecurityEventType =
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'UNAUTHORIZED_ACCESS'
  | 'PERMISSION_VIOLATION'
  | 'DATA_ACCESS'
  | 'DATA_MODIFICATION'
  | 'SUSPICIOUS_ACTIVITY'
  | 'BRUTE_FORCE_DETECTED'
  | 'SESSION_HIJACK_ATTEMPT'
  | 'XSS_ATTEMPT'
  | 'SQL_INJECTION_ATTEMPT'
  | 'CSRF_DETECTED'
  | 'MALWARE_DETECTED'
  | 'COMPLIANCE_VIOLATION'

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface SecurityAudit {
  timestamp: Date
  checkType: string
  result: 'PASS' | 'FAIL' | 'WARNING'
  details: string
  recommendations?: string[]
}

export interface SecurityMetrics {
  totalEvents: number
  failedLogins: number
  blockedIPs: number
  activeSessions: number
  threatLevel: ThreatLevel
  lastSecurityCheck: Date
  uptime: number
}

/**
 * Advanced Security Manager for Enterprise HACCP Systems
 */
class SecurityManagerService {
  private config: SecurityConfig = {
    enableRealTimeMonitoring: true,
    enableThreatDetection: true,
    enableAdvancedAudit: false,
    maxFailedAttempts: 5,
    sessionTimeout: 480, // 8 hours
    enableMFA: false,
    enableIPWhitelist: false,
  }

  private events: SecurityEvent[] = []
  private blockedIPs: Set<string> = new Set()
  private failedAttempts: Map<string, number> = new Map()
  private activeSessions: Map<string, Date> = new Map()
  private threatDetectionEnabled = true

  /**
   * Initialize security manager with configuration
   */
  public async initialize(config: Partial<SecurityConfig>): Promise<void> {
    this.config = { ...this.config, ...config }

    console.log('🔒 Initializing Enterprise Security Manager...')

    // Setup real-time monitoring
    if (this.config.enableRealTimeMonitoring) {
      this.startRealTimeMonitoring()
    }

    // Setup threat detection
    if (this.config.enableThreatDetection) {
      this.enableThreatDetection()
    }

    // Setup session monitoring
    this.startSessionMonitoring()

    console.log('✅ Security Manager initialized with enterprise features')
  }

  /**
   * Log security event
   */
  public async logSecurityEvent(
    event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>
  ): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      resolved: false,
    }

    this.events.push(securityEvent)

    // Real-time threat analysis
    if (this.threatDetectionEnabled) {
      await this.analyzeThreat(securityEvent)
    }

    // Log to console for development
    const severityEmoji = {
      LOW: '🟢',
      MEDIUM: '🟡',
      HIGH: '🟠',
      CRITICAL: '🔴',
    }

    console.log(
      `${severityEmoji[event.severity]} Security Event: ${event.type} - ${event.description}`
    )

    // Auto-respond to critical threats
    if (event.severity === 'CRITICAL') {
      await this.respondToCriticalThreat(securityEvent)
    }
  }

  /**
   * Track login attempt
   */
  public async trackLoginAttempt(
    userId: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    companyId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check if IP is blocked
    if (this.blockedIPs.has(ipAddress)) {
      await this.logSecurityEvent({
        type: 'LOGIN_ATTEMPT',
        severity: 'HIGH',
        description: `Login attempt from blocked IP: ${ipAddress}`,
        userId,
        companyId,
        ipAddress,
        userAgent,
        metadata: { blocked: true },
      })
      return {
        allowed: false,
        reason: 'IP address blocked due to suspicious activity',
      }
    }

    // Check IP whitelist if enabled
    if (this.config.enableIPWhitelist && this.config.allowedIPs) {
      if (!this.config.allowedIPs.includes(ipAddress)) {
        await this.logSecurityEvent({
          type: 'UNAUTHORIZED_ACCESS',
          severity: 'HIGH',
          description: `Login attempt from non-whitelisted IP: ${ipAddress}`,
          userId,
          companyId,
          ipAddress,
          userAgent,
          metadata: { whitelist_violation: true },
        })
        return { allowed: false, reason: 'IP address not in whitelist' }
      }
    }

    if (success) {
      // Reset failed attempts on successful login
      this.failedAttempts.delete(ipAddress)
      this.activeSessions.set(userId, new Date())

      await this.logSecurityEvent({
        type: 'LOGIN_SUCCESS',
        severity: 'LOW',
        description: `Successful login for user ${userId}`,
        userId,
        companyId,
        ipAddress,
        userAgent,
        metadata: { success: true },
      })

      return { allowed: true }
    } else {
      // Track failed attempt
      const attempts = (this.failedAttempts.get(ipAddress) || 0) + 1
      this.failedAttempts.set(ipAddress, attempts)

      await this.logSecurityEvent({
        type: 'LOGIN_FAILURE',
        severity: attempts >= this.config.maxFailedAttempts ? 'HIGH' : 'MEDIUM',
        description: `Failed login attempt ${attempts}/${this.config.maxFailedAttempts} from ${ipAddress}`,
        userId,
        companyId,
        ipAddress,
        userAgent,
        metadata: { attempts, threshold: this.config.maxFailedAttempts },
      })

      // Block IP after max attempts
      if (attempts >= this.config.maxFailedAttempts) {
        this.blockedIPs.add(ipAddress)

        await this.logSecurityEvent({
          type: 'BRUTE_FORCE_DETECTED',
          severity: 'CRITICAL',
          description: `IP ${ipAddress} blocked after ${attempts} failed login attempts`,
          userId,
          companyId,
          ipAddress,
          userAgent,
          metadata: { blocked: true, attempts },
        })

        return {
          allowed: false,
          reason: `IP blocked after ${attempts} failed attempts`,
        }
      }

      return { allowed: true }
    }
  }

  /**
   * Check session validity
   */
  public checkSessionValidity(userId: string): boolean {
    const sessionStart = this.activeSessions.get(userId)
    if (!sessionStart) return false

    const sessionAge = Date.now() - sessionStart.getTime()
    const maxAge = this.config.sessionTimeout * 60 * 1000 // Convert to ms

    if (sessionAge > maxAge) {
      this.activeSessions.delete(userId)
      return false
    }

    return true
  }

  /**
   * Get security metrics
   */
  public async getSecurityMetrics(): Promise<SecurityMetrics> {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentEvents = this.events.filter(event => event.timestamp >= last24h)
    const failedLogins = recentEvents.filter(
      event => event.type === 'LOGIN_FAILURE'
    ).length

    // Calculate current threat level
    let threatLevel: ThreatLevel = 'LOW'
    if (failedLogins > 50 || this.blockedIPs.size > 10) threatLevel = 'CRITICAL'
    else if (failedLogins > 20 || this.blockedIPs.size > 5) threatLevel = 'HIGH'
    else if (failedLogins > 10 || this.blockedIPs.size > 2)
      threatLevel = 'MEDIUM'

    return {
      totalEvents: recentEvents.length,
      failedLogins,
      blockedIPs: this.blockedIPs.size,
      activeSessions: this.activeSessions.size,
      threatLevel,
      lastSecurityCheck: now,
      uptime: performance.now(),
    }
  }

  /**
   * Perform security audit
   */
  public async performSecurityAudit(): Promise<SecurityAudit[]> {
    const audits: SecurityAudit[] = []
    const now = new Date()

    // Check session management
    audits.push({
      timestamp: now,
      checkType: 'SESSION_MANAGEMENT',
      result: this.activeSessions.size < 100 ? 'PASS' : 'WARNING',
      details: `${this.activeSessions.size} active sessions`,
      recommendations:
        this.activeSessions.size >= 100
          ? ['Consider session cleanup']
          : undefined,
    })

    // Check failed login attempts
    const totalFailedAttempts = Array.from(this.failedAttempts.values()).reduce(
      (a, b) => a + b,
      0
    )
    audits.push({
      timestamp: now,
      checkType: 'AUTHENTICATION_SECURITY',
      result: totalFailedAttempts < 50 ? 'PASS' : 'FAIL',
      details: `${totalFailedAttempts} failed login attempts in monitoring period`,
      recommendations:
        totalFailedAttempts >= 50
          ? [
              'Enable additional authentication measures',
              'Review IP blocking policies',
            ]
          : undefined,
    })

    // Check blocked IPs
    audits.push({
      timestamp: now,
      checkType: 'IP_BLOCKING',
      result: this.blockedIPs.size < 20 ? 'PASS' : 'WARNING',
      details: `${this.blockedIPs.size} IP addresses currently blocked`,
      recommendations:
        this.blockedIPs.size >= 20
          ? ['Review and cleanup blocked IP list']
          : undefined,
    })

    return audits
  }

  /**
   * Enable advanced threat detection
   */
  public async enableAdvancedThreatDetection(): Promise<void> {
    this.threatDetectionEnabled = true
    console.log('🔍 Advanced threat detection enabled')
  }

  /**
   * Get recent security events
   */
  public getRecentEvents(hours: number = 24): SecurityEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.events.filter(event => event.timestamp >= cutoff)
  }

  /**
   * Clear security events older than specified days
   */
  public cleanupOldEvents(days: number = 30): void {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    this.events = this.events.filter(event => event.timestamp >= cutoff)
  }

  /**
   * Real-time monitoring setup
   */
  private startRealTimeMonitoring(): void {
    setInterval(async () => {
      const metrics = await this.getSecurityMetrics()

      if (metrics.threatLevel === 'CRITICAL') {
        console.warn(
          '🚨 CRITICAL THREAT LEVEL DETECTED - Security response activated'
        )
      }
    }, 60000) // Check every minute
  }

  /**
   * Threat analysis
   */
  private async analyzeThreat(event: SecurityEvent): Promise<void> {
    // Pattern detection for suspicious activities
    const recentEvents = this.getRecentEvents(1) // Last hour
    const similarEvents = recentEvents.filter(
      e => e.type === event.type && e.ipAddress === event.ipAddress
    )

    if (similarEvents.length > 10) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'HIGH',
        description: `Suspicious pattern detected: ${similarEvents.length} ${event.type} events from ${event.ipAddress}`,
        companyId: event.companyId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: {
          pattern_count: similarEvents.length,
          pattern_type: event.type,
        },
      })
    }
  }

  /**
   * Critical threat response
   */
  private async respondToCriticalThreat(event: SecurityEvent): Promise<void> {
    console.error('🚨 CRITICAL SECURITY THREAT DETECTED:', event)

    // Auto-block IP for critical threats
    if (event.ipAddress) {
      this.blockedIPs.add(event.ipAddress)
      console.log(`🚫 Auto-blocked IP: ${event.ipAddress}`)
    }

    // Notify administrators (in production, this would send actual notifications)
    console.log('📧 Security team notified of critical threat')
  }

  /**
   * Session monitoring
   */
  private startSessionMonitoring(): void {
    setInterval(() => {
      const now = Date.now()
      const maxAge = this.config.sessionTimeout * 60 * 1000

      for (const [userId, sessionStart] of this.activeSessions.entries()) {
        if (now - sessionStart.getTime() > maxAge) {
          this.activeSessions.delete(userId)
          console.log(`⏰ Session expired for user: ${userId}`)
        }
      }
    }, 300000) // Check every 5 minutes
  }

  /**
   * Enable threat detection
   */
  private enableThreatDetection(): void {
    this.threatDetectionEnabled = true
    console.log('🛡️ Threat detection enabled')
  }
}

// Export singleton instance
export const securityManager = new SecurityManagerService()

export default securityManager

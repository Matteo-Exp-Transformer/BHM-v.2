/**
 * RiskAssessment - B.10.2 Advanced Analytics & Reporting
 * Compliance risk assessment and scoring algorithms for HACCP
 */

export interface RiskFactor {
  id: string
  name: string
  category:
    | 'temperature'
    | 'hygiene'
    | 'equipment'
    | 'staff'
    | 'process'
    | 'external'
  weight: number
  score: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  status: 'normal' | 'warning' | 'critical'
  lastUpdated: Date
}

export interface RiskAssessmentResult {
  id: string
  entityId: string
  entityType: 'conservation_point' | 'company' | 'department' | 'product'
  overallScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: RiskFactor[]
  trends: {
    score: number
    direction: 'improving' | 'stable' | 'deteriorating'
    confidence: number
  }
  recommendations: RiskRecommendation[]
  lastAssessment: Date
  nextAssessment: Date
}

export interface RiskRecommendation {
  id: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  title: string
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  timeline: string
  cost: 'low' | 'medium' | 'high'
}

export interface RiskThreshold {
  category: string
  low: number
  medium: number
  high: number
  critical: number
}

export interface RiskHistory {
  date: Date
  score: number
  riskLevel: string
  factors: Record<string, number>
}

/**
 * Risk Assessment Service for HACCP Compliance
 */
export class RiskAssessmentService {
  private isInitialized = false
  private riskThresholds: Map<string, RiskThreshold> = new Map()

  /**
   * Initialize the risk assessment service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.loadRiskThresholds()
      console.log('⚠️ Risk assessment initialized - B.10.2 Advanced Analytics')
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize risk assessment:', error)
      throw error
    }
  }

  /**
   * Assess risk for a conservation point
   */
  public async assessConservationPointRisk(
    conservationPointId: string
  ): Promise<RiskAssessment> {
    try {
      // Get conservation point data
      const conservationData =
        await this.getConservationPointData(conservationPointId)

      // Calculate risk factors
      const factors =
        await this.calculateConservationRiskFactors(conservationData)

      // Calculate overall risk score
      const overallScore = this.calculateOverallRiskScore(factors)

      // Determine risk level
      const riskLevel = this.determineRiskLevel(
        overallScore,
        'conservation_point'
      )

      // Calculate trends
      const trends = await this.calculateRiskTrends(
        conservationPointId,
        'conservation_point'
      )

      // Generate recommendations
      const recommendations = this.generateRiskRecommendations(
        factors,
        riskLevel
      )

      return {
        id: `risk_${conservationPointId}_${Date.now()}`,
        entityId: conservationPointId,
        entityType: 'conservation_point',
        overallScore,
        riskLevel,
        factors,
        trends,
        recommendations,
        lastAssessment: new Date(),
        nextAssessment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    } catch (error) {
      console.error('Failed to assess conservation point risk:', error)
      throw error
    }
  }

  /**
   * Assess risk for a company
   */
  public async assessCompanyRisk(companyId: string): Promise<RiskAssessment> {
    try {
      const companyData = await this.getCompanyData(companyId)
      const factors = await this.calculateCompanyRiskFactors(companyData)
      const overallScore = this.calculateOverallRiskScore(factors)
      const riskLevel = this.determineRiskLevel(overallScore, 'company')
      const trends = await this.calculateRiskTrends(companyId, 'company')
      const recommendations = this.generateRiskRecommendations(
        factors,
        riskLevel
      )

      return {
        id: `risk_${companyId}_${Date.now()}`,
        entityId: companyId,
        entityType: 'company',
        overallScore,
        riskLevel,
        factors,
        trends,
        recommendations,
        lastAssessment: new Date(),
        nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    } catch (error) {
      console.error('Failed to assess company risk:', error)
      throw error
    }
  }

  /**
   * Assess risk for a department
   */
  public async assessDepartmentRisk(
    departmentId: string
  ): Promise<RiskAssessment> {
    try {
      const departmentData = await this.getDepartmentData(departmentId)
      const factors = await this.calculateDepartmentRiskFactors(departmentData)
      const overallScore = this.calculateOverallRiskScore(factors)
      const riskLevel = this.determineRiskLevel(overallScore, 'department')
      const trends = await this.calculateRiskTrends(departmentId, 'department')
      const recommendations = this.generateRiskRecommendations(
        factors,
        riskLevel
      )

      return {
        id: `risk_${departmentId}_${Date.now()}`,
        entityId: departmentId,
        entityType: 'department',
        overallScore,
        riskLevel,
        factors,
        trends,
        recommendations,
        lastAssessment: new Date(),
        nextAssessment: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      }
    } catch (error) {
      console.error('Failed to assess department risk:', error)
      throw error
    }
  }

  /**
   * Get risk assessment history
   */
  public async getRiskHistory(
    entityId: string,
    entityType: string,
    days: number = 30
  ): Promise<RiskHistory[]> {
    try {
      // Mock implementation - would fetch from database
      const history: RiskHistory[] = []
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        const baseScore = 75
        const variation = Math.sin(i / 7) * 10 + Math.random() * 5

        history.push({
          date,
          score: Math.max(0, Math.min(100, baseScore + variation)),
          riskLevel: this.determineRiskLevel(baseScore + variation, entityType),
          factors: {
            temperature: 70 + Math.random() * 20,
            hygiene: 80 + Math.random() * 15,
            equipment: 75 + Math.random() * 20,
            staff: 85 + Math.random() * 10,
          },
        })
      }

      return history
    } catch (error) {
      console.error('Failed to get risk history:', error)
      throw error
    }
  }

  /**
   * Compare risk across multiple entities
   */
  public async compareRiskAssessments(
    entityIds: string[],
    entityType: string
  ): Promise<RiskAssessment[]> {
    try {
      const assessments: RiskAssessment[] = []

      for (const entityId of entityIds) {
        let assessment: RiskAssessment

        switch (entityType) {
          case 'conservation_point':
            assessment = await this.assessConservationPointRisk(entityId)
            break
          case 'company':
            assessment = await this.assessCompanyRisk(entityId)
            break
          case 'department':
            assessment = await this.assessDepartmentRisk(entityId)
            break
          default:
            throw new Error(`Unknown entity type: ${entityType}`)
        }

        assessments.push(assessment)
      }

      // Sort by risk score (highest first)
      return assessments.sort((a, b) => b.overallScore - a.overallScore)
    } catch (error) {
      console.error('Failed to compare risk assessments:', error)
      throw error
    }
  }

  /**
   * Get risk alerts for high-risk entities
   */
  public async getRiskAlerts(): Promise<RiskAssessment[]> {
    try {
      // Get all entities and their risk assessments
      const allAssessments = await this.getAllRiskAssessments()

      // Filter for high and critical risk
      return allAssessments.filter(
        assessment =>
          assessment.riskLevel === 'high' || assessment.riskLevel === 'critical'
      )
    } catch (error) {
      console.error('Failed to get risk alerts:', error)
      throw error
    }
  }

  /**
   * Update risk thresholds
   */
  public updateRiskThresholds(
    category: string,
    thresholds: RiskThreshold
  ): void {
    this.riskThresholds.set(category, thresholds)
    console.log(`📊 Risk thresholds updated for ${category}`)
  }

  // Private helper methods

  private async loadRiskThresholds(): Promise<void> {
    // Default risk thresholds
    this.riskThresholds.set('conservation_point', {
      category: 'conservation_point',
      low: 0,
      medium: 30,
      high: 60,
      critical: 80,
    })

    this.riskThresholds.set('company', {
      category: 'company',
      low: 0,
      medium: 25,
      high: 50,
      critical: 75,
    })

    this.riskThresholds.set('department', {
      category: 'department',
      low: 0,
      medium: 35,
      high: 65,
      critical: 85,
    })
  }

  private async getConservationPointData(
    conservationPointId: string
  ): Promise<any> {
    // Mock implementation - would fetch from database
    return {
      id: conservationPointId,
      temperature: {
        current: 4.2,
        average: 3.8,
        violations: 2,
        lastViolation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      equipment: {
        age: 5,
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        status: 'good',
      },
      hygiene: {
        lastInspection: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        score: 85,
        issues: 1,
      },
    }
  }

  private async getCompanyData(companyId: string): Promise<any> {
    // Mock implementation - would fetch from database
    return {
      id: companyId,
      compliance: {
        overallScore: 78,
        lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        violations: 3,
        improvements: 5,
      },
      staff: {
        totalEmployees: 45,
        trainedEmployees: 40,
        lastTraining: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      equipment: {
        totalEquipment: 12,
        maintenanceDue: 2,
        criticalIssues: 0,
      },
    }
  }

  private async getDepartmentData(departmentId: string): Promise<any> {
    // Mock implementation - would fetch from database
    return {
      id: departmentId,
      performance: {
        averageScore: 82,
        productivity: 78,
        quality: 85,
      },
      staff: {
        totalStaff: 8,
        experiencedStaff: 6,
        turnoverRate: 0.15,
      },
      processes: {
        documented: 12,
        updated: 10,
        compliant: 11,
      },
    }
  }

  private async calculateConservationRiskFactors(
    data: any
  ): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = []

    // Temperature risk factor
    const tempViolations = data.temperature.violations
    const tempScore = Math.max(0, 100 - tempViolations * 20)
    factors.push({
      id: 'temperature_risk',
      name: 'Temperature Control',
      category: 'temperature',
      weight: 0.4,
      score: tempScore,
      impact:
        tempScore < 40
          ? 'critical'
          : tempScore < 60
            ? 'high'
            : tempScore < 80
              ? 'medium'
              : 'low',
      status:
        tempScore < 40 ? 'critical' : tempScore < 60 ? 'warning' : 'normal',
      lastUpdated: new Date(),
    })

    // Equipment risk factor
    const equipmentAge = data.equipment.age
    const maintenanceGap =
      (Date.now() - data.equipment.lastMaintenance.getTime()) /
      (1000 * 60 * 60 * 24 * 30) // months
    const equipmentScore = Math.max(
      0,
      100 - equipmentAge * 5 - maintenanceGap * 10
    )
    factors.push({
      id: 'equipment_risk',
      name: 'Equipment Condition',
      category: 'equipment',
      weight: 0.3,
      score: equipmentScore,
      impact:
        equipmentScore < 40
          ? 'critical'
          : equipmentScore < 60
            ? 'high'
            : equipmentScore < 80
              ? 'medium'
              : 'low',
      status:
        equipmentScore < 40
          ? 'critical'
          : equipmentScore < 60
            ? 'warning'
            : 'normal',
      lastUpdated: new Date(),
    })

    // Hygiene risk factor
    const hygieneScore = data.hygiene.score
    factors.push({
      id: 'hygiene_risk',
      name: 'Hygiene Standards',
      category: 'hygiene',
      weight: 0.3,
      score: hygieneScore,
      impact:
        hygieneScore < 40
          ? 'critical'
          : hygieneScore < 60
            ? 'high'
            : hygieneScore < 80
              ? 'medium'
              : 'low',
      status:
        hygieneScore < 40
          ? 'critical'
          : hygieneScore < 60
            ? 'warning'
            : 'normal',
      lastUpdated: new Date(),
    })

    return factors
  }

  private async calculateCompanyRiskFactors(data: any): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = []

    // Compliance risk factor
    const complianceScore = data.compliance.overallScore
    factors.push({
      id: 'compliance_risk',
      name: 'Compliance Score',
      category: 'process',
      weight: 0.4,
      score: complianceScore,
      impact:
        complianceScore < 40
          ? 'critical'
          : complianceScore < 60
            ? 'high'
            : complianceScore < 80
              ? 'medium'
              : 'low',
      status:
        complianceScore < 40
          ? 'critical'
          : complianceScore < 60
            ? 'warning'
            : 'normal',
      lastUpdated: new Date(),
    })

    // Staff training risk factor
    const trainingCoverage =
      (data.staff.trainedEmployees / data.staff.totalEmployees) * 100
    const trainingGap =
      (Date.now() - data.staff.lastTraining.getTime()) /
      (1000 * 60 * 60 * 24 * 365) // years
    const staffScore = Math.max(0, trainingCoverage - trainingGap * 20)
    factors.push({
      id: 'staff_risk',
      name: 'Staff Training',
      category: 'staff',
      weight: 0.3,
      score: staffScore,
      impact:
        staffScore < 40
          ? 'critical'
          : staffScore < 60
            ? 'high'
            : staffScore < 80
              ? 'medium'
              : 'low',
      status:
        staffScore < 40 ? 'critical' : staffScore < 60 ? 'warning' : 'normal',
      lastUpdated: new Date(),
    })

    // Equipment risk factor
    const equipmentScore = Math.max(
      0,
      100 -
        data.equipment.maintenanceDue * 15 -
        data.equipment.criticalIssues * 30
    )
    factors.push({
      id: 'equipment_risk',
      name: 'Equipment Status',
      category: 'equipment',
      weight: 0.3,
      score: equipmentScore,
      impact:
        equipmentScore < 40
          ? 'critical'
          : equipmentScore < 60
            ? 'high'
            : equipmentScore < 80
              ? 'medium'
              : 'low',
      status:
        equipmentScore < 40
          ? 'critical'
          : equipmentScore < 60
            ? 'warning'
            : 'normal',
      lastUpdated: new Date(),
    })

    return factors
  }

  private async calculateDepartmentRiskFactors(
    data: any
  ): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = []

    // Performance risk factor
    const performanceScore =
      (data.performance.averageScore +
        data.performance.productivity +
        data.performance.quality) /
      3
    factors.push({
      id: 'performance_risk',
      name: 'Department Performance',
      category: 'process',
      weight: 0.4,
      score: performanceScore,
      impact:
        performanceScore < 40
          ? 'critical'
          : performanceScore < 60
            ? 'high'
            : performanceScore < 80
              ? 'medium'
              : 'low',
      status:
        performanceScore < 40
          ? 'critical'
          : performanceScore < 60
            ? 'warning'
            : 'normal',
      lastUpdated: new Date(),
    })

    // Staff risk factor
    const experienceRatio = data.staff.experiencedStaff / data.staff.totalStaff
    const turnoverRisk = data.staff.turnoverRate * 100
    const staffScore = Math.max(0, experienceRatio * 100 - turnoverRisk)
    factors.push({
      id: 'staff_risk',
      name: 'Staff Stability',
      category: 'staff',
      weight: 0.3,
      score: staffScore,
      impact:
        staffScore < 40
          ? 'critical'
          : staffScore < 60
            ? 'high'
            : staffScore < 80
              ? 'medium'
              : 'low',
      status:
        staffScore < 40 ? 'critical' : staffScore < 60 ? 'warning' : 'normal',
      lastUpdated: new Date(),
    })

    // Process risk factor
    const processCompliance =
      (data.processes.compliant / data.processes.documented) * 100
    const processScore = processCompliance
    factors.push({
      id: 'process_risk',
      name: 'Process Compliance',
      category: 'process',
      weight: 0.3,
      score: processScore,
      impact:
        processScore < 40
          ? 'critical'
          : processScore < 60
            ? 'high'
            : processScore < 80
              ? 'medium'
              : 'low',
      status:
        processScore < 40
          ? 'critical'
          : processScore < 60
            ? 'warning'
            : 'normal',
      lastUpdated: new Date(),
    })

    return factors
  }

  private calculateOverallRiskScore(factors: RiskFactor[]): number {
    const weightedSum = factors.reduce(
      (sum, factor) => sum + factor.score * factor.weight,
      0
    )
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0)

    // Risk score is inverse of performance score (higher performance = lower risk)
    return Math.max(0, Math.min(100, 100 - weightedSum / totalWeight))
  }

  private determineRiskLevel(
    score: number,
    entityType: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const thresholds = this.riskThresholds.get(entityType)
    if (!thresholds) {
      // Default thresholds
      if (score >= 80) return 'critical'
      if (score >= 60) return 'high'
      if (score >= 30) return 'medium'
      return 'low'
    }

    if (score >= thresholds.critical) return 'critical'
    if (score >= thresholds.high) return 'high'
    if (score >= thresholds.medium) return 'medium'
    return 'low'
  }

  private async calculateRiskTrends(
    _entityId: string,
    _entityType: string
  ): Promise<{
    score: number
    direction: 'improving' | 'stable' | 'deteriorating'
    confidence: number
  }> {
    // Mock implementation - would analyze historical data
    const historicalScores = [75, 72, 78, 80, 82] // Last 5 assessments
    const currentScore = historicalScores[historicalScores.length - 1]
    const previousScore = historicalScores[historicalScores.length - 2]

    const difference = currentScore - previousScore
    const direction =
      difference > 2
        ? 'improving'
        : difference < -2
          ? 'deteriorating'
          : 'stable'
    const confidence = 0.85

    return {
      score: currentScore,
      direction,
      confidence,
    }
  }

  private generateRiskRecommendations(
    factors: RiskFactor[],
    riskLevel: string
  ): RiskRecommendation[] {
    const recommendations: RiskRecommendation[] = []

    // Generate recommendations based on risk factors
    factors.forEach(factor => {
      if (factor.status === 'critical' || factor.status === 'warning') {
        recommendations.push(this.createRecommendation(factor, riskLevel))
      }
    })

    // Add general recommendations based on risk level
    if (riskLevel === 'critical') {
      recommendations.push({
        id: 'urgent_review',
        priority: 'urgent',
        category: 'general',
        title: 'Immediate Risk Review Required',
        description:
          'Critical risk level detected. Immediate intervention required.',
        impact: 'High - Prevents potential compliance violations',
        effort: 'high',
        timeline: 'Within 24 hours',
        cost: 'medium',
      })
    }

    return recommendations
  }

  private createRecommendation(
    factor: RiskFactor,
    _riskLevel: string
  ): RiskRecommendation {
    const priority = factor.status === 'critical' ? 'urgent' : 'high'
    const effort =
      factor.category === 'equipment'
        ? 'high'
        : factor.category === 'staff'
          ? 'medium'
          : 'low'
    const cost = factor.category === 'equipment' ? 'high' : 'low'

    return {
      id: `recommendation_${factor.id}`,
      priority,
      category: factor.category,
      title: `Improve ${factor.name}`,
      description: `Address ${factor.name.toLowerCase()} issues to reduce risk`,
      impact: `Medium - Improves ${factor.category} risk score`,
      effort,
      timeline: priority === 'urgent' ? 'Within 7 days' : 'Within 30 days',
      cost,
    }
  }

  private async getAllRiskAssessments(): Promise<RiskAssessment[]> {
    // Mock implementation - would fetch from database
    return []
  }
}

// Export singleton instance
export const riskAssessment = new RiskAssessmentService()

export default riskAssessment

/**
 * BenchmarkAnalyzer - B.10.2 Advanced Analytics & Reporting
 * Industry comparison and performance benchmarking system
 */

export interface BenchmarkData {
  id: string
  metric: string
  category: 'compliance' | 'performance' | 'efficiency' | 'quality' | 'cost'
  industry: string
  ourValue: number
  industryAverage: number
  industryMedian: number
  topQuartile: number
  bottomQuartile: number
  topPerformers: number
  percentile: number
  variance: number
  trend: 'improving' | 'declining' | 'stable'
  trendValue: number
  trendPeriod: string
  lastUpdated: Date
  dataSource: string
  confidence: number
}

export interface IndustryComparison {
  industry: string
  metrics: BenchmarkData[]
  overallScore: number
  ranking: number
  totalCompanies: number
  ourRanking: number
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
}

export interface CompetitiveAnalysis {
  competitor: string
  metrics: {
    [key: string]: {
      theirValue: number
      ourValue: number
      gap: number
      advantage: 'us' | 'them' | 'neutral'
    }
  }
  overallGap: number
  competitivePosition: 'leader' | 'strong' | 'average' | 'weak' | 'laggard'
}

export interface BenchmarkInsight {
  id: string
  type: 'opportunity' | 'threat' | 'achievement' | 'gap'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  metric: string
  impact: number
  recommendation: string
  timeline: string
  confidence: number
  affectedAreas: string[]
}

export interface BenchmarkReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalMetrics: number
    aboveAverage: number
    belowAverage: number
    topPerformers: number
    improvementAreas: number
  }
  industryComparisons: IndustryComparison[]
  competitiveAnalysis: CompetitiveAnalysis[]
  insights: BenchmarkInsight[]
  recommendations: string[]
  nextReviewDate: Date
}

/**
 * Benchmark Analyzer Service for Industry Comparison
 */
export class BenchmarkAnalyzer {
  private isInitialized = false
  private benchmarkData: Map<string, BenchmarkData[]> = new Map()

  /**
   * Initialize the benchmark analyzer
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.loadBenchmarkData()
      console.log('📊 Benchmark analyzer initialized - B.10.2 Advanced Analytics')
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize benchmark analyzer:', error)
      throw error
    }
  }

  /**
   * Generate comprehensive benchmark report
   */
  public async generateBenchmarkReport(
    startDate: Date,
    endDate: Date,
    industries: string[] = ['Food Safety', 'HACCP Management']
  ): Promise<BenchmarkReport> {
    try {
      // Get our performance data
      const ourData = await this.getOurPerformanceData(startDate, endDate)
      
      // Generate industry comparisons
      const industryComparisons = await this.generateIndustryComparisons(ourData, industries)
      
      // Generate competitive analysis
      const competitiveAnalysis = await this.generateCompetitiveAnalysis(ourData)
      
      // Generate insights
      const insights = await this.generateBenchmarkInsights(ourData, industryComparisons)
      
      // Calculate summary statistics
      const summary = this.calculateSummaryStatistics(industryComparisons)
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(insights, industryComparisons)

      const report: BenchmarkReport = {
        period: { start: startDate, end: endDate },
        summary,
        industryComparisons,
        competitiveAnalysis,
        insights,
        recommendations,
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      }

      console.log('📊 Generated comprehensive benchmark report')
      return report
      
    } catch (error) {
      console.error('Failed to generate benchmark report:', error)
      throw error
    }
  }

  /**
   * Get industry comparison for specific metrics
   */
  public async getIndustryComparison(
    industry: string,
    metrics: string[]
  ): Promise<IndustryComparison> {
    try {
      const benchmarkData = this.benchmarkData.get(industry) || []
      const ourData = await this.getOurPerformanceData()
      
      const filteredMetrics = benchmarkData.filter(data => metrics.includes(data.metric))
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore(filteredMetrics)
      
      // Determine ranking
      const ranking = this.calculateIndustryRanking(industry, overallScore)
      
      // Identify strengths and weaknesses
      const strengths = filteredMetrics
        .filter(m => m.percentile >= 75)
        .map(m => m.metric)
      
      const weaknesses = filteredMetrics
        .filter(m => m.percentile < 50)
        .map(m => m.metric)
      
      // Identify opportunities
      const opportunities = filteredMetrics
        .filter(m => m.percentile >= 50 && m.percentile < 75)
        .map(m => m.metric)

      return {
        industry,
        metrics: filteredMetrics,
        overallScore,
        ranking,
        totalCompanies: this.getIndustryCompanyCount(industry),
        ourRanking: ranking,
        strengths,
        weaknesses,
        opportunities
      }
      
    } catch (error) {
      console.error('Failed to get industry comparison:', error)
      throw error
    }
  }

  /**
   * Get competitive analysis
   */
  public async getCompetitiveAnalysis(
    competitors: string[]
  ): Promise<CompetitiveAnalysis[]> {
    try {
      const ourData = await this.getOurPerformanceData()
      const competitiveAnalysis: CompetitiveAnalysis[] = []

      for (const competitor of competitors) {
        const competitorData = await this.getCompetitorData(competitor)
        
        const analysis: CompetitiveAnalysis = {
          competitor,
          metrics: {},
          overallGap: 0,
          competitivePosition: 'average'
        }

        // Compare each metric
        let totalGap = 0
        let metricCount = 0

        Object.keys(ourData).forEach(metric => {
          const ourValue = ourData[metric]
          const theirValue = competitorData[metric] || ourValue
          const gap = ourValue - theirValue

          analysis.metrics[metric] = {
            theirValue,
            ourValue,
            gap,
            advantage: gap > 0 ? 'us' : gap < 0 ? 'them' : 'neutral'
          }

          totalGap += gap
          metricCount++
        })

        analysis.overallGap = metricCount > 0 ? totalGap / metricCount : 0
        analysis.competitivePosition = this.determineCompetitivePosition(analysis.overallGap)

        competitiveAnalysis.push(analysis)
      }

      console.log(`📊 Generated competitive analysis for ${competitors.length} competitors`)
      return competitiveAnalysis
      
    } catch (error) {
      console.error('Failed to get competitive analysis:', error)
      throw error
    }
  }

  /**
   * Get benchmark insights and recommendations
   */
  public async getBenchmarkInsights(
    industry: string,
    metrics: string[]
  ): Promise<BenchmarkInsight[]> {
    try {
      const benchmarkData = this.benchmarkData.get(industry) || []
      const ourData = await this.getOurPerformanceData()
      const insights: BenchmarkInsight[] = []

      const filteredData = benchmarkData.filter(data => metrics.includes(data.metric))

      filteredData.forEach(data => {
        // Identify opportunities (below average but achievable)
        if (data.percentile < 50 && data.percentile > 25) {
          insights.push({
            id: `opportunity_${data.metric}`,
            type: 'opportunity',
            priority: 'medium',
            title: `Improvement Opportunity: ${data.metric}`,
            description: `Our ${data.metric} is below industry average but within reach of improvement.`,
            metric: data.metric,
            impact: Math.abs(data.variance) * 0.1,
            recommendation: `Focus on improving ${data.metric} to reach industry average.`,
            timeline: 'Within 6 months',
            confidence: 0.8,
            affectedAreas: this.getAffectedAreas(data.metric)
          })
        }

        // Identify threats (significantly below average)
        if (data.percentile < 25) {
          insights.push({
            id: `threat_${data.metric}`,
            type: 'threat',
            priority: 'high',
            title: `Performance Gap: ${data.metric}`,
            description: `Our ${data.metric} is significantly below industry standards.`,
            metric: data.metric,
            impact: Math.abs(data.variance) * 0.2,
            recommendation: `Immediate action required to improve ${data.metric}.`,
            timeline: 'Within 3 months',
            confidence: 0.9,
            affectedAreas: this.getAffectedAreas(data.metric)
          })
        }

        // Identify achievements (above average)
        if (data.percentile >= 75) {
          insights.push({
            id: `achievement_${data.metric}`,
            type: 'achievement',
            priority: 'low',
            title: `Industry Leader: ${data.metric}`,
            description: `We are performing above industry average in ${data.metric}.`,
            metric: data.metric,
            impact: data.variance * 0.1,
            recommendation: `Maintain excellence in ${data.metric} and share best practices.`,
            timeline: 'Ongoing',
            confidence: 0.85,
            affectedAreas: this.getAffectedAreas(data.metric)
          })
        }
      })

      // Sort by priority and impact
      insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return b.impact - a.impact
      })

      console.log(`📊 Generated ${insights.length} benchmark insights`)
      return insights.slice(0, 15) // Return top 15 insights
      
    } catch (error) {
      console.error('Failed to get benchmark insights:', error)
      throw error
    }
  }

  /**
   * Update benchmark data
   */
  public updateBenchmarkData(
    industry: string,
    metric: string,
    data: Partial<BenchmarkData>
  ): void {
    const industryData = this.benchmarkData.get(industry) || []
    const existingIndex = industryData.findIndex(d => d.metric === metric)

    if (existingIndex >= 0) {
      industryData[existingIndex] = { ...industryData[existingIndex], ...data }
    } else {
      const newData: BenchmarkData = {
        id: `${industry}_${metric}`,
        metric,
        category: data.category || 'performance',
        industry,
        ourValue: data.ourValue || 0,
        industryAverage: data.industryAverage || 0,
        industryMedian: data.industryMedian || 0,
        topQuartile: data.topQuartile || 0,
        bottomQuartile: data.bottomQuartile || 0,
        topPerformers: data.topPerformers || 0,
        percentile: data.percentile || 50,
        variance: data.variance || 0,
        trend: data.trend || 'stable',
        trendValue: data.trendValue || 0,
        trendPeriod: data.trendPeriod || '30 days',
        lastUpdated: new Date(),
        dataSource: data.dataSource || 'internal',
        confidence: data.confidence || 0.8,
        ...data
      }
      industryData.push(newData)
    }

    this.benchmarkData.set(industry, industryData)
    console.log(`📊 Updated benchmark data for ${industry} - ${metric}`)
  }

  // Private helper methods

  private async loadBenchmarkData(): Promise<void> {
    // Load industry benchmark data
    const industries = ['Food Safety', 'HACCP Management', 'Quality Assurance']
    
    industries.forEach(industry => {
      const data: BenchmarkData[] = this.generateMockBenchmarkData(industry)
      this.benchmarkData.set(industry, data)
    })

    console.log(`📊 Loaded benchmark data for ${industries.length} industries`)
  }

  private generateMockBenchmarkData(industry: string): BenchmarkData[] {
    const metrics = [
      { name: 'Compliance Score', category: 'compliance' as const, avg: 78, range: 20 },
      { name: 'Violation Rate', category: 'compliance' as const, avg: 12, range: 15 },
      { name: 'Response Time', category: 'performance' as const, avg: 24, range: 18 },
      { name: 'Training Completion', category: 'performance' as const, avg: 75, range: 25 },
      { name: 'Documentation Score', category: 'quality' as const, avg: 82, range: 20 },
      { name: 'Audit Success Rate', category: 'quality' as const, avg: 88, range: 15 },
      { name: 'Cost per Compliance', category: 'cost' as const, avg: 1500, range: 500 },
      { name: 'Efficiency Index', category: 'efficiency' as const, avg: 72, range: 20 }
    ]

    return metrics.map(metric => {
      const ourValue = metric.avg + (Math.random() - 0.5) * metric.range
      const variance = ourValue - metric.avg
      const percentile = this.calculatePercentile(ourValue, metric.avg, metric.range)

      return {
        id: `${industry}_${metric.name}`,
        metric: metric.name,
        category: metric.category,
        industry,
        ourValue,
        industryAverage: metric.avg,
        industryMedian: metric.avg + (Math.random() - 0.5) * 5,
        topQuartile: metric.avg + metric.range * 0.5,
        bottomQuartile: metric.avg - metric.range * 0.5,
        topPerformers: metric.avg + metric.range * 0.75,
        percentile,
        variance,
        trend: Math.random() > 0.5 ? 'improving' : 'declining',
        trendValue: (Math.random() - 0.5) * 10,
        trendPeriod: '30 days',
        lastUpdated: new Date(),
        dataSource: 'industry_survey',
        confidence: 0.8 + Math.random() * 0.2
      }
    })
  }

  private calculatePercentile(ourValue: number, average: number, range: number): number {
    const deviation = (ourValue - average) / (range / 2)
    const percentile = 50 + (deviation * 25) // Convert to percentile
    return Math.max(0, Math.min(100, percentile))
  }

  private async getOurPerformanceData(): Promise<Record<string, number>> {
    // Mock implementation - would fetch from actual data sources
    return {
      'Compliance Score': 82,
      'Violation Rate': 8,
      'Response Time': 18,
      'Training Completion': 85,
      'Documentation Score': 88,
      'Audit Success Rate': 92,
      'Cost per Compliance': 1450,
      'Efficiency Index': 78
    }
  }

  private async getOurPerformanceData(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    // Mock implementation with time-based data
    return this.getOurPerformanceData()
  }

  private async generateIndustryComparisons(
    ourData: Record<string, number>,
    industries: string[]
  ): Promise<IndustryComparison[]> {
    const comparisons: IndustryComparison[] = []

    for (const industry of industries) {
      const benchmarkData = this.benchmarkData.get(industry) || []
      
      // Update our values in benchmark data
      const updatedData = benchmarkData.map(data => ({
        ...data,
        ourValue: ourData[data.metric] || data.ourValue,
        variance: (ourData[data.metric] || data.ourValue) - data.industryAverage,
        percentile: this.calculatePercentile(
          ourData[data.metric] || data.ourValue,
          data.industryAverage,
          data.topQuartile - data.bottomQuartile
        )
      }))

      const overallScore = this.calculateOverallScore(updatedData)
      const ranking = this.calculateIndustryRanking(industry, overallScore)

      const strengths = updatedData
        .filter(d => d.percentile >= 75)
        .map(d => d.metric)
      
      const weaknesses = updatedData
        .filter(d => d.percentile < 50)
        .map(d => d.metric)
      
      const opportunities = updatedData
        .filter(d => d.percentile >= 50 && d.percentile < 75)
        .map(d => d.metric)

      comparisons.push({
        industry,
        metrics: updatedData,
        overallScore,
        ranking,
        totalCompanies: this.getIndustryCompanyCount(industry),
        ourRanking: ranking,
        strengths,
        weaknesses,
        opportunities
      })
    }

    return comparisons
  }

  private async generateCompetitiveAnalysis(ourData: Record<string, number>): Promise<CompetitiveAnalysis[]> {
    // Mock competitor data
    const competitors = ['Competitor A', 'Competitor B', 'Competitor C']
    const analysis: CompetitiveAnalysis[] = []

    competitors.forEach(competitor => {
      const competitorData: Record<string, number> = {}
      let totalGap = 0
      let metricCount = 0

      Object.keys(ourData).forEach(metric => {
        const ourValue = ourData[metric]
        // Generate competitor value with some variation
        const competitorValue = ourValue + (Math.random() - 0.5) * ourValue * 0.2
        const gap = ourValue - competitorValue

        competitorData[metric] = competitorValue
        totalGap += gap
        metricCount++
      })

      analysis.push({
        competitor,
        metrics: Object.keys(ourData).reduce((acc, metric) => {
          const ourValue = ourData[metric]
          const theirValue = competitorData[metric]
          const gap = ourValue - theirValue

          acc[metric] = {
            theirValue,
            ourValue,
            gap,
            advantage: gap > 0 ? 'us' : gap < 0 ? 'them' : 'neutral'
          }
          return acc
        }, {} as CompetitiveAnalysis['metrics']),
        overallGap: metricCount > 0 ? totalGap / metricCount : 0,
        competitivePosition: this.determineCompetitivePosition(totalGap / metricCount)
      })
    })

    return analysis
  }

  private async generateBenchmarkInsights(
    ourData: Record<string, number>,
    industryComparisons: IndustryComparison[]
  ): Promise<BenchmarkInsight[]> {
    const insights: BenchmarkInsight[] = []

    industryComparisons.forEach(comparison => {
      comparison.metrics.forEach(data => {
        if (data.percentile < 50) {
          insights.push({
            id: `insight_${comparison.industry}_${data.metric}`,
            type: data.percentile < 25 ? 'threat' : 'opportunity',
            priority: data.percentile < 25 ? 'high' : 'medium',
            title: `${comparison.industry} Performance Gap: ${data.metric}`,
            description: `Our ${data.metric} in ${comparison.industry} is below industry average.`,
            metric: data.metric,
            impact: Math.abs(data.variance) * 0.1,
            recommendation: `Improve ${data.metric} to reach industry standards.`,
            timeline: data.percentile < 25 ? 'Within 3 months' : 'Within 6 months',
            confidence: 0.8,
            affectedAreas: this.getAffectedAreas(data.metric)
          })
        }
      })
    })

    return insights.slice(0, 10)
  }

  private calculateOverallScore(metrics: BenchmarkData[]): number {
    if (metrics.length === 0) return 0
    const totalPercentile = metrics.reduce((sum, m) => sum + m.percentile, 0)
    return totalPercentile / metrics.length
  }

  private calculateIndustryRanking(industry: string, score: number): number {
    // Mock ranking calculation
    return Math.floor(Math.random() * 10) + 1
  }

  private getIndustryCompanyCount(industry: string): number {
    // Mock company count
    return Math.floor(Math.random() * 100) + 50
  }

  private async getCompetitorData(competitor: string): Promise<Record<string, number>> {
    // Mock competitor data
    const baseData = await this.getOurPerformanceData()
    const competitorData: Record<string, number> = {}

    Object.keys(baseData).forEach(metric => {
      competitorData[metric] = baseData[metric] + (Math.random() - 0.5) * baseData[metric] * 0.3
    })

    return competitorData
  }

  private determineCompetitivePosition(overallGap: number): CompetitiveAnalysis['competitivePosition'] {
    if (overallGap > 10) return 'leader'
    if (overallGap > 5) return 'strong'
    if (overallGap > -5) return 'average'
    if (overallGap > -10) return 'weak'
    return 'laggard'
  }

  private calculateSummaryStatistics(industryComparisons: IndustryComparison[]): BenchmarkReport['summary'] {
    const totalMetrics = industryComparisons.reduce((sum, c) => sum + c.metrics.length, 0)
    const aboveAverage = industryComparisons.reduce((sum, c) => 
      sum + c.metrics.filter(m => m.percentile > 50).length, 0
    )
    const belowAverage = totalMetrics - aboveAverage
    const topPerformers = industryComparisons.reduce((sum, c) => 
      sum + c.metrics.filter(m => m.percentile >= 75).length, 0
    )

    return {
      totalMetrics,
      aboveAverage,
      belowAverage,
      topPerformers,
      improvementAreas: belowAverage
    }
  }

  private generateRecommendations(
    insights: BenchmarkInsight[],
    industryComparisons: IndustryComparison[]
  ): string[] {
    const recommendations: string[] = []

    // High priority insights
    const highPriorityInsights = insights.filter(i => i.priority === 'high')
    if (highPriorityInsights.length > 0) {
      recommendations.push(`Address ${highPriorityInsights.length} high-priority performance gaps immediately`)
    }

    // Industry-specific recommendations
    industryComparisons.forEach(comparison => {
      if (comparison.weaknesses.length > 0) {
        recommendations.push(`Focus on ${comparison.industry} weaknesses: ${comparison.weaknesses.join(', ')}`)
      }
      if (comparison.strengths.length > 0) {
        recommendations.push(`Leverage ${comparison.industry} strengths: ${comparison.strengths.join(', ')}`)
      }
    })

    // General recommendations
    recommendations.push('Implement continuous benchmarking process')
    recommendations.push('Share best practices across all operations')
    recommendations.push('Set quarterly improvement targets')

    return recommendations.slice(0, 10)
  }

  private getAffectedAreas(metric: string): string[] {
    // Map metrics to affected areas
    const areaMap: Record<string, string[]> = {
      'Compliance Score': ['Operations', 'Quality', 'Training'],
      'Violation Rate': ['Operations', 'Compliance', 'Management'],
      'Response Time': ['Operations', 'Management', 'Systems'],
      'Training Completion': ['HR', 'Training', 'Operations'],
      'Documentation Score': ['Quality', 'Documentation', 'Compliance'],
      'Audit Success Rate': ['Quality', 'Compliance', 'Operations'],
      'Cost per Compliance': ['Finance', 'Operations', 'Compliance'],
      'Efficiency Index': ['Operations', 'Management', 'Systems']
    }

    return areaMap[metric] || ['Operations']
  }
}

// Export singleton instance
export const benchmarkAnalyzer = new BenchmarkAnalyzer()

export default benchmarkAnalyzer

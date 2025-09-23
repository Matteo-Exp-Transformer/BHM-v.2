/**
 * B.10.4 Advanced Mobile & PWA - Mobile Reporting Panel
 * Touch-optimized report generation and automation reporting interface
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  automatedReportingService,
  type GeneratedReport,
  type ReportTemplate,
  type ReportSchedule,
  type ReportOutput,
} from '../../../services/automation'
import { mobileAutomationService } from '../../../services/mobile/automation/MobileAutomationService'

interface ReportCardProps {
  report: GeneratedReport
  onDownload: (reportId: string) => Promise<void>
  onShare: (reportId: string) => Promise<void>
  onSchedule: (reportId: string) => void
  isLoading?: boolean
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onDownload,
  onShare,
  onSchedule,
  isLoading = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true)
    try {
      await action()
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'border-green-200 bg-green-50'
      case 'generating':
        return 'border-blue-200 bg-blue-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'scheduled':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
        return '✅'
      case 'generating':
        return '🔄'
      case 'failed':
        return '❌'
      case 'scheduled':
        return '⏰'
      default:
        return '❓'
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return '📄'
      case 'excel':
        return '📊'
      case 'csv':
        return '📋'
      default:
        return '📄'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor(report.status)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{getStatusIcon(report.status)}</span>
            <span className="text-lg">{getFormatIcon(report.format)}</span>
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {report.format.toUpperCase()}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {report.title}
          </h3>
          <p className="text-xs text-gray-600 mt-1">{report.description}</p>
        </div>
      </div>

      {/* Report Info */}
      <div className="mb-3">
        <div className="text-sm text-gray-900">
          <span className="font-medium">Generated:</span>{' '}
          {formatTimestamp(report.generatedAt)}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Size:</span>{' '}
          {formatFileSize(report.fileSize)}
        </div>
        {report.recipients && report.recipients.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Recipients:</span>{' '}
            {report.recipients.length}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {report.status === 'generated' && (
          <>
            <button
              onClick={() => handleAction(() => onDownload(report.id))}
              disabled={isProcessing || isLoading}
              className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation disabled:opacity-50"
            >
              {isProcessing ? '⏳' : '⬇️'} Download
            </button>

            <button
              onClick={() => handleAction(() => onShare(report.id))}
              disabled={isProcessing || isLoading}
              className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation disabled:opacity-50"
            >
              {isProcessing ? '⏳' : '📤'} Share
            </button>

            <button
              onClick={() => onSchedule(report.id)}
              disabled={isLoading}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 active:bg-purple-800 transition-colors touch-manipulation disabled:opacity-50"
            >
              ⏰ Schedule
            </button>
          </>
        )}

        {report.status === 'generating' && (
          <div className="flex-1 py-2 px-3 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium text-center">
            🔄 Generating...
          </div>
        )}

        {report.status === 'failed' && (
          <div className="flex-1 py-2 px-3 bg-red-100 text-red-800 rounded-lg text-sm font-medium text-center">
            ❌ Generation Failed
          </div>
        )}

        {report.status === 'scheduled' && (
          <div className="flex-1 py-2 px-3 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium text-center">
            ⏰ Scheduled
          </div>
        )}
      </div>
    </div>
  )
}

const ReportingPanel: React.FC = () => {
  const [reports, setReports] = useState<GeneratedReport[]>([])
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<
    'all' | 'generated' | 'generating' | 'scheduled' | 'failed'
  >('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null)

  // Load reports and templates
  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true)

      // Mock reports - in real implementation, this would come from AutomatedReportingService
      const mockReports: GeneratedReport[] = [
        {
          id: '1',
          title: 'Daily Temperature Report',
          description:
            'Comprehensive temperature monitoring report for all refrigeration units',
          type: 'temperature_log',
          format: 'pdf',
          status: 'generated',
          fileSize: 245760, // 240 KB
          downloadUrl: '/reports/temperature-daily.pdf',
          recipients: ['manager@company.com', 'supervisor@company.com'],
          generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          generatedBy: 'automation-system',
          metadata: {
            period: 'daily',
            units: 12,
            avgTemperature: 4.2,
            violations: 0,
          },
        },
        {
          id: '2',
          title: 'Weekly Compliance Summary',
          description: 'Weekly compliance status and audit results',
          type: 'compliance_summary',
          format: 'excel',
          status: 'generating',
          fileSize: 0,
          downloadUrl: '',
          recipients: ['compliance@company.com'],
          generatedAt: new Date(),
          generatedBy: 'automation-system',
          metadata: {
            period: 'weekly',
            checks: 45,
            passed: 43,
            failed: 2,
          },
        },
        {
          id: '3',
          title: 'Monthly Inventory Report',
          description: 'Complete inventory audit and reconciliation report',
          type: 'inventory_audit',
          format: 'csv',
          status: 'scheduled',
          fileSize: 0,
          downloadUrl: '',
          recipients: ['inventory@company.com'],
          generatedAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          generatedBy: 'automation-system',
          metadata: {
            period: 'monthly',
            items: 1250,
            categories: 25,
          },
        },
        {
          id: '4',
          title: 'Equipment Maintenance Report',
          description: 'Equipment status and maintenance schedule report',
          type: 'maintenance_report',
          format: 'pdf',
          status: 'failed',
          fileSize: 0,
          downloadUrl: '',
          recipients: ['maintenance@company.com'],
          generatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          generatedBy: 'automation-system',
          metadata: {
            error: 'Data source unavailable',
            retryCount: 3,
          },
        },
      ]

      setReports(mockReports)

      // Mock report templates
      const mockTemplates: ReportTemplate[] = [
        {
          id: 't1',
          name: 'Temperature Monitoring',
          description: 'Automated temperature monitoring and compliance report',
          type: 'temperature_log',
          format: 'pdf',
          sections: [],
          parameters: [],
          schedule: null,
          enabled: true,
          createdAt: new Date(),
          createdBy: 'system',
        },
        {
          id: 't2',
          name: 'Compliance Summary',
          description: 'Weekly compliance status and audit results',
          type: 'compliance_summary',
          format: 'excel',
          sections: [],
          parameters: [],
          schedule: null,
          enabled: true,
          createdAt: new Date(),
          createdBy: 'admin',
        },
        {
          id: 't3',
          name: 'Inventory Audit',
          description: 'Complete inventory audit and reconciliation',
          type: 'inventory_audit',
          format: 'csv',
          sections: [],
          parameters: [],
          schedule: null,
          enabled: true,
          createdAt: new Date(),
          createdBy: 'manager',
        },
      ]

      setReportTemplates(mockTemplates)
      setError(null)
    } catch (err) {
      console.error('Failed to load reports:', err)
      setError('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // Download report
  const handleDownloadReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId)
      if (!report || report.status !== 'generated') return

      // In real implementation, this would trigger actual download
      console.log(`Downloading report: ${reportId}`)

      // Simulate download
      const link = document.createElement('a')
      link.href = report.downloadUrl
      link.download = `${report.title}.${report.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to download report:', err)
      setError('Failed to download report')
    }
  }

  // Share report
  const handleShareReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId)
      if (!report || report.status !== 'generated') return

      // In real implementation, this would open share dialog
      console.log(`Sharing report: ${reportId}`)

      if (navigator.share) {
        await navigator.share({
          title: report.title,
          text: report.description,
          url: report.downloadUrl,
        })
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(report.downloadUrl)
        alert('Report URL copied to clipboard')
      }
    } catch (err) {
      console.error('Failed to share report:', err)
      setError('Failed to share report')
    }
  }

  // Schedule report
  const handleScheduleReport = (reportId: string) => {
    console.log(`Opening schedule dialog for report: ${reportId}`)
    // In real implementation, this would open a schedule dialog
  }

  // Generate new report
  const handleGenerateReport = async (templateId: string) => {
    try {
      const template = reportTemplates.find(t => t.id === templateId)
      if (!template) return

      // In real implementation, this would call automatedReportingService.generateReport()
      console.log(`Generating report from template: ${templateId}`)

      // Add new generating report to list
      const newReport: GeneratedReport = {
        id: `new_${Date.now()}`,
        title: template.name,
        description: template.description,
        type: template.type,
        format: template.format,
        status: 'generating',
        fileSize: 0,
        downloadUrl: '',
        recipients: [],
        generatedAt: new Date(),
        generatedBy: 'user',
        metadata: {},
      }

      setReports(prev => [newReport, ...prev])

      // Simulate generation completion after 3 seconds
      setTimeout(() => {
        setReports(prev =>
          prev.map(r =>
            r.id === newReport.id
              ? {
                  ...r,
                  status: 'generated',
                  fileSize: 123456,
                  downloadUrl: '/reports/new-report.pdf',
                }
              : r
          )
        )
      }, 3000)
    } catch (err) {
      console.error('Failed to generate report:', err)
      setError('Failed to generate report')
    }
  }

  // Filter reports
  const filteredReports = reports.filter(report => {
    switch (filter) {
      case 'generated':
        return report.status === 'generated'
      case 'generating':
        return report.status === 'generating'
      case 'scheduled':
        return report.status === 'scheduled'
      case 'failed':
        return report.status === 'failed'
      default:
        return true
    }
  })

  // Get filter counts
  const filterCounts = {
    all: reports.length,
    generated: reports.filter(r => r.status === 'generated').length,
    generating: reports.filter(r => r.status === 'generating').length,
    scheduled: reports.filter(r => r.status === 'scheduled').length,
    failed: reports.filter(r => r.status === 'failed').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reporting panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                📊 Reporting Panel
              </h1>
              <p className="text-sm text-gray-500">
                {reports.length} reports available
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              ➕ Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex space-x-1">
          {(
            ['all', 'generated', 'generating', 'scheduled', 'failed'] as const
          ).map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`
                flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors
                ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                touch-manipulation
              `}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} (
              {filterCounts[filterType]})
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div className="px-4 py-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'No reports have been generated yet.'
                : `No ${filter} reports found.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                Generate First Report
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onDownload={handleDownloadReport}
                onShare={handleShareReport}
                onSchedule={handleScheduleReport}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              // Generate quick report
              if (reportTemplates.length > 0) {
                handleGenerateReport(reportTemplates[0].id)
              }
            }}
            disabled={isLoading || reportTemplates.length === 0}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-medium">Quick Report</div>
            </div>
          </button>

          <button
            onClick={() => {
              // Download all generated reports
              const generatedReports = reports.filter(
                r => r.status === 'generated'
              )
              generatedReports.forEach(report =>
                handleDownloadReport(report.id)
              )
            }}
            disabled={
              isLoading ||
              reports.filter(r => r.status === 'generated').length === 0
            }
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-medium">Download All</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile-specific touch feedback */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={loadReports}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
          aria-label="Refresh reports"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ReportingPanel

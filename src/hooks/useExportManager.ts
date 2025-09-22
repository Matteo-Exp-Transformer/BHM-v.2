/**
 * React Hook for Export Management
 * Provides export functionality integration for React components
 */

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { haccpReportGenerator } from '@/services/export/HACCPReportGenerator'
import {
  excelExporter,
  type ExcelExportConfig,
} from '@/services/export/ExcelExporter'
import {
  emailScheduler,
  type EmailSchedule,
} from '@/services/export/EmailScheduler'
import { useAuth } from './useAuth'
import { toast } from 'react-toastify'

export interface ExportProgress {
  status: 'idle' | 'generating' | 'downloading' | 'complete' | 'error'
  progress: number
  message?: string
}

export interface UseExportManagerReturn {
  // Export actions
  exportHACCPReport: (config: any) => Promise<void>
  exportExcelData: (config: ExcelExportConfig) => Promise<void>
  exportCSV: (
    table: string,
    dateRange: { start: Date; end: Date }
  ) => Promise<void>

  // Email scheduling
  schedules: EmailSchedule[]
  createSchedule: (
    schedule: Omit<EmailSchedule, 'id' | 'createdAt' | 'nextSend'>
  ) => Promise<void>
  updateSchedule: (id: string, updates: Partial<EmailSchedule>) => Promise<void>
  deleteSchedule: (id: string) => Promise<void>

  // Status
  exportProgress: ExportProgress
  isExporting: boolean
  lastExportError?: string

  // Utilities
  downloadBlob: (blob: Blob, fileName: string) => void
  getRecommendedSchedules: () => EmailSchedule[]
}

export function useExportManager(): UseExportManagerReturn {
  const { companyId, userId } = useAuth()
  const queryClient = useQueryClient()

  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
  })

  const [lastExportError, setLastExportError] = useState<string>()

  // Fetch email schedules
  const { data: schedules = [] } = useQuery({
    queryKey: ['email-schedules', companyId],
    queryFn: async () => {
      if (!companyId) return []
      return emailScheduler.getSchedules(companyId)
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Export HACCP PDF Report
  const exportHACCPReport = useCallback(
    async (config: any) => {
      if (!companyId) {
        toast.error('Autenticazione richiesta')
        return
      }

      setExportProgress({
        status: 'generating',
        progress: 10,
        message: 'Generazione rapporto HACCP...',
      })
      setLastExportError(undefined)

      try {
        setExportProgress({
          status: 'generating',
          progress: 50,
          message: 'Raccolta dati...',
        })

        const blob = await haccpReportGenerator.generateReport({
          companyId,
          dateRange: config.dateRange || {
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            end: new Date(),
          },
          reportType: config.reportType || 'monthly',
          includeCharts: config.includeCharts ?? true,
          language: config.language || 'it',
          sections: config.sections || {
            temperatureReadings: true,
            maintenanceTasks: true,
            staffTraining: true,
            correctiveActions: true,
            criticalControlPoints: true,
          },
        })

        setExportProgress({
          status: 'downloading',
          progress: 90,
          message: 'Download in corso...',
        })

        const fileName = `Rapporto_HACCP_${new Date().toISOString().split('T')[0]}.pdf`
        downloadBlob(blob, fileName)

        setExportProgress({ status: 'complete', progress: 100 })
        toast.success('Rapporto HACCP generato con successo')
      } catch (error) {
        console.error('[Export] HACCP report generation failed:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Errore sconosciuto'
        setExportProgress({
          status: 'error',
          progress: 0,
          message: errorMessage,
        })
        setLastExportError(errorMessage)
        toast.error(`Errore nella generazione del rapporto: ${errorMessage}`)
      }
    },
    [companyId]
  )

  // Export Excel Data
  const exportExcelData = useCallback(
    async (config: ExcelExportConfig) => {
      if (!companyId) {
        toast.error('Autenticazione richiesta')
        return
      }

      setExportProgress({
        status: 'generating',
        progress: 10,
        message: 'Preparazione export Excel...',
      })
      setLastExportError(undefined)

      try {
        setExportProgress({
          status: 'generating',
          progress: 30,
          message: 'Raccolta dati dalle tabelle...',
        })

        const exportConfig = {
          ...config,
          companyId,
        }

        setExportProgress({
          status: 'generating',
          progress: 60,
          message: 'Generazione file Excel...',
        })

        const blob = await excelExporter.exportData(exportConfig)

        setExportProgress({
          status: 'downloading',
          progress: 90,
          message: 'Download in corso...',
        })

        const fileName =
          config.fileName ||
          `Export_HACCP_${new Date().toISOString().split('T')[0]}.xlsx`
        downloadBlob(blob, fileName)

        setExportProgress({ status: 'complete', progress: 100 })
        toast.success('Export Excel completato con successo')
      } catch (error) {
        console.error('[Export] Excel export failed:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Errore sconosciuto'
        setExportProgress({
          status: 'error',
          progress: 0,
          message: errorMessage,
        })
        setLastExportError(errorMessage)
        toast.error(`Errore nell'export Excel: ${errorMessage}`)
      }
    },
    [companyId]
  )

  // Export CSV
  const exportCSV = useCallback(
    async (table: string, dateRange: { start: Date; end: Date }) => {
      if (!companyId) {
        toast.error('Autenticazione richiesta')
        return
      }

      setExportProgress({
        status: 'generating',
        progress: 20,
        message: 'Generazione CSV...',
      })
      setLastExportError(undefined)

      try {
        const blob = await excelExporter.exportCSV(
          companyId,
          table as any,
          dateRange
        )

        setExportProgress({
          status: 'downloading',
          progress: 90,
          message: 'Download in corso...',
        })

        const fileName = `${table}_${dateRange.start.toISOString().split('T')[0]}.csv`
        downloadBlob(blob, fileName)

        setExportProgress({ status: 'complete', progress: 100 })
        toast.success('Export CSV completato con successo')
      } catch (error) {
        console.error('[Export] CSV export failed:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Errore sconosciuto'
        setExportProgress({
          status: 'error',
          progress: 0,
          message: errorMessage,
        })
        setLastExportError(errorMessage)
        toast.error(`Errore nell'export CSV: ${errorMessage}`)
      }
    },
    [companyId]
  )

  // Create email schedule
  const createScheduleMutation = useMutation({
    mutationFn: async (
      schedule: Omit<EmailSchedule, 'id' | 'createdAt' | 'nextSend'>
    ) => {
      if (!companyId || !userId) throw new Error('Autenticazione richiesta')

      return emailScheduler.createSchedule({
        ...schedule,
        companyId,
        createdBy: userId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-schedules'] })
      toast.success('Programmazione email creata con successo')
    },
    onError: error => {
      console.error('[Export] Schedule creation failed:', error)
      toast.error('Errore nella creazione della programmazione')
    },
  })

  // Update email schedule
  const updateScheduleMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<EmailSchedule>
    }) => {
      return emailScheduler.updateSchedule(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-schedules'] })
      toast.success('Programmazione aggiornata con successo')
    },
    onError: error => {
      console.error('[Export] Schedule update failed:', error)
      toast.error("Errore nell'aggiornamento della programmazione")
    },
  })

  // Delete email schedule
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      return emailScheduler.deleteSchedule(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-schedules'] })
      toast.success('Programmazione eliminata')
    },
    onError: error => {
      console.error('[Export] Schedule deletion failed:', error)
      toast.error("Errore nell'eliminazione della programmazione")
    },
  })

  // Download blob utility
  const downloadBlob = useCallback((blob: Blob, fileName: string) => {
    try {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log(`[Export] Downloaded: ${fileName}`)
    } catch (error) {
      console.error('[Export] Download failed:', error)
      toast.error('Errore nel download del file')
    }
  }, [])

  // Get recommended schedules based on company activity
  const getRecommendedSchedules = useCallback((): EmailSchedule[] => {
    if (!companyId || !userId) return []

    const recommendations: Partial<EmailSchedule>[] = [
      {
        name: 'Rapporto HACCP Mensile',
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '09:00',
        reportType: 'haccp_pdf',
        recipients: [], // User would fill this
        isActive: false,
      },
      {
        name: 'Controlli Temperatura Settimanali',
        frequency: 'weekly',
        dayOfWeek: 1, // Monday
        time: '08:00',
        reportType: 'excel_temperature',
        recipients: [],
        isActive: false,
      },
      {
        name: 'Export Dati Completo Trimestrale',
        frequency: 'quarterly',
        dayOfMonth: 15,
        time: '10:00',
        reportType: 'excel_full',
        recipients: [],
        isActive: false,
      },
    ]

    return recommendations.map((rec, index) => ({
      id: `rec_${index}`,
      companyId,
      createdBy: userId,
      createdAt: new Date(),
      nextSend: new Date(),
      ...rec,
    })) as EmailSchedule[]
  }, [companyId, userId])

  // Quick export actions
  const quickExports = {
    monthlyHACCP: () =>
      exportHACCPReport({
        reportType: 'monthly',
        dateRange: {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(),
        },
      }),

    temperatureReadings: () =>
      exportExcelData({
        companyId: companyId!,
        dateRange: {
          start: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        tables: ['temperature_readings'],
        includeCharts: false,
        format: 'xlsx',
        fileName: 'Controlli_Temperatura_30gg',
      }),

    allData: () =>
      exportExcelData({
        companyId: companyId!,
        dateRange: {
          start: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        tables: [
          'temperature_readings',
          'tasks',
          'products',
          'staff',
          'departments',
        ],
        includeCharts: true,
        format: 'xlsx',
        fileName: 'Export_Completo_90gg',
      }),
  }

  return {
    // Export actions
    exportHACCPReport,
    exportExcelData,
    exportCSV,

    // Email scheduling
    schedules,
    createSchedule: createScheduleMutation.mutate,
    updateSchedule: (id: string, updates: Partial<EmailSchedule>) =>
      updateScheduleMutation.mutate({ id, updates }),
    deleteSchedule: deleteScheduleMutation.mutate,

    // Status
    exportProgress,
    isExporting:
      exportProgress.status === 'generating' ||
      exportProgress.status === 'downloading',
    lastExportError,

    // Utilities
    downloadBlob,
    getRecommendedSchedules,

    // Quick actions
    ...quickExports,
  }
}

// Simplified hook for basic export functionality
export function useQuickExport() {
  const {
    exportHACCPReport,
    exportExcelData,
    exportCSV,
    downloadBlob,
    isExporting,
  } = useExportManager()

  return {
    exportHACCPReport,
    exportExcelData,
    exportCSV,
    downloadBlob,
    isExporting,
  }
}

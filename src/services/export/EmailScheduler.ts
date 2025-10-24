/**
 * Email Scheduler for Automated HACCP Reports
 * Schedules and sends automatic reports via email
 */

import { supabase } from '@/lib/supabase/client'
import { haccpReportGenerator } from './HACCPReportGenerator'
import { excelExporter } from './ExcelExporter'

export interface EmailSchedule {
  id: string
  companyId: string
  name: string
  recipients: string[]
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number // 1-31 for monthly
  time: string // HH:MM format
  reportType: 'haccp_pdf' | 'excel_full' | 'excel_temperature' | 'custom'
  customConfig?: any
  isActive: boolean
  lastSent?: Date
  nextSend: Date
  createdAt: Date
  createdBy: string
}

export interface EmailTemplate {
  subject: string
  body: string
  attachmentName: string
}

export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
  sentAt: Date
  recipients: string[]
}

class EmailSchedulerService {
  private templates: Record<string, EmailTemplate> = {
    haccp_pdf: {
      subject: 'Rapporto HACCP - {date}',
      body: `
Gentile Cliente,

In allegato trova il rapporto HACCP per il periodo {period}.

Il rapporto include:
- Controlli temperatura
- Attività di manutenzione
- Punti critici di controllo
- Azioni correttive

Questo rapporto è stato generato automaticamente dal sistema HACCP Business Manager.

Per qualsiasi chiarimento, non esiti a contattarci.

Cordiali saluti,
Sistema HACCP Business Manager
      `,
      attachmentName: 'Rapporto_HACCP_{date}.pdf',
    },
    excel_full: {
      subject: 'Export Dati HACCP Completo - {date}',
      body: `
Gentile Cliente,

In allegato trova l'export completo dei dati HACCP per il periodo {period}.

Il file Excel include:
- Controlli temperatura
- Attività e task
- Inventario prodotti
- Gestione personale
- Riepilogo statistiche

Questo export è stato generato automaticamente dal sistema.

Cordiali saluti,
Sistema HACCP Business Manager
      `,
      attachmentName: 'Export_HACCP_Completo_{date}.xlsx',
    },
    excel_temperature: {
      subject: 'Controlli Temperatura - {date}',
      body: `
Gentile Cliente,

In allegato trova il dettaglio dei controlli temperatura per il periodo {period}.

Il file include tutti i rilevamenti con:
- Data e ora di rilevamento
- Postazioni monitorate
- Valori temperatura
- Stato di conformità
- Operatori responsabili

Questo report è stato generato automaticamente.

Cordiali saluti,
Sistema HACCP Business Manager
      `,
      attachmentName: 'Controlli_Temperatura_{date}.xlsx',
    },
  }

  async createSchedule(
    schedule: Omit<EmailSchedule, 'id' | 'createdAt' | 'nextSend'>
  ): Promise<string> {
    const nextSend = this.calculateNextSendDate(
      schedule.frequency,
      schedule.time,
      schedule.dayOfWeek,
      schedule.dayOfMonth
    )

    const { data, error } = await supabase
      .from('email_schedules')
      .insert({
        ...schedule,
        next_send: nextSend.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[EmailScheduler] Failed to create schedule:', error)
      throw new Error('Failed to create email schedule')
    }

    console.log(`[EmailScheduler] Created schedule: ${data.id}`)
    return data.id
  }

  async updateSchedule(
    scheduleId: string,
    updates: Partial<EmailSchedule>
  ): Promise<void> {
    // Recalculate next send if frequency or timing changed
    if (
      updates.frequency ||
      updates.time ||
      updates.dayOfWeek ||
      updates.dayOfMonth
    ) {
      const { data: current } = await supabase
        .from('email_schedules')
        .select('frequency, time, day_of_week, day_of_month')
        .eq('id', scheduleId)
        .single()

      if (current) {
        const frequency = updates.frequency || current.frequency
        const time = updates.time || current.time
        const dayOfWeek = updates.dayOfWeek || current.day_of_week
        const dayOfMonth = updates.dayOfMonth || current.day_of_month

        updates.nextSend = this.calculateNextSendDate(
          frequency,
          time,
          dayOfWeek,
          dayOfMonth
        )
      }
    }

    const { error } = await supabase
      .from('email_schedules')
      .update({
        ...updates,
        next_send: updates.nextSend?.toISOString(),
      })
      .eq('id', scheduleId)

    if (error) {
      console.error('[EmailScheduler] Failed to update schedule:', error)
      throw new Error('Failed to update email schedule')
    }

    console.log(`[EmailScheduler] Updated schedule: ${scheduleId}`)
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    const { error } = await supabase
      .from('email_schedules')
      .delete()
      .eq('id', scheduleId)

    if (error) {
      console.error('[EmailScheduler] Failed to delete schedule:', error)
      throw new Error('Failed to delete email schedule')
    }

    console.log(`[EmailScheduler] Deleted schedule: ${scheduleId}`)
  }

  async getSchedules(companyId: string): Promise<EmailSchedule[]> {
    const { data, error } = await supabase
      .from('email_schedules')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[EmailScheduler] Failed to fetch schedules:', error)
      return []
    }

    return data.map(this.mapDatabaseToSchedule)
  }

  async getDueSchedules(): Promise<EmailSchedule[]> {
    const now = new Date()

    const { data, error } = await supabase
      .from('email_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('next_send', now.toISOString())

    if (error) {
      console.error('[EmailScheduler] Failed to fetch due schedules:', error)
      return []
    }

    return data.map(this.mapDatabaseToSchedule)
  }

  async sendScheduledReport(schedule: EmailSchedule): Promise<SendResult> {
    console.log(`[EmailScheduler] Sending scheduled report: ${schedule.id}`)

    try {
      // Generate report based on type
      const { blob, fileName } = await this.generateReport(schedule)

      // Prepare email content
      const template =
        this.templates[schedule.reportType] || this.templates.haccp_pdf
      const emailContent = this.prepareEmailContent(template, schedule)

      // Send email (this would integrate with your email service)
      const result = await this.sendEmail({
        to: schedule.recipients,
        subject: emailContent.subject,
        body: emailContent.body,
        attachments: [
          {
            filename: fileName,
            content: blob,
          },
        ],
      })

      // Update schedule for next send
      await this.updateScheduleAfterSend(schedule.id)

      console.log(`[EmailScheduler] Successfully sent report: ${schedule.id}`)
      return result
    } catch (error) {
      console.error(
        `[EmailScheduler] Failed to send report ${schedule.id}:`,
        error
      )

      // Log the error for review
      await this.logSendError(
        schedule.id,
        error instanceof Error ? error.message : 'Unknown error'
      )

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date(),
        recipients: schedule.recipients,
      }
    }
  }

  private async generateReport(
    schedule: EmailSchedule
  ): Promise<{ blob: Blob; fileName: string }> {
    const dateRange = this.getReportDateRange(schedule.frequency)
    const dateStr = new Date().toISOString().split('T')[0]

    switch (schedule.reportType) {
      case 'haccp_pdf': {
        const pdfBlob = await haccpReportGenerator.generateMonthlyReport(
          schedule.companyId,
          new Date().getMonth() + 1,
          new Date().getFullYear()
        )
        return {
          blob: pdfBlob,
          fileName: `Rapporto_HACCP_${dateStr}.pdf`,
        }
      }

      case 'excel_full': {
        const excelBlob = await excelExporter.exportAllData(
          schedule.companyId,
          dateRange
        )
        return {
          blob: excelBlob,
          fileName: `Export_HACCP_Completo_${dateStr}.xlsx`,
        }
      }

      case 'excel_temperature': {
        const tempBlob = await excelExporter.exportTemperatureReadings(
          schedule.companyId,
          dateRange
        )
        return {
          blob: tempBlob,
          fileName: `Controlli_Temperatura_${dateStr}.xlsx`,
        }
      }

      case 'custom': {
        // Handle custom report configuration
        if (schedule.customConfig) {
          const customBlob = await excelExporter.exportData(
            schedule.customConfig
          )
          return {
            blob: customBlob,
            fileName: `Report_Personalizzato_${dateStr}.xlsx`,
          }
        }
        // Fall back to PDF
        const fallbackBlob = await haccpReportGenerator.generateMonthlyReport(
          schedule.companyId,
          new Date().getMonth() + 1,
          new Date().getFullYear()
        )
        return {
          blob: fallbackBlob,
          fileName: `Rapporto_HACCP_${dateStr}.pdf`,
        }
      }

      default:
        throw new Error(`Unknown report type: ${schedule.reportType}`)
    }
  }

  private getReportDateRange(frequency: EmailSchedule['frequency']): {
    start: Date
    end: Date
  } {
    const now = new Date()
    const end = new Date(now)

    let start: Date

    switch (frequency) {
      case 'daily': {
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      }
      case 'weekly': {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      }
      case 'monthly': {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end.setDate(0) // Last day of previous month
        break
      }
      case 'quarterly': {
        const currentQuarter = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1)
        end.setMonth(currentQuarter * 3, 0) // Last day of previous quarter
        break
      }
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Default 30 days
    }

    return { start, end }
  }

  private prepareEmailContent(
    template: EmailTemplate,
    schedule: EmailSchedule
  ): { subject: string; body: string } {
    const dateRange = this.getReportDateRange(schedule.frequency)
    const currentDate = new Date().toLocaleDateString('it-IT')
    const period = `${dateRange.start.toLocaleDateString('it-IT')} - ${dateRange.end.toLocaleDateString('it-IT')}`

    return {
      subject: template.subject
        .replace('{date}', currentDate)
        .replace('{period}', period),
      body: template.body
        .replace('{date}', currentDate)
        .replace('{period}', period),
    }
  }

  private async sendEmail(emailData: {
    to: string[]
    subject: string
    body: string
    attachments: Array<{ filename: string; content: Blob }>
  }): Promise<SendResult> {
    // This is a placeholder for actual email service integration
    // You would integrate with services like SendGrid, AWS SES, etc.

    console.log('[EmailScheduler] Sending email:', {
      to: emailData.to,
      subject: emailData.subject,
      attachmentCount: emailData.attachments.length,
    })

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real implementation, you would:
    // 1. Convert blob to base64 or buffer
    // 2. Call your email service API
    // 3. Handle the response

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date(),
      recipients: emailData.to,
    }
  }

  private async updateScheduleAfterSend(scheduleId: string): Promise<void> {
    const { data: schedule } = await supabase
      .from('email_schedules')
      .select('frequency, time, day_of_week, day_of_month')
      .eq('id', scheduleId)
      .single()

    if (!schedule) return

    const nextSend = this.calculateNextSendDate(
      schedule.frequency,
      schedule.time,
      schedule.day_of_week,
      schedule.day_of_month
    )

    await supabase
      .from('email_schedules')
      .update({
        last_sent: new Date().toISOString(),
        next_send: nextSend.toISOString(),
      })
      .eq('id', scheduleId)
  }

  private async logSendError(scheduleId: string, error: string): Promise<void> {
    await supabase.from('email_schedule_logs').insert({
      schedule_id: scheduleId,
      status: 'error',
      error_message: error,
      attempted_at: new Date().toISOString(),
    })
  }

  private calculateNextSendDate(
    frequency: EmailSchedule['frequency'],
    time: string,
    dayOfWeek?: number,
    dayOfMonth?: number
  ): Date {
    const now = new Date()
    const [hours, minutes] = time.split(':').map(Number)

    let nextSend = new Date()
    nextSend.setHours(hours, minutes, 0, 0)

    // If time has passed today, start from tomorrow
    if (nextSend <= now) {
      nextSend.setDate(nextSend.getDate() + 1)
    }

    switch (frequency) {
      case 'daily':
        // Already set correctly above
        break

      case 'weekly':
        if (dayOfWeek !== undefined) {
          const currentDay = nextSend.getDay()
          const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7
          if (daysUntilTarget === 0 && nextSend <= now) {
            nextSend.setDate(nextSend.getDate() + 7)
          } else {
            nextSend.setDate(nextSend.getDate() + daysUntilTarget)
          }
        }
        break

      case 'monthly': {
        if (dayOfMonth !== undefined) {
          nextSend.setDate(dayOfMonth)
          if (nextSend <= now) {
            nextSend.setMonth(nextSend.getMonth() + 1)
            nextSend.setDate(dayOfMonth)
          }
        }
        break
      }

      case 'quarterly': {
        const currentQuarter = Math.floor(now.getMonth() / 3)
        const nextQuarterMonth = (currentQuarter + 1) * 3
        nextSend.setMonth(nextQuarterMonth, dayOfMonth || 1)
        break
      }
    }

    return nextSend
  }

  private mapDatabaseToSchedule(dbRecord: any): EmailSchedule {
    return {
      id: dbRecord.id,
      companyId: dbRecord.company_id,
      name: dbRecord.name,
      recipients: dbRecord.recipients,
      frequency: dbRecord.frequency,
      dayOfWeek: dbRecord.day_of_week,
      dayOfMonth: dbRecord.day_of_month,
      time: dbRecord.time,
      reportType: dbRecord.report_type,
      customConfig: dbRecord.custom_config,
      isActive: dbRecord.is_active,
      lastSent: dbRecord.last_sent ? new Date(dbRecord.last_sent) : undefined,
      nextSend: new Date(dbRecord.next_send),
      createdAt: new Date(dbRecord.created_at),
      createdBy: dbRecord.created_by,
    }
  }

  // Background job to process due schedules
  async processDueSchedules(): Promise<void> {
    console.log('[EmailScheduler] Processing due schedules...')

    const dueSchedules = await this.getDueSchedules()
    console.log(`[EmailScheduler] Found ${dueSchedules.length} due schedules`)

    const results = await Promise.allSettled(
      dueSchedules.map(schedule => this.sendScheduledReport(schedule))
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(
      `[EmailScheduler] Processed schedules: ${successful} successful, ${failed} failed`
    )
  }
}

export const emailScheduler = new EmailSchedulerService()

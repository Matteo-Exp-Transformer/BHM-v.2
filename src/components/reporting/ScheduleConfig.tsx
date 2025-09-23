/**
 * ScheduleConfig - B.10.2 Advanced Analytics & Reporting
 * Schedule setup interface for automated report delivery
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Clock,
  Mail,
  Settings,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Save,
  TestTube,
} from 'lucide-react'

import {
  scheduleManager,
  ScheduleConfig,
  ScheduleFrequency,
  RecipientConfig,
  DeliveryOptions,
} from '@/services/reporting'

interface ScheduleConfigProps {
  reportId: string
  scheduleId?: string
  onSave?: (schedule: ScheduleConfig) => void
  onTest?: (schedule: ScheduleConfig) => void
}

export const ScheduleConfigComponent: React.FC<ScheduleConfigProps> = ({
  reportId,
  scheduleId,
  onSave,
  onTest,
}) => {
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [validation, setValidation] = useState<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }>({ isValid: true, errors: [], warnings: [] })

  useEffect(() => {
    loadSchedule()
  }, [scheduleId])

  const loadSchedule = () => {
    if (scheduleId) {
      const existingSchedule = scheduleManager.getSchedule(scheduleId)
      if (existingSchedule) {
        setSchedule(existingSchedule)
      }
    } else {
      // Create new schedule
      const newSchedule: ScheduleConfig = {
        id: '',
        reportId,
        name: '',
        description: '',
        frequency: {
          type: 'daily',
          time: '09:00',
        },
        timezone: 'UTC',
        enabled: true,
        recipients: [],
        deliveryOptions: {
          format: 'pdf',
          compression: false,
          includeCharts: true,
          includeData: true,
          pageSize: 'A4',
          orientation: 'portrait',
        },
        conditions: [],
        nextRun: new Date(),
        runCount: 0,
        errorCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current_user',
      }
      setSchedule(newSchedule)
    }
  }

  const handleSave = async () => {
    if (!schedule) return

    setIsLoading(true)
    try {
      // Validate schedule
      const validationResult = scheduleManager.validateSchedule(schedule)
      setValidation(validationResult)

      if (!validationResult.isValid) {
        setIsLoading(false)
        return
      }

      if (scheduleId) {
        // Update existing schedule
        scheduleManager.updateSchedule(scheduleId, schedule)
      } else {
        // Create new schedule
        scheduleManager.createSchedule(
          schedule.reportId,
          schedule.name,
          schedule.description,
          schedule.frequency,
          schedule.recipients,
          schedule.deliveryOptions,
          schedule.createdBy,
          schedule.timezone
        )
      }

      onSave?.(schedule)
      setIsDirty(false)
      console.log('⏰ Schedule saved successfully')
    } catch (error) {
      console.error('Failed to save schedule:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = () => {
    if (!schedule) return
    onTest?.(schedule)
  }

  const handleAddRecipient = () => {
    if (!schedule) return

    const newRecipient: RecipientConfig = {
      id: '',
      type: 'email',
      address: '',
      name: '',
      enabled: true,
    }

    setSchedule({
      ...schedule,
      recipients: [...schedule.recipients, newRecipient],
    })
    setIsDirty(true)
  }

  const handleUpdateRecipient = (
    index: number,
    updates: Partial<RecipientConfig>
  ) => {
    if (!schedule) return

    const updatedRecipients = [...schedule.recipients]
    updatedRecipients[index] = { ...updatedRecipients[index], ...updates }

    setSchedule({
      ...schedule,
      recipients: updatedRecipients,
    })
    setIsDirty(true)
  }

  const handleRemoveRecipient = (index: number) => {
    if (!schedule) return

    const updatedRecipients = schedule.recipients.filter((_, i) => i !== index)
    setSchedule({
      ...schedule,
      recipients: updatedRecipients,
    })
    setIsDirty(true)
  }

  const handleToggleSchedule = () => {
    if (!schedule) return

    setSchedule({
      ...schedule,
      enabled: !schedule.enabled,
    })
    setIsDirty(true)
  }

  const updateSchedule = (updates: Partial<ScheduleConfig>) => {
    if (!schedule) return

    setSchedule({
      ...schedule,
      ...updates,
    })
    setIsDirty(true)
  }

  const getFrequencyLabel = (frequency: ScheduleFrequency) => {
    switch (frequency.type) {
      case 'once':
        return 'Once'
      case 'daily':
        return `Daily at ${frequency.time}`
      case 'weekly':
        const days = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ]
        return `Weekly on ${days[frequency.dayOfWeek || 0]} at ${frequency.time}`
      case 'monthly':
        return `Monthly on day ${frequency.dayOfMonth} at ${frequency.time}`
      case 'yearly':
        const months = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]
        return `Yearly on ${months[frequency.month || 0]} ${frequency.dayOfMonth} at ${frequency.time}`
      case 'custom':
        return `Every ${frequency.interval} minutes`
      default:
        return 'Unknown'
    }
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="h-8 w-8 animate-pulse" />
        <span className="ml-2">Loading schedule configuration...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule Configuration</h1>
          <p className="text-muted-foreground">
            Configure automated report delivery
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleTest}>
            <TestTube className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button variant="default" onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-1" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {!validation.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p>Please fix the following errors:</p>
              <ul className="list-disc list-inside">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p>Warnings:</p>
              <ul className="list-disc list-inside">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Configuration */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduleName">Schedule Name</Label>
                  <Input
                    id="scheduleName"
                    value={schedule.name}
                    onChange={e => updateSchedule({ name: e.target.value })}
                    placeholder="Enter schedule name"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={schedule.timezone}
                    onValueChange={value => updateSchedule({ timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">
                        Eastern Time
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time
                      </SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={schedule.description}
                  onChange={e =>
                    updateSchedule({ description: e.target.value })
                  }
                  placeholder="Enter schedule description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={schedule.enabled}
                  onCheckedChange={handleToggleSchedule}
                />
                <Label htmlFor="enabled">Enable this schedule</Label>
              </div>

              {schedule.nextRun && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Next Run:</span>
                    <span className="text-sm">
                      {schedule.nextRun.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={schedule.frequency.type}
                    onValueChange={(value: any) =>
                      updateSchedule({
                        frequency: { ...schedule.frequency, type: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={schedule.frequency.time}
                    onChange={e =>
                      updateSchedule({
                        frequency: {
                          ...schedule.frequency,
                          time: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {schedule.frequency.type === 'weekly' && (
                <div>
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select
                    value={String(schedule.frequency.dayOfWeek || 0)}
                    onValueChange={value =>
                      updateSchedule({
                        frequency: {
                          ...schedule.frequency,
                          dayOfWeek: parseInt(value),
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {schedule.frequency.type === 'monthly' && (
                <div>
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={schedule.frequency.dayOfMonth || 1}
                    onChange={e =>
                      updateSchedule({
                        frequency: {
                          ...schedule.frequency,
                          dayOfMonth: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              )}

              {schedule.frequency.type === 'yearly' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={String(schedule.frequency.month || 0)}
                      onValueChange={value =>
                        updateSchedule({
                          frequency: {
                            ...schedule.frequency,
                            month: parseInt(value),
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'January',
                          'February',
                          'March',
                          'April',
                          'May',
                          'June',
                          'July',
                          'August',
                          'September',
                          'October',
                          'November',
                          'December',
                        ].map((month, index) => (
                          <SelectItem key={index} value={String(index)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="yearlyDayOfMonth">Day of Month</Label>
                    <Input
                      id="yearlyDayOfMonth"
                      type="number"
                      min="1"
                      max="31"
                      value={schedule.frequency.dayOfMonth || 1}
                      onChange={e =>
                        updateSchedule({
                          frequency: {
                            ...schedule.frequency,
                            dayOfMonth: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {schedule.frequency.type === 'custom' && (
                <div>
                  <Label htmlFor="interval">Interval (minutes)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={schedule.frequency.interval || 60}
                    onChange={e =>
                      updateSchedule({
                        frequency: {
                          ...schedule.frequency,
                          interval: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Schedule: {getFrequencyLabel(schedule.frequency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recipients Tab */}
        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recipients</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddRecipient}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Recipient
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.recipients.map((recipient, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={recipient.type}
                          onValueChange={(value: any) =>
                            handleUpdateRecipient(index, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="webhook">Webhook</SelectItem>
                            <SelectItem value="dashboard">Dashboard</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Address/URL</Label>
                        <Input
                          value={recipient.address}
                          onChange={e =>
                            handleUpdateRecipient(index, {
                              address: e.target.value,
                            })
                          }
                          placeholder={
                            recipient.type === 'email'
                              ? 'email@example.com'
                              : 'https://...'
                          }
                        />
                      </div>
                      <div>
                        <Label>Name (Optional)</Label>
                        <Input
                          value={recipient.name || ''}
                          onChange={e =>
                            handleUpdateRecipient(index, {
                              name: e.target.value,
                            })
                          }
                          placeholder="Recipient name"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={recipient.enabled}
                          onCheckedChange={checked =>
                            handleUpdateRecipient(index, { enabled: checked })
                          }
                        />
                        <Label>Enabled</Label>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {schedule.recipients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recipients configured</p>
                    <p className="text-sm">
                      Add recipients to receive scheduled reports
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={schedule.deliveryOptions.format}
                    onValueChange={(value: any) =>
                      updateSchedule({
                        deliveryOptions: {
                          ...schedule.deliveryOptions,
                          format: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pageSize">Page Size</Label>
                  <Select
                    value={schedule.deliveryOptions.pageSize}
                    onValueChange={(value: any) =>
                      updateSchedule({
                        deliveryOptions: {
                          ...schedule.deliveryOptions,
                          pageSize: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="orientation">Orientation</Label>
                <Select
                  value={schedule.deliveryOptions.orientation}
                  onValueChange={(value: any) =>
                    updateSchedule({
                      deliveryOptions: {
                        ...schedule.deliveryOptions,
                        orientation: value,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compression"
                    checked={schedule.deliveryOptions.compression}
                    onCheckedChange={checked =>
                      updateSchedule({
                        deliveryOptions: {
                          ...schedule.deliveryOptions,
                          compression: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="compression">Enable compression</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeCharts"
                    checked={schedule.deliveryOptions.includeCharts}
                    onCheckedChange={checked =>
                      updateSchedule({
                        deliveryOptions: {
                          ...schedule.deliveryOptions,
                          includeCharts: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="includeCharts">Include charts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeData"
                    checked={schedule.deliveryOptions.includeData}
                    onCheckedChange={checked =>
                      updateSchedule({
                        deliveryOptions: {
                          ...schedule.deliveryOptions,
                          includeData: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="includeData">Include raw data</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ScheduleConfigComponent

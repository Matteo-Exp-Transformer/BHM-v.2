export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end?: Date
  allDay?: boolean
  source: 'maintenance' | 'task' | 'training' | 'inventory' | 'meeting'
  sourceId: string
  extendedProps: {
    description?: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
    assignedTo?: string[]
    location?: string
    category?: string
    color?: string
    isRecurring?: boolean
    recurrenceRule?: string
    notifications?: CalendarNotification[]
    metadata?: Record<string, any>
  }
}

export interface CalendarNotification {
  id: string
  type: 'email' | 'push' | 'sms' | 'in_app'
  timing: 'at_time' | 'minutes_before' | 'hours_before' | 'days_before'
  value?: number
  enabled: boolean
}

export interface MaintenanceEvent
  extends Omit<CalendarEvent, 'source' | 'extendedProps'> {
  source: 'maintenance'
  extendedProps: CalendarEvent['extendedProps'] & {
    maintenanceType: 'temperature' | 'sanitization' | 'defrosting' | 'repair'
    conservationPointId?: string
    conservationPointName?: string
    checklist?: string[]
    estimatedDuration: number
    requiredTools?: string[]
    safetyRequirements?: string[]
    lastCompletedDate?: Date
    frequency:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'yearly'
      | 'custom'
  }
}

export interface TaskEvent
  extends Omit<CalendarEvent, 'source' | 'extendedProps'> {
  source: 'task'
  extendedProps: CalendarEvent['extendedProps'] & {
    taskType:
      | 'haccp_check'
      | 'inventory_count'
      | 'quality_control'
      | 'admin'
      | 'other'
    departmentId?: string
    departmentName?: string
    estimatedDuration: number
    dependencies?: string[]
    completionCriteria?: string[]
  }
}

export interface TrainingEvent
  extends Omit<CalendarEvent, 'source' | 'extendedProps'> {
  source: 'training'
  extendedProps: CalendarEvent['extendedProps'] & {
    trainingType: 'haccp' | 'safety' | 'hygiene' | 'equipment' | 'procedures'
    instructor?: string
    maxParticipants?: number
    currentParticipants?: number
    materialIds?: string[]
    certificationRequired: boolean
    certificationLevel?: 'base' | 'advanced'
  }
}

export interface InventoryEvent
  extends Omit<CalendarEvent, 'source' | 'extendedProps'> {
  source: 'inventory'
  extendedProps: CalendarEvent['extendedProps'] & {
    inventoryType:
      | 'expiry_check'
      | 'stock_count'
      | 'delivery'
      | 'order'
      | 'waste_disposal'
    productIds?: string[]
    supplierId?: string
    expectedQuantity?: number
    actualQuantity?: number
    variance?: number
    conservationPointId?: string
  }
}

export interface MeetingEvent
  extends Omit<CalendarEvent, 'source' | 'extendedProps'> {
  source: 'meeting'
  extendedProps: CalendarEvent['extendedProps'] & {
    meetingType: 'team' | 'training' | 'audit' | 'review' | 'emergency'
    attendees: string[]
    optionalAttendees?: string[]
    agenda?: string[]
    meetingLink?: string
    roomId?: string
    roomName?: string
    isVirtual: boolean
  }
}

export type TypedCalendarEvent =
  | MaintenanceEvent
  | TaskEvent
  | TrainingEvent
  | InventoryEvent
  | MeetingEvent

export interface CalendarView {
  type: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'
  title: string
  buttonText: string
}

export interface CalendarFilter {
  sources: CalendarEvent['source'][]
  priorities: CalendarEvent['extendedProps']['priority'][]
  statuses: CalendarEvent['extendedProps']['status'][]
  assignedTo?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface CalendarSettings {
  defaultView: CalendarView['type']
  weekStartsOn: 0 | 1
  timeFormat: '12h' | '24h'
  firstDayOfWeek: number
  businessHours: {
    daysOfWeek: number[]
    startTime: string
    endTime: string
  }
  notifications: {
    enabled: boolean
    defaultTimings: CalendarNotification['timing'][]
  }
  colorScheme: Record<CalendarEvent['source'], string>
}

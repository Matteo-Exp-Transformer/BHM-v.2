// Shared types for entities that don't have a specific domain

// Events
export interface Event {
  id: string
  company_id: string
  title: string
  description?: string
  start_date: Date
  end_date?: Date
  created_at: Date
  updated_at: Date
}

export interface CreateEventRequest {
  title: string
  description?: string
  start_date: Date
  end_date?: Date
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string
}

export interface EventFilters {
  start_date_from?: Date
  start_date_to?: Date
  search?: string
}

// Notes
export interface Note {
  id: string
  company_id: string
  title: string
  content: string
  created_at: Date
  updated_at: Date
}

export interface CreateNoteRequest {
  title: string
  content: string
}

export interface UpdateNoteRequest extends Partial<CreateNoteRequest> {
  id: string
}

export interface NoteFilters {
  search?: string
  date_from?: Date
  date_to?: Date
}

// Non-Conformities
// Note: severity and status are PostgreSQL ENUMs
// You may need to check the actual ENUM values in your database
export type NonConformitySeverity = 'low' | 'medium' | 'high' | 'critical'
export type NonConformityStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface NonConformity {
  id: string
  company_id: string
  title: string
  description: string
  severity: NonConformitySeverity
  status: NonConformityStatus
  created_at: Date
  updated_at: Date
}

export interface CreateNonConformityRequest {
  title: string
  description: string
  severity: NonConformitySeverity
  status?: NonConformityStatus
}

export interface UpdateNonConformityRequest extends Partial<CreateNonConformityRequest> {
  id: string
}

export interface NonConformityFilters {
  severity?: NonConformitySeverity[]
  status?: NonConformityStatus[]
  search?: string
  date_from?: Date
  date_to?: Date
}

// Stats interfaces for the new entities
export interface EventStats {
  total: number
  upcoming: number
  thisMonth: number
}

export interface NoteStats {
  total: number
  thisWeek: number
  thisMonth: number
}

export interface NonConformityStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  bySeverity: {
    low: number
    medium: number
    high: number
    critical: number
  }
  critical: number
}
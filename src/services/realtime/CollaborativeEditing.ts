/**
 * Collaborative Editing System for HACCP Tasks
 * Real-time collaborative editing with operational transformation and conflict resolution
 */

import {
  realtimeManager,
  type PresenceState,
} from './RealtimeConnectionManager'

export interface EditOperation {
  id: string
  type: 'insert' | 'delete' | 'update'
  position: number
  content: string
  field: string
  userId: string
  timestamp: Date
  applied: boolean
}

export interface DocumentState {
  id: string
  type: 'maintenance_task' | 'product' | 'shopping_list' | 'calendar_event'
  version: number
  content: Record<string, any>
  last_modified: Date
  last_modified_by: string
  locked_by?: string
  locked_at?: Date
}

export interface CollaborativeSession {
  id: string
  document_id: string
  document_type: string
  participants: Map<string, CollaboratorInfo>
  operations: EditOperation[]
  current_version: number
  created_at: Date
  last_activity: Date
}

export interface CollaboratorInfo {
  userId: string
  userEmail: string
  userName: string
  presence: PresenceState
  cursor_position?: number
  current_field?: string
  last_activity: Date
  permissions: CollaboratorPermissions
}

export interface CollaboratorPermissions {
  can_edit: boolean
  can_delete: boolean
  can_assign: boolean
  can_approve: boolean
  fields_readonly: string[]
}

export interface EditConflict {
  id: string
  operation1: EditOperation
  operation2: EditOperation
  resolution_strategy: 'last_write_wins' | 'merge' | 'manual'
  resolved: boolean
  resolved_by?: string
  resolved_at?: Date
}

export interface CursorPosition {
  userId: string
  field: string
  position: number
  selection?: { start: number; end: number }
  timestamp: Date
}

class CollaborativeEditing {
  private sessions: Map<string, CollaborativeSession> = new Map()
  private subscriptions: Map<string, string> = new Map() // documentId -> subscriptionId
  private operationCallbacks: ((operation: EditOperation) => void)[] = []
  private cursorCallbacks: ((cursors: CursorPosition[]) => void)[] = []
  private conflictCallbacks: ((conflict: EditConflict) => void)[] = []
  private presenceCallbacks: ((collaborators: CollaboratorInfo[]) => void)[] =
    []

  // Operational Transformation parameters
  private readonly _maxOperationHistory = 1000
  private readonly conflictTimeWindow = 5000 // 5 seconds
  private readonly autoSaveInterval = 30000 // 30 seconds

  /**
   * Start collaborative session for a document
   */
  public async startSession(
    documentId: string,
    documentType: DocumentState['type'],
    userId: string,
    userEmail: string,
    permissions: CollaboratorPermissions
  ): Promise<string> {
    const sessionId = this.generateSessionId()

    // Create or join existing session
    let session = this.findSessionByDocument(documentId)
    if (!session) {
      session = {
        id: sessionId,
        document_id: documentId,
        document_type: documentType,
        participants: new Map(),
        operations: [],
        current_version: 0,
        created_at: new Date(),
        last_activity: new Date(),
      }
      this.sessions.set(sessionId, session)
    }

    // Add collaborator to session
    const collaborator: CollaboratorInfo = {
      userId,
      userEmail,
      userName: userEmail.split('@')[0], // Simple name extraction
      presence: {
        userId,
        userEmail,
        presence_ref: '',
        online_at: new Date().toISOString(),
        activity_status: 'active',
      },
      last_activity: new Date(),
      permissions,
    }

    session.participants.set(userId, collaborator)

    // Subscribe to real-time updates for this document
    await this.subscribeToDocument(documentId, documentType)

    // Setup auto-save
    this.setupAutoSave(sessionId)

    // Notify presence change
    this.notifyPresenceChange(session)

    console.log(`👥 Collaborative session started: ${sessionId}`)
    return sessionId
  }

  /**
   * End collaborative session
   */
  public endSession(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // Remove collaborator
    session.participants.delete(userId)

    // If no participants left, cleanup session
    if (session.participants.size === 0) {
      this.cleanupSession(sessionId)
    } else {
      this.notifyPresenceChange(session)
    }

    console.log(`👋 User left collaborative session: ${userId}`)
  }

  /**
   * Apply an edit operation
   */
  public async applyOperation(
    sessionId: string,
    operation: Omit<EditOperation, 'id' | 'timestamp' | 'applied'>
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    const fullOperation: EditOperation = {
      id: this.generateOperationId(),
      timestamp: new Date(),
      applied: false,
      ...operation,
    }

    // Check for conflicts
    const conflicts = this.detectConflicts(session, fullOperation)
    if (conflicts.length > 0) {
      await this.resolveConflicts(session, fullOperation, conflicts)
    }

    // Transform operation based on previous operations
    const transformedOperation = this.transformOperation(session, fullOperation)

    // Apply operation
    session.operations.push(transformedOperation)
    session.current_version++
    session.last_activity = new Date()

    // Mark as applied
    transformedOperation.applied = true

    // Broadcast operation to other collaborators
    await this.broadcastOperation(session, transformedOperation)

    // Notify callbacks
    this.notifyOperationCallbacks(transformedOperation)

    return true
  }

  /**
   * Update cursor position
   */
  public updateCursor(
    sessionId: string,
    userId: string,
    field: string,
    position: number,
    selection?: { start: number; end: number }
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const collaborator = session.participants.get(userId)
    if (!collaborator) return

    collaborator.cursor_position = position
    collaborator.current_field = field
    collaborator.last_activity = new Date()

    const cursorPosition: CursorPosition = {
      userId,
      field,
      position,
      selection,
      timestamp: new Date(),
    }

    // Broadcast cursor position
    this.broadcastCursor(session, cursorPosition)
  }

  /**
   * Lock document for exclusive editing
   */
  public async lockDocument(
    documentId: string,
    userId: string,
    duration: number = 300000 // 5 minutes default
  ): Promise<boolean> {
    const session = this.findSessionByDocument(documentId)
    if (!session) return false

    // Check if already locked
    const now = new Date()
    const existingLock = await this.getDocumentLock(documentId)

    if (existingLock && existingLock.locked_by !== userId) {
      const lockExpiry = new Date(existingLock.locked_at!.getTime() + duration)
      if (now < lockExpiry) {
        return false // Document is locked by someone else
      }
    }

    // Apply lock
    await this.setDocumentLock(documentId, userId, duration)

    // Notify collaborators
    this.broadcastLockStatus(session, userId, true)

    console.log(`🔒 Document locked by: ${userId}`)
    return true
  }

  /**
   * Unlock document
   */
  public async unlockDocument(
    documentId: string,
    userId: string
  ): Promise<void> {
    const session = this.findSessionByDocument(documentId)
    if (!session) return

    await this.removeDocumentLock(documentId, userId)

    // Notify collaborators
    this.broadcastLockStatus(session, userId, false)

    console.log(`🔓 Document unlocked by: ${userId}`)
  }

  /**
   * Get document state with all operations applied
   */
  public getDocumentState(sessionId: string): DocumentState | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    // Apply all operations to get current state
    const baseState = this.getBaseDocumentState(session.document_id)
    if (!baseState) return null

    const currentState = { ...baseState }

    session.operations
      .filter(op => op.applied)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .forEach(op => {
        this.applyOperationToState(currentState, op)
      })

    return currentState
  }

  /**
   * Detect conflicts between operations
   */
  private detectConflicts(
    session: CollaborativeSession,
    newOperation: EditOperation
  ): EditConflict[] {
    const conflicts: EditConflict[] = []
    const recentOperations = session.operations.filter(
      op =>
        op.field === newOperation.field &&
        new Date().getTime() - op.timestamp.getTime() < this.conflictTimeWindow
    )

    for (const existingOp of recentOperations) {
      if (this.operationsConflict(existingOp, newOperation)) {
        conflicts.push({
          id: this.generateConflictId(),
          operation1: existingOp,
          operation2: newOperation,
          resolution_strategy: this.determineResolutionStrategy(
            existingOp,
            newOperation
          ),
          resolved: false,
        })
      }
    }

    return conflicts
  }

  /**
   * Check if two operations conflict
   */
  private operationsConflict(op1: EditOperation, op2: EditOperation): boolean {
    if (op1.field !== op2.field) return false

    // Check position overlap
    const pos1 = op1.position
    const pos2 = op2.position
    const len1 = op1.content.length
    const len2 = op2.content.length

    return (
      (pos1 <= pos2 && pos1 + len1 > pos2) ||
      (pos2 <= pos1 && pos2 + len2 > pos1)
    )
  }

  /**
   * Transform operation based on operational transformation rules
   */
  private transformOperation(
    session: CollaborativeSession,
    operation: EditOperation
  ): EditOperation {
    const transformedOp = { ...operation }

    // Get operations that happened after the base version this operation was created on
    const concurrentOps = session.operations.filter(
      op =>
        op.applied &&
        op.timestamp < operation.timestamp &&
        op.field === operation.field
    )

    // Apply operational transformation
    for (const concurrentOp of concurrentOps) {
      transformedOp.position = this.transformPosition(
        transformedOp.position,
        concurrentOp
      )
    }

    return transformedOp
  }

  /**
   * Transform position based on concurrent operation
   */
  private transformPosition(
    position: number,
    concurrentOp: EditOperation
  ): number {
    if (concurrentOp.position <= position) {
      if (concurrentOp.type === 'insert') {
        return position + concurrentOp.content.length
      } else if (concurrentOp.type === 'delete') {
        return Math.max(
          position - concurrentOp.content.length,
          concurrentOp.position
        )
      }
    }
    return position
  }

  /**
   * Resolve conflicts using specified strategy
   */
  private async resolveConflicts(
    _session: CollaborativeSession,
    newOperation: EditOperation,
    conflicts: EditConflict[]
  ): Promise<void> {
    for (const conflict of conflicts) {
      switch (conflict.resolution_strategy) {
        case 'last_write_wins':
          // Keep the new operation, mark old as superseded
          conflict.resolved = true
          break

        case 'merge': {
          // Attempt automatic merge
          const merged = this.mergeOperations(conflict.operation1, newOperation)
          if (merged) {
            Object.assign(newOperation, merged)
            conflict.resolved = true
          }
          break
        }

        case 'manual':
          // Notify for manual resolution
          this.notifyConflictCallbacks(conflict)
          break
      }
    }
  }

  /**
   * Attempt to merge two conflicting operations
   */
  private mergeOperations(
    op1: EditOperation,
    op2: EditOperation
  ): EditOperation | null {
    // Simple merge strategy - concatenate content
    if (op1.type === 'insert' && op2.type === 'insert') {
      return {
        ...op2,
        content: op1.content + op2.content,
        position: Math.min(op1.position, op2.position),
      }
    }

    return null // Cannot merge
  }

  /**
   * Broadcast operation to other collaborators
   */
  private async broadcastOperation(
    _session: CollaborativeSession,
    operation: EditOperation
  ): Promise<void> {
    // In a real implementation, this would send through WebSocket or Supabase realtime
    console.log(
      `📡 Broadcasting operation: ${operation.type} in ${operation.field}`
    )
  }

  /**
   * Broadcast cursor position
   */
  private broadcastCursor(
    session: CollaborativeSession,
    cursor: CursorPosition
  ): void {
    const otherCursors = Array.from(session.participants.values())
      .filter(p => p.userId !== cursor.userId)
      .map(p => ({
        userId: p.userId,
        field: p.current_field || '',
        position: p.cursor_position || 0,
        timestamp: p.last_activity,
      }))

    this.notifyCursorCallbacks([cursor, ...otherCursors])
  }

  /**
   * Broadcast lock status
   */
  private broadcastLockStatus(
    _session: CollaborativeSession,
    userId: string,
    locked: boolean
  ): void {
    console.log(
      `🔐 Broadcasting lock status: ${locked ? 'locked' : 'unlocked'} by ${userId}`
    )
  }

  /**
   * Setup auto-save for session
   */
  private setupAutoSave(sessionId: string): void {
    const interval = setInterval(async () => {
      const session = this.sessions.get(sessionId)
      if (!session || session.participants.size === 0) {
        clearInterval(interval)
        return
      }

      await this.saveDocumentState(session)
    }, this.autoSaveInterval)
  }

  /**
   * Save current document state
   */
  private async saveDocumentState(
    session: CollaborativeSession
  ): Promise<void> {
    const state = this.getDocumentState(session.id)
    if (!state) return

    // Save to database through Supabase
    console.log(`💾 Auto-saving document: ${session.document_id}`)
  }

  /**
   * Subscribe to document changes
   */
  private async subscribeToDocument(
    documentId: string,
    documentType: string
  ): Promise<void> {
    if (this.subscriptions.has(documentId)) return

    const tableName = this.getTableName(documentType)
    const subscriptionId = realtimeManager.subscribe({
      table: tableName as any,
      event: '*',
      callback: payload => this.handleExternalUpdate(documentId, payload),
      filter: `id=eq.${documentId}`,
    })

    this.subscriptions.set(documentId, subscriptionId)
  }

  /**
   * Handle external updates to document
   */
  private handleExternalUpdate(documentId: string, payload: any): void {
    const session = this.findSessionByDocument(documentId)
    if (!session) return

    // Create operation from external update
    const operation: EditOperation = {
      id: this.generateOperationId(),
      type: 'update',
      position: 0,
      content: JSON.stringify(payload.new),
      field: 'external_update',
      userId: 'system',
      timestamp: new Date(),
      applied: true,
    }

    session.operations.push(operation)
    this.notifyOperationCallbacks(operation)
  }

  /**
   * Utility methods
   */
  private findSessionByDocument(
    documentId: string
  ): CollaborativeSession | undefined {
    return Array.from(this.sessions.values()).find(
      s => s.document_id === documentId
    )
  }

  private getTableName(documentType: string): string {
    switch (documentType) {
      case 'maintenance_task':
        return 'maintenance_tasks'
      case 'product':
        return 'products'
      case 'shopping_list':
        return 'shopping_lists'
      case 'calendar_event':
        return 'calendar_events'
      default:
        return 'tasks'
    }
  }

  private determineResolutionStrategy(
    op1: EditOperation,
    op2: EditOperation
  ): EditConflict['resolution_strategy'] {
    // Simple strategy determination
    if (op1.type === op2.type && op1.field === op2.field) {
      return 'merge'
    }
    return 'last_write_wins'
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async getDocumentLock(_documentId: string): Promise<any> {
    // Implementation would query database for lock status
    return null
  }

  private async setDocumentLock(
    _documentId: string,
    _userId: string,
    _duration: number
  ): Promise<void> {
    // Implementation would set lock in database
  }

  private async removeDocumentLock(
    _documentId: string,
    _userId: string
  ): Promise<void> {
    // Implementation would remove lock from database
  }

  private getBaseDocumentState(_documentId: string): DocumentState | null {
    // Implementation would fetch base state from database
    return null
  }

  private applyOperationToState(
    state: DocumentState,
    operation: EditOperation
  ): void {
    // Apply operation to document state
    if (operation.type === 'update') {
      try {
        const update = JSON.parse(operation.content)
        Object.assign(state.content, update)
      } catch (error) {
        console.error('Failed to apply operation:', error)
      }
    }
  }

  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // Unsubscribe from document updates
    const subscriptionId = this.subscriptions.get(session.document_id)
    if (subscriptionId) {
      realtimeManager.unsubscribe(subscriptionId)
      this.subscriptions.delete(session.document_id)
    }

    this.sessions.delete(sessionId)
    console.log(`🧹 Cleaned up session: ${sessionId}`)
  }

  private notifyOperationCallbacks(operation: EditOperation): void {
    this.operationCallbacks.forEach(callback => {
      try {
        callback(operation)
      } catch (error) {
        console.error('Error in operation callback:', error)
      }
    })
  }

  private notifyCursorCallbacks(cursors: CursorPosition[]): void {
    this.cursorCallbacks.forEach(callback => {
      try {
        callback(cursors)
      } catch (error) {
        console.error('Error in cursor callback:', error)
      }
    })
  }

  private notifyConflictCallbacks(conflict: EditConflict): void {
    this.conflictCallbacks.forEach(callback => {
      try {
        callback(conflict)
      } catch (error) {
        console.error('Error in conflict callback:', error)
      }
    })
  }

  private notifyPresenceChange(session: CollaborativeSession): void {
    const collaborators = Array.from(session.participants.values())
    this.presenceCallbacks.forEach(callback => {
      try {
        callback(collaborators)
      } catch (error) {
        console.error('Error in presence callback:', error)
      }
    })
  }

  /**
   * Event listeners
   */
  public onOperation(callback: (operation: EditOperation) => void): void {
    this.operationCallbacks.push(callback)
  }

  public onCursor(callback: (cursors: CursorPosition[]) => void): void {
    this.cursorCallbacks.push(callback)
  }

  public onConflict(callback: (conflict: EditConflict) => void): void {
    this.conflictCallbacks.push(callback)
  }

  public onPresence(
    callback: (collaborators: CollaboratorInfo[]) => void
  ): void {
    this.presenceCallbacks.push(callback)
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.sessions.clear()
    this.subscriptions.forEach(subId => realtimeManager.unsubscribe(subId))
    this.subscriptions.clear()
    this.operationCallbacks = []
    this.cursorCallbacks = []
    this.conflictCallbacks = []
    this.presenceCallbacks = []

    console.log('🧹 Collaborative editing system destroyed')
  }
}

// Export singleton instance
export const collaborativeEditing = new CollaborativeEditing()
export default CollaborativeEditing

import { useActiveSessions } from '@/hooks/useActivityTracking'
import { Users, Clock, Activity, Loader2, Monitor, Smartphone, Tablet } from 'lucide-react'
import type { ActiveSessionInfo } from '@/types/activity'

export function ActiveSessionsCard() {
  const { data: sessions = [], isLoading, error, refetch } = useActiveSessions()

  const calculateDuration = (sessionStart: string) => {
    const start = new Date(sessionStart)
    const now = new Date()
    const durationMs = now.getTime() - start.getTime()
    const durationMinutes = Math.floor(durationMs / (1000 * 60))
    return durationMinutes
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4 text-gray-400" />

    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4 text-blue-600" />
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-4 w-4 text-purple-600" />
    }
    return <Monitor className="h-4 w-4 text-gray-600" />
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Caricamento sessioni attive...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">
            Errore nel caricamento delle sessioni
          </p>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Errore sconosciuto'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna sessione attiva
          </h3>
          <p className="text-gray-600">
            Non ci sono utenti connessi in questo momento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {sessions.length} {sessions.length === 1 ? 'Utente' : 'Utenti'}{' '}
              Connesso{sessions.length === 1 ? '' : 'i'}
            </h2>
            <p className="text-blue-100">Sessioni attive in tempo reale</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <Users className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session: ActiveSessionInfo) => {
          const duration = calculateDuration(session.session_start)
          const lastActivityMinutes = Math.floor(
            (new Date().getTime() -
              new Date(session.last_activity).getTime()) /
              (1000 * 60)
          )

          return (
            <div
              key={session.session_id}
              className="bg-white rounded-lg shadow border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="font-semibold text-gray-900 truncate">
                        {session.user_email}
                      </p>
                    </div>
                  </div>
                  {getDeviceIcon(session.user_agent)}
                </div>

                {/* Session Start */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Inizio:{' '}
                    {new Date(session.session_start).toLocaleTimeString(
                      'it-IT',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700 font-medium">
                    Durata: {formatDuration(duration)}
                  </span>
                </div>

                {/* Last Activity */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Ultima attività:</span>
                    <span
                      className={`font-medium ${
                        lastActivityMinutes < 1
                          ? 'text-green-600'
                          : lastActivityMinutes < 5
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {lastActivityMinutes < 1
                        ? 'Ora'
                        : `${lastActivityMinutes} min fa`}
                    </span>
                  </div>
                </div>

                {/* IP Address (optional) */}
                {session.ip_address && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      IP: {session.ip_address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats Footer */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {sessions.length}
            </p>
            <p className="text-sm text-gray-600">Sessioni Attive</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {
                sessions.filter(
                  s =>
                    (new Date().getTime() -
                      new Date(s.last_activity).getTime()) /
                      (1000 * 60) <
                    1
                ).length
              }
            </p>
            <p className="text-sm text-gray-600">Attivi Ora</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(
                sessions.reduce(
                  (acc, s) => acc + calculateDuration(s.session_start),
                  0
                ) / sessions.length
              )}
              m
            </p>
            <p className="text-sm text-gray-600">Durata Media</p>
          </div>
        </div>
      </div>
    </div>
  )
}



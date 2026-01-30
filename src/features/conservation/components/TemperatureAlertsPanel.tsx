import { ConservationPoint, TemperatureReading } from '@/types/conservation'
import { AlertTriangle, AlertCircle, ChevronRight, Thermometer } from 'lucide-react'
import { getAllowedRange } from '@/features/conservation/utils/correctiveActions'

interface TemperatureAlertsPanelProps {
  anomalies: Array<{ point: ConservationPoint; reading: TemperatureReading }>
  missingReadings: ConservationPoint[]
  onGoToPoint: (pointId: string) => void
  onAddReading: (point: ConservationPoint) => void
}

export function TemperatureAlertsPanel({
  anomalies,
  missingReadings,
  onGoToPoint,
  onAddReading,
}: TemperatureAlertsPanelProps) {
  // Don't show panel if there are no alerts
  if (anomalies.length === 0 && missingReadings.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 mb-4">
      {/* Temperature Anomalies Alert */}
      {anomalies.length > 0 && (
        <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">
              ANOMALIE TEMPERATURA
            </h3>
          </div>

          <div className="border-t border-red-200 pt-3 space-y-2">
            {anomalies.map(({ point, reading }) => {
              const { min, max } = getAllowedRange(point.setpoint_temp)
              return (
                <div
                  key={point.id}
                  className="flex items-center justify-between rounded-md bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {point.name}: {reading.temperature.toFixed(1)}°C
                      </p>
                      <p className="text-sm text-gray-600">
                        critico, range {min.toFixed(1)}/{max.toFixed(1)}°C
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onGoToPoint(point.id)}
                    className="flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
                  >
                    Vai
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Missing Readings Alert */}
      {missingReadings.length > 0 && (
        <div className="rounded-lg border-2 border-orange-500 bg-orange-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-orange-900">
              PUNTI DA RILEVARE OGGI (obbligo HACCP)
            </h3>
          </div>

          <div className="border-t border-orange-200 pt-3 space-y-2">
            {missingReadings.map((point) => (
              <div
                key={point.id}
                className="flex items-center justify-between rounded-md bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {point.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {point.last_temperature_reading
                        ? `ultima lettura ${new Date(point.last_temperature_reading.recorded_at).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : 'nessuna lettura oggi'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onAddReading(point)}
                  className="flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-800 transition-colors"
                >
                  Rileva
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

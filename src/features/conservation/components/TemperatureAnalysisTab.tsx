import { useState, useMemo } from 'react'
import { ConservationPoint, TemperatureReading } from '@/types/conservation'
import { TemperatureChart } from './TemperatureChart'
import { isTemperatureCompliant } from '@/features/conservation/utils/correctiveActions'

interface TemperatureAnalysisTabProps {
  points: ConservationPoint[]
  readings: TemperatureReading[]
}

const PERIOD_OPTIONS = [
  { value: 3, label: 'Ultimi 3 giorni' },
  { value: 7, label: 'Ultima settimana' },
  { value: 9, label: 'Ultimi 9 giorni' },
  { value: 14, label: 'Ultimi 14 giorni' },
  { value: 30, label: 'Ultimo mese' },
]

export function TemperatureAnalysisTab({
  points,
  readings,
}: TemperatureAnalysisTabProps) {
  const [selectedPointId, setSelectedPointId] = useState<string>(
    points[0]?.id || ''
  )
  const [periodDays, setPeriodDays] = useState(9)

  // Find selected point
  const selectedPoint = points.find((p) => p.id === selectedPointId)

  // Filter readings for selected point and period
  const filteredReadings = useMemo(() => {
    if (!selectedPointId) return []

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - periodDays)

    return readings.filter((reading) => {
      const isForPoint = reading.conservation_point_id === selectedPointId
      const isInPeriod = new Date(reading.recorded_at) >= cutoffDate
      return isForPoint && isInPeriod
    })
  }, [selectedPointId, periodDays, readings])

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredReadings.length === 0 || !selectedPoint) {
      return {
        average: 0,
        min: 0,
        max: 0,
        anomalies: 0,
      }
    }

    const temperatures = filteredReadings.map((r) => r.temperature)
    const average = temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length
    const min = Math.min(...temperatures)
    const max = Math.max(...temperatures)
    const anomalies = filteredReadings.filter(
      (r) => !isTemperatureCompliant(r.temperature, selectedPoint.setpoint_temp)
    ).length

    return { average, min, max, anomalies }
  }, [filteredReadings, selectedPoint])

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-gray-500">Nessun punto di conservazione disponibile</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Point Selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Punto:
          </label>
          <select
            value={selectedPointId}
            onChange={(e) => setSelectedPointId(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {points.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name}
              </option>
            ))}
          </select>
        </div>

        {/* Period Selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Periodo:
          </label>
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      {selectedPoint && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <TemperatureChart
            readings={filteredReadings}
            setpoint={selectedPoint.setpoint_temp}
            periodDays={periodDays}
          />
        </div>
      )}

      {/* Statistics */}
      {filteredReadings.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 font-semibold text-gray-900">
            Statistiche periodo
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Media</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.average.toFixed(1)}°C
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Minima</p>
              <p className="text-lg font-semibold text-blue-600">
                {stats.min.toFixed(1)}°C
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Massima</p>
              <p className="text-lg font-semibold text-red-600">
                {stats.max.toFixed(1)}°C
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Anomalie</p>
              <p className={`text-lg font-semibold ${stats.anomalies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.anomalies}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

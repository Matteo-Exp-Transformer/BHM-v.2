import { TemperatureReading, ConservationPoint } from '@/types/conservation'
import { isTemperatureCompliant } from '@/features/conservation/utils/correctiveActions'
import { CheckCircle, AlertTriangle } from 'lucide-react'

interface TemperatureReadingsTableProps {
  readings: TemperatureReading[]
  points: ConservationPoint[]
}

export function TemperatureReadingsTable({
  readings,
  points,
}: TemperatureReadingsTableProps) {
  // Create a map of point IDs to points for quick lookup
  const pointsMap = new Map(points.map((p) => [p.id, p]))

  if (readings.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-500">Nessuna lettura disponibile</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-2 text-left font-medium text-gray-700">Ora</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Punto</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Temperatura</th>
            <th className="px-3 py-2 text-center font-medium text-gray-700">Esito</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Operatore</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {readings.map((reading) => {
            const point = pointsMap.get(reading.conservation_point_id)
            const isCompliant = point
              ? isTemperatureCompliant(reading.temperature, point.setpoint_temp)
              : false

            const recordedDate = new Date(reading.recorded_at)
            const timeString = recordedDate.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
            })

            const operatorName = reading.recorded_by_user
              ? `${reading.recorded_by_user.first_name || ''} ${reading.recorded_by_user.last_name || ''}`.trim()
              : '-'

            return (
              <tr key={reading.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-900">{timeString}</td>
                <td className="px-3 py-2">
                  <span className="font-medium text-gray-900">
                    {point?.name || 'Punto sconosciuto'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`font-semibold ${isCompliant ? 'text-gray-900' : 'text-red-600'}`}>
                    {reading.temperature.toFixed(1)}°C
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  {isCompliant ? (
                    <CheckCircle className="inline h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="inline h-5 w-5 text-red-500" />
                  )}
                </td>
                <td className="px-3 py-2 text-gray-600">{operatorName}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

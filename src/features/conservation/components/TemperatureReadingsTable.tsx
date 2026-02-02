import React, { useState } from 'react'
import { TemperatureReading, ConservationPoint } from '@/types/conservation'
import { isTemperatureCompliant } from '@/features/conservation/utils/correctiveActions'
import { CheckCircle, AlertTriangle, ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react'

const METHOD_LABELS: Record<string, string> = {
  manual: 'Manuale',
  digital_thermometer: 'Termometro Digitale',
  automatic_sensor: 'Sensore Automatico',
}

interface TemperatureReadingsTableProps {
  readings: TemperatureReading[]
  points: ConservationPoint[]
  onEditReading?: (reading: TemperatureReading) => void
  onDeleteReading?: (id: string) => void
}

export function TemperatureReadingsTable({
  readings,
  points,
  onEditReading,
  onDeleteReading,
}: TemperatureReadingsTableProps) {
  const [expandedReadingId, setExpandedReadingId] = useState<string | null>(null)
  const pointsMap = new Map(points.map((p) => [p.id, p]))

  const toggleExpanded = (readingId: string) => {
    setExpandedReadingId((prev) => (prev === readingId ? null : readingId))
  }

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
            <th className="w-8 px-1 py-2" aria-label="Espandi" />
            <th className="px-3 py-2 text-left font-medium text-gray-700">Ora</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Punto</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Reparto</th>
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
            const isExpanded = expandedReadingId === reading.id
            const hasDetails =
              reading.method || reading.notes || (reading.photo_evidence && reading.photo_evidence.trim())

            const recordedDate = new Date(reading.recorded_at)
            const timeString = recordedDate.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
            })

            const operatorName = reading.recorded_by_user
              ? `${reading.recorded_by_user.first_name || ''} ${reading.recorded_by_user.last_name || ''}`.trim()
              : '-'

            return (
              <React.Fragment key={reading.id}>
                <tr
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpanded(reading.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleExpanded(reading.id)
                    }
                  }}
                  className="hover:bg-gray-50 cursor-pointer select-none"
                  aria-expanded={isExpanded}
                  aria-label={`Riga lettura ${point?.name || ''} ${timeString}, clicca per ${isExpanded ? 'chiudere' : 'aprire'} dettagli`}
                >
                  <td className="px-1 py-2 text-gray-400">
                    {hasDetails ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      )
                    ) : (
                      <span className="w-4 inline-block" aria-hidden />
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-900">{timeString}</td>
                  <td className="px-3 py-2">
                    <span className="font-medium text-gray-900">
                      {point?.name || 'Punto sconosciuto'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {point?.department?.name || '-'}
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
                {isExpanded && (
                  <tr className="bg-gray-50/80">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                          Dettagli rilevamento
                        </h4>
                        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Metodo di rilevazione</dt>
                            <dd className="mt-1 text-base text-gray-900">
                              {reading.method ? METHOD_LABELS[reading.method] || reading.method : '—'}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Note aggiuntive</dt>
                            <dd className="mt-1 text-base text-gray-900 whitespace-pre-wrap">
                              {reading.notes && reading.notes.trim() ? reading.notes : '—'}
                            </dd>
                          </div>
                          <div className="sm:col-span-3">
                            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Foto evidenza</dt>
                            <dd className="mt-1 text-base text-gray-900">
                              {reading.photo_evidence && reading.photo_evidence.trim() ? (
                                <a
                                  href={reading.photo_evidence}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all"
                                >
                                  {reading.photo_evidence}
                                </a>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </dd>
                          </div>
                        </dl>
                        {(onEditReading || onDeleteReading) && (
                          <div className="mt-3 flex gap-2 border-t border-gray-200 pt-3">
                            {onEditReading && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditReading(reading)
                                }}
                                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                                Modifica
                              </button>
                            )}
                            {onDeleteReading && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteReading(reading.id)
                                }}
                                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Elimina
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

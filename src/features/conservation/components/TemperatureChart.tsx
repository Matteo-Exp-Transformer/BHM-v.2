import { TemperatureReading } from '@/types/conservation'
import { getAllowedRange, isTemperatureCompliant } from '@/features/conservation/utils/correctiveActions'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Legend,
} from 'recharts'

interface TemperatureChartProps {
  readings: TemperatureReading[]
  setpoint: number
  periodDays?: number
}

interface ChartDataPoint {
  timestamp: number
  date: string
  temperature: number
  isCompliant: boolean
  recordedBy?: string
  recordedAt: string
}

export function TemperatureChart({
  readings,
  setpoint,
  periodDays = 9,
}: TemperatureChartProps) {
  const { min, max } = getAllowedRange(setpoint)

  // Prepare chart data
  const chartData: ChartDataPoint[] = readings
    .filter((reading) => {
      // Filter readings within the period
      const readingDate = new Date(reading.recorded_at)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - periodDays)
      return readingDate >= cutoffDate
    })
    .map((reading) => {
      const recordedAt = new Date(reading.recorded_at)
      return {
        timestamp: recordedAt.getTime(),
        date: recordedAt.toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'short',
        }),
        temperature: reading.temperature,
        isCompliant: isTemperatureCompliant(reading.temperature, setpoint),
        recordedBy: reading.recorded_by_user
          ? `${reading.recorded_by_user.first_name || ''} ${reading.recorded_by_user.last_name || ''}`.trim()
          : undefined,
        recordedAt: recordedAt.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as ChartDataPoint
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-semibold text-gray-900">
            {data.temperature.toFixed(1)}°C
          </p>
          <p className="text-sm text-gray-600">{data.recordedAt}</p>
          {data.recordedBy && (
            <p className="text-sm text-gray-500">{data.recordedBy}</p>
          )}
          <p className={`text-xs mt-1 ${data.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
            {data.isCompliant ? '✓ Conforme' : '⚠ Fuori range'}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom dot renderer to show red dots for non-compliant readings
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    const isCompliant = payload.isCompliant

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={isCompliant ? '#3b82f6' : '#ef4444'}
        stroke="#fff"
        strokeWidth={2}
      />
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-gray-500">Nessun dato disponibile per il periodo selezionato</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* X Axis - Date */}
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />

          {/* Y Axis - Temperature */}
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(value) => `${value}°C`}
          />

          {/* Allowed range area (green band) */}
          <ReferenceArea
            y1={min}
            y2={max}
            fill="#86efac"
            fillOpacity={0.3}
            label={{ value: 'Range consentito', position: 'insideTopRight', fill: '#16a34a', fontSize: 12 }}
          />

          {/* Setpoint line */}
          <ReferenceLine
            y={setpoint}
            stroke="#16a34a"
            strokeDasharray="5 5"
            label={{ value: `Setpoint ${setpoint}°C`, position: 'right', fill: '#16a34a', fontSize: 12 }}
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} />

          {/* Legend */}
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />

          {/* Temperature line */}
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={<CustomDot />}
            name="Temperatura"
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

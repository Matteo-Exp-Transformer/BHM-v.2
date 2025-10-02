import React from 'react'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  Package,
  ShoppingCart,
  Thermometer,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from './hooks/useDashboardData'
import { KPICard } from './components/KPICard'
import { ComplianceChart } from './components/ComplianceChart'
import { TemperatureTrend } from './components/TemperatureTrend'
import { TaskSummary } from './components/TaskSummary'
import { useTemperatureReadings } from '@/features/conservation/hooks/useTemperatureReadings'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'

export const DashboardPage: React.FC = () => {
  const { isLoading: authLoading } = useAuth()
  const {
    data: kpis,
    isLoading: kpisLoading,
    error: kpisError,
  } = useDashboardData()
  const { temperatureReadings } = useTemperatureReadings()
  const { maintenanceTasks } = useMaintenanceTasks()

  if (authLoading || kpisLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (kpisError) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Errore nel caricamento dei dati
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Si è verificato un errore durante il caricamento dei dati della
          dashboard. Riprova più tardi o contatta l'amministratore.
        </p>
      </div>
    )
  }

  if (!kpis) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nessun dato disponibile
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Non ci sono ancora dati disponibili per la dashboard. Inizia
          aggiungendo staff, prodotti o punti di conservazione.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <BarChart3 className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Panoramica completa del sistema HACCP</p>
        </div>
      </div>

      {/* Main KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Compliance Score"
          value={`${kpis.overall_compliance_score.value}%`}
          subtitle="Overall HACCP compliance"
          trend={kpis.overall_compliance_score.trend}
          trendValue={`vs ${kpis.overall_compliance_score.previous_period_score}%`}
          status={
            kpis.overall_compliance_score.value >= 90
              ? 'success'
              : kpis.overall_compliance_score.value >= 70
                ? 'warning'
                : 'error'
          }
          icon={<TrendingUp className="w-5 h-5" />}
        />

        <KPICard
          title="Temperature Compliance"
          value={`${kpis.temperature_compliance.compliance_rate}%`}
          subtitle={`${kpis.temperature_compliance.compliant_readings}/${kpis.temperature_compliance.total_readings} readings`}
          trend={
            kpis.temperature_compliance.compliance_rate >= 95
              ? 'up'
              : kpis.temperature_compliance.compliance_rate >= 85
                ? 'stable'
                : 'down'
          }
          status={
            kpis.temperature_compliance.compliance_rate >= 95
              ? 'success'
              : kpis.temperature_compliance.compliance_rate >= 85
                ? 'warning'
                : 'error'
          }
          icon={<Thermometer className="w-5 h-5" />}
        />

        <KPICard
          title="Task Completion"
          value={`${kpis.task_completion_rate.completion_rate}%`}
          subtitle={`${kpis.task_completion_rate.completed_on_time}/${kpis.task_completion_rate.total_tasks} tasks`}
          trend={kpis.task_completion_rate.trend}
          status={
            kpis.task_completion_rate.completion_rate >= 90
              ? 'success'
              : kpis.task_completion_rate.completion_rate >= 70
                ? 'warning'
                : 'error'
          }
          icon={<Package className="w-5 h-5" />}
        />

        <KPICard
          title="Active Staff"
          value={kpis.staff_metrics.active_staff}
          subtitle={`${kpis.staff_metrics.haccp_certifications_expiring} certs expiring`}
          trend={
            kpis.staff_metrics.haccp_certifications_expiring === 0
              ? 'up'
              : 'stable'
          }
          status={
            kpis.staff_metrics.haccp_certifications_expiring === 0
              ? 'success'
              : kpis.staff_metrics.haccp_certifications_expiring <= 2
                ? 'warning'
                : 'error'
          }
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Inventory Health"
          value={`${kpis.inventory_metrics.total_products}`}
          subtitle={`${kpis.inventory_metrics.expiring_soon} expiring soon`}
          trend={kpis.inventory_metrics.expiring_soon === 0 ? 'up' : 'stable'}
          status={
            kpis.inventory_metrics.expiring_soon === 0
              ? 'success'
              : kpis.inventory_metrics.expiring_soon <= 5
                ? 'warning'
                : 'error'
          }
          icon={<Package className="w-5 h-5" />}
        />

        <KPICard
          title="Shopping Lists"
          value={`${kpis.shopping_activity.active_lists}`}
          subtitle={`${kpis.shopping_activity.completion_rate}% completion rate`}
          trend={kpis.shopping_activity.completion_rate >= 80 ? 'up' : 'stable'}
          status={
            kpis.shopping_activity.completion_rate >= 80
              ? 'success'
              : kpis.shopping_activity.completion_rate >= 60
                ? 'warning'
                : 'error'
          }
          icon={<ShoppingCart className="w-5 h-5" />}
        />

        <KPICard
          title="Conservation Points"
          value={`${kpis.conservation_status.normal_status}/${kpis.conservation_status.total_points}`}
          subtitle={`${kpis.conservation_status.maintenance_due} maintenance due`}
          trend={
            kpis.conservation_status.critical_status === 0 ? 'up' : 'stable'
          }
          status={
            kpis.conservation_status.critical_status === 0
              ? 'success'
              : kpis.conservation_status.critical_status <= 1
                ? 'warning'
                : 'error'
          }
          icon={<Thermometer className="w-5 h-5" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Thermometer className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Record Temperature Reading</span>
            </div>
          </button>
          <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-green-600" />
              <span className="font-medium">Add New Product</span>
            </div>
          </button>
          <button className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Create Shopping List</span>
            </div>
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Chart */}
        <ComplianceChart
          data={[
            {
              category: 'Temperature Control',
              compliant: kpis?.temperature_compliance.compliant_readings || 0,
              warning: Math.max(
                0,
                (kpis?.temperature_compliance.total_readings || 0) -
                  (kpis?.temperature_compliance.compliant_readings || 0) -
                  1
              ),
              critical: 1,
              total: kpis?.temperature_compliance.total_readings || 0,
            },
            {
              category: 'Task Completion',
              compliant: kpis?.task_completion_rate.completed_on_time || 0,
              warning: Math.max(
                0,
                (kpis?.task_completion_rate.total_tasks || 0) -
                  (kpis?.task_completion_rate.completed_on_time || 0) -
                  (kpis?.task_completion_rate.overdue || 0)
              ),
              critical: kpis?.task_completion_rate.overdue || 0,
              total: kpis?.task_completion_rate.total_tasks || 0,
            },
            {
              category: 'Staff Certification',
              compliant: Math.max(
                0,
                (kpis?.staff_metrics.total_staff || 0) -
                  (kpis?.staff_metrics.haccp_certifications_expiring || 0)
              ),
              warning: kpis?.staff_metrics.haccp_certifications_expiring || 0,
              critical: 0,
              total: kpis?.staff_metrics.total_staff || 0,
            },
            {
              category: 'Conservation Points',
              compliant: kpis?.conservation_status.normal_status || 0,
              warning: kpis?.conservation_status.warning_status || 0,
              critical: kpis?.conservation_status.critical_status || 0,
              total: kpis?.conservation_status.total_points || 0,
            },
          ]}
          title="HACCP Compliance Overview"
        />

        {/* Task Summary */}
        <TaskSummary
          data={{
            period: 'week',
            total: kpis?.task_completion_rate.total_tasks || 0,
            completed: kpis?.task_completion_rate.completed_on_time || 0,
            pending: Math.max(
              0,
              (kpis?.task_completion_rate.total_tasks || 0) -
                (kpis?.task_completion_rate.completed_on_time || 0) -
                (kpis?.task_completion_rate.overdue || 0)
            ),
            overdue: kpis?.task_completion_rate.overdue || 0,
            completion_rate: kpis?.task_completion_rate.completion_rate || 0,
            by_type: {
              Maintenance: Math.floor(
                (kpis?.task_completion_rate.total_tasks || 0) * 0.6
              ),
              Cleaning: Math.floor(
                (kpis?.task_completion_rate.total_tasks || 0) * 0.3
              ),
              Inspection: Math.floor(
                (kpis?.task_completion_rate.total_tasks || 0) * 0.1
              ),
            },
            by_assigned_to: {
              'Kitchen Staff': Math.floor(
                (kpis?.task_completion_rate.total_tasks || 0) * 0.4
              ),
              'Maintenance Team': Math.floor(
                (kpis?.task_completion_rate.total_tasks || 0) * 0.3
              ),
              Supervisor: Math.floor(
                (kpis?.task_completion_rate.total_tasks || 0) * 0.2
              ),
              Unassigned: Math.floor(
                (kpis?.task_completion_rate.total_tasks || 0) * 0.1
              ),
            },
            upcoming: maintenanceTasks.slice(0, 5).map(task => ({
              id: task.id,
              title: `Manutenzione ${task.title} (${task.type})`,
              due_date: task.next_due.toISOString(),
              assigned_to: task.assigned_to || 'Unassigned',
              priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
              type: 'Maintenance',
            })),
          }}
          title="Weekly Task Summary"
        />
      </div>

      {/* Temperature Trend - Full Width */}
      <TemperatureTrend
        data={temperatureReadings.slice(0, 50).map(reading => ({
          date: reading.recorded_at.toISOString(),
          temperature: reading.temperature,
          status: reading.status as 'compliant' | 'warning' | 'critical',
          point_name: `Point ${reading.conservation_point_id}`,
        }))}
        title="Temperature Trends - Last 7 Days"
        className="w-full"
      />
    </div>
  )
}

export default DashboardPage

/**
 * ReportDesigner - B.10.2 Advanced Analytics & Reporting
 * Drag-and-drop report builder interface
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import {
  Save,
  Eye,
  Download,
  Settings,
  Plus,
  Trash2,
  Move,
  Copy,
  Palette,
  BarChart3,
  Table,
  Type,
  Image,
  Target,
  Database,
  Filter,
  Layout,
  RefreshCw,
} from 'lucide-react'

import {
  reportBuilder,
  Report,
  ReportComponent,
  ComponentConfig,
  DataSourceConfig,
  FilterConfig,
  LayoutConfig,
} from '@/services/reporting'

interface ReportDesignerProps {
  reportId?: string
  onSave?: (report: Report) => void
  onPreview?: (report: Report) => void
  onExport?: (report: Report, format: string) => void
}

export const ReportDesigner: React.FC<ReportDesignerProps> = ({
  reportId,
  onSave,
  onPreview,
  onExport,
}) => {
  const [report, setReport] = useState<Report | null>(null)
  const [selectedComponent, setSelectedComponent] =
    useState<ReportComponent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('components')
  const [dragOver, setDragOver] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadReport()
  }, [reportId])

  const loadReport = async () => {
    if (!reportId) {
      // Create new report
      const newReport = reportBuilder.createReport(
        'New Report',
        'A new report created with the designer',
        'custom',
        'current_user'
      )
      setReport(newReport)
    } else {
      // Load existing report
      const existingReport = reportBuilder.getReport(reportId)
      if (existingReport) {
        setReport(existingReport)
      }
    }
  }

  const handleAddComponent = (type: ReportComponent['type']) => {
    if (!report) return

    const newComponent: Omit<ReportComponent, 'id'> = {
      type,
      config: getDefaultComponentConfig(type),
      dataSource: getDefaultDataSourceConfig(type),
      filters: [],
      layout: getDefaultLayoutConfig(report.components.length),
      styling: {},
    }

    const component = reportBuilder.addComponent(report.id, newComponent)
    setReport({ ...report, components: [...report.components, component] })
    setSelectedComponent(component)
    setIsDirty(true)
  }

  const handleUpdateComponent = (
    componentId: string,
    updates: Partial<ReportComponent>
  ) => {
    if (!report) return

    const updatedComponent = reportBuilder.updateComponent(
      report.id,
      componentId,
      updates
    )
    setReport({
      ...report,
      components: report.components.map(c =>
        c.id === componentId ? updatedComponent : c
      ),
    })
    setSelectedComponent(updatedComponent)
    setIsDirty(true)
  }

  const handleRemoveComponent = (componentId: string) => {
    if (!report) return

    reportBuilder.removeComponent(report.id, componentId)
    setReport({
      ...report,
      components: report.components.filter(c => c.id !== componentId),
    })
    setSelectedComponent(null)
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (!report) return

    setIsLoading(true)
    try {
      // Validate report
      const validation = reportBuilder.validateReport(report.id)
      if (!validation.isValid) {
        alert('Report validation failed: ' + validation.errors.join(', '))
        return
      }

      onSave?.(report)
      setIsDirty(false)
      console.log('📋 Report saved successfully')
    } catch (error) {
      console.error('Failed to save report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    if (!report) return
    onPreview?.(report)
  }

  const handleExport = (format: string) => {
    if (!report) return
    onExport?.(report, format)
  }

  const getDefaultComponentConfig = (
    type: ReportComponent['type']
  ): ComponentConfig => {
    switch (type) {
      case 'chart':
        return {
          title: 'New Chart',
          chartType: 'line',
          showLegend: true,
          showGrid: true,
        }
      case 'table':
        return {
          title: 'New Table',
          tableColumns: [
            {
              id: 'col1',
              header: 'Column 1',
              field: 'field1',
              type: 'string',
              sortable: true,
            },
          ],
        }
      case 'metric':
        return {
          title: 'New Metric',
          metricValue: 0,
          metricUnit: '',
        }
      case 'kpi':
        return {
          title: 'New KPI',
          metricValue: 0,
          metricUnit: '%',
          kpiTarget: 100,
        }
      case 'text':
        return {
          title: 'New Text Block',
          textContent: 'Enter your text content here...',
        }
      case 'image':
        return {
          title: 'New Image',
          imageUrl: '',
        }
      default:
        return { title: 'New Component' }
    }
  }

  const getDefaultDataSourceConfig = (
    type: ReportComponent['type']
  ): DataSourceConfig => {
    return {
      source: 'database',
      query: 'SELECT * FROM sample_data LIMIT 100',
      refreshInterval: 300000, // 5 minutes
    }
  }

  const getDefaultLayoutConfig = (index: number): LayoutConfig => {
    return {
      x: (index % 2) * 300,
      y: Math.floor(index / 2) * 200,
      width: 280,
      height: 180,
      zIndex: index + 1,
    }
  }

  const getComponentIcon = (type: ReportComponent['type']) => {
    switch (type) {
      case 'chart':
        return <BarChart3 className="h-4 w-4" />
      case 'table':
        return <Table className="h-4 w-4" />
      case 'metric':
      case 'kpi':
        return <Target className="h-4 w-4" />
      case 'text':
        return <Type className="h-4 w-4" />
      case 'image':
        return <Image className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const getComponentColor = (type: ReportComponent['type']) => {
    switch (type) {
      case 'chart':
        return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'table':
        return 'bg-green-100 text-green-600 border-green-200'
      case 'metric':
        return 'bg-purple-100 text-purple-600 border-purple-200'
      case 'kpi':
        return 'bg-orange-100 text-orange-600 border-orange-200'
      case 'text':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'image':
        return 'bg-pink-100 text-pink-600 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading report designer...</span>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Report Designer</h1>
          <Badge variant="outline">{report.name}</Badge>
          {isDirty && <Badge variant="secondary">Unsaved Changes</Badge>}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-1" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Component Library */}
        <div className="w-64 border-r bg-gray-50 p-4 space-y-4">
          <h3 className="font-semibold">Components</h3>
          <div className="space-y-2">
            {[
              { type: 'chart' as const, label: 'Chart' },
              { type: 'table' as const, label: 'Table' },
              { type: 'metric' as const, label: 'Metric' },
              { type: 'kpi' as const, label: 'KPI' },
              { type: 'text' as const, label: 'Text' },
              { type: 'image' as const, label: 'Image' },
            ].map(({ type, label }) => (
              <Button
                key={type}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddComponent(type)}
              >
                {getComponentIcon(type)}
                <span className="ml-2">{label}</span>
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Data Sources</h4>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Database className="h-4 w-4 mr-2" />
                Database
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Database className="h-4 w-4 mr-2" />
                API
              </Button>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <TabsList className="w-full justify-start">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="flex-1 p-4">
              {/* Canvas */}
              <div
                ref={canvasRef}
                className="relative w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-auto"
                style={{ minHeight: '600px' }}
              >
                {report.components.map(component => (
                  <Card
                    key={component.id}
                    className={`absolute border-2 cursor-pointer transition-all hover:shadow-lg ${
                      selectedComponent?.id === component.id
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200'
                    }`}
                    style={{
                      left: component.layout.x,
                      top: component.layout.y,
                      width: component.layout.width,
                      height: component.layout.height,
                      zIndex: component.layout.zIndex,
                    }}
                    onClick={() => setSelectedComponent(component)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getComponentIcon(component.type)}
                          <span>{component.config.title}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Move className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={e => {
                              e.stopPropagation()
                              handleRemoveComponent(component.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-sm">
                          {component.type.charAt(0).toUpperCase() +
                            component.type.slice(1)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {report.components.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Drag components here to start building your report</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="data" className="flex-1 p-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="dataSource">Data Source</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="query">Query</Label>
                        <Textarea
                          id="query"
                          placeholder="Enter your query here..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Add Filter
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="reportName">Report Name</Label>
                      <Input
                        id="reportName"
                        value={report.name}
                        onChange={e =>
                          setReport({ ...report, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportDescription">Description</Label>
                      <Textarea
                        id="reportDescription"
                        value={report.description}
                        onChange={e =>
                          setReport({ ...report, description: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublic"
                        checked={report.isPublic}
                        onCheckedChange={checked =>
                          setReport({ ...report, isPublic: checked })
                        }
                      />
                      <Label htmlFor="isPublic">Make report public</Label>
                    </div>
                  </CardContent>
                </Card>

                {selectedComponent && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Component Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="componentTitle">Title</Label>
                        <Input
                          id="componentTitle"
                          value={selectedComponent.config.title}
                          onChange={e =>
                            handleUpdateComponent(selectedComponent.id, {
                              config: {
                                ...selectedComponent.config,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showLegend"
                          checked={selectedComponent.config.showLegend || false}
                          onCheckedChange={checked =>
                            handleUpdateComponent(selectedComponent.id, {
                              config: {
                                ...selectedComponent.config,
                                showLegend: checked,
                              },
                            })
                          }
                        />
                        <Label htmlFor="showLegend">Show Legend</Label>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default ReportDesigner

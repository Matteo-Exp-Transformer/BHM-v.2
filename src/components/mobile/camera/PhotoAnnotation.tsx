/**
 * PhotoAnnotation - B.8.4 Advanced Mobile Features
 * Image markup tools for HACCP photo documentation
 */

import React, { useState, useRef, useEffect } from 'react'
import { AnnotationOptions, ProcessedPhoto } from '@/services/mobile/camera'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  Type, 
  Circle, 
  Square, 
  ArrowRight, 
  X, 
  Save, 
  Undo, 
  Redo,
  Palette,
  Move
} from 'lucide-react'

interface PhotoAnnotationProps {
  photoDataUrl: string
  onAnnotationComplete?: (annotatedPhoto: ProcessedPhoto) => void
  onCancel?: () => void
  className?: string
}

interface AnnotationTool {
  type: 'text' | 'circle' | 'rectangle' | 'arrow'
  icon: React.ReactNode
  label: string
}

interface DrawingState {
  isDrawing: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  tool: AnnotationTool['type']
}

export const PhotoAnnotation: React.FC<PhotoAnnotationProps> = ({
  photoDataUrl,
  onAnnotationComplete,
  onCancel,
  className = ''
}) => {
  const [annotations, setAnnotations] = useState<AnnotationOptions[]>([])
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<AnnotationOptions>>({
    text: '',
    position: { x: 50, y: 50 },
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#000000',
    opacity: 0.8
  })
  const [activeTool, setActiveTool] = useState<AnnotationTool['type']>('text')
  const [drawingState, setDrawingState] = useState<DrawingState | null>(null)
  const [history, setHistory] = useState<AnnotationOptions[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const tools: AnnotationTool[] = [
    { type: 'text', icon: <Type className="h-4 w-4" />, label: 'Text' },
    { type: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
    { type: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
    { type: 'arrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow' }
  ]

  useEffect(() => {
    loadImage()
  }, [photoDataUrl])

  const loadImage = () => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      redrawCanvas()
    }
    img.src = photoDataUrl
  }

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match image
    canvas.width = img.width
    canvas.height = img.height

    // Draw image
    ctx.drawImage(img, 0, 0)

    // Draw annotations
    annotations.forEach(annotation => {
      drawAnnotation(ctx, annotation)
    })

    // Draw current drawing if in progress
    if (drawingState && drawingState.isDrawing) {
      drawCurrentShape(ctx, drawingState)
    }
  }

  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: AnnotationOptions) => {
    if (annotation.text) {
      drawTextAnnotation(ctx, annotation)
    }
  }

  const drawTextAnnotation = (ctx: CanvasRenderingContext2D, annotation: AnnotationOptions) => {
    const { text, position, fontSize, color, backgroundColor, opacity } = annotation
    if (!text || !position) return

    ctx.save()
    ctx.globalAlpha = opacity || 0.8

    // Draw background rectangle
    ctx.font = `${fontSize || 16}px Arial`
    const textMetrics = ctx.measureText(text)
    const padding = 8
    const rectWidth = textMetrics.width + (padding * 2)
    const rectHeight = (fontSize || 16) + (padding * 2)

    ctx.fillStyle = backgroundColor || '#000000'
    ctx.fillRect(
      position.x - padding,
      position.y - (fontSize || 16) - padding,
      rectWidth,
      rectHeight
    )

    // Draw text
    ctx.fillStyle = color || '#ffffff'
    ctx.fillText(text, position.x, position.y)

    ctx.restore()
  }

  const drawCurrentShape = (ctx: CanvasRenderingContext2D, state: DrawingState) => {
    ctx.save()
    ctx.strokeStyle = currentAnnotation.color || '#ff0000'
    ctx.lineWidth = 2
    ctx.globalAlpha = currentAnnotation.opacity || 0.8

    const { startX, startY, currentX, currentY, tool } = state

    switch (tool) {
      case 'circle':
        const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2))
        ctx.beginPath()
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
        ctx.stroke()
        break

      case 'rectangle':
        ctx.strokeRect(startX, startY, currentX - startX, currentY - startY)
        break

      case 'arrow':
        drawArrow(ctx, startX, startY, currentX, currentY)
        break
    }

    ctx.restore()
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 20
    const angle = Math.atan2(toY - fromY, toX - fromX)

    // Draw line
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    // Draw arrowhead
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    if (activeTool === 'text') {
      setCurrentAnnotation(prev => ({
        ...prev,
        position: { x, y }
      }))
    } else {
      setDrawingState({
        isDrawing: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        tool: activeTool
      })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState?.isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    setDrawingState(prev => prev ? { ...prev, currentX: x, currentY: y } : null)
    redrawCanvas()
  }

  const handleCanvasMouseUp = () => {
    if (!drawingState?.isDrawing) return

    // Add completed shape to annotations
    const newAnnotation: AnnotationOptions = {
      ...currentAnnotation,
      position: { x: drawingState.startX, y: drawingState.startY }
    }

    addAnnotation(newAnnotation)
    setDrawingState(null)
  }

  const addAnnotation = (annotation: AnnotationOptions) => {
    saveToHistory()
    setAnnotations(prev => [...prev, annotation])
    setCurrentAnnotation({
      text: '',
      position: { x: 50, y: 50 },
      fontSize: 16,
      color: '#ffffff',
      backgroundColor: '#000000',
      opacity: 0.8
    })
    redrawCanvas()
  }

  const removeAnnotation = (index: number) => {
    saveToHistory()
    setAnnotations(prev => prev.filter((_, i) => i !== index))
    redrawCanvas()
  }

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...annotations])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setAnnotations([...history[historyIndex - 1]])
      redrawCanvas()
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setAnnotations([...history[historyIndex + 1]])
      redrawCanvas()
    }
  }

  const handleSave = async () => {
    try {
      // Import photoProcessor dynamically to avoid circular dependencies
      const { photoProcessor } = await import('@/services/mobile/camera')
      
      // Create a mock PhotoMetadata for processing
      const mockMetadata = {
        id: `annotation_${Date.now()}`,
        timestamp: new Date(),
        deviceInfo: {
          platform: 'web',
          model: 'browser',
          osVersion: 'unknown'
        },
        cameraSettings: {
          quality: 85,
          resolution: { width: canvasRef.current?.width || 1920, height: canvasRef.current?.height || 1080 },
          flashUsed: false
        }
      }

      const processedPhoto = await photoProcessor.processPhoto(
        photoDataUrl,
        mockMetadata,
        { annotations }
      )

      onAnnotationComplete?.(processedPhoto)
    } catch (error) {
      console.error('❌ Annotation save failed:', error)
    }
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Photo Annotation
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Tools Panel */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Annotation Tools</Label>
                <div className="grid grid-cols-2 gap-2">
                  {tools.map(tool => (
                    <Button
                      key={tool.type}
                      variant={activeTool === tool.type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTool(tool.type)}
                      className="flex items-center gap-2"
                    >
                      {tool.icon}
                      {tool.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Text Annotation Form */}
              {activeTool === 'text' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="annotation-text">Text</Label>
                    <Input
                      id="annotation-text"
                      value={currentAnnotation.text || ''}
                      onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter annotation text..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="font-size">Font Size: {currentAnnotation.fontSize}</Label>
                    <Slider
                      id="font-size"
                      min={12}
                      max={32}
                      step={2}
                      value={[currentAnnotation.fontSize || 16]}
                      onValueChange={([value]) => setCurrentAnnotation(prev => ({ ...prev, fontSize: value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={currentAnnotation.color || '#ffffff'}
                        onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, color: e.target.value }))}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={currentAnnotation.color || '#ffffff'}
                        onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={currentAnnotation.backgroundColor || '#000000'}
                        onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={currentAnnotation.backgroundColor || '#000000'}
                        onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="opacity">Opacity: {Math.round((currentAnnotation.opacity || 0.8) * 100)}%</Label>
                    <Slider
                      id="opacity"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={[currentAnnotation.opacity || 0.8]}
                      onValueChange={([value]) => setCurrentAnnotation(prev => ({ ...prev, opacity: value }))}
                    />
                  </div>

                  <Button
                    onClick={() => addAnnotation(currentAnnotation as AnnotationOptions)}
                    disabled={!currentAnnotation.text}
                    className="w-full"
                  >
                    Add Text Annotation
                  </Button>
                </div>
              )}

              {/* Current Annotations */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Current Annotations ({annotations.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {annotations.map((annotation, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm truncate">
                        {annotation.text || `${annotation.position?.x}, ${annotation.position?.y}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAnnotation(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="border rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-96 cursor-crosshair"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click to add text annotations or drag to draw shapes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PhotoAnnotation

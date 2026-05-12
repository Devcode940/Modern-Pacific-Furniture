'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Image as ImageIcon,
  Download,
  RotateCcw,
  Sparkles,
  Loader2,
  Move,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FeaturedProduct {
  id: string
  name: string
  images: string
  price: number
}

export function RoomVisualizer() {
  const [roomImage, setRoomImage] = useState<string | null>(null)
  const [roomFileName, setRoomFileName] = useState<string>('')
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null)
  const [furnitureScale, setFurnitureScale] = useState([50])
  const [furnitureOpacity, setFurnitureOpacity] = useState([80])
  const [furnitureRotation, setFurnitureRotation] = useState([0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [furniturePosition, setFurniturePosition] = useState({ x: 50, y: 50 })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, or WebP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB')
      return
    }
    setRoomFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setRoomImage(base64)
      setShowResult(false)
      setSelectedProduct(null)
    }
    reader.readAsDataURL(file)

    if (featuredProducts.length === 0) {
      fetchFeaturedProducts()
    }
  }, [featuredProducts.length])

  const fetchFeaturedProducts = async () => {
    try {
      const res = await fetch('/api/products?featured=true&limit=6')
      const data = await res.json()
      setFeaturedProducts(data.products || [])
    } catch {
      toast.error('Failed to load furniture options')
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleGenerate = async () => {
    if (!roomImage || !selectedProduct) {
      toast.error('Please upload a room photo and select a product')
      return
    }

    setIsGenerating(true)
    setShowResult(false)
    setFurniturePosition({ x: 50, y: 50 })

    try {
      await fetch('/api/visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: roomImage,
          productId: selectedProduct.id,
        }),
      })

      // Small delay for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setShowResult(true)
      toast.success('Visualization generated!')
    } catch {
      toast.error('Failed to generate visualization')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!roomImage || !selectedProduct || !resultRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const roomImg = new Image()
    const furnImg = new Image()

    roomImg.crossOrigin = 'anonymous'
    furnImg.crossOrigin = 'anonymous'

    roomImg.onload = () => {
      canvas.width = roomImg.naturalWidth
      canvas.height = roomImg.naturalHeight

      ctx.drawImage(roomImg, 0, 0)

      furnImg.onload = () => {
        const scaleVal = furnitureScale[0] / 100
        const size = Math.min(canvas.width, canvas.height) * 0.4 * scaleVal

        ctx.save()
        ctx.globalAlpha = furnitureOpacity[0] / 100
        ctx.translate(
          (canvas.width * furniturePosition.x) / 100,
          (canvas.height * furniturePosition.y) / 100
        )
        ctx.rotate((furnitureRotation[0] * Math.PI) / 180)
        ctx.drawImage(furnImg, -size / 2, -size / 2, size, size)
        ctx.restore()

        canvas.toBlob((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `furnicraft-visualization.png`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
          toast.success('Image downloaded!')
        }, 'image/png')
      }

      furnImg.src = selectedProduct.images.startsWith('[')
        ? (JSON.parse(selectedProduct.images) as string[])[0]
        : selectedProduct.images
    }

    roomImg.src = roomImage
  }

  const handleTryAnother = () => {
    setShowResult(false)
    setSelectedProduct(null)
    setFurnitureScale([50])
    setFurnitureOpacity([80])
    setFurnitureRotation([0])
    setFurniturePosition({ x: 50, y: 50 })
  }

  const handleResultMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!resultRef.current) return
    const rect = resultRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setFurniturePosition({ x, y })
  }

  const productImage = selectedProduct
    ? selectedProduct.images.startsWith('[')
      ? (JSON.parse(selectedProduct.images) as string[])[0]
      : selectedProduct.images
    : ''

  return (
    <section className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-white dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Eye className="h-4 w-4" />
            Room Visualizer
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Visualize Furniture in{' '}
            <span className="text-amber-700 dark:text-amber-500">Your Space</span>
          </h1>
          <p className="max-w-xl mx-auto text-muted-foreground">
            Upload a photo of your room, select a piece of furniture, and see how it looks before you buy.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            {/* Upload Area */}
            {!roomImage ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all',
                    isDragging
                      ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/30'
                      : 'border-stone-300 bg-card hover:border-amber-400 hover:bg-amber-50/50 dark:border-stone-600 dark:hover:border-amber-500'
                  )}
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Upload className="h-8 w-8 text-amber-700 dark:text-amber-500" />
                  </div>
                  <p className="mb-1 text-base font-semibold">Upload a photo of your room</p>
                  <p className="text-sm text-muted-foreground">or drag and drop</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Supports JPG, PNG, WebP (max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="relative overflow-hidden rounded-2xl border bg-card">
                  <img
                    src={roomImage}
                    alt="Your room"
                    className="w-full object-contain max-h-64"
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
                      {roomFileName}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-2 gap-1 bg-white/90 backdrop-blur-sm dark:bg-black/60 dark:text-white dark:border-transparent"
                    onClick={() => {
                      setRoomImage(null)
                      setShowResult(false)
                      setSelectedProduct(null)
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Change
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Product Selector */}
            {roomImage && !showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Label className="text-sm font-semibold">
                  Select furniture to place
                </Label>
                {featuredProducts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {featuredProducts.map((product) => {
                      const pImg = product.images.startsWith('[')
                        ? (JSON.parse(product.images) as string[])[0]
                        : product.images
                      return (
                        <motion.button
                          key={product.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedProduct(product)}
                          className={cn(
                            'relative overflow-hidden rounded-xl border-2 transition-all',
                            selectedProduct?.id === product.id
                              ? 'border-amber-700 shadow-md dark:border-amber-500'
                              : 'border-transparent hover:border-stone-300 dark:hover:border-stone-600'
                          )}
                        >
                          <div className="aspect-square overflow-hidden bg-stone-100 dark:bg-stone-800">
                            <img
                              src={pImg}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl border bg-card py-8">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading furniture...</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Controls Panel */}
            {roomImage && selectedProduct && !showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 rounded-2xl border bg-card p-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Size</Label>
                    <span className="text-xs text-muted-foreground">
                      {furnitureScale[0] < 33 ? 'Small' : furnitureScale[0] < 66 ? 'Medium' : 'Large'}
                    </span>
                  </div>
                  <Slider
                    value={furnitureScale}
                    onValueChange={setFurnitureScale}
                    min={10}
                    max={100}
                    step={1}
                    className="[&>div>div]:bg-amber-700 dark:[&>div>div]:bg-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Opacity</Label>
                    <span className="text-xs text-muted-foreground">{furnitureOpacity[0]}%</span>
                  </div>
                  <Slider
                    value={furnitureOpacity}
                    onValueChange={setFurnitureOpacity}
                    min={10}
                    max={100}
                    step={1}
                    className="[&>div>div]:bg-amber-700 dark:[&>div>div]:bg-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Rotation</Label>
                    <span className="text-xs text-muted-foreground">{furnitureRotation[0]}&deg;</span>
                  </div>
                  <Slider
                    value={furnitureRotation}
                    onValueChange={setFurnitureRotation}
                    min={0}
                    max={360}
                    step={1}
                    className="[&>div>div]:bg-amber-700 dark:[&>div>div]:bg-amber-500"
                  />
                </div>

                <Button
                  className="w-full bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI is visualizing your room...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Visualization
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Right Column: Preview / Result */}
          <div className="space-y-4">
            {!roomImage && !showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 dark:border-stone-700 dark:bg-stone-900/50"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your room preview will appear here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Upload a photo to get started
                  </p>
                </div>
              </motion.div>
            )}

            {/* Generating State */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
                >
                  <div className="relative mb-6">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-200 border-t-amber-700 dark:border-amber-800 dark:border-t-amber-500" />
                    <Sparkles className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-amber-700 dark:text-amber-500" />
                  </div>
                  <p className="text-base font-semibold text-amber-700 dark:text-amber-500">
                    AI is visualizing your room...
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Placing {selectedProduct?.name} in your space
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            {showResult && roomImage && productImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border bg-card overflow-hidden">
                  <div
                    ref={resultRef}
                    className="relative cursor-crosshair overflow-hidden"
                    onMouseMove={handleResultMouseMove}
                    style={{ minHeight: 300 }}
                  >
                    <img
                      src={roomImage}
                      alt="Room"
                      className="block w-full"
                      draggable={false}
                    />
                    <img
                      src={productImage}
                      alt="Furniture"
                      className="absolute pointer-events-none"
                      draggable={false}
                      style={{
                        left: `${furniturePosition.x}%`,
                        top: `${furniturePosition.y}%`,
                        transform: `translate(-50%, -50%) scale(${furnitureScale[0] / 50}) rotate(${furnitureRotation[0]}deg)`,
                        opacity: furnitureOpacity[0] / 100,
                        width: '150px',
                        height: '150px',
                        objectFit: 'contain',
                      }}
                    />
                    <div className="absolute left-2 bottom-2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
                      <Move className="h-3.5 w-3.5 text-white/80" />
                      <span className="text-xs text-white/80">Click to reposition</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="flex-1 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={handleTryAnother}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try Another Product
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

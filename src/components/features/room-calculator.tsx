'use client'

import { useState, useMemo } from 'react'
import { Ruler, Maximize, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type SpaceLevel = 'plenty' | 'moderate' | 'tight' | 'too-big'

interface SpaceResult {
  percentage: number
  level: SpaceLevel
  remainingArea: number
  remainingWidth: number
  remainingDepth: number
  tip: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ReactNode
}

function calculateResult(
  roomW: number,
  roomD: number,
  furnW: number,
  furnD: number,
  _roomH?: number,
  furnH?: number
): SpaceResult | null {
  if (roomW <= 0 || roomD <= 0 || furnW <= 0 || furnD <= 0) return null
  if (furnW > roomW || furnD > roomD) {
    return {
      percentage: 100,
      level: 'too-big',
      remainingArea: 0,
      remainingWidth: Math.max(0, roomW - furnW),
      remainingDepth: Math.max(0, roomD - furnD),
      tip: 'This furniture piece is too large for the room. Consider a smaller size.',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    }
  }

  // Height clearance check
  if (_roomH && furnH && furnH > _roomH) {
    return {
      percentage: 100,
      level: 'too-big',
      remainingArea: 0,
      remainingWidth: Math.max(0, roomW - furnW),
      remainingDepth: Math.max(0, roomD - furnD),
      tip: 'The furniture is taller than your room height! It will not fit vertically.',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    }
  }

  const roomArea = roomW * roomD
  const furnArea = furnW * furnD
  const percentage = (furnArea / roomArea) * 100
  const remainingArea = roomArea - furnArea

  // Center the furniture in the room for the visual
  const remainingWidth = roomW - furnW
  const remainingDepth = roomD - furnD

  if (percentage < 40) {
    return {
      percentage,
      level: 'plenty',
      remainingArea,
      remainingWidth,
      remainingDepth,
      tip: 'Great choice! The room will feel spacious and open with plenty of walking room around the furniture.',
      color: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    }
  } else if (percentage < 60) {
    return {
      percentage,
      level: 'moderate',
      remainingArea,
      remainingWidth,
      remainingDepth,
      tip: 'Good fit! The room will have a comfortable balance of furniture and open space.',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      icon: <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    }
  } else if (percentage < 80) {
    return {
      percentage,
      level: 'tight',
      remainingArea,
      remainingWidth,
      remainingDepth,
      tip: 'It will be a snug fit. Make sure you have enough clearance for doors and walkways.',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      icon: <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
    }
  } else {
    return {
      percentage,
      level: 'too-big',
      remainingArea,
      remainingWidth,
      remainingDepth,
      tip: 'This furniture takes up most of the room. Consider a smaller piece or a bigger room.',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    }
  }
}

const furnitureColors: Record<SpaceLevel, string> = {
  plenty: 'bg-emerald-500/30 border-emerald-500',
  moderate: 'bg-amber-500/30 border-amber-500',
  tight: 'bg-orange-500/30 border-orange-500',
  'too-big': 'bg-red-500/30 border-red-500',
}

const furnitureLabels: Record<SpaceLevel, string> = {
  plenty: 'Plenty of Space',
  moderate: 'Moderate Fit',
  tight: 'Tight Fit',
  'too-big': 'Too Big!',
}

export function RoomCalculator() {
  const [roomWidth, setRoomWidth] = useState('4')
  const [roomLength, setRoomLength] = useState('3')
  const [roomHeight, setRoomHeight] = useState('')
  const [furnitureWidth, setFurnitureWidth] = useState('2')
  const [furnitureDepth, setFurnitureDepth] = useState('1')
  const [furnitureHeight, setFurnitureHeight] = useState('')

  const result = useMemo(() => {
    const rw = parseFloat(roomWidth) || 0
    const rl = parseFloat(roomLength) || 0
    const rh = parseFloat(roomHeight) || 0
    const fw = parseFloat(furnitureWidth) || 0
    const fd = parseFloat(furnitureDepth) || 0
    const fh = parseFloat(furnitureHeight) || 0
    return calculateResult(rw, rl, fw, fd, rh || undefined, fh || undefined)
  }, [roomWidth, roomLength, roomHeight, furnitureWidth, furnitureDepth, furnitureHeight])

  // Visual scale: fit the room into a max visual area
  const visualScale = useMemo(() => {
    const rw = parseFloat(roomWidth) || 4
    const rl = parseFloat(roomLength) || 3
    const maxVisualW = 320
    const maxVisualD = 240
    const scaleW = maxVisualW / rw
    const scaleD = maxVisualD / rl
    return Math.min(scaleW, scaleD)
  }, [roomWidth, roomLength])

  const rw = parseFloat(roomWidth) || 0
  const rl = parseFloat(roomLength) || 0
  const fw = parseFloat(furnitureWidth) || 0
  const fd = parseFloat(furnitureDepth) || 0

  const roomVisualW = rw * visualScale
  const roomVisualD = rl * visualScale
  const furnVisualW = Math.min(fw * visualScale, roomVisualW)
  const furnVisualD = Math.min(fd * visualScale, roomVisualD)

  // Center furniture in room
  const furnLeft = (roomVisualW - furnVisualW) / 2
  const furnTop = (roomVisualD - furnVisualD) / 2

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <Ruler className="h-5 w-5 text-amber-700 dark:text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Will It Fit?</h2>
          <p className="text-sm text-muted-foreground">
            Check if your furniture will fit in your room
          </p>
        </div>
      </div>

      {/* Room Dimensions */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
          <Maximize className="h-4 w-4 text-muted-foreground" />
          Room Dimensions
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="room-w" className="text-xs">
              Width (m)
            </Label>
            <Input
              id="room-w"
              type="number"
              step="0.1"
              min="0.5"
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
              placeholder="4"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-d" className="text-xs">
              Length (m)
            </Label>
            <Input
              id="room-d"
              type="number"
              step="0.1"
              min="0.5"
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              placeholder="3"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-h" className="text-xs">
              Height (m)
              <span className="ml-1 text-muted-foreground">(opt.)</span>
            </Label>
            <Input
              id="room-h"
              type="number"
              step="0.1"
              min="0.5"
              value={roomHeight}
              onChange={(e) => setRoomHeight(e.target.value)}
              placeholder="2.8"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Furniture Dimensions */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
          <Maximize className="h-4 w-4 text-muted-foreground" />
          Furniture Dimensions
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="furn-w" className="text-xs">
              Width (m)
            </Label>
            <Input
              id="furn-w"
              type="number"
              step="0.1"
              min="0.1"
              value={furnitureWidth}
              onChange={(e) => setFurnitureWidth(e.target.value)}
              placeholder="2"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="furn-d" className="text-xs">
              Depth (m)
            </Label>
            <Input
              id="furn-d"
              type="number"
              step="0.1"
              min="0.1"
              value={furnitureDepth}
              onChange={(e) => setFurnitureDepth(e.target.value)}
              placeholder="1"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="furn-h" className="text-xs">
              Height (m)
              <span className="ml-1 text-muted-foreground">(opt.)</span>
            </Label>
            <Input
              id="furn-h"
              type="number"
              step="0.1"
              min="0.1"
              value={furnitureHeight}
              onChange={(e) => setFurnitureHeight(e.target.value)}
              placeholder="0.9"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Visual Representation */}
      {result && rw > 0 && rl > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top-Down Room View */}
          <div className="flex flex-col items-center">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Top-Down View
            </p>
            <div
              className="relative rounded-lg border-2 border-stone-400 bg-stone-100 dark:border-stone-600 dark:bg-stone-800"
              style={{
                width: `${roomVisualW}px`,
                height: `${roomVisualD}px`,
              }}
            >
              {/* Room dimensions label */}
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                {rw}m
              </span>
              <span className="absolute -left-5 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-muted-foreground">
                {rl}m
              </span>

              {/* Grid lines for visual reference */}
              {Array.from({ length: Math.floor(rw) }).map((_, i) => (
                <div
                  key={`vw-${i}`}
                  className="absolute top-0 bottom-0 border-l border-dashed border-stone-300 dark:border-stone-600"
                  style={{ left: `${((i + 1) / rw) * 100}%` }}
                />
              ))}
              {Array.from({ length: Math.floor(rl) }).map((_, i) => (
                <div
                  key={`vd-${i}`}
                  className="absolute left-0 right-0 border-t border-dashed border-stone-300 dark:border-stone-600"
                  style={{ top: `${((i + 1) / rl) * 100}%` }}
                />
              ))}

              {/* Furniture piece */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={cn(
                  'absolute rounded border-2 flex items-center justify-center',
                  furnitureColors[result.level]
                )}
                style={{
                  width: `${Math.max(furnVisualW, 1)}px`,
                  height: `${Math.max(furnVisualD, 1)}px`,
                  left: `${furnLeft}px`,
                  top: `${furnTop}px`,
                }}
              >
                <span className="text-[9px] font-bold text-center leading-tight px-0.5 drop-shadow-sm">
                  {fw}×{fd}m
                </span>
              </motion.div>
            </div>
          </div>

          {/* Result Card */}
          <motion.div
            key={result.level}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'mt-5 rounded-xl border p-4',
              result.bgColor,
              result.borderColor
            )}
          >
            <div className="flex items-start gap-3">
              {result.icon}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={cn('text-sm font-bold', result.color)}>
                    {furnitureLabels[result.level]}
                  </h4>
                  <span className={cn('text-sm font-bold', result.color)}>
                    {Math.round(result.percentage)}%
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {result.tip}
                </p>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Room Area</p>
                    <p className="text-xs font-semibold">
                      {(rw * rl).toFixed(1)} m²
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Furniture Area</p>
                    <p className="text-xs font-semibold">
                      {(fw * fd).toFixed(1)} m²
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Remaining</p>
                    <p className="text-xs font-semibold">
                      {result.remainingArea.toFixed(1)} m²
                    </p>
                  </div>
                </div>

                {/* Clearance info */}
                {result.level !== 'too-big' && (
                  <div className="mt-2 flex gap-3">
                    <span className="text-[10px] text-muted-foreground">
                      Side clearance: {result.remainingWidth.toFixed(1)}m total
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Front/back: {result.remainingDepth.toFixed(1)}m total
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Ruler className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Enter room and furniture dimensions to see if it will fit
          </p>
        </div>
      )}
    </div>
  )
}

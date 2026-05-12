'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, ShoppingCart, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'

interface QuizProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  images: string
  rating: number
  reviewCount: number
  stock: number
  category: { id: string; name: string; slug: string }
}

interface ColorOption {
  id: string
  label: string
  description: string
  gradient: string
}

interface MaterialOption {
  id: string
  label: string
  description: string
  icon: string
}

interface SpaceOption {
  id: string
  label: string
  description: string
  gradient: string
}

const colorOptions: ColorOption[] = [
  {
    id: 'neutral',
    label: 'Neutral',
    description: 'Whites, grays, beiges',
    gradient: 'linear-gradient(135deg, #f5f0eb 0%, #d4c5b5 50%, #e8e0d8 100%)',
  },
  {
    id: 'warm',
    label: 'Warm',
    description: 'Terracotta, mustard, olive',
    gradient: 'linear-gradient(135deg, #c97c5d 0%, #d4a34a 50%, #7d8c4e 100%)',
  },
  {
    id: 'cool',
    label: 'Cool',
    description: 'Sage, blue-gray, dusty rose',
    gradient: 'linear-gradient(135deg, #8fa882 0%, #8a9da8 50%, #c49a9a 100%)',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Navy, emerald, burgundy',
    gradient: 'linear-gradient(135deg, #1a3a5c 0%, #1b5e3b 50%, #6b2737 100%)',
  },
]

const materialOptions: MaterialOption[] = [
  {
    id: 'wood',
    label: 'Natural Wood',
    description: 'Oak, walnut, teak',
    icon: '🪵',
  },
  {
    id: 'metal',
    label: 'Metal & Glass',
    description: 'Industrial, modern',
    icon: '🔩',
  },
  {
    id: 'fabric',
    label: 'Soft Fabrics',
    description: 'Velvet, linen, cotton',
    icon: '🧵',
  },
  {
    id: 'mixed',
    label: 'Mixed Materials',
    description: 'Eclectic, layered',
    icon: '✨',
  },
]

const spaceOptions: SpaceOption[] = [
  {
    id: 'minimal',
    label: 'Minimal & Clean',
    description: 'Less is more',
    gradient: 'linear-gradient(135deg, #faf9f7 0%, #f0ece6 100%)',
  },
  {
    id: 'cozy',
    label: 'Cozy & Inviting',
    description: 'Warm textures, layers',
    gradient: 'linear-gradient(135deg, #f0e6d6 0%, #e0d0be 100%)',
  },
  {
    id: 'bold',
    label: 'Bold & Expressive',
    description: 'Statement pieces, patterns',
    gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
  },
]

const styleDescriptions: Record<string, string> = {
  modern:
    'You gravitate towards sleek lines, functional design, and a clutter-free environment. Your ideal space features clean silhouettes, a neutral palette with warm accents, and furniture that doubles as art. Think mid-century meets contemporary — every piece serves a purpose and makes a statement.',
  scandinavian:
    'You embrace the "hygge" philosophy — creating warmth and comfort through thoughtful simplicity. Your space celebrates natural light, organic materials, and a connection to nature. Light woods, soft textiles, and minimalist forms create a serene sanctuary that feels effortlessly stylish.',
  industrial:
    'You find beauty in raw, unfinished elements and architectural details. Your space tells a story through exposed textures, metal accents, and repurposed materials. It is bold yet grounded — a perfect blend of form and function with an edgy, urban soul.',
  rustic:
    'You are drawn to the warmth and character of natural materials and handcrafted pieces. Your space feels like a retreat — rich wood tones, textured fabrics, and earthy colors create an environment that is both welcoming and deeply personal, celebrating imperfection.',
  glam:
    'You love luxury, elegance, and a touch of drama. Your space features sumptuous fabrics, metallic accents, and statement pieces that command attention. Rich colors, plush textures, and curated accessories create an atmosphere of sophisticated indulgence.',
}

const styleDisplayNames: Record<string, string> = {
  modern: 'Modern Contemporary',
  scandinavian: 'Scandinavian Modern',
  industrial: 'Urban Industrial',
  rustic: 'Rustic Warmth',
  glam: 'Glam Luxe',
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

export function InteriorDesignQuiz() {
  const { quizAnswers, setQuizAnswers, setQuizStyle, navigate, addToCartOptimistic, sessionId } = useStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    style: string
    scores: Record<string, number>
    products: QuizProduct[]
  } | null>(null)
  const [selectedColor, setSelectedColor] = useState(quizAnswers.color || '')
  const [selectedMaterial, setSelectedMaterial] = useState(quizAnswers.material || '')
  const [selectedSpace, setSelectedSpace] = useState(quizAnswers.space || '')

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep === 1 && !selectedColor) return
    if (currentStep === 2 && !selectedMaterial) return
    if (currentStep === 3 && !selectedSpace) return

    if (currentStep === 3) {
      handleSubmit()
      return
    }

    setDirection(1)
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (currentStep === 1) return
    setDirection(-1)
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    const answers = {
      color: selectedColor,
      material: selectedMaterial,
      space: selectedSpace,
    }
    setQuizAnswers(answers)
    setLoading(true)

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      setResults(data)
      setQuizStyle(data.style)
      setDirection(1)
      setCurrentStep(4)
    } catch {
      toast.error('Failed to get recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: QuizProduct) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      const item = await res.json()
      addToCartOptimistic(item)
      toast.success(`${product.name} added to cart!`)
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  const handleRetake = () => {
    setSelectedColor('')
    setSelectedMaterial('')
    setSelectedSpace('')
    setResults(null)
    setDirection(-1)
    setCurrentStep(1)
  }

  const canProceed = () => {
    if (currentStep === 1) return !!selectedColor
    if (currentStep === 2) return !!selectedMaterial
    if (currentStep === 3) return !!selectedSpace
    return true
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-stone-50/50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
            Interior Design Quiz
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Discover Your <span className="text-amber-700 dark:text-amber-500">Perfect Style</span>
          </h1>
          <p className="text-muted-foreground">
            Answer a few questions and we will curate furniture recommendations just for you.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Step {currentStep <= 3 ? currentStep : totalSteps} of {totalSteps}
            </span>
            <span className="text-amber-700 dark:text-amber-500 font-semibold">
              {currentStep <= 3 ? `${Math.round(progress)}%` : 'Complete!'}
            </span>
          </div>
          <Progress value={currentStep <= 3 ? progress : 100} className="h-2 [&>div]:bg-amber-700 dark:[&>div]:bg-amber-500" />
        </div>

        {/* Quiz Steps */}
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Colors */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
                What colors do you gravitate towards?
              </h2>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                Choose the palette that speaks to you most
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {colorOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedColor(option.id)}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border-2 p-1 transition-all',
                      selectedColor === option.id
                        ? 'border-amber-700 shadow-lg shadow-amber-700/20 dark:border-amber-500 dark:shadow-amber-500/20'
                        : 'border-transparent hover:border-stone-300 dark:hover:border-stone-600'
                    )}
                  >
                    <div
                      className="aspect-[4/3] rounded-xl"
                      style={{ background: option.gradient }}
                    />
                    <div className="p-3 text-left">
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    {selectedColor === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-white dark:bg-amber-500"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Materials */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
                What materials do you prefer?
              </h2>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                Select the textures that resonate with your style
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {materialOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedMaterial(option.id)}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border-2 bg-card p-6 text-center transition-all',
                      selectedMaterial === option.id
                        ? 'border-amber-700 shadow-lg shadow-amber-700/20 dark:border-amber-500 dark:shadow-amber-500/20'
                        : 'border-transparent hover:border-stone-300 dark:hover:border-stone-600'
                    )}
                  >
                    <div className="mb-3 text-5xl">{option.icon}</div>
                    <p className="font-semibold">{option.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                    {selectedMaterial === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-white dark:bg-amber-500"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Space */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
                How would you describe your ideal space?
              </h2>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                Think about the mood you want to create
              </p>
              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                {spaceOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedSpace(option.id)}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border-2 transition-all',
                      selectedSpace === option.id
                        ? 'border-amber-700 shadow-lg shadow-amber-700/20 dark:border-amber-500 dark:shadow-amber-500/20'
                        : 'border-transparent hover:border-stone-300 dark:hover:border-stone-600'
                    )}
                  >
                    <div
                      className="aspect-square rounded-xl sm:aspect-[3/4]"
                      style={{ background: option.gradient }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/0 transition-colors group-hover:bg-black/10">
                      <p
                        className={cn(
                          'text-lg font-bold',
                          option.id === 'bold' ? 'text-white' : 'text-stone-800'
                        )}
                      >
                        {option.label}
                      </p>
                      <p
                        className={cn(
                          'mt-1 text-sm',
                          option.id === 'bold' ? 'text-white/80' : 'text-stone-600'
                        )}
                      >
                        {option.description}
                      </p>
                    </div>
                    {selectedSpace === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-white dark:bg-amber-500"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && results && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {/* Style Reveal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center dark:from-amber-950/30 dark:to-orange-950/30 sm:p-8"
              >
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <Sparkles className="h-7 w-7 text-amber-700 dark:text-amber-500" />
                </div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">Your style is</p>
                <h2 className="mb-4 text-2xl font-bold text-amber-700 dark:text-amber-500 sm:text-3xl">
                  {styleDisplayNames[results.style] || results.style}
                </h2>
                <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {styleDescriptions[results.style] || 'Based on your preferences, we have curated a collection that perfectly matches your unique style.'}
                </p>
              </motion.div>

              {/* Recommended Products */}
              <h3 className="mb-4 text-lg font-bold">
                Curated For You
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({results.products.length} pieces)
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.products.map((product, index) => {
                  const images: string[] = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
                  const discount = product.compareAtPrice
                    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
                    : 0
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.08 }}
                      className="group overflow-hidden rounded-xl border bg-card"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {images[0] ? (
                          <img
                            src={images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                            <span className="text-4xl text-muted-foreground/30">🪑</span>
                          </div>
                        )}
                        {discount > 0 && (
                          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground">{product.category.name}</p>
                        <h4 className="mt-0.5 font-semibold leading-tight line-clamp-1">{product.name}</h4>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-bold text-amber-700 dark:text-amber-500">
                            {formatCurrency(product.price)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                        <Button
                          className="mt-3 w-full bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                          Add to Cart
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Retake */}
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={handleRetake}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake Quiz
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-700 dark:border-amber-800 dark:border-t-amber-500" />
            <p className="text-sm text-muted-foreground">Analyzing your style preferences...</p>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {currentStep <= 3 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex items-center justify-between"
          >
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {currentStep === 3 ? (
                <>
                  See Results
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

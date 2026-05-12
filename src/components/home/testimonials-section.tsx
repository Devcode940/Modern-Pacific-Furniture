'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface Testimonial {
  id: number
  name: string
  role: string
  rating: number
  comment: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Wanjiru Kamau',
    role: 'Interior Designer',
    rating: 5,
    comment:
      'Modern Furniture Pacific has been my go-to for client projects here in Nairobi. The quality of their living room sofas is exceptional — the craftsmanship really shows. My clients always ask where I sourced the furniture.',
    avatar: 'WK',
  },
  {
    id: 2,
    name: 'James Mwangi',
    role: 'Homeowner',
    rating: 5,
    comment:
      'We furnished our entire home with Modern Furniture Pacific pieces. The dining table is a masterpiece — every guest compliments it. The delivery to Karen was smooth and the quality is outstanding.',
    avatar: 'JM',
  },
  {
    id: 3,
    name: 'Grace Nyambura',
    role: 'Architect',
    rating: 4,
    comment:
      'The standing desk transformed my home office in Westlands. It is beautifully crafted and the finish is gorgeous. The smooth electric lift is whisper-quiet. Best purchase I made this year.',
    avatar: 'GN',
  },
  {
    id: 4,
    name: 'Peter Ochieng',
    role: 'Business Owner',
    rating: 5,
    comment:
      'The outdoor furniture set has held up incredibly well through Nairobi rains and sunshine. The cushions are still plush and the wicker looks brand new after a year. Modern Furniture Pacific really delivers on durability.',
    avatar: 'PO',
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
          What Our Customers Say
        </h2>
        <p className="mb-12 text-muted-foreground">
          Join thousands of happy homeowners and designers
        </p>

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-2xl"
            >
              <Quote className="mx-auto mb-6 h-10 w-10 text-amber-200 dark:text-amber-800" />

              <div className="mb-4 flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonials[current].rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <p className="mb-6 text-lg leading-relaxed text-foreground/90 md:text-xl">
                &ldquo;{testimonials[current].comment}&rdquo;
              </p>

              <div className="flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {testimonials[current].avatar}
                </div>
                <div className="text-left">
                  <p className="font-semibold">{testimonials[current].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[current].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous testimonial</span>
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1)
                    setCurrent(i)
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === current
                      ? 'w-6 bg-amber-700 dark:bg-amber-500'
                      : 'w-2 bg-muted-foreground/30'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

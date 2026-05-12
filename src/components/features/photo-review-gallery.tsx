'use client'

import { useState, useEffect } from 'react'
import { Star, Camera, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotoItem {
  url: string
  author: string
  rating: number
  productName: string
  reviewId: string
}

interface PhotoReviewGalleryProps {
  productId: string
}

// Demo/placeholder photos from the product images directory
const DEMO_PHOTOS: PhotoItem[] = [
  {
    url: '/images/products/modena-sofa.png',
    author: 'Sarah M.',
    rating: 5,
    productName: 'Modena Sofa',
    reviewId: 'demo-1',
  },
  {
    url: '/images/products/copenhagen-corduroy-sofa.png',
    author: 'James K.',
    rating: 4,
    productName: 'Copenhagen Corduroy Sofa',
    reviewId: 'demo-2',
  },
  {
    url: '/images/products/coffee-table-walnut.png',
    author: 'Amina W.',
    rating: 5,
    productName: 'Coffee Table Walnut',
    reviewId: 'demo-3',
  },
  {
    url: '/images/products/dining-table-oak.png',
    author: 'David O.',
    rating: 4,
    productName: 'Dining Table Oak',
    reviewId: 'demo-4',
  },
  {
    url: '/images/products/bed-platform-walnut.png',
    author: 'Grace N.',
    rating: 5,
    productName: 'Bed Platform Walnut',
    reviewId: 'demo-5',
  },
  {
    url: '/images/products/bookcase-oak.png',
    author: 'Peter T.',
    rating: 4,
    productName: 'Bookcase Oak',
    reviewId: 'demo-6',
  },
  {
    url: '/images/products/desk-ergonomic.png',
    author: 'Linda C.',
    rating: 5,
    productName: 'Ergonomic Desk',
    reviewId: 'demo-7',
  },
  {
    url: '/images/products/nightstand-walnut.png',
    author: 'Martin R.',
    rating: 4,
    productName: 'Nightstand Walnut',
    reviewId: 'demo-8',
  },
  {
    url: '/images/products/elegant-coffee-table.png',
    author: 'Esther J.',
    rating: 5,
    productName: 'Elegant Coffee Table',
    reviewId: 'demo-9',
  },
]

export function PhotoReviewGallery({ productId }: PhotoReviewGalleryProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setLoading(true)
        const reviews = data.product?.reviews || []
        const reviewPhotos: PhotoItem[] = []

        for (const review of reviews) {
          let parsedPhotos: string[] = []
          try {
            parsedPhotos = review.photos ? JSON.parse(review.photos) : []
          } catch {
            parsedPhotos = []
          }

          for (const photoUrl of parsedPhotos) {
            reviewPhotos.push({
              url: photoUrl,
              author: review.author,
              rating: review.rating,
              productName: data.product.name,
              reviewId: review.id,
            })
          }
        }

        // If no real review photos, supplement with demo photos
        if (reviewPhotos.length === 0) {
          // Pick a subset of demo photos
          const shuffled = [...DEMO_PHOTOS].sort(() => Math.random() - 0.5)
          setPhotos(shuffled.slice(0, 6))
        } else {
          // Add demo photos to fill up the grid if less than 4
          if (reviewPhotos.length < 4) {
            const shuffled = [...DEMO_PHOTOS].sort(() => Math.random() - 0.5)
            const extra = shuffled.slice(0, 6 - reviewPhotos.length).map((p) => ({
              ...p,
              productName: data.product.name,
            }))
            setPhotos([...reviewPhotos, ...extra])
          } else {
            setPhotos(reviewPhotos)
          }
        }
      })
      .catch(() => {
        if (cancelled) return
        // On error, show demo photos
        const shuffled = [...DEMO_PHOTOS].sort(() => Math.random() - 0.5)
        setPhotos(shuffled.slice(0, 6))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [productId])

  if (loading) {
    return (
      <section className="mt-12">
        <div className="mb-6 h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </section>
    )
  }

  if (photos.length === 0) return null

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null

  const handleLightboxPrev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === 0 ? photos.length - 1 : lightboxIndex - 1)
  }

  const handleLightboxNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === photos.length - 1 ? 0 : lightboxIndex + 1)
  }

  return (
    <>
      <section className="mt-12">
        <div className="mb-6 flex items-center gap-3">
          <Camera className="h-5 w-5 text-amber-700 dark:text-amber-500" />
          <h2 className="text-xl font-bold">Customer Photos</h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {photos.length} photos
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <AnimatePresence>
            {photos.map((photo, i) => (
              <motion.button
                key={photo.reviewId + '-' + i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                onClick={() => setLightboxIndex(i)}
                className="group relative aspect-square overflow-hidden rounded-xl border bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              >
                {/* Photo */}
                <img
                  src={photo.url}
                  alt={`${photo.author}'s photo of ${photo.productName}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="p-3">
                    <p className="text-xs font-semibold text-white truncate">
                      {photo.author}
                    </p>
                    <p className="text-[10px] text-white/70 truncate mt-0.5">
                      {photo.productName}
                    </p>
                    <div className="mt-1.5 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className={`h-3 w-3 ${
                            si < photo.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-white/30 text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null)
        }}
      >
        <DialogContent className="max-w-3xl border-0 bg-black/95 p-0 sm:rounded-xl">
          <DialogTitle className="sr-only">
            Photo by {currentPhoto?.author}
          </DialogTitle>

          {currentPhoto && (
            <div className="relative flex flex-col items-center">
              {/* Close button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Close lightbox"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={handleLightboxPrev}
                    className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleLightboxNext}
                    className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Main image */}
              <div className="relative w-full">
                <img
                  src={currentPhoto.url}
                  alt={`${currentPhoto.author}'s photo of ${currentPhoto.productName}`}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>

              {/* Info bar at bottom */}
              <div className="flex w-full items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {currentPhoto.author}
                  </p>
                  <p className="text-xs text-white/60">
                    {currentPhoto.productName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < currentPhoto.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-white/20 text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white/40">
                    {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {photos.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

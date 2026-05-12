'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ArrowLeft, Star, Minus, Plus, ShoppingCart, ChevronRight,
  Truck, Shield, RotateCcw, Package, Headphones,
  Camera, Upload, CheckCircle2, PackageCheck, AlertCircle, Loader2,
  MessageSquare, ThumbsUp, X, BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'
import { formatCurrency, cn } from '@/lib/utils'
import { RecentlyViewed } from '@/components/features/recently-viewed'
import { WaitlistButton } from '@/components/features/waitlist-button'
import { ProductQA } from '@/components/features/product-qa'
import { QuickViewModal } from '@/components/features/quick-view-modal'
import { PhotoReviewGallery } from '@/components/features/photo-review-gallery'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  images: string
  specs: string | null
  rating: number
  reviewCount: number
  stock: number
  category: { id: string; name: string; slug: string }
  tags: string | null
  dimensions: string | null
}

interface Review {
  id: string
  author: string
  rating: number
  comment: string | null
  verified: boolean
  helpful: number
  createdAt: string
}

// Stock status helper
function getStockStatus(stock: number): {
  label: string
  color: string
  bgColor: string
  textColor: string
  icon: React.ReactNode
  showWarning: boolean
  message: string
} {
  if (stock === 0) {
    return {
      label: 'Out of Stock',
      color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      textColor: 'text-red-600',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      showWarning: true,
      message: 'This item is currently out of stock. Join the waitlist to be notified when available.',
    }
  }
  if (stock <= 3) {
    return {
      label: `Only ${stock} Left`,
      color: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      textColor: 'text-red-600',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      showWarning: true,
      message: `Hurry! Only ${stock} unit${stock > 1 ? 's' : ''} remaining — order before it's gone!`,
    }
  }
  if (stock <= 7) {
    return {
      label: `Low Stock (${stock})`,
      color: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      textColor: 'text-orange-600',
      icon: <PackageCheck className="h-3.5 w-3.5" />,
      showWarning: true,
      message: 'Stock is running low. Order soon to avoid disappointment.',
    }
  }
  return {
    label: 'In Stock',
    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    textColor: 'text-emerald-600',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    showWarning: false,
    message: 'Ready to ship! Order now for fast delivery.',
  }
}

const trustBadges = [
  { icon: Truck, label: 'Free Delivery', sublabel: 'Orders over KSh 30,000' },
  { icon: Shield, label: '5-Year Warranty', sublabel: 'Full coverage' },
  { icon: RotateCcw, label: '30-Day Returns', sublabel: 'No questions asked' },
  { icon: BadgeCheck, label: 'Quality Guaranteed', sublabel: 'Premium materials' },
  { icon: Package, label: 'Free Assembly', sublabel: 'Professional setup' },
  { icon: Headphones, label: '24/7 Support', sublabel: 'WhatsApp & phone' },
]

export function ProductDetail() {
  const { selectedProductId, navigate, addToCartOptimistic, sessionId } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // Review form state
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  useEffect(() => {
    if (!selectedProductId) return

    fetch(`/api/products/${selectedProductId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product)
        setReviews(data.product.reviews || [])
        setRelatedProducts(data.relatedProducts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedProductId])

  const handleAddToCart = async () => {
    if (!product) return
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({ productId: product.id, quantity }),
      })
      const item = await res.json()
      addToCartOptimistic(item)
      toast.success(`${quantity}x ${product.name} added to cart!`)
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  const handlePhotoUpload = () => {
    // Simulate photo upload (base64 from file input)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setReviewPhoto(ev.target?.result as string)
          toast.success('Photo attached!')
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleSubmitReview = async () => {
    if (!product || !reviewName || reviewRating === 0) {
      toast.error('Please enter your name and rating')
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review: {
            author: reviewName,
            rating: reviewRating,
            comment: reviewComment || null,
            photo: reviewPhoto,
          },
        }),
      })
      if (res.ok) {
        const newReview: Review = {
          id: `temp-${Date.now()}`,
          author: reviewName,
          rating: reviewRating,
          comment: reviewComment || null,
          createdAt: new Date().toISOString(),
        }
        setReviews([newReview, ...reviews])
        setReviewName('')
        setReviewRating(0)
        setReviewComment('')
        setReviewPhoto(null)
        toast.success('Review submitted! Thank you.')
      }
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate('shop')} className="mt-4">
          Back to Shop
        </Button>
      </div>
    )
  }

  const images: string[] = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
  const specs = product.specs ? (() => { try { return JSON.parse(product.specs) } catch { return null } })() : null
  const tags = product.tags ? (() => { try { return JSON.parse(product.tags) } catch { return [] } })() : []
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0
  const stockStatus = getStockStatus(product.stock)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate('home')}
          className="transition-colors hover:text-foreground"
        >
          Home
        </button>
        <ChevronRight className="h-3 w-3" />
        <button
          onClick={() => navigate('shop')}
          className="transition-colors hover:text-foreground"
        >
          Shop
        </button>
        <ChevronRight className="h-3 w-3" />
        <button
          onClick={() => navigate('shop', { category: product.category.slug })}
          className="transition-colors hover:text-foreground"
        >
          {product.category.name}
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('shop')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shop
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative mb-4 overflow-hidden rounded-2xl border bg-card">
            <div className="relative aspect-square">
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <span className="text-6xl text-muted-foreground/30">🪑</span>
                </div>
              )}
              {/* Badges */}
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {discount > 0 && (
                  <Badge className="bg-red-500 text-white hover:bg-red-600">
                    -{discount}% OFF
                  </Badge>
                )}
                <Badge className={cn('gap-1', stockStatus.color)}>
                  {stockStatus.icon}
                  {stockStatus.label}
                </Badge>
              </div>
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === selectedImage
                      ? 'border-amber-700 dark:border-amber-500'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs capitalize"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="mb-2 text-3xl font-bold tracking-tight">{product.name}</h1>

          {/* Rating */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-amber-700 dark:text-amber-500">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            {discount > 0 && (
              <Badge className="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                Save {formatCurrency(product.compareAtPrice! - product.price)}
              </Badge>
            )}
          </div>

          {/* Stock Status Banner */}
          <div className={cn('mb-4 rounded-lg px-3 py-2 flex items-center gap-2', stockStatus.bgColor)}>
            {stockStatus.icon}
            <p className={cn('text-sm font-medium', stockStatus.textColor)}>
              {stockStatus.message}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Description */}
          <Accordion type="single" collapsible defaultValue="description">
            <AccordionItem value="description">
              <AccordionTrigger className="text-base font-semibold">
                Description
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            {specs && (
              <AccordionItem value="specs">
                <AccordionTrigger className="text-base font-semibold">
                  Specifications
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </p>
                        <p className="mt-0.5 text-sm font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          <Separator className="my-4" />

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex h-10 w-12 items-center justify-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-none"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1 bg-amber-700 text-base hover:bg-amber-800"
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>

          {product.stock === 0 && (
            <WaitlistButton productId={product.id} />
          )}

          {product.stock > 0 && product.stock <= 3 && (
            <p className="mt-2 text-sm text-orange-600">
              Only {product.stock} left in stock — order soon
            </p>
          )}

          <Separator className="my-6" />

          {/* Enhanced Trust Badges */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-1 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <badge.icon className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                </div>
                <span className="text-[10px] font-semibold leading-tight">{badge.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews with Photo Upload */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Customer Reviews ({reviews.length})</h2>
        </div>

        {/* Review Form */}
        <div className="mb-8 rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Write a Review</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name *</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. John K."
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating *</label>
                <div className="flex gap-1 pt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewRating(i + 1)}
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          i < (hoverRating || reviewRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Review</label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3}
              />
            </div>
            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Photo (optional)</label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePhotoUpload}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {reviewPhoto ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {reviewPhoto && (
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                    <img src={reviewPhoto} alt="Review photo" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setReviewPhoto(null)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      x
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview || !reviewName || reviewRating === 0}
              className="bg-amber-700 hover:bg-amber-800"
            >
              {submittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </div>

        {/* Reviews List — compact, click to expand */}
        <div className="grid gap-3">
          {reviews.map((review) => (
            <button
              key={review.id}
              onClick={() => setSelectedReview(review)}
              className="flex items-center justify-between rounded-xl border bg-card p-4 text-left transition-all hover:border-amber-700/40 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {review.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{review.author}</span>
                    {review.verified && (
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <MessageSquare className="h-3 w-3 text-muted-foreground/40" />
                    )}
                  </div>
                </div>
              </div>
              <svg className="h-4 w-4 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
          {reviews.length > 5 && (
            <p className="py-2 text-center text-sm text-muted-foreground">
              Showing all {reviews.length} reviews. Click any review to read the full details.
            </p>
          )}
        </div>

        {/* Review Detail Popup */}
        <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {selectedReview?.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {selectedReview?.author}
                    {selectedReview?.verified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <BadgeCheck className="h-2.5 w-2.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {selectedReview && Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                    {selectedReview?.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(selectedReview.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedReview?.comment ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {selectedReview.comment}
                  </p>
                </div>
                {selectedReview.helpful > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {selectedReview.helpful} person{selectedReview.helpful > 1 ? 's' : ''} found this helpful
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No written review — just a star rating.</p>
            )}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={async () => {
                  if (!selectedReview) return
                  const { sessionId } = useStore.getState()
                  const res = await fetch(`/api/reviews/${selectedReview.id}/helpful`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                  })
                  const data = await res.json()
                  if (res.ok) {
                    setSelectedReview({ ...selectedReview, helpful: data.helpful })
                    if (!data.voted) toast.success('Thanks for your feedback!')
                  }
                }}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Helpful ({selectedReview?.helpful || 0})
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Customer Photo Gallery */}
      {selectedProductId && <PhotoReviewGallery productId={selectedProductId} />}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rp, i) => {
              const rpImages: string[] = (() => { try { return JSON.parse(rp.images) } catch { return [] } })()
              const rpStock = getStockStatus(rp.stock)
              return (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group cursor-pointer"
                  onClick={() => navigate('product', { productId: rp.id })}
                >
                  <div className="relative mb-3 overflow-hidden rounded-xl border bg-card">
                    <div className="relative aspect-square overflow-hidden">
                      {rpImages[0] ? (
                        <img
                          src={rpImages[0]}
                          alt={rp.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" />
                      )}
                      {/* Stock badge on related products */}
                      <div className="absolute left-2 bottom-2">
                        <Badge className={cn('text-[10px] gap-0.5', rpStock.color)}>
                          {rpStock.icon}
                          {rpStock.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{rp.category.name}</p>
                  <h3 className="font-semibold group-hover:text-amber-700 dark:group-hover:text-amber-500">
                    {rp.name}
                  </h3>
                  <p className="mt-1 font-bold text-amber-700 dark:text-amber-500">
                    {formatCurrency(rp.price)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* Product Q&A */}
      {selectedProductId && <ProductQA productId={selectedProductId} />}

      {/* Recently Viewed */}
      <RecentlyViewed productId={selectedProductId || undefined} />
    </div>
  )
}

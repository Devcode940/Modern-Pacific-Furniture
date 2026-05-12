'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, TrendingUp, Sparkles, X, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/use-store'
import { cn, formatCurrency } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  price: number
  images: string
  category: { id: string; name: string; slug: string }
}

const trendingSearches = ['Sofa', 'Desk', 'Dining Table', 'Bed', 'Bookcase']

const popularCategories = [
  { name: 'Living Room', slug: 'living-room', icon: '🛋️' },
  { name: 'Bedroom', slug: 'bedroom', icon: '🛏️' },
  { name: 'Dining', slug: 'dining', icon: '🍽️' },
  { name: 'Office', slug: 'office', icon: '💼' },
  { name: 'Outdoor', slug: 'outdoor', icon: '🌿' },
]

export function SmartSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const { navigate, setFilter } = useStore()

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await res.json()
      setResults(data.products || [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchResults(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchResults])

  const handleSelect = (productId: string) => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    navigate('product', { productId })
  }

  const handleCategoryClick = (slug: string) => {
    setIsOpen(false)
    setQuery('')
    navigate('shop', { category: slug })
  }

  const handleTrendingClick = (term: string) => {
    setQuery(term)
    setIsOpen(true)
    setFilter({ sortBy: 'newest' })
    navigate('shop')
    useStore.getState().setSearchQuery(term)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightIndex(-1)
  }, [results, query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = query.trim() ? results.length : trendingSearches.length + popularCategories.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (query.trim() && results.length > 0 && highlightIndex >= 0) {
        handleSelect(results[highlightIndex].id)
      } else if (!query.trim() && highlightIndex >= 0) {
        if (highlightIndex < trendingSearches.length) {
          handleTrendingClick(trendingSearches[highlightIndex])
        } else {
          const catIndex = highlightIndex - trendingSearches.length
          handleCategoryClick(popularCategories[catIndex].slug)
        }
      } else if (query.trim()) {
        setIsOpen(false)
        navigate('shop')
        useStore.getState().setSearchQuery(query)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getImage = (product: SearchResult) => {
    try {
      const images = JSON.parse(product.images) as string[]
      return images[0] || null
    } catch {
      return null
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search furniture, styles, rooms..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-10 rounded-full border-stone-200 bg-stone-50 pl-10 pr-10 text-sm transition-all focus-visible:ring-amber-700/30 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900"
          >
            {query.trim() ? (
              /* Search Results */
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-3 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    {results.map((product, index) => {
                      const img = getImage(product)
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleSelect(product.id)}
                          onMouseEnter={() => setHighlightIndex(index)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                            highlightIndex === index
                              ? 'bg-amber-50 dark:bg-amber-950/30'
                              : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                          )}
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                            {img ? (
                              <img
                                src={img}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-lg">
                                🪑
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.category.name}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-amber-700 dark:text-amber-500">
                            {formatCurrency(product.price)}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )
                    })}
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        navigate('shop')
                        useStore.getState().setSearchQuery(query)
                      }}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm text-amber-700 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-950/30 transition-colors"
                    >
                      View all results for &ldquo;{query}&rdquo;
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No products found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Try different keywords or browse categories
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Default: Trending + Categories */
              <div className="p-4">
                {/* Trending Searches */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Trending Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term, index) => (
                      <button
                        key={term}
                        onClick={() => handleTrendingClick(term)}
                        onMouseEnter={() => setHighlightIndex(index)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
                          highlightIndex === index
                            ? 'border-amber-700 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-500'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-amber-300 hover:bg-amber-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                        )}
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Categories */}
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Popular Categories
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {popularCategories.map((cat, index) => {
                      const globalIndex = trendingSearches.length + index
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => handleCategoryClick(cat.slug)}
                          onMouseEnter={() => setHighlightIndex(globalIndex)}
                          className={cn(
                            'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                            highlightIndex === globalIndex
                              ? 'border-amber-700 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30'
                              : 'border-stone-200 hover:border-amber-300 hover:bg-amber-50 dark:border-stone-700 dark:hover:bg-stone-800'
                          )}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                            {cat.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

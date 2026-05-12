'use client'

import { useState, useEffect, useCallback } from 'react'
import { PackageSearch } from 'lucide-react'
import { ProductCard } from './product-card'
import { ProductFiltersEnhanced } from './product-filters-enhanced'
import { ProductSort } from './product-sort'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useStore } from '@/store/use-store'
import { QuickViewModal } from '@/components/features/quick-view-modal'

interface Product {
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
  featured: boolean
  category: { id: string; name: string; slug: string }
  tags: string | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function ProductGrid() {
  const { selectedCategory, searchQuery, filters } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (searchQuery) params.set('search', searchQuery)
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      if (filters.sortBy) params.set('sortBy', filters.sortBy)
      params.set('page', page.toString())
      params.set('limit', '12')

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      let filtered = data.products || []

      // Client-side rating filter
      if (filters.rating > 0) {
        filtered = filtered.filter((p: Product) => p.rating >= filters.rating)
      }

      setProducts(filtered)
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 })
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery, filters, page])

  useEffect(() => {
    setPage(1)
    fetchProducts()
  }, [selectedCategory, searchQuery, filters, fetchProducts])

  return (
    <div className="flex gap-8">
      <ProductFiltersEnhanced />
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {selectedCategory
                ? selectedCategory
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')
                : searchQuery
                  ? `Search: "${searchQuery}"`
                  : 'All Products'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${products.length} products found`}
            </p>
          </div>
          <ProductSort />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageSearch className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} onQuickView={(p) => { setQuickViewProduct(p); setQuickViewOpen(true) }} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      className={p === page ? 'bg-amber-700 hover:bg-amber-800' : ''}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <QuickViewModal product={quickViewProduct} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Star, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/store/use-store'

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

function FilterContent({ categories }: { categories: Category[] }) {
  const { filters, setFilter, resetFilters, selectedCategory } = useStore()

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.slug}`}
                checked={selectedCategory === cat.slug}
                onCheckedChange={() => {
                  if (selectedCategory === cat.slug) {
                    useStore.getState().navigate('shop')
                  } else {
                    useStore.getState().navigate('shop', { category: cat.slug })
                  }
                }}
              />
              <Label
                htmlFor={`cat-${cat.slug}`}
                className="cursor-pointer text-sm"
              >
                {cat.name}
                <span className="ml-1 text-muted-foreground">
                  ({cat._count.products})
                </span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilter({ minPrice: e.target.value })}
            className="h-9"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilter({ maxPrice: e.target.value })}
            className="h-9"
          />
        </div>
      </div>

      <Separator />

      {/* Rating Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Minimum Rating</h3>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilter({ rating: filters.rating === rating ? 0 : rating })}
              className="rounded p-1 transition-colors hover:bg-muted"
            >
              <Star
                className={`h-5 w-5 ${
                  rating <= filters.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
        </div>
        {filters.rating > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {filters.rating}+ stars
          </p>
        )}
      </div>

      <Separator />

      <Button
        variant="outline"
        onClick={resetFilters}
        className="w-full"
      >
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  )
}

export function ProductFilters() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  return (
    <div>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
          </div>
          <FilterContent categories={categories} />
        </div>
      </aside>

      {/* Mobile */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent categories={categories} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

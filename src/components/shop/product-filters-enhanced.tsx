'use client'

import { useState, useEffect, useMemo } from 'react'
import { Star, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useStore, type FilterState } from '@/store/use-store'

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

const materials = ['Wood', 'Metal', 'Fabric', 'Leather', 'Bamboo']
const styles = ['Modern', 'Scandinavian', 'Industrial', 'Rustic', 'Minimalist', 'Contemporary']

function FilterContent({ categories }: { categories: Category[] }) {
  const { filters, setFilter, resetFilters, selectedCategory } = useStore()

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedCategory) count++
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.rating > 0) count++
    if (filters.material) count++
    if (filters.style) count++
    if (filters.onSale) count++
    if (filters.inStock) count++
    return count
  }, [filters, selectedCategory])

  const handleMaterialChange = (material: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const current = filters.material ? filters.material.split(',') : []
      if (!current.includes(material)) {
        setFilter({ material: [...current, material].join(',') })
      }
    } else {
      const current = filters.material ? filters.material.split(',') : []
      setFilter({ material: current.filter((m) => m !== material).join(',') })
    }
  }

  const handleStyleChange = (style: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const current = filters.style ? filters.style.split(',') : []
      if (!current.includes(style)) {
        setFilter({ style: [...current, style].join(',') })
      }
    } else {
      const current = filters.style ? filters.style.split(',') : []
      setFilter({ style: current.filter((s) => s !== style).join(',') })
    }
  }

  const isMaterialChecked = (material: string) => {
    return filters.material ? filters.material.split(',').includes(material) : false
  }

  const isStyleChecked = (style: string) => {
    return filters.style ? filters.style.split(',').includes(style) : false
  }

  return (
    <div className="space-y-2">
      {/* Header with count */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge className="h-5 min-w-5 rounded-full bg-amber-700 px-1.5 text-[10px] text-white">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <Separator />

      {/* Desktop: all sections open */}
      <div className="hidden lg:block space-y-5">
        {/* Categories */}
        <FilterSection title="Categories">
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={`enh-cat-${cat.slug}`}
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
                  htmlFor={`enh-cat-${cat.slug}`}
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
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilter({ minPrice: e.target.value })}
              className="h-8 text-sm"
              min={0}
            />
            <span className="text-muted-foreground text-sm">—</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilter({ maxPrice: e.target.value })}
              className="h-8 text-sm"
              min={0}
            />
          </div>
        </FilterSection>

        {/* Star Rating */}
        <FilterSection title="Rating">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilter({ rating: filters.rating === rating ? 0 : rating })}
                className="rounded p-1 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/20"
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
        </FilterSection>

        {/* Material */}
        <FilterSection title="Material">
          <div className="space-y-2">
            {materials.map((mat) => (
              <div key={mat} className="flex items-center gap-2">
                <Checkbox
                  id={`enh-mat-${mat}`}
                  checked={isMaterialChecked(mat)}
                  onCheckedChange={(checked) => handleMaterialChange(mat, checked)}
                />
                <Label htmlFor={`enh-mat-${mat}`} className="cursor-pointer text-sm">
                  {mat}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Style */}
        <FilterSection title="Style">
          <div className="space-y-2">
            {styles.map((style) => (
              <div key={style} className="flex items-center gap-2">
                <Checkbox
                  id={`enh-style-${style}`}
                  checked={isStyleChecked(style)}
                  onCheckedChange={(checked) => handleStyleChange(style, checked)}
                />
                <Label htmlFor={`enh-style-${style}`} className="cursor-pointer text-sm">
                  {style}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Toggles */}
        <FilterSection title="Availability">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="enh-onsale" className="text-sm cursor-pointer">
                On Sale
              </Label>
              <Switch
                id="enh-onsale"
                checked={filters.onSale}
                onCheckedChange={(checked) => setFilter({ onSale: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enh-instock" className="text-sm cursor-pointer">
                In Stock Only
              </Label>
              <Switch
                id="enh-instock"
                checked={filters.inStock}
                onCheckedChange={(checked) => setFilter({ inStock: checked })}
              />
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Mobile: accordion style */}
      <div className="lg:hidden">
        <Accordion type="multiple" defaultValue={['categories', 'price', 'rating', 'material', 'style', 'availability']}>
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm py-3">Categories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-1">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`mob-cat-${cat.slug}`}
                      checked={selectedCategory === cat.slug}
                      onCheckedChange={() => {
                        if (selectedCategory === cat.slug) {
                          useStore.getState().navigate('shop')
                        } else {
                          useStore.getState().navigate('shop', { category: cat.slug })
                        }
                      }}
                    />
                    <Label htmlFor={`mob-cat-${cat.slug}`} className="cursor-pointer text-sm">
                      {cat.name}
                      <span className="ml-1 text-muted-foreground">
                        ({cat._count.products})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price">
            <AccordionTrigger className="text-sm py-3">Price Range</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-2 pb-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilter({ minPrice: e.target.value })}
                  className="h-8 text-sm"
                  min={0}
                />
                <span className="text-muted-foreground text-sm">—</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter({ maxPrice: e.target.value })}
                  className="h-8 text-sm"
                  min={0}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rating">
            <AccordionTrigger className="text-sm py-3">Rating</AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-1 pb-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilter({ rating: filters.rating === rating ? 0 : rating })}
                    className="rounded p-1 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/20"
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
                <p className="mt-1 text-xs text-muted-foreground pb-1">
                  {filters.rating}+ stars
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="material">
            <AccordionTrigger className="text-sm py-3">Material</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-1">
                {materials.map((mat) => (
                  <div key={mat} className="flex items-center gap-2">
                    <Checkbox
                      id={`mob-mat-${mat}`}
                      checked={isMaterialChecked(mat)}
                      onCheckedChange={(checked) => handleMaterialChange(mat, checked)}
                    />
                    <Label htmlFor={`mob-mat-${mat}`} className="cursor-pointer text-sm">
                      {mat}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="style">
            <AccordionTrigger className="text-sm py-3">Style</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-1">
                {styles.map((style) => (
                  <div key={style} className="flex items-center gap-2">
                    <Checkbox
                      id={`mob-style-${style}`}
                      checked={isStyleChecked(style)}
                      onCheckedChange={(checked) => handleStyleChange(style, checked)}
                    />
                    <Label htmlFor={`mob-style-${style}`} className="cursor-pointer text-sm">
                      {style}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="availability">
            <AccordionTrigger className="text-sm py-3">Availability</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pb-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mob-onsale" className="text-sm cursor-pointer">
                    On Sale
                  </Label>
                  <Switch
                    id="mob-onsale"
                    checked={filters.onSale}
                    onCheckedChange={(checked) => setFilter({ onSale: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mob-instock" className="text-sm cursor-pointer">
                    In Stock Only
                  </Label>
                  <Switch
                    id="mob-instock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => setFilter({ inStock: checked })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Clear All Button for mobile */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={resetFilters}
            className="mt-4 w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function ProductFiltersEnhanced() {
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
              <MobileFilterBadge />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterContent categories={categories} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

function MobileFilterBadge() {
  const { filters, selectedCategory } = useStore()
  const count = useMemo(() => {
    let c = 0
    if (selectedCategory) c++
    if (filters.minPrice) c++
    if (filters.maxPrice) c++
    if (filters.rating > 0) c++
    if (filters.material) c++
    if (filters.style) c++
    if (filters.onSale) c++
    if (filters.inStock) c++
    return c
  }, [filters, selectedCategory])

  if (count === 0) return null
  return (
    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-700 px-1.5 text-[10px] font-medium text-white">
      {count}
    </span>
  )
}

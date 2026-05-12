'use client'

import { useStore } from '@/store/use-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'

export function ProductSort() {
  const { filters, setFilter } = useStore()

  return (
    <div className="flex items-center justify-between gap-4">
      <Select
        value={filters.sortBy}
        onValueChange={(value) => setFilter({ sortBy: value })}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="rating">Top Rated</SelectItem>
          <SelectItem value="popular">Best Selling</SelectItem>
        </SelectContent>
      </Select>

      {/* View toggle - decorative but functional */}
      <div className="hidden items-center gap-1 rounded-md border p-1 sm:flex">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {}}
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="sr-only">Grid view</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {}}
        >
          <List className="h-4 w-4" />
          <span className="sr-only">List view</span>
        </Button>
      </div>
    </div>
  )
}

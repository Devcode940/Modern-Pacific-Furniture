'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Star,
  StarOff,
  Pencil,
  Trash2,
  MoreVertical,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn, formatCurrency } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  images: string
  stock: number
  featured: boolean
  rating: number
  reviewCount: number
  material: string | null
  style: string | null
  colors: string | null
  dimensions: string | null
  weight: string | null
  tags: string | null
  category: Category
}

interface ProductFormData {
  name: string
  description: string
  price: string
  compareAtPrice: string
  categoryId: string
  stock: string
  material: string
  style: string
  colors: string
  dimensions: string
  weight: string
  tags: string
  images: string
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  categoryId: '',
  stock: '',
  material: '',
  style: '',
  colors: '',
  dimensions: '',
  weight: '',
  tags: '',
  images: '[]',
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data)
    } catch {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || p.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({ ...emptyForm })
    setFormOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || '',
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      material: product.material || '',
      style: product.style || '',
      colors: product.colors || '',
      dimensions: product.dimensions || '',
      weight: product.weight || '',
      tags: product.tags || '',
      images: product.images,
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Please fill in required fields (Name, Price, Category)')
      return
    }

    setSaving(true)
    try {
      const body = {
        id: editingProduct?.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        categoryId: formData.categoryId,
        stock: parseInt(formData.stock) || 0,
        material: formData.material || null,
        style: formData.style || null,
        colors: formData.colors || null,
        dimensions: formData.dimensions || null,
        weight: formData.weight || null,
        tags: formData.tags || null,
        images: formData.images || '[]',
      }

      const method = editingProduct ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast.success(
        editingProduct
          ? `"${formData.name}" updated successfully`
          : `"${formData.name}" created successfully`
      )
      setFormOpen(false)
      fetchProducts()
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleFeatured = async (product: Product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          featured: !product.featured,
          categoryId: product.categoryId,
          compareAtPrice: product.compareAtPrice,
        }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: !p.featured } : p))
        )
        toast.success(
          product.featured
            ? `"${product.name}" removed from featured`
            : `"${product.name}" added to featured`
        )
      }
    } catch {
      toast.error('Failed to update featured status')
    }
  }

  const handleBulkFeatured = async () => {
    if (selectedIds.size === 0) return
    const selectedProducts = products.filter((p) => selectedIds.has(p.id))
    for (const product of selectedProducts) {
      if (!product.featured) {
        try {
          await fetch('/api/admin/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...product,
              featured: true,
              categoryId: product.categoryId,
              compareAtPrice: product.compareAtPrice,
            }),
          })
        } catch {
          // continue
        }
      }
    }
    toast.success(`${selectedIds.size} products marked as featured`)
    setSelectedIds(new Set())
    fetchProducts()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)))
    }
  }

  const getFirstImage = (imagesStr: string): string | null => {
    try {
      const images = JSON.parse(imagesStr)
      return images.length > 0 ? images[0] : null
    } catch {
      return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-full max-w-xs" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              {...fadeIn}
              className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700"
            >
              <span className="font-medium">{selectedIds.size} selected</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-amber-700 hover:bg-amber-100"
                onClick={handleBulkFeatured}
              >
                <Star className="size-3 mr-1" />
                Mark Featured
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="ml-auto">
          <Button onClick={handleOpenCreate} className="bg-amber-700 hover:bg-amber-800">
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card className="border-stone-200 shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50 hover:bg-stone-50">
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const imgUrl = getFirstImage(product.images)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={selectedIds.has(product.id)}
                          onCheckedChange={() => toggleSelect(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover bg-stone-100"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100">
                            <ImageIcon className="size-4 text-stone-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-stone-900">{product.name}</p>
                          <p className="text-xs text-stone-500">{product.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <span className="font-medium text-stone-900">
                            {formatCurrency(product.price)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="ml-1.5 text-xs text-stone-400 line-through">
                              {formatCurrency(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-medium',
                            product.stock <= 5 ? 'text-red-600' : 'text-stone-900'
                          )}
                        >
                          {product.stock}
                        </span>
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="ml-1.5 text-xs text-orange-500">Low</span>
                        )}
                        {product.stock === 0 && (
                          <span className="ml-1.5 text-xs text-red-500">Out</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className="inline-flex"
                        >
                          {product.featured ? (
                            <Star className="size-5 fill-amber-400 text-amber-400" />
                          ) : (
                            <StarOff className="size-5 text-stone-300 hover:text-amber-400 transition-colors" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                              <Pencil className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeletingProduct(product)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <Search className="size-8 mb-2" />
              <p className="text-sm">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update product details below.'
                : 'Fill in the details for the new product.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 py-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="compareAtPrice">Compare-at Price</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                value={formData.compareAtPrice}
                onChange={(e) =>
                  setFormData({ ...formData, compareAtPrice: e.target.value })
                }
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g., Oak Wood"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="style">Style</Label>
              <Input
                id="style"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                placeholder="e.g., Scandinavian"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="colors">Colors</Label>
              <Input
                id="colors"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder="e.g., Natural, Walnut, Black"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 200x100x75 cm"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g., 25 kg"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., sale, new, popular"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-700 hover:bg-amber-800"
            >
              {saving && <Loader2 className="size-4 mr-1 animate-spin" />}
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingProduct(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                toast.info('Product management is in demo mode — deletion is disabled.')
                setDeletingProduct(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

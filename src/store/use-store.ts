import { create } from 'zustand'

export type ViewType =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'checkout-success'
  | 'wishlist'
  | 'compare'
  | 'visualizer'
  | 'quiz'
  | 'quiz-results'
  | 'admin'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-analytics'
  | 'calculator'
  | 'loyalty'
  | 'bundles'
  | 'order-tracking'
  | 'blog'
  | 'blog-post'
  | 'referral'
  | 'account'
  | 'videos'

export interface CartItemType {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    compareAtPrice: number | null
    images: string
    stock: number
    category: { id: string; name: string; slug: string }
  }
}

export interface WishlistItemType {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    compareAtPrice: number | null
    images: string
    rating: number
    stock: number
    category: { id: string; name: string; slug: string }
  }
}

export interface FilterState {
  minPrice: string
  maxPrice: string
  sortBy: string
  rating: number
  material: string
  style: string
  onSale: boolean
  inStock: boolean
}

export interface CouponState {
  code: string
  discount: number
  value: number
  type: string
  valid: boolean
  message: string
}

interface StoreState {
  // Session
  sessionId: string

  // Navigation
  currentView: ViewType
  selectedCategory: string | null
  selectedProductId: string | null
  searchQuery: string

  // Filters
  filters: FilterState

  // Cart
  cart: CartItemType[]
  cartOpen: boolean
  cartCount: number
  cartTotal: number

  // Checkout
  lastOrderNumber: string | null

  // Wishlist
  wishlist: WishlistItemType[]
  wishlistOpen: boolean
  wishlistCount: number

  // Comparison
  compareIds: string[]

  // Coupon
  coupon: CouponState

  // Loyalty
  loyaltyPoints: number

  // Quiz
  quizAnswers: Record<string, string>
  quizStyle: string

  // Blog
  selectedBlogSlug: string | null

  // Delivery
  deliveryCost: number
  deliveryCounty: string
  deliveryDays: string

  // Payment
  paymentMethod: 'mpesa' | 'cod'

  // Admin
  adminTab: string

  // Actions
  initSession: () => void
  navigate: (view: ViewType, params?: { category?: string; productId?: string; blogSlug?: string }) => void
  setSearchQuery: (query: string) => void
  setFilter: (filter: Partial<FilterState>) => void
  resetFilters: () => void
  setCart: (items: CartItemType[]) => void
  addToCartOptimistic: (item: CartItemType) => void
  updateCartItemOptimistic: (id: string, quantity: number) => void
  removeFromCartOptimistic: (id: string) => void
  clearCart: () => void
  setCartOpen: (open: boolean) => void
  setLastOrderNumber: (num: string | null) => void
  setWishlist: (items: WishlistItemType[]) => void
  toggleWishlistItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  setWishlistOpen: (open: boolean) => void
  toggleCompare: (productId: string) => void
  isInCompare: (productId: string) => boolean
  clearCompare: () => void
  setCoupon: (coupon: CouponState) => void
  clearCoupon: () => void
  setLoyaltyPoints: (points: number) => void
  setQuizAnswers: (answers: Record<string, string>) => void
  setQuizStyle: (style: string) => void
  setDeliveryInfo: (cost: number, county: string, days: string) => void
  setPaymentMethod: (method: 'mpesa' | 'cod') => void
  setAdminTab: (tab: string) => void
}

const defaultFilters: FilterState = {
  minPrice: '',
  maxPrice: '',
  sortBy: 'newest',
  rating: 0,
  material: '',
  style: '',
  onSale: false,
  inStock: false,
}

const defaultCoupon: CouponState = {
  code: '',
  discount: 0,
  value: 0,
  type: 'percentage',
  valid: false,
  message: '',
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('mfp_session')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('mfp_session', id)
  }
  return id
}

export const useStore = create<StoreState>((set, get) => ({
  // Session
  sessionId: '',

  // Navigation
  currentView: 'home',
  selectedCategory: null,
  selectedProductId: null,
  searchQuery: '',

  // Filters
  filters: { ...defaultFilters },

  // Cart
  cart: [],
  cartOpen: false,
  cartCount: 0,
  cartTotal: 0,

  // Checkout
  lastOrderNumber: null,

  // Wishlist
  wishlist: [],
  wishlistOpen: false,
  wishlistCount: 0,

  // Comparison
  compareIds: [],

  // Coupon
  coupon: { ...defaultCoupon },

  // Loyalty
  loyaltyPoints: 0,

  // Quiz
  quizAnswers: {},
  quizStyle: '',

  // Blog
  selectedBlogSlug: null,

  // Delivery
  deliveryCost: 0,
  deliveryCounty: '',
  deliveryDays: '',

  // Payment
  paymentMethod: 'mpesa',

  // Admin
  adminTab: 'dashboard',

  // Session actions
  initSession: () => {
    const id = getSessionId()
    set({ sessionId: id })
  },

  // Navigation actions
  navigate: (view, params) => {
    const updates: Partial<StoreState> = {
      currentView: view,
      selectedCategory: params?.category || null,
      selectedProductId: params?.productId || null,
      selectedBlogSlug: params?.blogSlug || null,
    }
    if (params?.category) {
      updates.filters = { ...get().filters }
    }
    set(updates)
    if (params?.category) {
      get().setFilter({ sortBy: 'newest' })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  // Filter actions
  setFilter: (filter) =>
    set((state) => ({ filters: { ...state.filters, ...filter } })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  // Cart actions
  setCart: (items) => {
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const cartTotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    set({ cart: items, cartCount, cartTotal })
  },

  addToCartOptimistic: (item) => {
    const { cart } = get()
    const existingIndex = cart.findIndex((c) => c.productId === item.productId)
    let newCart: CartItemType[]
    if (existingIndex >= 0) {
      newCart = [...cart]
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newCart[existingIndex].quantity + item.quantity,
      }
    } else {
      newCart = [...cart, item]
    }
    const cartCount = newCart.reduce((sum, i) => sum + i.quantity, 0)
    const cartTotal = newCart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    set({ cart: newCart, cartCount, cartTotal })
  },

  updateCartItemOptimistic: (id, quantity) => {
    const { cart } = get()
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    )
    const cartCount = newCart.reduce((sum, i) => sum + i.quantity, 0)
    const cartTotal = newCart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    set({ cart: newCart, cartCount, cartTotal })
  },

  removeFromCartOptimistic: (id) => {
    const newCart = get().cart.filter((item) => item.id !== id)
    const cartCount = newCart.reduce((sum, i) => sum + i.quantity, 0)
    const cartTotal = newCart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    set({ cart: newCart, cartCount, cartTotal })
  },

  clearCart: () => set({ cart: [], cartCount: 0, cartTotal: 0, coupon: { ...defaultCoupon } }),

  setCartOpen: (open) => set({ cartOpen: open }),

  setLastOrderNumber: (num) => set({ lastOrderNumber: num }),

  // Wishlist actions
  setWishlist: (items) => {
    set({ wishlist: items, wishlistCount: items.length })
  },

  toggleWishlistItem: (productId) => {
    const { wishlist } = get()
    const exists = wishlist.some((w) => w.productId === productId)
    if (exists) {
      const newWishlist = wishlist.filter((w) => w.productId !== productId)
      set({ wishlist: newWishlist, wishlistCount: newWishlist.length })
      fetch(`/api/wishlist/${productId}`, { method: 'DELETE' }).catch(() => {})
    } else {
      set({ wishlist: [...wishlist, { id: `temp-${productId}`, productId } as WishlistItemType], wishlistCount: wishlist.length + 1 })
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).catch(() => {})
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some((w) => w.productId === productId)
  },

  setWishlistOpen: (open) => set({ wishlistOpen: open }),

  // Compare actions
  toggleCompare: (productId) => {
    const { compareIds } = get()
    if (compareIds.includes(productId)) {
      set({ compareIds: compareIds.filter((id) => id !== productId) })
    } else if (compareIds.length < 4) {
      set({ compareIds: [...compareIds, productId] })
    }
  },

  isInCompare: (productId) => {
    return get().compareIds.includes(productId)
  },

  clearCompare: () => set({ compareIds: [] }),

  // Coupon actions
  setCoupon: (coupon) => set({ coupon }),

  clearCoupon: () => set({ coupon: { ...defaultCoupon } }),

  // Loyalty actions
  setLoyaltyPoints: (points) => set({ loyaltyPoints: points }),

  // Quiz actions
  setQuizAnswers: (answers) => set({ quizAnswers: answers }),
  setQuizStyle: (style) => set({ quizStyle: style }),

  // Delivery actions
  setDeliveryInfo: (cost, county, days) => set({ deliveryCost: cost, deliveryCounty: county, deliveryDays: days }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  // Admin actions
  setAdminTab: (tab) => set({ adminTab: tab }),
}))

'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { WishlistDrawer } from '@/components/wishlist/wishlist-drawer'
import { ProductComparison } from '@/components/shop/product-comparison'
import { HeroBanner } from '@/components/home/hero-banner'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { FeaturedProducts } from '@/components/home/featured-products'
import { DealsSection } from '@/components/home/deals-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { ProductGrid } from '@/components/shop/product-grid'
import { ProductDetail } from '@/components/product/product-detail'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { CheckoutSuccess } from '@/components/checkout/checkout-success'
import { InteriorDesignQuiz } from '@/components/features/interior-design-quiz'
import { RoomVisualizer } from '@/components/features/room-visualizer'
import { RoomCalculator } from '@/components/features/room-calculator'
import { RecentlyViewed } from '@/components/features/recently-viewed'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { WhatsAppChat } from '@/components/features/whatsapp-chat'
import { LoyaltyDashboard } from '@/components/features/loyalty-dashboard'
import { BundleDealBuilder } from '@/components/features/bundle-deals'
import { OrderTracking } from '@/components/features/order-tracking'
import { SocialProof } from '@/components/features/social-proof'
import { ReferralPage } from '@/components/features/referral-page'
import { AccountView } from '@/components/features/account-view'
import { BlogPage } from '@/components/features/blog-page'
import { BlogPostPage } from '@/components/features/blog-post-page'
import { AbandonedCartBanner } from '@/components/features/abandoned-cart-banner'

function HomePage() {
  const { selectedProductId } = useStore()
  return (
    <>
      <HeroBanner />
      <CategoryShowcase />
      <FeaturedProducts />
      <DealsSection />
      <TestimonialsSection />
      <RecentlyViewed />
    </>
  )
}

function ShopPage() {
  return (
    <section className="container mx-auto px-4 py-8">
      <ProductGrid />
    </section>
  )
}

function ProductPage() {
  const { selectedProductId } = useStore()
  return <ProductDetail key={selectedProductId} />
}

function CheckoutPage() {
  return <CheckoutForm />
}

function CheckoutSuccessPage() {
  return <CheckoutSuccess />
}

function CalculatorPage() {
  return <RoomCalculator />
}

function LoyaltyPage() {
  return <LoyaltyDashboard />
}

function BundlesPage() {
  return <BundleDealBuilder />
}

function OrderTrackingPage() {
  return <OrderTracking />
}

function AccountPage() {
  return <AccountView />
}

function ReferralView() {
  return <ReferralPage />
}

function BlogView() {
  return <BlogPage />
}

function BlogPostView() {
  return <BlogPostPage />
}

export default function AppPage() {
  const { currentView, setCart, setWishlist, searchQuery, sessionId, initSession, setCartOpen } = useStore()
  const { fetchProfile } = useAuthStore()

  // Initialize session & auth
  useEffect(() => {
    initSession()
    fetchProfile()
  }, [initSession, fetchProfile])

  // Load cart and wishlist on mount
  useEffect(() => {
    if (!sessionId) return
    fetch('/api/cart', {
      headers: { 'x-session-id': sessionId },
    })
      .then((res) => res.json())
      .then((items) => setCart(items))
      .catch(() => {})

    fetch('/api/wishlist')
      .then((res) => res.json())
      .then((items) => setWishlist(items || []))
      .catch(() => {})
  }, [setCart, setWishlist, sessionId])

  // Re-fetch cart when navigating to cart/checkout & auto-open cart drawer
  useEffect(() => {
    if ((currentView === 'cart' || currentView === 'checkout') && sessionId) {
      fetch('/api/cart', {
        headers: { 'x-session-id': sessionId },
      })
        .then((res) => res.json())
        .then((items) => setCart(items))
        .catch(() => {})
      if (currentView === 'cart') {
        setCartOpen(true)
      }
    }
  }, [currentView, setCart, sessionId, setCartOpen])

  // Navigate to shop when search query changes
  useEffect(() => {
    if (searchQuery && currentView !== 'shop') {
      useStore.getState().navigate('shop')
    }
  }, [searchQuery, currentView])

  const isAdminView = currentView === 'admin' || currentView === 'admin-products' || currentView === 'admin-orders' || currentView === 'admin-analytics'

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />
      case 'shop':
        return <ShopPage />
      case 'product':
        return <ProductPage />
      case 'cart':
        return <ShopPage />
      case 'checkout':
        return <CheckoutPage />
      case 'checkout-success':
        return <CheckoutSuccessPage />
      case 'compare':
        return <ProductComparison />
      case 'quiz':
        return <InteriorDesignQuiz />
      case 'visualizer':
        return <RoomVisualizer />
      case 'calculator':
        return <CalculatorPage />
      case 'loyalty':
        return <LoyaltyPage />
      case 'bundles':
        return <BundlesPage />
      case 'order-tracking':
        return <OrderTrackingPage />
      case 'referral':
        return <ReferralView />
      case 'blog':
        return <BlogView />
      case 'blog-post':
        return <BlogPostView />
      case 'account':
        return <AccountPage />
      case 'admin':
      case 'admin-products':
      case 'admin-orders':
      case 'admin-analytics':
        return <AdminDashboard />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminView && <AbandonedCartBanner />}
      {!isAdminView && <SiteHeader />}
      <main className="flex-1">{renderView()}</main>
      {!isAdminView && <SiteFooter />}
      <CartDrawer />
      <WishlistDrawer />
      {!isAdminView && <MobileBottomNav />}
      {!isAdminView && <WhatsAppChat />}
      {!isAdminView && <SocialProof />}
    </div>
  )
}

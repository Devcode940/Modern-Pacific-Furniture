'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Package,
  User,
  MapPin,
  Shield,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ShoppingCart,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useStore } from '@/store/use-store'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Status Badge Component ────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string }> = {
    pending: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    processing: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    shipped: { className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    delivered: { className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    cancelled: { className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  }
  const c = config[status] || config.pending
  return (
    <Badge variant="secondary" className={cn('capitalize', c.className)}>
      {status}
    </Badge>
  )
}

// ─── Orders Tab ────────────────────────────────────────────────
function OrdersTab() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">No orders yet</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          When you place your first order, it will appear here.
        </p>
        <Button
          onClick={() => useStore.getState().navigate('shop')}
          className="bg-amber-700 hover:bg-amber-800"
        >
          Start Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{order.orderNumber}</p>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' · '}
                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-500">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Profile Tab ───────────────────────────────────────────────
function ProfileTab() {
  const { user, fetchProfile } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone || '')
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      })
      if (res.ok) {
        toast.success('Profile updated successfully')
        await fetchProfile()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Full Name</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-phone">Phone</Label>
        <Input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11"
          placeholder="+254 7XX XXX XXX"
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-amber-700 hover:bg-amber-800"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  )
}

// ─── Addresses Tab ─────────────────────────────────────────────
function AddressesTab() {
  const { user } = useAuthStore()
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formLabel, setFormLabel] = useState('Home')
  const [formStreet, setFormStreet] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formCounty, setFormCounty] = useState('')
  const [formDefault, setFormDefault] = useState(false)

  const loadAddresses = async () => {
    try {
      const res = await fetch('/api/auth/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  const openNew = () => {
    setEditing(null)
    setFormLabel('Home')
    setFormStreet('')
    setFormCity('')
    setFormCounty('')
    setFormDefault(false)
    setDialogOpen(true)
  }

  const openEdit = (addr: any) => {
    setEditing(addr)
    setFormLabel(addr.label)
    setFormStreet(addr.street)
    setFormCity(addr.city)
    setFormCounty(addr.county)
    setFormDefault(addr.isDefault)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formStreet || !formCity || !formCounty) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const res = await fetch('/api/auth/addresses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editing.id,
            label: formLabel,
            street: formStreet,
            city: formCity,
            county: formCounty,
            isDefault: formDefault,
          }),
        })
        if (res.ok) {
          toast.success('Address updated')
          setDialogOpen(false)
          loadAddresses()
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to update')
        }
      } else {
        const res = await fetch('/api/auth/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: formLabel,
            street: formStreet,
            city: formCity,
            county: formCounty,
            isDefault: formDefault,
          }),
        })
        if (res.ok) {
          toast.success('Address added')
          setDialogOpen(false)
          loadAddresses()
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to add address')
        }
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/auth/addresses?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Address deleted')
        loadAddresses()
      }
    } catch {
      toast.error('Failed to delete address')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
        </h3>
        <Button
          onClick={openNew}
          size="sm"
          className="bg-amber-700 hover:bg-amber-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">No saved addresses</h3>
          <p className="text-sm text-muted-foreground">
            Add an address for faster checkout.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                'rounded-xl border bg-card p-4',
                addr.isDefault && 'border-amber-300 dark:border-amber-700'
              )}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{addr.label}</p>
                    {addr.isDefault && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{addr.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {addr.city}, {addr.county}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(addr)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(addr.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update your saved address.' : 'Add a new delivery address.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Label</Label>
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map((label) => (
                  <Button
                    key={label}
                    type="button"
                    variant={formLabel === label ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      formLabel === label && 'bg-amber-700 hover:bg-amber-800'
                    )}
                    onClick={() => setFormLabel(label)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-street">Street Address *</Label>
              <Input
                id="addr-street"
                placeholder="123 Kenyatta Ave"
                value={formStreet}
                onChange={(e) => setFormStreet(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addr-city">City *</Label>
                <Input
                  id="addr-city"
                  placeholder="Nairobi"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-county">County *</Label>
                <Input
                  id="addr-county"
                  placeholder="Nairobi"
                  value={formCounty}
                  onChange={(e) => setFormCounty(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="addr-default"
                checked={formDefault}
                onChange={(e) => setFormDefault(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-amber-700"
              />
              <Label htmlFor="addr-default" className="text-sm">
                Set as default address
              </Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-amber-700 hover:bg-amber-800"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editing ? (
                  'Update'
                ) : (
                  'Add Address'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Security Tab ──────────────────────────────────────────────
function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to change password')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <p className="text-sm text-muted-foreground">
          Update your password to keep your account secure.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleChangePassword}>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-11"
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-11"
            placeholder="Min 6 characters"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">Confirm New Password</Label>
          <Input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11"
            autoComplete="new-password"
          />
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="bg-amber-700 hover:bg-amber-800"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Password'
          )}
        </Button>
      </form>
    </div>
  )
}

// ─── Main Account View ─────────────────────────────────────────
export function AccountView() {
  const { user } = useAuthStore()
  const { navigate } = useStore()

  // Not logged in state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Sign in to your account</h2>
        <p className="mb-6 text-muted-foreground">
          Track orders, manage addresses, and more.
        </p>
        <Button
          onClick={() => useAuthStore.getState().setSignInOpen(true)}
          className="bg-amber-700 hover:bg-amber-800"
        >
          Sign In
        </Button>
      </div>
    )
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            My Account
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-6 w-full justify-start bg-muted/50 sm:inline-flex">
          <TabsTrigger
            value="orders"
            className="gap-2 data-[state=active]:bg-amber-700 data-[state=active]:text-white"
          >
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="gap-2 data-[state=active]:bg-amber-700 data-[state=active]:text-white"
          >
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="addresses"
            className="gap-2 data-[state=active]:bg-amber-700 data-[state=active]:text-white"
          >
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="gap-2 data-[state=active]:bg-amber-700 data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="rounded-xl border bg-card p-6">
            <OrdersTab />
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="rounded-xl border bg-card p-6">
            <ProfileTab />
          </div>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="rounded-xl border bg-card p-6">
            <AddressesTab />
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="rounded-xl border bg-card p-6">
            <SecurityTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
}

interface AuthState {
  user: User | null
  loading: boolean
  signInOpen: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setSignInOpen: (open: boolean) => void
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error: string | null }>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  signInOpen: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setSignInOpen: (open) => set({ signInOpen: open }),

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid email or password' }
      }
      // Fetch profile to set user state
      await get().fetchProfile()
      set({ signInOpen: false })
      return { success: true, error: null }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      set({ loading: false })
    }
  },

  register: async (email, password, name, phone) => {
    set({ loading: true })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Could not create account' }
      }
      await get().fetchProfile()
      set({ signInOpen: false })
      return { success: true, error: null }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      })
    } catch {
      // Ignore errors
    }
    set({ user: null })
  },

  fetchProfile: async () => {
    try {
      const res = await fetch('/api/auth/profile')
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user })
      } else {
        set({ user: null })
      }
    } catch {
      set({ user: null })
    }
  },
}))

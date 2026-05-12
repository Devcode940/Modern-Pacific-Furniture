'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

export function SocialLogin() {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin')
  const { login, register, loading } = useAuthStore()

  // Sign In state
  const [signinEmail, setSigninEmail] = useState('')
  const [signinPassword, setSigninPassword] = useState('')
  const [signinError, setSigninError] = useState('')

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regError, setRegError] = useState('')

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login coming soon!`, {
      description: 'Sign in with email for now.',
      duration: 3000,
    })
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSigninError('')
    if (!signinEmail || !signinPassword) {
      setSigninError('Please fill in all fields')
      return
    }
    const result = await login(signinEmail, signinPassword)
    if (result.success) {
      toast.success('Welcome back!')
      setSigninEmail('')
      setSigninPassword('')
    } else {
      setSigninError(result.error || 'Invalid email or password')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    if (!regName || !regEmail || !regPassword) {
      setRegError('Please fill in all required fields')
      return
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters')
      return
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match')
      return
    }
    const result = await register(regEmail, regPassword, regName, regPhone || undefined)
    if (result.success) {
      toast.success('Account created successfully!')
      setRegName('')
      setRegEmail('')
      setRegPhone('')
      setRegPassword('')
      setRegConfirmPassword('')
      setActiveTab('signin')
    } else {
      setRegError(result.error || 'Could not create account. Email may already be in use.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Switcher */}
      <div className="flex rounded-lg border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => { setActiveTab('signin'); setSigninError('') }}
          className={cn(
            'flex-1 rounded-md py-2 text-sm font-medium transition-all',
            activeTab === 'signin'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('register'); setRegError('') }}
          className={cn(
            'flex-1 rounded-md py-2 text-sm font-medium transition-all',
            activeTab === 'register'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Create Account
        </button>
      </div>

      {/* Social Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('Google')}
          className="h-11 w-full gap-3 rounded-lg border-neutral-300 bg-white font-medium text-neutral-800 transition-all hover:bg-neutral-50 hover:shadow-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('Apple')}
          className="h-11 w-full gap-3 rounded-lg border-neutral-300 bg-neutral-900 font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-sm dark:border-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          <AppleIcon />
          Continue with Apple
        </Button>
      </div>

      <div className="relative flex items-center gap-3 py-1">
        <Separator className="flex-1" />
        <span className="text-xs font-medium text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      {/* Sign In Form */}
      {activeTab === 'signin' && (
        <form className="flex flex-col gap-3" onSubmit={handleSignIn}>
          {signinError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {signinError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="signin-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="signin-email"
              type="email"
              placeholder="you@example.com"
              className="h-11"
              value={signinEmail}
              onChange={(e) => setSigninEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="signin-password" className="text-sm font-medium">
                Password
              </Label>
              <button
                type="button"
                className="text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400"
                onClick={() => toast.info('Password reset coming soon!', { duration: 3000 })}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="signin-password"
              type="password"
              placeholder="Enter your password"
              className="h-11"
              value={signinPassword}
              onChange={(e) => setSigninPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full bg-amber-700 text-white hover:bg-amber-800"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <form className="flex flex-col gap-3" onSubmit={handleRegister}>
          {regError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {regError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="reg-name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="reg-name"
              type="text"
              placeholder="Your full name"
              className="h-11"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-email" className="text-sm font-medium">
              Email *
            </Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              className="h-11"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-phone" className="text-sm font-medium">
              Phone <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="reg-phone"
              type="tel"
              placeholder="+254 7XX XXX XXX"
              className="h-11"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-password" className="text-sm font-medium">
              Password *
            </Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Min 6 characters"
              className="h-11"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm-password" className="text-sm font-medium">
              Confirm Password *
            </Label>
            <Input
              id="reg-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              className="h-11"
              value={regConfirmPassword}
              onChange={(e) => setRegConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full bg-amber-700 text-white hover:bg-amber-800"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      )}

      {activeTab === 'signin' && (
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400"
            onClick={() => setActiveTab('register')}
          >
            Create one
          </button>
        </p>
      )}

      {activeTab === 'register' && (
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400"
            onClick={() => setActiveTab('signin')}
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const WHATSAPP_NUMBER = '254700000000'
const BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`

const PRESET_MESSAGES = [
  "I'd like to know about delivery",
  "What's the warranty?",
  'Custom order inquiry',
]

const AUTO_CLOSE_DELAY = 5000

export function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const clearAutoClose = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }
  }, [])

  const startAutoClose = useCallback(() => {
    clearAutoClose()
    if (!hasInteracted) {
      autoCloseTimerRef.current = setTimeout(() => {
        setIsOpen(false)
      }, AUTO_CLOSE_DELAY)
    }
  }, [clearAutoClose, hasInteracted])

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev)
    setHasInteracted(true)
    clearAutoClose()
  }, [clearAutoClose])

  const handlePanelInteraction = useCallback(() => {
    setHasInteracted(true)
    clearAutoClose()
  }, [clearAutoClose])

  const openWhatsApp = useCallback(
    (message: string) => {
      const encoded = encodeURIComponent(message)
      window.open(`${BASE_URL}?text=${encoded}`, '_blank', 'noopener,noreferrer')
      setIsOpen(false)
    },
    [BASE_URL]
  )

  // Start auto-close timer when panel opens
  useEffect(() => {
    if (isOpen) {
      startAutoClose()
    }
    return clearAutoClose
  }, [isOpen, startAutoClose, clearAutoClose])

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="mb-3 w-[300px] origin-bottom-right overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-neutral-900"
            onMouseEnter={handlePanelInteraction}
            onTouchStart={handlePanelInteraction}
          >
            {/* Header */}
            <div className="bg-[#25D366] px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold leading-snug text-white">
                    Need help? Chat with us on WhatsApp!
                  </h3>
                  <p className="mt-0.5 text-xs text-white/80">
                    We typically reply within minutes
                  </p>
                </div>
                <button
                  onClick={togglePanel}
                  className="ml-2 -mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Close WhatsApp chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Quick questions?
              </p>

              <div className="flex flex-col gap-2">
                {PRESET_MESSAGES.map((msg) => (
                  <button
                    key={msg}
                    onClick={() => openWhatsApp(msg)}
                    className="group flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-left text-sm text-neutral-700 transition-all hover:border-[#25D366]/40 hover:bg-[#25D366]/5 hover:text-[#128C7E] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-[#25D366]/40 dark:hover:bg-[#25D366]/10 dark:hover:text-[#25D366]"
                  >
                    <Send className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition-colors group-hover:text-[#25D366]" />
                    <span className="leading-snug">{msg}</span>
                  </button>
                ))}
              </div>

              {/* Chat Now CTA */}
              <button
                onClick={() => openWhatsApp('Hello Modern Furniture Pacific')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#25D366]/25 transition-all hover:bg-[#128C7E] hover:shadow-lg hover:shadow-[#25D366]/30 active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                Chat Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={togglePanel}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-colors hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
      >
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

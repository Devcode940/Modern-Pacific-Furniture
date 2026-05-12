'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  User,
  Clock,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface QAItem {
  id: string
  question: string
  answer: string
  helpfulCount: number
  date: string
  askedBy: string
  isPending?: boolean
  userVoted?: boolean
}

/* ------------------------------------------------------------------ */
/*  Pre-seeded Q&A data                                                */
/* ------------------------------------------------------------------ */

const SEED_QA: QAItem[] = [
  {
    id: 'qa-1',
    question: 'What is the warranty period for this product?',
    answer:
      'All our furniture comes with a 5-year warranty covering manufacturing defects. This does not cover normal wear and tear.',
    helpfulCount: 24,
    date: '2025-01-15',
    askedBy: 'Grace W.',
  },
  {
    id: 'qa-2',
    question: 'Do you offer assembly service?',
    answer:
      "Yes! Free professional assembly is included with all furniture purchases across Kenya.",
    helpfulCount: 31,
    date: '2025-02-03',
    askedBy: 'Peter M.',
  },
  {
    id: 'qa-3',
    question: 'What is the return policy?',
    answer:
      "We offer a 30-day return policy. If you're not satisfied, contact us within 30 days of delivery for a hassle-free return.",
    helpfulCount: 18,
    date: '2025-02-20',
    askedBy: 'Sarah K.',
  },
  {
    id: 'qa-4',
    question: 'How long does delivery take?',
    answer:
      'Delivery within Nairobi takes 1-3 business days. Other major towns take 3-7 business days. Remote areas may take up to 14 days.',
    helpfulCount: 42,
    date: '2025-03-08',
    askedBy: 'David O.',
  },
  {
    id: 'qa-5',
    question: 'Can I customize the fabric/color?',
    answer:
      'Some products offer customization options. Please contact us via WhatsApp to discuss your specific requirements.',
    helpfulCount: 15,
    date: '2025-03-22',
    askedBy: 'Lucy N.',
  },
]

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_VISIBLE = 3

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
}

/* ------------------------------------------------------------------ */
/*  Helper: format date                                                */
/* ------------------------------------------------------------------ */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ProductQAProps {
  productId: string
}

export function ProductQA({ productId }: ProductQAProps) {
  const [qaList, setQaList] = useState<QAItem[]>(SEED_QA)
  const [showAll, setShowAll] = useState(false)
  const [name, setName] = useState('')
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const visibleQA = showAll ? qaList : qaList.slice(0, DEFAULT_VISIBLE)
  const hasMore = qaList.length > DEFAULT_VISIBLE

  /* -- Submit question ------------------------------------------------ */

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!name.trim()) {
        toast.error('Please enter your name')
        return
      }
      if (!question.trim()) {
        toast.error('Please enter your question')
        return
      }
      if (question.trim().length < 10) {
        toast.error('Your question is too short — at least 10 characters')
        return
      }

      setIsSubmitting(true)

      // Simulate network delay
      setTimeout(() => {
        const newQA: QAItem = {
          id: `qa-user-${Date.now()}`,
          question: question.trim(),
          answer: '',
          helpfulCount: 0,
          date: new Date().toISOString(),
          askedBy: name.trim(),
          isPending: true,
        }

        setQaList((prev) => [newQA, ...prev])
        setName('')
        setQuestion('')
        setIsSubmitting(false)
        toast.success('Your question has been submitted!', {
          description: 'We\'ll respond within 24 hours.',
        })
      }, 800)
    },
    [name, question],
  )

  /* -- Helpful vote --------------------------------------------------- */

  const handleHelpful = useCallback((id: string) => {
    setQaList((prev) =>
      prev.map((item) =>
        item.id === id && !item.userVoted
          ? { ...item, helpfulCount: item.helpfulCount + 1, userVoted: true }
          : item,
      ),
    )
    toast.success('Thanks for your feedback!')
  }, [])

  /* -- Toggle show all ------------------------------------------------ */

  const toggleShowAll = useCallback(() => {
    setShowAll((prev) => !prev)
  }, [])

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <section className="space-y-6" aria-label="Product Questions & Answers">
      {/* ─── Section Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Questions & Answers
          </h2>
          <p className="text-sm text-muted-foreground">
            {qaList.length} question{qaList.length !== 1 ? 's' : ''} about this
            product
          </p>
        </div>
      </motion.div>

      {/* ─── Ask a Question Form ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-4 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/20">
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Ask a Question
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 sm:w-48">
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 border-amber-200 bg-white/80 placeholder:text-muted-foreground/60 dark:border-amber-800 dark:bg-amber-950/40"
                />
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="Type your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[40px] resize-none border-amber-200 bg-white/80 placeholder:text-muted-foreground/60 dark:border-amber-800 dark:bg-amber-950/40"
                  rows={1}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
              size="sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                <>
                  <MessageSquare className="h-3.5 w-3.5" />
                  Submit Question
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>

      {/* ─── Q&A List ─── */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleQA.map((qa, index) => (
            <motion.div
              key={qa.id}
              custom={index}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
              layout
            >
              <div
                className={`rounded-xl border transition-colors ${
                  qa.isPending
                    ? 'border-dashed border-amber-300 bg-amber-50/40 dark:border-amber-700 dark:bg-amber-950/20'
                    : 'border-border bg-card'
                }`}
              >
                <Accordion type="single" collapsible>
                  <AccordionItem value={qa.id} className="border-0">
                    <AccordionTrigger className="px-4 py-3.5 hover:no-underline hover:bg-muted/30 rounded-t-xl">
                      <div className="flex items-start gap-3 text-left">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            qa.isPending
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                          }`}
                        >
                          {qa.isPending ? (
                            <Clock className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold leading-snug">
                              {qa.question}
                            </span>
                            {qa.isPending && (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-700 text-[10px] px-1.5 py-0">
                                Pending Answer
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {qa.askedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(qa.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4">
                      {qa.isPending ? (
                        <div className="ml-10 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                            <Clock className="h-4 w-4 animate-pulse" />
                            <span className="font-medium">
                              Awaiting response from our team
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            We typically answer within 24 hours. You&apos;ll be
                            notified once a response is posted.
                          </p>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="ml-10"
                        >
                          <div className="rounded-lg bg-muted/40 p-3">
                            <p className="text-sm leading-relaxed text-foreground/90">
                              {qa.answer}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <button
                              onClick={() => handleHelpful(qa.id)}
                              disabled={qa.userVoted}
                              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                qa.userVoted
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 cursor-default'
                                  : 'bg-muted/60 text-muted-foreground hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 cursor-pointer'
                              }`}
                            >
                              <ThumbsUp
                                className={`h-3.5 w-3.5 ${
                                  qa.userVoted ? 'fill-current' : ''
                                }`}
                              />
                              Helpful ({qa.helpfulCount})
                            </button>
                            <span className="text-[11px] text-muted-foreground">
                              Was this answer helpful?
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ─── Show All / Show Less ─── */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pt-2"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShowAll}
              className="w-full text-muted-foreground hover:text-amber-700 dark:hover:text-amber-400"
            >
              {showAll ? (
                <>
                  Show Less
                  <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                </>
              ) : (
                <>
                  Show All {qaList.length} Questions
                  <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      {/* ─── Bottom info ─── */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <HelpCircle className="h-3.5 w-3.5 shrink-0" />
        <span>
          Can&apos;t find your answer?{' '}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              setTimeout(() => {
                document.querySelector<HTMLInputElement>(
                  'input[placeholder="Your name"]',
                )?.focus()
              }, 500)
            }}
            className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
          >
            Ask a new question
          </button>{' '}
          above, or contact us via WhatsApp for immediate support.
        </span>
      </div>
    </section>
  )
}

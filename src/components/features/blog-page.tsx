'use client'

import { useState, useEffect } from 'react'
import { Calendar, Tag, ArrowRight, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { useStore } from '@/store/use-store'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  author: string
  tags: string | null
  createdAt: string
}

const gradients = [
  'from-amber-400 via-orange-400 to-rose-400',
  'from-stone-400 via-amber-500 to-yellow-400',
  'from-amber-600 via-orange-500 to-yellow-300',
  'from-yellow-400 via-amber-500 to-orange-500',
  'from-orange-300 via-amber-400 to-stone-400',
  'from-rose-400 via-amber-400 to-yellow-300',
]

export function BlogPage() {
  const { navigate } = useStore()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const parseTags = (tags: string | null): string[] => {
    if (!tags) return []
    try {
      return JSON.parse(tags)
    } catch {
      return []
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <BookOpen className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Design Inspiration & Tips</h1>
            <p className="text-sm text-muted-foreground">
              Expert advice, trends, and ideas for your home
            </p>
          </div>
        </div>
      </motion.div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No articles yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back soon for design tips, trends, and inspiration!
          </p>
        </div>
      )}

      {/* Blog Grid */}
      {!loading && posts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => {
            const tags = parseTags(post.tags)
            const gradient = gradients[index % gradients.length]
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
                onClick={() => navigate('blog-post', { blogSlug: post.slug })}
              >
                <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
                  {/* Cover Image Placeholder */}
                  <div className={`relative h-48 bg-gradient-to-br ${gradient}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white/30" />
                    </div>
                    {tags.length > 0 && (
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1">
                        {tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-white/90 text-stone-800 hover:bg-white text-[10px] backdrop-blur-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <CardContent className="pt-4 pb-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(post.createdAt)}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{post.author}</span>
                    </div>

                    <h2 className="text-base font-semibold leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="mt-3 flex items-center text-sm font-medium text-amber-700 dark:text-amber-400 group-hover:gap-2 transition-all">
                      Read Article
                      <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

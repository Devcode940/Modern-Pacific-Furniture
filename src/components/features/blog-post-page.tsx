'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, User, Tag, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { useStore } from '@/store/use-store'

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  author: string
  tags: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

export function BlogPostPage() {
  const { selectedBlogSlug, navigate } = useStore()
  const [post, setPost] = useState<BlogPostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!selectedBlogSlug) {
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    fetch(`/api/blog/${selectedBlogSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        setPost(data)
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [selectedBlogSlug])

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

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    )
  }

  // Not found state
  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Article Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The article you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button
          onClick={() => navigate('blog')}
          className="mt-4 bg-amber-700 hover:bg-amber-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </div>
    )
  }

  const tags = parseTags(post.tags)
  const paragraphs = post.content.split('\n\n')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('blog')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Button>

      {/* Article Header */}
      <div className="mb-8">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs capitalize"
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Excerpt */}
      <div className="mb-8 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-5">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 leading-relaxed italic">
          {post.excerpt}
        </p>
      </div>

      {/* Content */}
      <article className="prose prose-stone dark:prose-invert max-w-none">
        {paragraphs.map((paragraph, index) => {
          const trimmed = paragraph.trim()
          if (!trimmed) return null

          // Handle headings (## format)
          if (trimmed.startsWith('## ')) {
            return (
              <h2
                key={index}
                className="mb-3 mt-8 text-xl font-bold tracking-tight"
              >
                {trimmed.replace('## ', '')}
              </h2>
            )
          }

          return (
            <p
              key={index}
              className="mb-4 text-foreground/90 leading-relaxed"
            >
              {trimmed}
            </p>
          )
        })}
      </article>

      <Separator className="my-8" />

      {/* Footer */}
      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground mb-3">
          Enjoyed this article? Explore more design tips and inspiration.
        </p>
        <Button
          onClick={() => navigate('blog')}
          className="bg-amber-700 hover:bg-amber-800"
        >
          View All Articles
        </Button>
      </div>
    </motion.div>
  )
}

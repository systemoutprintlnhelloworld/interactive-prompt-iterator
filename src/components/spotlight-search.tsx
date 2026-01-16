'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MessageSquare, Star, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'
import type { ChatSession, FavoritePrompt } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface SpotlightSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSessionSelect: (id: number) => void
  onNavigateToFavorites: () => void
}

export function SpotlightSearch({ open, onOpenChange, onSessionSelect, onNavigateToFavorites }: SpotlightSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'chats' | 'favorites'>('chats')
  const [chatResults, setChatResults] = useState<ChatSession[]>([])
  const [favoriteResults, setFavoriteResults] = useState<FavoritePrompt[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // 搜索对话
  useEffect(() => {
    if (!open) return

    const searchChats = async () => {
      const allSessions = await db.chatSessions.orderBy('updatedAt').reverse().toArray()

      if (!searchQuery.trim()) {
        setChatResults(allSessions.slice(0, 10))
        return
      }

      const query = searchQuery.toLowerCase()
      const filtered = allSessions.filter(session =>
        session.title?.toLowerCase().includes(query) ||
        session.previewText?.toLowerCase().includes(query)
      )
      setChatResults(filtered.slice(0, 10))
    }

    searchChats()
  }, [searchQuery, open])

  // 搜索收藏
  useEffect(() => {
    if (!open) return

    const searchFavorites = async () => {
      const allFavorites = await db.favoritePrompts.orderBy('updatedAt').reverse().toArray()

      if (!searchQuery.trim()) {
        setFavoriteResults(allFavorites.slice(0, 10))
        return
      }

      const query = searchQuery.toLowerCase()
      const filtered = allFavorites.filter(fav =>
        fav.title?.toLowerCase().includes(query) ||
        fav.content?.toLowerCase().includes(query)
      )
      setFavoriteResults(filtered.slice(0, 10))
    }

    searchFavorites()
  }, [searchQuery, open])

  // 重置状态
  useEffect(() => {
    if (open) {
      setSearchQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const results = activeTab === 'chats' ? chatResults : favoriteResults

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      setActiveTab(prev => prev === 'chats' ? 'favorites' : 'chats')
      setSelectedIndex(0)
    }
  }

  const handleSelect = (item: ChatSession | FavoritePrompt) => {
    if (activeTab === 'chats') {
      const session = item as ChatSession
      onSessionSelect(session.id!)
      onOpenChange(false)
    } else {
      onNavigateToFavorites()
      onOpenChange(false)
    }
  }

  const results = activeTab === 'chats' ? chatResults : favoriteResults

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>搜索对话和收藏</DialogTitle>
        </VisuallyHidden>

        {/* 搜索框 */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="搜索对话或收藏... (Tab 切换)"
              className="pl-10 pr-4 h-12 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="flex border-b bg-muted/30">
          <button
            onClick={() => { setActiveTab('chats'); setSelectedIndex(0) }}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'chats'
                ? 'text-primary border-b-2 border-primary bg-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            对话 ({chatResults.length})
          </button>
          <button
            onClick={() => { setActiveTab('favorites'); setSelectedIndex(0) }}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'favorites'
                ? 'text-primary border-b-2 border-primary bg-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className="w-4 h-4" />
            收藏 ({favoriteResults.length})
          </button>
        </div>

        {/* 结果列表 */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>未找到匹配的{activeTab === 'chats' ? '对话' : '收藏'}</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {activeTab === 'chats'
                          ? (item as ChatSession).title
                          : (item as FavoritePrompt).title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate mt-1">
                        {activeTab === 'chats'
                          ? (item as ChatSession).previewText
                          : (item as FavoritePrompt).content?.substring(0, 100)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(item.updatedAt, { addSuffix: true, locale: zhCN })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 快捷键提示 */}
        <div className="p-3 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-4">
            <span><Badge variant="outline" className="mr-1">↑↓</Badge>导航</span>
            <span><Badge variant="outline" className="mr-1">Enter</Badge>选择</span>
            <span><Badge variant="outline" className="mr-1">Tab</Badge>切换</span>
          </div>
          <span><Badge variant="outline" className="mr-1">Esc</Badge>关闭</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

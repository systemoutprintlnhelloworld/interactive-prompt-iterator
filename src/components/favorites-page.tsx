'use client'

import { useState, useEffect } from 'react'
import { Star, Search, Copy, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/db'
import type { FavoritePrompt } from '@/lib/db'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoritePrompt[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFavorites, setFilteredFavorites] = useState<FavoritePrompt[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const loadFavorites = async () => {
    const allFavorites = await db.favoritePrompts.orderBy('updatedAt').reverse().toArray()
    setFavorites(allFavorites)
    setFilteredFavorites(allFavorites)
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  // 搜索过滤
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFavorites(favorites)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = favorites.filter(fav =>
      fav.title?.toLowerCase().includes(query) ||
      fav.content?.toLowerCase().includes(query)
    )
    setFilteredFavorites(filtered)
  }, [searchQuery, favorites])

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
    toast.success('已复制到剪贴板')
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这条收藏吗？')) {
      await db.favoritePrompts.delete(id)
      await loadFavorites()
      toast.success('已删除')
    }
  }

  const handleEdit = (fav: FavoritePrompt) => {
    setEditingId(fav.id!)
    setEditTitle(fav.title)
    setEditContent(fav.content)
  }

  const handleSave = async () => {
    if (!editingId) return
    await db.favoritePrompts.update(editingId, {
      title: editTitle,
      content: editContent,
      updatedAt: new Date()
    })
    setEditingId(null)
    await loadFavorites()
    toast.success('已保存')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
      {/* 搜索框 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索收藏的提示词..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 收藏列表 */}
      {filteredFavorites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>{searchQuery ? '未找到匹配的收藏' : '还没有收藏的提示词'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFavorites.map((fav) => (
            <div key={fav.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              {editingId === fav.id ? (
                <div className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="标题"
                    className="font-medium"
                  />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="内容"
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>保存</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>取消</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{fav.title}</h3>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(fav.content)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(fav)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(fav.id!)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{fav.content}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {formatDistanceToNow(fav.updatedAt, { addSuffix: true, locale: zhCN })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

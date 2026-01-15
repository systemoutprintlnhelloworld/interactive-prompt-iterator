'use client'

import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Trash2, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { db, type ChatSession } from '@/lib/db'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ChatSidebarProps {
    currentSessionId: number | null
    onSessionSelect: (id: number) => void
    onNewChat: () => void
}

export function ChatSidebar({ currentSessionId, onSessionSelect, onNewChat }: ChatSidebarProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(256) // 默认 256px (w-64)
    const [isResizing, setIsResizing] = useState(false)

    const loadSessions = async () => {
        const allSessions = await db.chatSessions.orderBy('updatedAt').reverse().toArray()
        setSessions(allSessions)
    }

    // 从 localStorage 加载折叠状态和宽度
    useEffect(() => {
        const savedCollapsed = localStorage.getItem('sidebar-collapsed')
        if (savedCollapsed !== null) {
            setIsCollapsed(savedCollapsed === 'true')
        }

        const savedWidth = localStorage.getItem('sidebar-width')
        if (savedWidth !== null) {
            setSidebarWidth(parseInt(savedWidth))
        }
    }, [])

    // 保存折叠状态到 localStorage
    const toggleCollapse = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        localStorage.setItem('sidebar-collapsed', String(newState))
    }

    // 处理拖动调整宽度
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return

            const newWidth = e.clientX
            // 限制宽度在 200px 到 500px 之间
            if (newWidth >= 200 && newWidth <= 500) {
                setSidebarWidth(newWidth)
            }
        }

        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false)
                localStorage.setItem('sidebar-width', String(sidebarWidth))
            }
        }

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing, sidebarWidth])

    useEffect(() => {
        loadSessions()
        // Simple polling or event listener could be better, but for now load on mount
        // and we can expose a reload method if needed, or rely on parent updates?
        // Actually, dexie `useLiveQuery` is best but without it, we might just poll or
        // rely on parent triggering re-renders if we move state up.
        // Let's stick to simple effect for now.
    }, [])

    // Listen to custom event for DB updates if we want to be fancy, or just refresh often.
    // For MVP, valid to refresh when list changes.
    useEffect(() => {
        // Hacky execution: refresh every 2 seconds to catch updates from main thread
        const interval = setInterval(loadSessions, 2000)
        return () => clearInterval(interval)
    }, [])

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        e.preventDefault()
        if (confirm('确定要删除这条记录吗？')) {
            try {
                await db.messages.where('sessionId').equals(id).delete()
                await db.chatSessions.delete(id)
                await loadSessions()
                if (currentSessionId === id) {
                    onNewChat()
                }
                toast.success('对话已删除')
            } catch (error) {
                console.error("Failed to delete session:", error)
                toast.error('删除失败')
            }
        }
    }

    const SidebarContent = ({ showToggle = false }: { showToggle?: boolean }) => (
        <div className="flex flex-col h-full py-4">
            <div className={`px-4 mb-4 flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
                {!isCollapsed && (
                    <Button
                        className="flex-1 justify-start gap-2"
                        variant="outline"
                        onClick={() => {
                            onNewChat()
                            setIsOpen(false)
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        新对话
                    </Button>
                )}
                {showToggle && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleCollapse}
                        className="shrink-0"
                        title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 px-4 overflow-auto">
                <div className="flex flex-col gap-2 pb-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`group relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg cursor-pointer transition-all border ${currentSessionId === session.id
                                ? 'bg-secondary border-primary/20'
                                : 'hover:bg-muted/50 border-transparent'
                                } ${isCollapsed ? 'overflow-visible' : ''}`}
                            onClick={() => {
                                onSessionSelect(session.id!)
                                setIsOpen(false)
                            }}
                        >
                            {isCollapsed ? (
                                <>
                                    <MessageSquare className="w-5 h-5" />
                                    {/* 折叠状态下的删除按钮 - 悬浮显示在右侧 */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 h-7 w-7 bg-destructive/90 hover:bg-destructive text-destructive-foreground transition-all shrink-0 rounded-full z-50 ml-1"
                                        onClick={(e) => handleDelete(e, session.id!)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-1 overflow-hidden flex-1 min-w-0 pr-2">
                                        <span className="font-medium text-sm truncate">
                                            {session.title || '未命名对话'}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {formatDistanceToNow(session.updatedAt, { addSuffix: true, locale: zhCN })}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-70 group-hover:opacity-100 h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                                        onClick={(e) => handleDelete(e, session.id!)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}

                    {sessions.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            暂无历史记录
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className="hidden md:flex border-r flex-col bg-card/30 shrink-0 relative h-screen overflow-hidden"
                style={{
                    width: isCollapsed ? '64px' : `${sidebarWidth}px`,
                    transition: isCollapsed ? 'width 0.3s' : 'none'
                }}
            >
                <SidebarContent showToggle={true} />

                {/* 可拖动的分隔条 */}
                {!isCollapsed && (
                    <div
                        className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors ${
                            isResizing ? 'bg-primary' : ''
                        }`}
                        onMouseDown={handleMouseDown}
                    />
                )}
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden absolute left-4 top-4 z-20">
                        <Menu className="w-5 h-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SidebarContent showToggle={false} />
                </SheetContent>
            </Sheet>
        </>
    )
}

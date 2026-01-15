'use client'

import { useEffect, useRef } from 'react'
import { Send, Trash2, StopCircle, User, Bot, Copy, Pencil, Code2, Sparkles } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { ChatSidebar } from '@/components/chat-sidebar'
import { db } from '@/lib/db'
import { useState } from 'react'
import { toast } from 'sonner'
import { SettingsDialog } from '@/components/settings-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { QuestionForm } from '@/components/question-form'
import { PromptProposalCard } from '@/components/prompt-proposal-card'
import { EnhancementForm } from '@/components/enhancement-form'
import { FileUpload } from '@/components/file-upload'

export default function Home() {
  const { apiKey, baseUrl, model, availableModels, setModel } = useAppStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [sessionId, setSessionId] = useState<number | null>(null)
  const sessionIdRef = useRef(sessionId)

  // 关键修复：使用本地状态和 ref
  const [localInput, setLocalInput] = useState('')
  const aiContentRef = useRef('')
  const aiToolInvocationsRef = useRef<any[]>([])

  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isToolRendering, setIsToolRendering] = useState(false) // 工具渲染状态
  const abortControllerRef = useRef<AbortController | null>(null)

  // 文件上传状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | undefined>(undefined)
  const [fileText, setFileText] = useState<string | undefined>(undefined)

  // 不再限制模型识图，统一允许上传并提醒用户
  const modelSupportsVision = true // 允许所有模型上传图片，由用户判断

  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  // 组件卸载时取消正在进行的请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('Component unmounting, aborting request')
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load chat history when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([])
      return
    }

    const loadHistory = async () => {
      const history = await db.messages.where('sessionId').equals(sessionId).sortBy('createdAt')
      const uiMessages = history.map(m => ({
        id: m.id?.toString() || Math.random().toString(),
        role: m.role as any,
        content: m.content,
        toolInvocations: m.toolInvocations,
        file: m.file
      }))
      setMessages(uiMessages)
    }

    loadHistory()
  }, [sessionId])

  // 核心修复：完全绕过 useChat，直接使用 fetch
  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localInput.trim()) return

    // 取消之前的请求（如果有）
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // 创建新的 AbortController
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    let currentId = sessionId

    if (!currentId) {
      const title = localInput.slice(0, 30)
      currentId = await db.chatSessions.add({
        title,
        previewText: title,
        createdAt: new Date(),
        updatedAt: new Date()
      }) as number
      setSessionId(currentId)
    }

    // 构建用户消息内容（包含文件）
    let userContent = localInput
    if (fileText) {
      userContent = `${localInput}\n\n[附件内容]\n${fileText.substring(0, 5000)}`
    } else if (filePreview) {
      userContent = `${localInput}\n\n[已上传图片]`
    }

    const userMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: userContent,
      file: uploadedFile ? {
        name: uploadedFile.name,
        type: uploadedFile.type,
        preview: filePreview
      } : undefined
    }

    // 保存用户消息到数据库（包含文件信息）
    await db.messages.add({
      sessionId: currentId,
      role: 'user',
      content: localInput,
      file: uploadedFile ? {
        name: uploadedFile.name,
        type: uploadedFile.type,
        preview: filePreview
      } : undefined,
      createdAt: new Date()
    })

    // 立即显示用户消息
    setMessages(prev => [...prev, userMessage])
    setLocalInput('')
    setIsLoading(true)

    // 清除文件状态
    setUploadedFile(null)
    setFilePreview(undefined)
    setFileText(undefined)

    // 重置 AI 内容累积器
    aiContentRef.current = ''
    aiToolInvocationsRef.current = []

    // 立即保存空的 AI 消息到数据库（防止 Fast Refresh 时丢失）
    const aiDbId = await db.messages.add({
      sessionId: currentId,
      role: 'assistant',
      content: '',
      createdAt: new Date()
    })

    const aiMessageId = aiDbId.toString()
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: ''
    }

    // 添加空的 AI 消息占位符
    setMessages(prev => [...prev, aiMessage])

    try {
      console.log('Starting fetch request...')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-base-url': baseUrl
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: model
        }),
        signal: abortController.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      console.log('Starting to read stream...')
      let chunkCount = 0
      let lastChunkTime = Date.now()
      const TIMEOUT_MS = 30000 // 30秒超时
      let buffer = ''

      while (true) {
        // 添加超时检测
        if (Date.now() - lastChunkTime > TIMEOUT_MS) {
          console.warn('Stream timeout - no data received for 30s')
          break
        }

        try {
          const { done, value } = await reader.read()

          if (done) {
            console.log('Stream complete normally')
            break
          }

          lastChunkTime = Date.now()
          chunkCount++
          const chunk = decoder.decode(value, { stream: true })
          console.log(`Chunk ${chunkCount} raw:`, chunk.substring(0, 100))
          buffer += chunk

          // 解析 Vercel AI SDK 数据流协议
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留最后一个不完整的行

          for (const line of lines) {
            if (!line.trim()) continue

            console.log('Processing line:', line.substring(0, 100))

            try {
              // Vercel AI SDK 使用格式: "0:text" 或 "9:{json}"
              if (line.startsWith('0:')) {
                // 文本内容
                const text = JSON.parse(line.slice(2))
                aiContentRef.current += text
                console.log('Text added, total length:', aiContentRef.current.length)
              } else if (line.startsWith('9:')) {
                // 工具调用
                const toolData = JSON.parse(line.slice(2))
                console.log('Tool call detected:', toolData)
                aiToolInvocationsRef.current.push(toolData)
                setIsToolRendering(true) // 标记工具正在渲染
              } else {
                // 可能是其他格式，直接累积为文本
                console.log('Unknown format, treating as text')
                aiContentRef.current += line
              }
            } catch (parseError) {
              console.warn('Failed to parse line:', line.substring(0, 50), parseError)
              // 解析失败时，将其作为普通文本处理
              aiContentRef.current += line
            }
          }

          // 更新消息显示
          setMessages(prev => {
            const updated = prev.map(m =>
              m.id === aiMessageId ? {
                ...m,
                content: aiContentRef.current,
                toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
              } : m
            )
            return updated
          })

          // 实时更新数据库（每 10 个 chunk 更新一次）
          if (chunkCount % 10 === 0) {
            db.messages.update(parseInt(aiMessageId), {
              content: aiContentRef.current,
              toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
            }).catch(err => console.error('Failed to update message:', err))
          }
        } catch (readError: any) {
          console.error('Stream read error:', readError)
          break
        }
      }

      console.log('Final AI content length:', aiContentRef.current.length)
      console.log('Tool invocations count:', aiToolInvocationsRef.current.length)

      // 最终更新数据库中的 AI 消息
      if (aiContentRef.current.length > 0 || aiToolInvocationsRef.current.length > 0) {
        await db.messages.update(parseInt(aiMessageId), {
          content: aiContentRef.current,
          toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
        })

        // 更新会话
        await db.chatSessions.update(currentId, {
          updatedAt: new Date(),
          previewText: aiContentRef.current.slice(0, 50)
        })
      }

    } catch (error: any) {
      console.error('Chat error:', error)

      // 如果是用户主动取消或组件卸载导致的中断，不显示错误提示
      if (error.name === 'AbortError') {
        console.log('Request was aborted')
        toast.info('请求已取消', { duration: 2000 })
      } else {
        toast.error(`请求出错: ${error.message}`, { duration: 4000 })
      }
    } finally {
      console.log('Setting isLoading to false')
      setIsLoading(false)
      console.log('isLoading set to false')

      // 清理 AbortController 引用
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }

  const handleNewChat = async () => {
    // 如果有当前会话，删除数据库中的消息
    if (sessionId) {
      try {
        await db.messages.where('sessionId').equals(sessionId).delete()
        await db.chatSessions.delete(sessionId)
      } catch (error) {
        console.error('Failed to delete session:', error)
      }
    }

    setSessionId(null)
    setMessages([])
    setLocalInput('')
    setUploadedFile(null)
    setFilePreview(undefined)
    setFileText(undefined)
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      // 检查是否是图片
      if (item.type.startsWith('image/')) {
        e.preventDefault()

        const file = item.getAsFile()
        if (!file) continue

        // 读取图片并设置预览
        const reader = new FileReader()
        reader.onload = (event) => {
          handleFileSelect(file, event.target?.result as string)
          toast.success('图片已粘贴', {
            description: '提示：请确保您的模型支持图片识别（如 GPT-4o、Claude 3.5 等）',
            duration: 4000
          })
        }
        reader.readAsDataURL(file)
        break
      }
    }
  }

  const handleFileSelect = async (file: File, preview?: string) => {
    setUploadedFile(file)
    setFilePreview(preview)

    // 如果是 PDF 文件，使用客户端解析
    if (file.type === 'application/pdf') {
      try {
        toast.info('正在解析 PDF...', { duration: 3000 })
        const arrayBuffer = await file.arrayBuffer()

        // 动态导入 pdfjs-dist
        const pdfjs = await import('pdfjs-dist')

        // 设置 worker - 使用 public 目录中的静态文件
        if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
        }

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
        let fullText = ''

        // 提取所有页面的文本
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .join(' ')
          fullText += pageText + '\n'
        }

        setFileText(fullText)
        toast.success(`PDF 已解析（${pdf.numPages} 页）`)
      } catch (error: any) {
        console.error('PDF 解析错误:', error)
        toast.error(`PDF 解析失败: ${error.message || '未知错误'}`)
      }
    }
    // DOCX 文件解析
    else if (file.type.includes('wordprocessing') || file.name.endsWith('.docx')) {
      try {
        toast.info('正在解析 DOCX...')
        const arrayBuffer = await file.arrayBuffer()

        // 动态导入 mammoth
        const mammoth = await import('mammoth')

        const result = await mammoth.extractRawText({ arrayBuffer })
        setFileText(result.value)
        toast.success('DOCX 已解析')
      } catch (error: any) {
        console.error('DOCX 解析错误:', error)
        toast.error(`DOCX 解析失败: ${error.message || '未知错误'}`)
      }
    }
    // 文本文件解析
    else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      try {
        const text = await file.text()
        setFileText(text)
        toast.success('文本文件已读取')
      } catch (error: any) {
        console.error('文本文件读取错误:', error)
        toast.error(`文件读取失败: ${error.message || '未知错误'}`)
      }
    }
  }

  const handleFileRemove = () => {
    setUploadedFile(null)
    setFilePreview(undefined)
    setFileText(undefined)
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleEdit = (content: string) => {
    setLocalInput(content)
  }

  const handleDeleteMessage = async (id: string, sessionId: number | null) => {
    setMessages(messages.filter((m: any) => m.id !== id))

    if (id) {
      const dbId = parseInt(id)
      if (!isNaN(dbId)) {
        await db.messages.delete(dbId)
        toast.success("消息已删除")
      }
    }
  }

  const append = async (message: any) => {
    // 添加用户消息
    const userMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: message.content
    }

    setMessages(prev => [...prev, userMessage])

    // 保存到数据库
    if (sessionIdRef.current) {
      await db.messages.add({
        sessionId: sessionIdRef.current,
        role: 'user',
        content: message.content,
        createdAt: new Date()
      })
    }

    // 触发 API 请求
    setIsLoading(true)
    aiContentRef.current = ''
    aiToolInvocationsRef.current = []

    const currentId = sessionIdRef.current

    // 创建 AI 消息占位符
    const aiDbId = await db.messages.add({
      sessionId: currentId!,
      role: 'assistant',
      content: '',
      createdAt: new Date()
    })

    const aiMessageId = aiDbId.toString()
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: ''
    }

    setMessages(prev => [...prev, aiMessage])

    // 发送 API 请求
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-base-url': baseUrl
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: model
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            if (line.startsWith('0:')) {
              const text = JSON.parse(line.slice(2))
              aiContentRef.current += text
            } else if (line.startsWith('9:')) {
              const toolData = JSON.parse(line.slice(2))
              aiToolInvocationsRef.current.push(toolData)
            }
          } catch (e) {
            aiContentRef.current += line
          }
        }

        setMessages(prev => prev.map(m =>
          m.id === aiMessageId ? {
            ...m,
            content: aiContentRef.current,
            toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
          } : m
        ))
      }

      // 保存到数据库
      await db.messages.update(parseInt(aiMessageId), {
        content: aiContentRef.current,
        toolInvocations: aiToolInvocationsRef.current.length > 0 ? aiToolInvocationsRef.current : undefined
      })

    } catch (error: any) {
      console.error('Chat error:', error)
      toast.error(`请求出错: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const stop = () => {
    console.log('Stop button clicked')
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsLoading(false)
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        currentSessionId={sessionId}
        onSessionSelect={setSessionId}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-sm shrink-0 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Prompt Iterator</h1>
            <Badge variant="outline" className="ml-2 text-xs text-muted-foreground font-normal">
              Beta
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[180px] h-8 text-xs font-medium">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.length > 0 ? (
                  availableModels.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                    <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <SettingsDialog />
            <div className="h-6 w-px bg-border mx-2" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleNewChat} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>清空对话</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
            {messages.length === 0 ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-10">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-2">
                    构建完美的提示词
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
                    通过多轮交互引导，将模糊的想法转化为精准、结构化的 AI 指令。
                  </p>
                </div>

                {/* 快速示例 */}
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center">快速开始</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 px-5 text-left justify-start hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setLocalInput('帮我写一篇关于人工智能发展趋势的深度分析文章')}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">📝 AI 趋势分析文章</span>
                        <span className="text-xs text-muted-foreground">生成专业的技术分析文章</span>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-4 px-5 text-left justify-start hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setLocalInput('生成一个关于产品发布会的 PPT 大纲')}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">📊 PPT 大纲生成</span>
                        <span className="text-xs text-muted-foreground">创建结构化演示文稿</span>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-4 px-5 text-left justify-start hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setLocalInput('帮我优化这段代码的性能和可读性')}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">💻 代码优化助手</span>
                        <span className="text-xs text-muted-foreground">提升代码质量和效率</span>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-4 px-5 text-left justify-start hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setLocalInput('设计一个用户调研问卷，了解产品使用体验')}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">📋 问卷设计</span>
                        <span className="text-xs text-muted-foreground">创建专业调研问卷</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {messages.map((m: any) => (
                  <div
                    key={m.id}
                    className={`group flex gap-4 relative mb-8 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role !== 'user' && (
                      <Avatar className="w-8 h-8 mt-1 border shrink-0 bg-secondary/20">
                        <AvatarFallback className="bg-transparent"><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                        <AvatarImage src="/ai-avatar.png" className="opacity-0" />
                      </Avatar>
                    )}

                    <div
                      className={`rounded-2xl px-5 py-3 shadow-sm ${m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm max-w-[85%]'
                        : 'bg-card text-card-foreground border rounded-tl-sm max-w-[95%]'
                        }`}
                    >
                      {/* 只在有内容且不是纯工具调用时显示文本 */}
                      {m.content && !m.content.includes('toolCallId') && !m.content.includes('toolName') && (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                          {m.content}

                          {/* 文字生成期间的等待提示 - 当有内容但表单未生成时显示 */}
                          {m.role === 'assistant' && m.id === messages[messages.length - 1]?.id && isLoading && !m.toolInvocations && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 animate-pulse">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
                              <span className="font-medium text-amber-700 dark:text-amber-300">正在准备交互式表单，请稍候...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 文件预览 */}
                      {m.file?.preview && (
                        <div className="mt-3">
                          <img src={m.file.preview} alt={m.file.name} className="max-w-sm rounded-lg border" />
                        </div>
                      )}
                      {m.file && !m.file.preview && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          📎 {m.file.name}
                        </div>
                      )}

                      {/* Generative UI for Tool Invocations */}
                      {m.toolInvocations?.map((toolInvocation: any) => {
                        const toolCallId = toolInvocation.toolCallId;

                        if (toolInvocation.toolName === 'ask_questions') {
                          return (
                            <div key={toolCallId} className="mt-3">
                              <QuestionForm
                                toolInvocation={toolInvocation}
                                addToolResult={({ toolCallId, result }: { toolCallId: string; result: any }) => {
                                  append({
                                    role: 'user',
                                    content: result
                                  })
                                }}
                              />
                            </div>
                          )
                        }

                        if (toolInvocation.toolName === 'suggest_enhancements') {
                          return (
                            <div key={toolCallId} className="-mx-5 -mb-3 mt-3">
                              <EnhancementForm
                                toolInvocation={toolInvocation}
                                onSubmit={(text) => {
                                  append({
                                    role: 'user',
                                    content: text
                                  })
                                  setIsToolRendering(false)
                                }}
                              />
                            </div>
                          )
                        }

                        if (toolInvocation.toolName === 'propose_prompt') {
                          return (
                            <div key={toolCallId} className="w-full mt-3">
                              <PromptProposalCard
                                toolInvocation={toolInvocation}
                                addToolResult={({ toolCallId, result }: { toolCallId: string; result: any }) => {
                                  setIsToolRendering(false)
                                }}
                              />
                            </div>
                          )
                        }
                        return null
                      })}

                      {/* 加载提示 - 叠加遮罩动画 */}
                      {m.role === 'assistant' && m.id === messages[messages.length - 1]?.id && isLoading && (
                        <>
                          {/* 等待 AI 回复 */}
                          {!m.content && !m.toolInvocations && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                              <span>正在思考...</span>
                            </div>
                          )}

                          {/* 工具调用加载 - 叠加遮罩（即使有文字内容也显示） */}
                          {m.toolInvocations && m.toolInvocations.length > 0 && !m.toolInvocations[0].args && (
                            <div className="mt-3 relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse rounded-lg backdrop-blur-[2px] z-10" />
                              <div className="relative z-20 flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border border-dashed border-primary/30">
                                <Sparkles className="w-4 h-4 animate-spin text-primary" />
                                <span className="font-medium">正在生成交互式表单...</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {m.role === 'user' && (
                      <Avatar className="w-8 h-8 mt-1 border shrink-0 bg-primary/10">
                        <AvatarFallback className="bg-transparent"><User className="w-5 h-5 text-primary" /></AvatarFallback>
                        <AvatarImage src="/user-avatar.png" className="opacity-0" />
                      </Avatar>
                    )}

                    {/* Message Actions */}
                    <div className={`absolute -bottom-6 ${m.role === 'user' ? 'right-12' : 'left-12'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(m.content)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      {m.role === 'user' && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(m.content)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/50 hover:text-destructive" onClick={() => handleDeleteMessage(m.id, sessionId)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="p-4 bg-background border-t shrink-0">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* 文件上传区域 */}
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              currentFile={uploadedFile}
              currentPreview={filePreview}
              modelSupportsVision={modelSupportsVision}
            />

            <form
              onSubmit={onFormSubmit}
              className="relative flex items-end gap-2 p-2 rounded-xl border bg-muted/40 hover:border-primary/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all"
            >
              <Input
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 min-h-[50px]"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                onPaste={handlePaste}
                placeholder="描述你的任务..."
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || (!localInput?.trim())}
                className={`h-10 w-10 mb-1 mr-1 shrink-0 rounded-lg ${isLoading ? 'hidden' : 'flex'}`}
              >
                <Send className="w-4 h-4" />
              </Button>
              {isLoading && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => stop()}
                  className="h-10 w-10 mb-1 mr-1 shrink-0 rounded-lg animate-in fade-in zoom-in"
                >
                  <StopCircle className="w-4 h-4" />
                </Button>
              )}
            </form>
            <div className="text-center text-xs text-muted-foreground mt-2">
              AI 可能会犯错。请核对重要信息。配置仅存储在本地。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

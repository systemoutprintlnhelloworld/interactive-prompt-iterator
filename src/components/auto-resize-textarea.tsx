'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AutoResizeTextareaProps {
  value: string
  onChange: (value: string) => void
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export function AutoResizeTextarea({
  value,
  onChange,
  onPaste,
  placeholder,
  disabled,
  autoFocus,
  className = '',
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState(false)

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = 'auto'

    // 计算最大高度（屏幕高度的 1/4，更大的显示空间）
    const maxHeight = Math.max(window.innerHeight / 4, 150)
    const scrollHeight = textarea.scrollHeight

    if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`
      setShowExpandButton(true)
    } else {
      textarea.style.height = `${scrollHeight}px`
      setShowExpandButton(false)
    }
  }, [value])

  return (
    <>
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={onPaste}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 min-h-[50px] leading-relaxed ${className}`}
          rows={1}
          style={{
            lineHeight: '1.6',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap'
          }}
        />

        {showExpandButton && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setIsExpanded(true)}
            className="absolute right-2 top-2 h-8 w-8 rounded-md bg-background/80 backdrop-blur-sm hover:bg-muted shadow-sm transition-all animate-in fade-in zoom-in z-10"
            title="展开输入框 (查看完整内容)"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 放大对话框 */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>编辑输入内容</DialogTitle>
          </DialogHeader>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-h-[500px] resize-none leading-relaxed"
            autoFocus
            style={{
              lineHeight: '1.6',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap'
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

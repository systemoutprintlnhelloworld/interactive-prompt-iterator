'use client'

import { useState } from 'react'
import { Send, Sparkles, Check, Pencil } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

interface EnhancementOption {
    label: string
    value: string
    description?: string
}

interface EnhancementDimension {
    key: string
    title: string
    options: EnhancementOption[]
    allowCustom: boolean
    selectionType?: 'single' | 'multiple' // 单选或多选
}

interface EnhancementFormProps {
    toolInvocation: any
    addToolResult?: (result: { toolCallId: string; result: any }) => void
    onSubmit?: (text: string) => void
}

export function EnhancementForm({ toolInvocation, addToolResult, onSubmit }: EnhancementFormProps) {
    const { toolCallId, args } = toolInvocation
    const [selections, setSelections] = useState<Record<string, string | string[]>>({}) // 支持单选和多选
    const [customInputs, setCustomInputs] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [forceMultiSelect, setForceMultiSelect] = useState<Record<string, boolean>>({}) // 强制多选
    const [editingOption, setEditingOption] = useState<{ dimKey: string; optionValue: string } | null>(null) // 正在编辑的选项
    const [editedLabels, setEditedLabels] = useState<Record<string, string>>({}) // 编辑后的标签

    // Parse args safely with better error handling
    let formConfig: { dimensions: EnhancementDimension[] } | null = null
    try {
        // 调试：输出原始 args
        console.log('EnhancementForm args:', args)
        console.log('EnhancementForm args type:', typeof args)

        // 处理流式数据：args 可能是对象或字符串
        let parsed = typeof args === 'string' ? JSON.parse(args) : args
        console.log('EnhancementForm parsed:', parsed)

        // 验证解析结果的结构
        if (parsed && typeof parsed === 'object') {
            // 检查是否有 dimensions 字段且为数组
            if (Array.isArray(parsed.dimensions) && parsed.dimensions.length > 0) {
                console.log('Found dimensions:', parsed.dimensions.length)

                // 进一步验证每个 dimension 的结构
                const validDimensions = parsed.dimensions.filter((dim: any) =>
                    dim &&
                    typeof dim === 'object' &&
                    dim.key &&
                    dim.title &&
                    Array.isArray(dim.options) &&
                    dim.options.length > 0
                )

                console.log('Valid dimensions:', validDimensions.length)

                if (validDimensions.length > 0) {
                    formConfig = { dimensions: validDimensions }
                }
            } else {
                console.warn('No valid dimensions array found')
            }
        }
    } catch (e) {
        // JSON 解析失败，可能是流式数据还未完成
        console.error('Enhancement form config parsing error:', e)
        console.error('Args value:', args)
    }

    // 如果配置无效或为空，显示加载状态
    if (!formConfig || !formConfig.dimensions || formConfig.dimensions.length === 0) {
        return (
            <Card className="flex items-center justify-center p-6 border-dashed animate-pulse">
                <Sparkles className="w-5 h-5 text-primary animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">正在分析优化维度...</span>
            </Card>
        )
    }

    const handleSelect = (dimKey: string, value: string, isMultiple: boolean) => {
        setSelections(prev => {
            const newSel = { ...prev }

            if (isMultiple) {
                // 多选逻辑
                const current = Array.isArray(newSel[dimKey]) ? newSel[dimKey] as string[] : []
                if (current.includes(value)) {
                    // 取消选择
                    const filtered = current.filter(v => v !== value)
                    if (filtered.length === 0) {
                        delete newSel[dimKey]
                    } else {
                        newSel[dimKey] = filtered
                    }
                } else {
                    // 添加选择
                    newSel[dimKey] = [...current, value]
                }
            } else {
                // 单选逻辑
                if (newSel[dimKey] === value) {
                    delete newSel[dimKey] // Toggle off
                } else {
                    newSel[dimKey] = value
                }
            }
            return newSel
        })
    }

    const toggleMultiSelect = (dimKey: string) => {
        setForceMultiSelect(prev => ({
            ...prev,
            [dimKey]: !prev[dimKey]
        }))
        // 切换时清空该维度的选择
        setSelections(prev => {
            const newSel = { ...prev }
            delete newSel[dimKey]
            return newSel
        })
    }

    // 获取选项的显示标签（优先使用编辑后的标签）
    const getOptionLabel = (dimKey: string, optionValue: string, originalLabel: string) => {
        const key = `${dimKey}-${optionValue}`
        return editedLabels[key] || originalLabel
    }

    // 处理双击编辑
    const handleDoubleClick = (dimKey: string, optionValue: string, currentLabel: string) => {
        if (submitted) return
        setEditingOption({ dimKey, optionValue })
        const key = `${dimKey}-${optionValue}`
        if (!editedLabels[key]) {
            setEditedLabels(prev => ({ ...prev, [key]: currentLabel }))
        }
    }

    // 保存编辑
    const handleSaveEdit = () => {
        setEditingOption(null)
    }

    const handleSubmit = () => {
        setSubmitted(true)

        // Construct detailed feedback
        const feedbackParts: string[] = []

        formConfig?.dimensions.forEach(dim => {
            const selectedVal = selections[dim.key]
            const customVal = customInputs[dim.key]

            if (customVal && customVal.trim()) {
                feedbackParts.push(`【${dim.title}】: 用户自定义 - ${customVal}`)
            } else if (selectedVal) {
                if (Array.isArray(selectedVal)) {
                    // 多选 - 使用编辑后的标签
                    const labels = selectedVal.map(v => {
                        const opt = dim.options.find(o => o.value === v)
                        const editKey = `${dim.key}-${v}`
                        return editedLabels[editKey] || opt?.label || v
                    })
                    feedbackParts.push(`【${dim.title}】: ${labels.join('、')}`)
                } else {
                    // 单选 - 使用编辑后的标签
                    const opt = dim.options.find(o => o.value === selectedVal)
                    const editKey = `${dim.key}-${selectedVal}`
                    const finalLabel = editedLabels[editKey] || opt?.label || selectedVal
                    feedbackParts.push(`【${dim.title}】: ${finalLabel}`)
                }
            }
            // If neither, implied "Skip/No Change"
        })

        if (feedbackParts.length === 0) {
            feedbackParts.push("用户没有选择任何特定修改，请基于当前理解直接生成最终文档。")
        } else {
            feedbackParts.push("请根据以上选择，生成最终的结构化 Prompt 文档。")
        }

        if (onSubmit) {
            onSubmit(feedbackParts.join('\n'))
        } else if (addToolResult) {
            addToolResult({
                toolCallId,
                result: feedbackParts.join('\n')
            })
        }
    }

    // 如果已提交或有结果，显示已完成状态（不可再交互）
    if (submitted || 'result' in toolInvocation) {
        return (
            <Card className="bg-muted/10 border-dashed">
                <CardContent className="p-4 flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">✓ 已提交优化方向</span>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-none mx-auto border-primary/20 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CardHeader className="bg-primary/5 pb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">优化方向建议</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">请选择您希望改进的维度（未选择将保持默认）</p>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex flex-col">
                    {formConfig.dimensions.map((dim, idx) => {
                        const isMultiple = forceMultiSelect[dim.key] || dim.selectionType === 'multiple'
                        const currentSelection = selections[dim.key]
                        const isSelected = (value: string) => {
                            if (Array.isArray(currentSelection)) {
                                return currentSelection.includes(value)
                            }
                            return currentSelection === value
                        }

                        return (
                        <div key={dim.key} className="p-4 hover:bg-muted/10 transition-colors">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Label className="text-sm font-semibold text-foreground/80">{dim.title}</Label>
                                    {/* 扁平化切换按钮 */}
                                    <div className="inline-flex items-center rounded-md bg-muted p-1 text-xs">
                                        <button
                                            type="button"
                                            disabled={submitted}
                                            onClick={() => isMultiple && toggleMultiSelect(dim.key)}
                                            className={`px-3 py-1 rounded transition-all ${
                                                !isMultiple
                                                    ? 'bg-background text-foreground shadow-sm font-medium'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            } ${submitted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        >
                                            单选
                                        </button>
                                        <button
                                            type="button"
                                            disabled={submitted}
                                            onClick={() => !isMultiple && toggleMultiSelect(dim.key)}
                                            className={`px-3 py-1 rounded transition-all ${
                                                isMultiple
                                                    ? 'bg-background text-foreground shadow-sm font-medium'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            } ${submitted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        >
                                            多选
                                        </button>
                                    </div>
                                </div>
                                {selections[dim.key] && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                        {Array.isArray(currentSelection) ? `已选 ${currentSelection.length}` : '已选'}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {dim.options.map((opt) => {
                                    const selected = isSelected(opt.value)
                                    const isEditing = editingOption?.dimKey === dim.key && editingOption?.optionValue === opt.value
                                    const displayLabel = getOptionLabel(dim.key, opt.value, opt.label)
                                    const editKey = `${dim.key}-${opt.value}`

                                    if (isEditing) {
                                        // 编辑模式：显示输入框
                                        return (
                                            <div key={opt.value} className="flex items-center gap-1">
                                                <Input
                                                    autoFocus
                                                    className="h-8 text-xs w-32"
                                                    value={editedLabels[editKey] || opt.label}
                                                    onChange={(e) => setEditedLabels(prev => ({ ...prev, [editKey]: e.target.value }))}
                                                    onBlur={handleSaveEdit}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveEdit()
                                                        if (e.key === 'Escape') {
                                                            setEditedLabels(prev => {
                                                                const newLabels = { ...prev }
                                                                delete newLabels[editKey]
                                                                return newLabels
                                                            })
                                                            setEditingOption(null)
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )
                                    }

                                    // 正常模式：显示按钮
                                    return (
                                        <Button
                                            key={opt.value}
                                            variant={selected ? "default" : "outline"}
                                            size="sm"
                                            disabled={submitted}
                                            className={`group/btn relative h-8 text-xs transition-all duration-200 ${
                                                selected
                                                    ? 'shadow-md scale-105'
                                                    : 'text-muted-foreground border-muted-foreground/30 hover:border-primary/50 hover:shadow-sm'
                                            }`}
                                            onClick={() => handleSelect(dim.key, opt.value, isMultiple)}
                                            onDoubleClick={() => handleDoubleClick(dim.key, opt.value, displayLabel)}
                                            title={`${opt.description || ''}\n\n💡 双击可编辑选项文本`}
                                        >
                                            {displayLabel}
                                            {/* 双击编辑提示 - 悬停时显示 */}
                                            {!submitted && (
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-[10px] font-medium whitespace-nowrap shadow-lg">
                                                        <Pencil className="w-2.5 h-2.5" />
                                                        双击编辑
                                                    </span>
                                                </span>
                                            )}
                                        </Button>
                                    )
                                })}
                            </div>

                            {dim.allowCustom && (
                                <Input
                                    placeholder="其他 (输入自定义要求)..."
                                    className="h-8 text-xs bg-transparent border-input/50 focus-visible:ring-primary/20"
                                    value={customInputs[dim.key] || ''}
                                    disabled={submitted}
                                    onChange={(e) => setCustomInputs(prev => ({ ...prev, [dim.key]: e.target.value }))}
                                />
                            )}

                            {idx < (formConfig?.dimensions.length || 0) - 1 && <Separator className="mt-4 opacity-50" />}
                        </div>
                        )
                    })}
                </div>
            </CardContent>

            <CardFooter className="bg-muted/30 p-4 border-t sticky bottom-0 z-10">
                <Button className="w-full gap-2 shadow-lg" onClick={handleSubmit}>
                    <Send className="w-4 h-4" />
                    生成最终 Prompt 文档
                </Button>
            </CardFooter>
        </Card>
    )
}

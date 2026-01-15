'use client'

import { useState, useEffect } from 'react'
import { Settings, Check, AlertCircle, RefreshCw, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TEST_CONFIG = {
    apiKey: 'sk-xMUZVRACBogvAsbFxm2buTDoixjx7APxES7cBh5TELHABCe0',
    baseUrl: 'https://ai.huan666.de/v1',
    model: 'claude-sonnet-4-5-20250929',
    systemPrompt: '你是交互式提示词优化助手。你的目标是通过多轮对话，引导用户明确需求，并最终生成高质量的结构化提示词。你应该主动提出建议，使用Checkbox等形式让用户选择。'
}

const DEFAULT_SYSTEM_PROMPT = `你是交互式提示词优化助手。你的目标是通过多轮对话，引导用户明确需求，并最终生成高质量的结构化提示词。

**核心工作流程**:

1. **Phase 1: 理解与总结**
   - 当用户提出初步需求时，**不要直接生成 Prompt**。
   - 必须调用 \`suggest_enhancements\` 工具，提供 3-5 个关键维度的优化建议。
   - 维度示例：
     - **角色设定**: (e.g., 资深客户、创意总监、严谨学者)
     - **思考风格**: (e.g., 专业严谨、幽默风趣、简明扼要)
     - **思考深度**: (e.g., 一步到位、思维链CoT、多角度讨论)
     - **输出格式**: (e.g., Markdown文档、JSON、表格)
   - 每个维度提供 2-3 个具体的用户点选项，并允许自定义。

2. **Phase 2: 交互生成**
   - 当调用 \`suggest_enhancements\` 的工具反应（用户的选择）后，生成最终的 Markdown 文档。
   - **文档格式要求**:
     - 标题提示词方案 (H1)
     - 必须包含 ##角色定义 (H2)
     - 必须包含 ##核心目标 (H2)
     - 必须包含 ##工作流程 (H2)
     - 必须包含 ##约束条件 (H2)
     - 必须包含 ##知识边界 (H2)

3. **Phase 3: 最终确认**
   - 调用 \`propose_prompt\` 工具，将生成的 Markdown 提示词展示给用户。
   - 用户可以：复制使用、继续优化、重新生成

**重要原则**:
- 不要跳过 Phase 1 直接生成提示词
- 必须使用工具进行交互，不要纯文本输出选项
- 生成的提示词必须结构化、可复用`

export function SettingsDialog() {
    const { apiKey, baseUrl, model, systemPrompt, availableModels, setApiKey, setBaseUrl, setModel, setSystemPrompt, setAvailableModels } = useAppStore()
    const [open, setOpen] = useState(false)
    const [localConfig, setLocalConfig] = useState({ apiKey, baseUrl, model, systemPrompt })

    // Connection Test State
    const [isChecking, setIsChecking] = useState(false)
    const [checkStatus, setCheckStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [checkMessage, setCheckMessage] = useState('')

    // Custom Templates State
    const [customTemplates, setCustomTemplates] = useState<Array<{name: string, content: string}>>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('default')
    const [isAddingTemplate, setIsAddingTemplate] = useState(false)
    const [newTemplateName, setNewTemplateName] = useState('')

    // Initial sync
    useEffect(() => {
        if (open) {
            setLocalConfig({ apiKey, baseUrl, model, systemPrompt })
            setCheckStatus('idle')
            // Load custom templates from localStorage
            const saved = localStorage.getItem('custom-prompt-templates')
            if (saved) {
                try {
                    setCustomTemplates(JSON.parse(saved))
                } catch (e) {
                    console.error('Failed to load templates:', e)
                }
            }
        }
    }, [open, apiKey, baseUrl, model, systemPrompt])

    const normalizeUrl = (url: string) => {
        let cleanUrl = url.trim()
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1)
        return cleanUrl
    }

    const checkConnection = async () => {
        setIsChecking(true)
        setCheckStatus('idle')
        setCheckMessage('')
        setAvailableModels([])

        try {
            const cleanUrl = normalizeUrl(localConfig.baseUrl)
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (localConfig.apiKey && localConfig.apiKey !== 'demo') {
                headers['Authorization'] = `Bearer ${localConfig.apiKey}`
            }

            const response = await fetch(`${cleanUrl}/models`, {
                method: 'GET',
                headers
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            if (data && Array.isArray(data.data)) {
                const models = data.data.map((m: any) => m.id).sort()
                setAvailableModels(models)
                setCheckStatus('success')
                setCheckMessage(`连接成功！获取到 ${models.length} 个模型。`)
            } else {
                throw new Error('响应格式不符合 OpenAI 标准 (missing data array)')
            }
        } catch (error: any) {
            setCheckStatus('error')
            setCheckMessage(error.message || '连接失败')
        } finally {
            setIsChecking(false)
        }
    }

    const applyPreset = (type: 'deepseek' | 'openai' | 'demo') => {
        let newConfig = { ...localConfig }
        if (type === 'deepseek') {
            newConfig = {
                ...newConfig,
                baseUrl: 'https://ai.huan666.de/v1',
                apiKey: '',
                model: 'deepseek-chat'
            }
        } else if (type === 'openai') {
            newConfig = {
                ...newConfig,
                baseUrl: 'https://api.openai.com/v1',
                apiKey: '',
                model: 'gpt-4-turbo'
            }
        } else if (type === 'demo') {
            newConfig = {
                ...newConfig,
                baseUrl: 'https://api.openai.com/v1',
                apiKey: 'demo',
                model: 'gpt-3.5-turbo'
            }
        }
        setLocalConfig(newConfig)
        setCheckStatus('idle')
    }

    const handleTemplateChange = (val: string) => {
        setSelectedTemplate(val)
        if (val === 'default') {
            setLocalConfig(prev => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }))
        } else {
            const template = customTemplates.find(t => t.name === val)
            if (template) {
                setLocalConfig(prev => ({ ...prev, systemPrompt: template.content }))
            }
        }
    }

    const loadTestConfig = () => {
        setLocalConfig(TEST_CONFIG)
        setCheckStatus('idle')
        setCheckMessage('')
    }

    const handleAddTemplate = () => {
        if (!newTemplateName.trim()) return
        const newTemplate = {
            name: newTemplateName.trim(),
            content: localConfig.systemPrompt
        }
        const updated = [...customTemplates, newTemplate]
        setCustomTemplates(updated)
        localStorage.setItem('custom-prompt-templates', JSON.stringify(updated))
        setNewTemplateName('')
        setIsAddingTemplate(false)
        setSelectedTemplate(newTemplate.name)
    }

    const handleDeleteTemplate = (name: string) => {
        const updated = customTemplates.filter(t => t.name !== name)
        setCustomTemplates(updated)
        localStorage.setItem('custom-prompt-templates', JSON.stringify(updated))
        if (selectedTemplate === name) {
            setSelectedTemplate('default')
            setLocalConfig(prev => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }))
        }
    }

    const handleSave = () => {
        setApiKey(localConfig.apiKey)
        setBaseUrl(localConfig.baseUrl)
        setModel(localConfig.model)
        setSystemPrompt(localConfig.systemPrompt)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>系统设置</DialogTitle>
                    <DialogDescription>
                        配置 API 连接与系统提示词逻辑
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="config" className="flex-1 flex flex-col min-h-0 w-full">
                    <TabsList className="mx-6 mt-2 grid w-[300px] grid-cols-2">
                        <TabsTrigger value="config">基础配置</TabsTrigger>
                        <TabsTrigger value="prompt">提示词管理</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto p-6 pt-4">
                        <TabsContent value="config" className="space-y-6 mt-0">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={loadTestConfig} className="flex-1">
                                    🧪 测试预设（一键配置）
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Base URL</Label>
                                    <Input
                                        value={localConfig.baseUrl}
                                        onChange={e => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                                        className="font-mono text-sm"
                                        placeholder="https://api.openai.com/v1"
                                    />
                                    <p className="text-xs text-muted-foreground">通常以 /v1 结尾</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>API Key</Label>
                                    <Input
                                        type="password"
                                        value={localConfig.apiKey}
                                        onChange={e => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                                        className="font-mono text-sm"
                                        placeholder="sk-..."
                                    />
                                </div>

                                <div className="flex items-center justify-between bg-muted/40 p-3 rounded-md border">
                                    <div className="flex items-center gap-2 text-sm">
                                        {isChecking ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> :
                                            checkStatus === 'success' ? <Check className="w-4 h-4 text-green-500" /> :
                                                checkStatus === 'error' ? <AlertCircle className="w-4 h-4 text-destructive" /> : null}
                                        <span className={checkStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'}>
                                            {isChecking ? "连接中..." : checkMessage || "点击测试连接以获取模型列表"}
                                        </span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={checkConnection} disabled={isChecking}>
                                        <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isChecking ? 'animate-spin' : ''}`} /> 测试连接
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>选择模型</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                value={localConfig.model}
                                                onChange={e => setLocalConfig({ ...localConfig, model: e.target.value })}
                                                placeholder="自定义或选择..."
                                                className="font-mono text-sm"
                                            />
                                        </div>
                                        {availableModels.length > 0 && (
                                            <Select onValueChange={(val) => setLocalConfig(prev => ({ ...prev, model: val }))} value={localConfig.model}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="选择模型" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" sideOffset={5} className="max-h-[300px] z-50">
                                                    {availableModels.map(m => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">收到模型列表后，您可以直接选择或手动输入</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="prompt" className="space-y-6 mt-0">
                            <div className="flex items-center justify-between">
                                <Label>系统提示词模板</Label>
                                <div className="flex gap-2">
                                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-50">
                                            <SelectItem value="default">默认模板</SelectItem>
                                            {customTemplates.map(t => (
                                                <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!isAddingTemplate && (
                                        <Button size="sm" variant="outline" onClick={() => setIsAddingTemplate(true)}>
                                            + 保存为新模板
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isAddingTemplate && (
                                <div className="flex gap-2 p-3 bg-muted/30 rounded-lg border">
                                    <Input
                                        placeholder="输入模板名称..."
                                        value={newTemplateName}
                                        onChange={e => setNewTemplateName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTemplate()}
                                        className="flex-1"
                                    />
                                    <Button size="sm" onClick={handleAddTemplate} disabled={!newTemplateName.trim()}>
                                        保存
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingTemplate(false)}>
                                        取消
                                    </Button>
                                </div>
                            )}

                            {selectedTemplate !== 'default' && (
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteTemplate(selectedTemplate)}
                                    >
                                        删除当前模板
                                    </Button>
                                </div>
                            )}

                            <Textarea
                                className="min-h-[400px] font-mono text-sm leading-relaxed p-4"
                                value={localConfig.systemPrompt}
                                onChange={e => {
                                    setLocalConfig({ ...localConfig, systemPrompt: e.target.value })
                                    setSelectedTemplate('custom')
                                }}
                                placeholder="在此输入 System Prompt..."
                            />
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="p-6 pt-2 border-t mt-auto bg-muted/10">
                    <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" /> 保存更改
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { Settings, Check, AlertCircle, RefreshCw, Loader2, Save, Upload, Download } from 'lucide-react'
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations, useLocale } from 'next-intl'

const TEST_CONFIG = {
    apiKey: 'sk-xMUZVRACBogvAsbFxm2buTDoixjx7APxES7cBh5TELHABCe0',
    baseUrl: 'https://ai.huan666.de/v1',
    model: 'deepseek-v3.2-exp',
    systemPrompt: '你是交互式提示词优化助手。你的目标是通过多轮对话，引导用户明确需求，并最终生成高质量的结构化提示词。你应该主动提出建议，使用Checkbox等形式让用户选择。',
    correctionModel: 'grok-beta-fast'
}

const DEFAULT_SYSTEM_PROMPT_ZH = `你是交互式提示词优化助手。你的目标是通过多轮对话，引导用户明确需求，并最终生成高质量的结构化提示词。

**核心工作流程**:

1. **Phase 1: 理解与总结**
   - 当用户提出初步需求时，**不要直接生成 Prompt**。
   - **严格要求**：你必须调用 \`suggest_enhancements\` 工具，提供 3-5 个关键维度的优化建议。
   - **禁止行为**：绝对不要直接输出 JSON 字符串或文本形式的选项，必须通过工具调用。
   - 维度示例：
     - **角色设定**: (e.g., 资深客户、创意总监、严谨学者)
     - **思考风格**: (e.g., 专业严谨、幽默风趣、简明扼要)
     - **思考深度**: (e.g., 一步到位、思维链CoT、多角度讨论)
     - **输出格式**: (e.g., Markdown文档、JSON、表格)
   - 每个维度提供 2-3 个具体的用户点选项，并允许自定义。

2. **Phase 2: 交互生成**
   - 当收到 \`suggest_enhancements\` 的工具响应（用户的选择）后，生成最终的 Markdown 文档。
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
- **绝对禁止**：不要输出原始 JSON 或文本形式的选项，必须使用工具调用
- 生成的提示词必须结构化、可复用
- 如果工具调用失败，请重试，不要回退到文本输出

---

**One-Shot 示例**:

用户输入："帮我写一篇关于 React Server Components 的技术文章"

助手响应：
1. 立即调用 suggest_enhancements 工具，展示交互式表格：
   - 角色设定：资深技术作家 / AI专家 / 科普作者
   - 语气风格：专业正式 / 轻松易读 / 学术严谨
   - 内容深度：深度分析 / 适中 / 简明概述
   - 输出格式：Markdown文档 / 结构化大纲 / 分段式文章

2. 用户选择后（例如：资深技术作家 + 专业正式 + 深度分析 + Markdown文档）

3. 助手调用 propose_prompt 工具生成完整提示词：
   - 角色定义：你是一位资深技术作家，擅长深入浅出地解释复杂技术概念
   - 核心目标：撰写一篇关于 React Server Components 的深度技术分析文章
   - 工作流程：技术背景介绍 → 核心概念解析 → 实际应用场景 → 最佳实践建议
   - 约束条件：保持专业严谨的语气、提供代码示例、引用官方文档
   - 知识边界：基于 React 18+ 版本，涵盖服务端渲染的最新实践`

const DEFAULT_SYSTEM_PROMPT_EN = `You are an interactive prompt optimization assistant. Your goal is to guide users through multi-turn conversations to clarify their requirements and ultimately generate high-quality, structured prompts.

**Core Workflow**:

1. **Phase 1: Understanding & Summarization**
   - When users present initial requirements, **DO NOT generate prompts directly**.
   - **Strict Requirement**: You MUST call the \`suggest_enhancements\` tool to provide 3-5 key optimization dimensions.
   - **Prohibited Behavior**: Never output raw JSON strings or text-based options directly. Always use tool calls.
   - Example dimensions:
     - **Role Definition**: (e.g., Senior Consultant, Creative Director, Rigorous Scholar)
     - **Thinking Style**: (e.g., Professional & Rigorous, Humorous & Witty, Concise & Clear)
     - **Thinking Depth**: (e.g., Direct Answer, Chain-of-Thought, Multi-perspective Discussion)
     - **Output Format**: (e.g., Markdown Document, JSON, Table)
   - Provide 2-3 specific user-selectable options for each dimension, and allow customization.

2. **Phase 2: Interactive Generation**
   - After receiving the tool response from \`suggest_enhancements\` (user's selections), generate the final Markdown document.
   - **Document Format Requirements**:
     - Title: Prompt Proposal (H1)
     - Must include ##Role Definition (H2)
     - Must include ##Core Objective (H2)
     - Must include ##Workflow (H2)
     - Must include ##Constraints (H2)
     - Must include ##Knowledge Boundaries (H2)

3. **Phase 3: Final Confirmation**
   - Call the \`propose_prompt\` tool to present the generated Markdown prompt to the user.
   - Users can: copy and use, continue optimizing, or regenerate

**Important Principles**:
- Do not skip Phase 1 and generate prompts directly
- **Absolutely Prohibited**: Never output raw JSON or text-based options. Always use tool calls.
- Generated prompts must be structured and reusable
- If tool call fails, retry instead of falling back to text output

---

**One-Shot Example**:

User input: "Help me write a technical article about React Server Components"

Assistant response:
1. Immediately call suggest_enhancements tool to display interactive table:
   - Role Definition: Senior Tech Writer / AI Expert / Science Communicator
   - Tone: Professional & Formal / Casual & Readable / Academic & Rigorous
   - Content Depth: Deep Analysis / Moderate / Brief Overview
   - Output Format: Markdown Document / Structured Outline / Segmented Article

2. After user selection (e.g., Senior Tech Writer + Professional & Formal + Deep Analysis + Markdown Document)

3. Assistant calls propose_prompt tool to generate complete prompt:
   - Role Definition: You are a senior technical writer skilled at explaining complex technical concepts clearly
   - Core Objective: Write an in-depth technical analysis article about React Server Components
   - Workflow: Technical background introduction → Core concept analysis → Practical use cases → Best practice recommendations
   - Constraints: Maintain professional and rigorous tone, provide code examples, cite official documentation
   - Knowledge Boundaries: Based on React 18+ version, covering latest server-side rendering practices`

export function SettingsDialog() {
    const t = useTranslations();
    const locale = useLocale();
    const DEFAULT_SYSTEM_PROMPT = locale === 'zh-CN' ? DEFAULT_SYSTEM_PROMPT_ZH : DEFAULT_SYSTEM_PROMPT_EN;
    const { apiKey, baseUrl, model, systemPrompt, availableModels, correctionModel, setApiKey, setBaseUrl, setModel, setSystemPrompt, setAvailableModels, setCorrectionModel } = useAppStore()
    const [open, setOpen] = useState(false)
    const [localConfig, setLocalConfig] = useState({ apiKey, baseUrl, model, systemPrompt, correctionModel })

    // Connection Test State
    const [isChecking, setIsChecking] = useState(false)
    const [checkStatus, setCheckStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [checkMessage, setCheckMessage] = useState('')

    // Custom Templates State
    const [customTemplates, setCustomTemplates] = useState<Array<{name: string, content: string}>>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('default')
    const [isAddingTemplate, setIsAddingTemplate] = useState(false)
    const [newTemplateName, setNewTemplateName] = useState('')
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [templateToDelete, setTemplateToDelete] = useState<string>('')

    // Initial sync
    useEffect(() => {
        if (open) {
            // Check if current systemPrompt is one of the default prompts
            // Check by exact match or by starting text to handle old versions
            const isDefaultPrompt = systemPrompt === DEFAULT_SYSTEM_PROMPT_ZH ||
                                   systemPrompt === DEFAULT_SYSTEM_PROMPT_EN ||
                                   systemPrompt.startsWith('你是交互式提示词优化助手') ||
                                   systemPrompt.startsWith('You are an interactive prompt optimization assistant')

            // If it's a default prompt, use the current locale's default
            // Otherwise, keep the custom prompt
            const promptToUse = isDefaultPrompt ? DEFAULT_SYSTEM_PROMPT : systemPrompt

            setLocalConfig({
                apiKey,
                baseUrl,
                model,
                systemPrompt: promptToUse,
                correctionModel
            })
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
    }, [open, apiKey, baseUrl, model, systemPrompt, DEFAULT_SYSTEM_PROMPT])

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
                setCheckMessage(t('settings.connectionSuccess', { count: models.length }))
            } else {
                throw new Error('响应格式不符合 OpenAI 标准 (missing data array)')
            }
        } catch (error: any) {
            setCheckStatus('error')
            setCheckMessage(error.message || t('settings.connectionFailed'))
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
                model: 'deepseek-v3.2-exp'
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
            // Always use the current locale's default prompt
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
        setTemplateToDelete(name)
        setDeleteConfirmOpen(true)
    }

    const confirmDeleteTemplate = () => {
        const updated = customTemplates.filter(t => t.name !== templateToDelete)
        setCustomTemplates(updated)
        localStorage.setItem('custom-prompt-templates', JSON.stringify(updated))
        if (selectedTemplate === templateToDelete) {
            setSelectedTemplate('default')
            setLocalConfig(prev => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }))
        }
        setDeleteConfirmOpen(false)
        setTemplateToDelete('')
    }

    const handleSave = () => {
        setApiKey(localConfig.apiKey)
        setBaseUrl(localConfig.baseUrl)
        setModel(localConfig.model)
        setSystemPrompt(localConfig.systemPrompt)
        setCorrectionModel(localConfig.correctionModel)
        setOpen(false)
    }

    const handleExportSettings = () => {
        const settings = {
            apiKey: localConfig.apiKey,
            baseUrl: localConfig.baseUrl,
            model: localConfig.model,
            systemPrompt: localConfig.systemPrompt,
            correctionModel: localConfig.correctionModel,
            exportTime: new Date().toISOString()
        }
        const jsonString = JSON.stringify(settings)
        const base64String = btoa(unescape(encodeURIComponent(jsonString)))
        navigator.clipboard.writeText(base64String).then(() => {
            alert(t('settings.exportSuccess'))
        }).catch(() => {
            // 如果复制失败，显示在弹窗中让用户手动复制
            prompt(t('settings.exportPrompt'), base64String)
        })
    }

    const handleImportSettings = async () => {
        try {
            // 尝试从剪贴板读取
            const clipboardText = await navigator.clipboard.readText()
            let base64String = clipboardText.trim()

            // 如果剪贴板为空或无效，回退到手动输入
            if (!base64String) {
                const userInput = prompt(t('settings.importPrompt'))
                if (!userInput) return
                base64String = userInput.trim()
            }

            // 解析配置
            const jsonString = decodeURIComponent(escape(atob(base64String)))
            const settings = JSON.parse(jsonString)
            setLocalConfig({
                apiKey: settings.apiKey || '',
                baseUrl: settings.baseUrl || '',
                model: settings.model || '',
                systemPrompt: settings.systemPrompt || '',
                correctionModel: settings.correctionModel || 'grok-beta-fast'
            })
            alert(t('settings.importSuccess'))
        } catch (error) {
            // 如果剪贴板读取失败或解析失败，回退到手动输入
            const base64String = prompt(t('settings.importError') + '\n' + t('settings.importPrompt'))
            if (!base64String) return

            try {
                const jsonString = decodeURIComponent(escape(atob(base64String.trim())))
                const settings = JSON.parse(jsonString)
                setLocalConfig({
                    apiKey: settings.apiKey || '',
                    baseUrl: settings.baseUrl || '',
                    model: settings.model || '',
                    systemPrompt: settings.systemPrompt || '',
                    correctionModel: settings.correctionModel || 'grok-beta-fast'
                })
                alert(t('settings.importSuccess'))
            } catch (error) {
                alert(t('settings.importError'))
            }
        }
    }

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" data-settings-trigger>
                    <Settings className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>{t('settings.title')}</DialogTitle>
                    <DialogDescription>
                        {t('settings.description')}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="config" className="flex-1 flex flex-col min-h-0 w-full">
                    <TabsList className="mx-6 mt-2 grid w-[300px] grid-cols-2">
                        <TabsTrigger value="config">{t('settings.basicConfig')}</TabsTrigger>
                        <TabsTrigger value="prompt">{t('settings.promptManagement')}</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto p-6 pt-4">
                        <TabsContent value="config" className="space-y-6 mt-0">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={loadTestConfig} className="flex-1">
                                    {t('settings.testPreset')}
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t('settings.baseUrl')}</Label>
                                    <Input
                                        value={localConfig.baseUrl}
                                        onChange={e => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                                        className="font-mono text-sm"
                                        placeholder="https://api.openai.com/v1"
                                    />
                                    <p className="text-xs text-muted-foreground">{t('settings.baseUrlHint')}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('settings.apiKey')}</Label>
                                    <Input
                                        type="password"
                                        value={localConfig.apiKey}
                                        onChange={e => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                                        className="font-mono text-sm"
                                        placeholder="sk-..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('settings.correctionModel')}</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                value={localConfig.correctionModel}
                                                onChange={e => setLocalConfig({ ...localConfig, correctionModel: e.target.value })}
                                                placeholder="grok-beta-fast"
                                                className="font-mono text-sm"
                                            />
                                        </div>
                                        {availableModels.length > 0 && (
                                            <Select onValueChange={(val) => setLocalConfig(prev => ({ ...prev, correctionModel: val }))} value={localConfig.correctionModel}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder={t('settings.selectModel')} />
                                                </SelectTrigger>
                                                <SelectContent position="popper" sideOffset={5} className="max-h-[300px] z-50">
                                                    {availableModels.map(m => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t('settings.correctionModelHint')}</p>
                                </div>

                                <div className="flex items-center justify-between bg-muted/40 p-3 rounded-md border">
                                    <div className="flex items-center gap-2 text-sm">
                                        {isChecking ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> :
                                            checkStatus === 'success' ? <Check className="w-4 h-4 text-green-500" /> :
                                                checkStatus === 'error' ? <AlertCircle className="w-4 h-4 text-destructive" /> : null}
                                        <span className={checkStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'}>
                                            {isChecking ? t('settings.connecting') : checkMessage || t('settings.clickToTest')}
                                        </span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={checkConnection} disabled={isChecking}>
                                        <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isChecking ? 'animate-spin' : ''}`} /> {t('settings.testConnection')}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('settings.selectModel')}</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                value={localConfig.model}
                                                onChange={e => setLocalConfig({ ...localConfig, model: e.target.value })}
                                                placeholder={t('settings.modelPlaceholder')}
                                                className="font-mono text-sm"
                                            />
                                        </div>
                                        {availableModels.length > 0 && (
                                            <Select onValueChange={(val) => setLocalConfig(prev => ({ ...prev, model: val }))} value={localConfig.model}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder={t('settings.selectModel')} />
                                                </SelectTrigger>
                                                <SelectContent position="popper" sideOffset={5} className="max-h-[300px] z-50">
                                                    {availableModels.map(m => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t('settings.modelHint')}</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="prompt" className="space-y-6 mt-0">
                            <div className="flex items-center justify-between">
                                <Label>{t('settings.systemPromptTemplate')}</Label>
                                <div className="flex gap-2">
                                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-50">
                                            <SelectItem value="default">{t('settings.defaultTemplate')}</SelectItem>
                                            {customTemplates.map(t => (
                                                <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!isAddingTemplate && (
                                        <Button size="sm" variant="outline" onClick={() => setIsAddingTemplate(true)}>
                                            {t('settings.saveAsNewTemplate')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isAddingTemplate && (
                                <div className="flex gap-2 p-3 bg-muted/30 rounded-lg border">
                                    <Input
                                        placeholder={t('settings.templateNamePlaceholder')}
                                        value={newTemplateName}
                                        onChange={e => setNewTemplateName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTemplate()}
                                        className="flex-1"
                                    />
                                    <Button size="sm" onClick={handleAddTemplate} disabled={!newTemplateName.trim()}>
                                        {t('favoritesDialog.saveButton')}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingTemplate(false)}>
                                        {t('favoritesDialog.cancelButton')}
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
                                        {t('settings.deleteCurrentTemplate')}
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
                                placeholder={t('settings.promptPlaceholder')}
                            />
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="p-6 pt-2 border-t mt-auto bg-muted/10">
                    <div className="flex items-center gap-2 mr-auto">
                        <Button variant="outline" size="sm" onClick={handleImportSettings}>
                            <Upload className="w-4 h-4 mr-2" /> {t('settings.importSettings')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportSettings}>
                            <Download className="w-4 h-4 mr-2" /> {t('settings.exportSettings')}
                        </Button>
                    </div>
                    <Button variant="outline" onClick={() => setOpen(false)}>{t('settings.cancel')}</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" /> {t('settings.saveChanges')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('settings.deleteTemplateTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('settings.deleteTemplateDescription', { name: templateToDelete })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
                        {t('favoritesDialog.cancelButton')}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('settings.confirmDelete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
    )
}

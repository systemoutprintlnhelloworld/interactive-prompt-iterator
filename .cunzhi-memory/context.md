# 项目上下文信息

- prompt-decorators 项目核心设计：1) 使用 +++Decorator 语法作为结构化前缀；2) 分为认知生成类（Reasoning, StepByStep, Socratic等）和表达系统类（OutputFormat, Tone等）；3) 支持装饰器组合和作用域控制（MessageScope, ChatScope）；4) 无需重新训练模型，通过声明式语法控制 AI 行为；5) 452 stars，MIT 协议，有完整的学术论文支持。
- # 提示词优化器核心架构设计（三层架构）

## 架构层次
1. **装饰器层（Decorator Layer）**：控制 AI 回答风格
   - 基于 prompt-decorators 项目（452⭐）
   - 使用 `+++Decorator` 语法（如 `+++Reasoning`, `+++StepByStep`）
   - 提供预设模式：学术研究、代码开发、创意写作、数据分析

2. **内容优化层（Content Optimization Layer）**：AI 自动分析生成优化维度
   - **关键点**：不是预设选项，而是根据用户粗提示词动态分析
   - AI 需要理解用户意图，生成针对性的优化建议
   - 生成多维度表单供用户选择/修改

3. **可视化层（Visualization Layer）**：展示优化前后对比
   - 显示哪些地方被优化了
   - Before/After 对比视图
   - 让用户直观看到改进效果

## 交互模式
- **一轮交互**：所有维度一次性展示，避免多轮对话
- 支持快速模式（预设）+ 自定义模式
- # GitHub 项目调研清单

## 已深入分析
1. **prompt-decorators** (452⭐, MIT)
   - 仓库：https://github.com/nomyx-io/prompt-decorators
   - 核心特性：
     * 声明式装饰器语法 `+++Decorator`
     * 两大类别：认知生成类（Reasoning, StepByStep, Socratic, Debate）、表达系统类（Tone, OutputFormat）
     * 作用域控制：MessageScope, ChatScope, Clear
     * 参数化设计：`+++Refine(iterations=3)`, `+++Tone(style=formal)`
   - 可借鉴点：装饰器映射表、预设模式组合

## 待深入分析（下阶段优先）
1. **KPrompt** (64⭐)
   - 特性：Conversational Prompt Refiner
   - 重点关注：如何实现对话式提示词改进

2. **anthropics/prompt-eng-interactive-tutorial** (28K⭐)
   - Anthropic 官方教程
   - 重点关注：提示词工程最佳实践、交互式教学方法

3. **langfuse** (20K⭐)
   - Prompt management platform
   - 重点关注：提示词版本管理、A/B 测试、可视化分析

4. **dair-ai/Prompt-Engineering-Guide** (69K⭐)
   - 综合性提示词工程指南
   - 重点关注：优化维度分类、评估标准
- # 下阶段开发任务清单

## 阶段 1: 深度调研（优先级：高）

### 任务 1.1: 分析 KPrompt 项目
- 目标：理解对话式提示词改进的实现方式
- 重点关注：用户交互流程、维度生成逻辑
- 输出：技术要点文档

### 任务 1.2: 分析 Anthropic 官方教程
- 目标：学习提示词工程最佳实践
- 重点关注：优化维度分类、评估标准
- 输出：优化维度分类体系

### 任务 1.3: 分析 langfuse 平台
- 目标：了解提示词管理和可视化方案
- 重点关注：版本对比、A/B 测试、可视化组件
- 输出：可视化设计参考

### 任务 1.4: 分析 dair-ai 指南
- 目标：建立完整的提示词优化知识体系
- 重点关注：优化技巧、常见问题、评估方法
- 输出：优化策略库
- # 下阶段开发任务清单（续）

## 阶段 2: 核心功能设计与实现

### 任务 2.1: 设计装饰器引擎
- 实现装饰器映射和组合逻辑
- 文件：`src/lib/decorator-engine.ts`
- 支持预设模式和自定义组合

### 任务 2.2: 设计 AI 分析工具
- 创建 `analyze_prompt` 工具定义
- 输入：用户原始提示词
- 输出：动态生成的优化维度配置
- 文件：`src/app/api/chat/route.ts`

### 任务 2.3: 重构 System Prompt
- 支持三层架构（装饰器 + 内容优化 + 可视化）
- 明确 AI 的分析和生成职责
- 优化工具调用流程

### 任务 2.4: 实现动态表单组件
- 基于 AI 分析结果动态渲染表单
- 支持通用维度 + 针对性维度
- 文件：`src/components/dynamic-enhancement-form.tsx`
- # 下阶段开发任务清单 - 阶段 3

## 阶段 3: 可视化功能实现

### 任务 3.1: 实现差异对比组件
- 创建 DiffViewer 组件
- 支持并排对比和内联对比两种模式
- 使用颜色标记：新增（绿色）、删除（红色）、修改（黄色）
- 文件：`src/components/diff-viewer.tsx`

### 任务 3.2: 实现改进摘要组件
- 创建 ImprovementSummary 组件
- 以卡片形式展示优化点
- 支持折叠/展开详细说明
- 文件：`src/components/improvement-summary.tsx`

### 任务 3.3: 集成 diff 算法
- 选择合适的 diff 库（如 diff-match-patch 或 react-diff-viewer）
- 实现文本差异计算逻辑
- 优化大文本性能
- # 下阶段开发任务清单 - 阶段 4

## 阶段 4: 集成与测试

### 任务 4.1: 完整流程集成
- 串联装饰器引擎 + AI 分析 + 可视化
- 确保工具调用顺序正确
- 优化用户体验流程

### 任务 4.2: 预设模式实现
- 实现 4 种快速模式：学术研究、代码开发、创意写作、数据分析
- 每种模式预配置装饰器组合
- 文件：`src/lib/preset-modes.ts`

### 任务 4.3: 功能测试
- 测试各种类型的提示词输入
- 验证 AI 分析的准确性
- 测试可视化展示效果
- 边界情况测试

### 任务 4.4: UI/UX 优化
- 响应式设计适配
- 加载状态优化
- 错误处理和提示
- 交互动画优化
- # 当前阶段已完成的工作

## 已创建的文档
1. **PLAN_SOLUTION_B.md**
   - 内容：多轮交互方案设计（状态机、工具定义、系统提示词）
   - 状态：已完成，但需根据新需求（一轮交互）进行修订

2. **TECH_RESEARCH.md**
   - 内容：一轮交互设计、装饰器引擎实现、预设模式配置
   - 状态：已完成，部分内容可复用

3. **FINAL_SOLUTION.md**
   - 内容：基于 prompt-decorators 的完整技术方案
   - 包含：装饰器映射表、预设模式、实现代码示例
   - 状态：已完成，但需补充 AI 自动分析和可视化部分

## 已分析的项目代码
- `src/app/page.tsx` - 主界面组件
- `src/components/enhancement-form.tsx` - 优化表单组件
- `src/app/api/chat/route.ts` - API 路由（缺少 propose_prompt 工具）
- `src/components/prompt-proposal-card.tsx` - 提示词展示组件
- ## 待修复问题清单 (2026-01-17)

### 1. 全屏预览对话框宽度未增加
- 问题: prompt-proposal-card.tsx 中全屏预览对话框宽度仍然不够宽
- 期望: 比输入框更宽的全屏预览

### 2. 多文件上传挤占输入框空间
- 问题: 文件卡片显示在输入框内部,挤占文字输入空间
- 期望: 在输入框上方单独设置文件展示区域

### 3. 新对话按钮会删除当前历史对话 (严重问题)
- 问题: 在历史对话中点击"新对话"会删除当前对话记录
- 期望: 新对话应该只是切换到空白对话,不删除历史

### 4. 对话页面预览显示异常
- 问题: PromptProposalCard 的预览视图显示不正常
- 期望: 恢复之前正常的预览方案

### 5. 收藏标签页无法启动新对话
- 问题: 在收藏标签页点击"新对话"按钮无响应
- 期望: 应该切换到对话标签页并启动新对话

### 6. 反馈表单宽度动态调整
- 问题: EnhancementForm 宽度仍然动态调整,显得很窄
- 期望: 设置固定的较宽宽度

### 7. 收藏按钮位置不统一
- 问题: 预览视图中收藏按钮在文本框上,结构详情中在tab右上方
- 期望: 统一收藏按钮位置
- ## 未来开发计划: 浏览器插件

### 功能描述
开发一个浏览器插件,逻辑与当前 Web 应用相同:
- 交互式提示词生成
- 多轮对话引导
- 结构化提示词输出
- 收藏管理

### 技术方案
- 浏览器扩展 (Chrome/Edge/Firefox)
- 复用现有核心逻辑
- 适配浏览器插件 UI

### 优先级
- 状态: 规划中,不急着开发
- 优先级: P3 (低优先级)
- 前置条件: Web 应用功能稳定后再开发

# 交互式提示词迭代器 - 修正方案与技术细节

## 1. 核心需求变更确认
- **专注领域**：仅专注于交互式提示词优化Web应用（与论文撰写无关）。
- **部署架构**：纯前端应用（Serverless/Vercel），**无后端数据库**。
- **数据隐私**：所有敏感数据（LLM API Key、对话历史、配置）必须**持久化存储在用户浏览器**中。
- **交互限制**：仅支持**纯文本**交互（禁用语音）。
- **初始体验**：首页不能是空白，必须包含引导提示（Hints/Starters）。

## 2. 优化方案细化

### 2.1 多维度优化策略 (Multi-dimensional Optimization)
系统不应只问“你要写什么”，而应基于以下维度主动生成预设选项（Checkbox）：
1.  **结构维度**：Markdown报告、纯文本大纲、JSON数据、代码块。
2.  **角色/语气维度**：学术严谨、通俗易懂、创意发散、技术专家。
3.  **思维链维度 (CoT)**：是否需要AI展示推理过程、是否需要自我反思。
4.  **限制条件**：字数限制、语言风格（中文/英文）、特定术语集。

### 2.2 浏览器端持久化技术选型 (Client-side Persistence)
由于没有后端数据库，我们将采用“本地优先 (Local-First)”架构：

| 数据类型 | 推荐方案 | 技术实现细节 |
| :--- | :--- | :--- |
| **LLM配置** (API Keys, Models) | **LocalStorage** + 加密 | 使用 `zustand` + `persist` 中间件。API Key 建议在存入前进行轻量级混淆，防止XSS直接读取明文。 |
| **对话历史** (Chat History) | **IndexedDB** | LocalStorage有5MB限制，历史记录容易超标。推荐使用 **Dexie.js** 封装 IndexedDB，支持海量文本存储。 |
| **用户偏好** (Theme, Presets) | **LocalStorage** | 简单键值对，直接存储。 |

### 2.3 初始引导设计 (Landing Experience)
首页加载时，不展示空白ChatInput，而是展示 **"Inspiration Cards" (灵感卡片)**：
- "优化一个论文大纲提示词"
- "设计一个Python代码审查助手"
- "创建一个Midjourney绘图指令"
*用户点击卡片后，自动填充Input Box，并触发第一轮优化询问。*

## 3. 推荐技术栈 (Stack)

- **框架**: Next.js 14 (App Router)
- **UI库**: TailwindCSS + Shadcn/UI (极简、高端设计)
- **状态管理**: Zustand (配合 `persist` 中间件实现配置持久化)
- **本地数据库**: Dexie.js (用于 IndexedDB 管理)
- **AI SDK**: Vercel AI SDK (通过 `useChat` 钩子处理流式传输)

## 4. 下一步行动计划
我们将分三步走：
1.  **脚手架搭建**：初始化 Next.js 项目，配置 Shadcn/UI 和 Zustand。
2.  **核心交互实现**：实现 AI 配置面板（本地存储）和 基础对话界面。
3.  **优化逻辑开发**：实现“生成-预览-选择”的交互组件（Generative UI）。

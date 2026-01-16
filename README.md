<div align="center">
  <img src="icon.png" alt="Prompt Iterator Logo" width="120" height="120" style="max-width: 100%;" />

  # 🚀 交互式提示词迭代器

  ### Interactive Prompt Iterator

  <p align="center">
    <strong>通过多轮交互式对话，将模糊想法转化为结构化、高质量的 AI 提示词</strong>
  </p>

  <p align="center">
    <a href="https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator/stargazers">
      <img src="https://img.shields.io/github/stars/systemoutprintlnhelloworld/interactive-prompt-iterator?style=for-the-badge&logo=github&color=yellow" alt="GitHub Stars" />
    </a>
    <a href="https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator/network/members">
      <img src="https://img.shields.io/github/forks/systemoutprintlnhelloworld/interactive-prompt-iterator?style=for-the-badge&logo=github&color=blue" alt="GitHub Forks" />
    </a>
    <a href="https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/systemoutprintlnhelloworld/interactive-prompt-iterator?style=for-the-badge&color=green" alt="License" />
    </a>
    <a href="https://interactive-prompt-iterator.vercel.app">
      <img src="https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
  </p>

  <p align="center">
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
    </a>
  </p>

  <p align="center">
    <a href="README.md">简体中文</a> •
    <a href="README_EN.md">English</a> •
    <a href="#-功能演示">功能演示</a> •
    <a href="#-本地开发">快速开始</a> •
    <a href="TODO.md">开发计划</a>
  </p>

  <p align="center">
    <a href="https://interactive-prompt-iterator.vercel.app" style="margin-right: 20px;">
      <img src="https://img.shields.io/badge/🎯_在线演示-Live_Demo-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
    <a href="https://vercel.com/new/clone?repository-url=https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator">
      <img src="https://img.shields.io/badge/🚀_一键部署-Deploy-blue?style=for-the-badge&logo=vercel" alt="Deploy with Vercel" />
    </a>
  </p>

</div>

## 📺 功能演示

### 1. 交互式提示词生成流程
> **场景**: 从模糊需求到精准提示词
>
> 演示：用户输入"帮我写一篇关于AI的文章" → AI提供多维度选项（角色、风格、深度、格式）→ 用户选择偏好 → 生成结构化提示词

![交互式生成流程](docs/screenshots/demo-interactive-flow.gif)

### 2. 文件上传与解析
> **场景**: 基于文档内容生成提示词
>
> 演示：上传PDF论文/DOCX报告/图片截图 → 自动解析内容 → AI结合文件内容提供优化建议 → 生成针对性提示词

![文件上传演示](docs/screenshots/demo-file-upload.webp)

### 3. 多场景应用示例

#### 📝 内容创作场景
> 演示：博客文章、技术文档、营销文案等不同内容类型的提示词生成

#### 💼 专业工作场景
> 演示：数据分析报告、项目方案、会议纪要等商务场景的提示词优化

#### 🎓 学术研究场景
> 演示：论文摘要、文献综述、研究计划等学术场景的提示词构建

#### 🎨 创意设计场景
> 演示：UI设计需求、品牌故事、创意策划等设计场景的提示词迭代

![多场景应用](docs/screenshots/demo-multi-scenarios.webp)

### 4. 自定义模板管理
> **场景**: 保存和复用常用提示词模板
>
> 演示：创建自定义提示词模板 → 保存到本地 → 切换使用不同模板 → 快速应用到新对话

![模板管理演示](docs/screenshots/demo-template-management.webp)

## ✨ 核心特性

- **🎯 智能交互引导**：通过交互式表单和多轮对话，逐步明确用户需求
- **💾 本地优先 (Local-First)**：
  - 配置存储：使用 `Zustand` + `LocalStorage` 存储 API Key 和模型偏好
  - 历史记录：使用 `Dexie.js` (IndexedDB) 存储对话记录，支持离线访问
- **🎨 现代化 UI**：
  - 采用 Tailwind CSS + Shadcn/UI 设计系统
  - 支持深色模式
  - 响应式设计，支持移动端
- **📁 文件支持**：
  - 支持图片上传和粘贴（PNG、JPG、WebP）
  - 支持 PDF 文档解析
  - 支持多模态模型（GPT-4o、Claude 3.5、Gemini 等）
- **🔧 灵活配置**：
  - 支持多种 AI 模型（OpenAI、Claude、国产大模型）
  - 自定义 API Base URL
  - 可调整系统提示词

## 🛠️ 技术栈

- **Framework**: Next.js 14.2.16 (App Router)
- **UI**: Tailwind CSS 3.4, Shadcn/UI, Lucide React
- **State Management**: Zustand 5.0
- **Database**: Dexie.js 4.2 (IndexedDB wrapper)
- **AI Integration**: Vercel AI SDK 6.0 (@ai-sdk/react, @ai-sdk/openai)
- **File Processing**: pdfjs-dist 5.4 (PDF parsing)

## 💻 本地开发

1. **克隆仓库**
```bash
git clone https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator.git
cd interactive-prompt-iterator
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### ⚙️ 配置说明

1. 点击右上角 **设置图标 (⚙️)**
2. 输入您的 AI API 配置：
   - **API Key**: 您的 OpenAI/Claude/其他兼容 API 的密钥
   - **Base URL**: API 端点地址（默认：`https://api.openai.com/v1`）
   - **Model**: 选择要使用的模型
   - **System Prompt**: 自定义系统提示词（可选）

3. 点击保存，开始使用

> 💡 **提示**: 所有配置仅存储在浏览器本地，不会上传到服务器

### 支持的模型

- **OpenAI**: gpt-4o, gpt-4o-mini, gpt-4-turbo, o1, o1-mini
- **Anthropic Claude**: claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus
- **国产大模型**: deepseek-chat, deepseek-reasoner, GLM-4-Plus, Qwen-Max, moonshot-v1-128k 等

## 📁 项目结构

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/chat/       # AI 聊天 API 路由
│   │   └── page.tsx        # 主页面
│   ├── components/          # React 组件
│   │   ├── ui/             # Shadcn UI 基础组件
│   │   ├── chat-sidebar.tsx
│   │   ├── settings-dialog.tsx
│   │   └── ...
│   └── lib/                # 工具库
│       ├── store.ts        # Zustand 状态管理
│       ├── db.ts           # Dexie.js 数据库
│       └── utils.ts
├── public/                 # 静态资源
└── package.json
```

## 🔧 开发指南

### 构建生产版本

```bash
npm run build
npm run start
```

### 代码检查

```bash
npm run lint
```

### 技术要点

- **流式响应**: 使用 Vercel AI SDK 的 `streamText` 实现实时响应
- **工具调用**: 支持 AI 主动调用工具生成交互式表单
- **状态持久化**: Zustand + localStorage 实现配置持久化
- **数据库**: Dexie.js 封装 IndexedDB，支持复杂查询


## ❓ 常见问题

### Q: 我的 API Key 安全吗？
A: 是的。所有配置（包括 API Key）仅存储在您的浏览器本地 localStorage 中，不会上传到任何服务器。

### Q: 支持哪些 AI 模型？
A: 支持所有兼容 OpenAI API 格式的模型，包括：
- OpenAI 官方模型（GPT-4o、GPT-4-turbo 等）
- Anthropic Claude（通过兼容接口）
- 国产大模型（DeepSeek、智谱 GLM、通义千问等）

### Q: 如何使用自定义 API 端点？
A: 在设置中修改 "Base URL" 为您的 API 端点地址即可。

### Q: PDF 解析失败怎么办？
A: 确保：
1. PDF 文件不是扫描版（需要包含可提取的文本）
2. 文件大小适中（建议 < 10MB）
3. 浏览器支持 WebAssembly


### Q: 图片上传不支持怎么办？
A: 检查您选择的模型是否支持 Vision 功能。支持的模型包括：
- GPT-4o、GPT-4-turbo
- Claude 3.5 Sonnet、Claude 3 Opus
- Gemini Pro Vision
- 通义千问 VL、智谱 GLM-4V 等

### Q: 对话历史存储在哪里？
A: 对话历史存储在浏览器的 IndexedDB 中，清除浏览器数据会导致历史记录丢失。


## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request


## 📝 更新日志

### v0.1.0 (2026-01-15)
- ✨ 初始版本发布
- 🎯 支持多轮交互式提示词优化
- 📁 支持图片和 PDF 文件上传
- 💾 本地存储对话历史
- 🎨 现代化 UI 设计
- 🔧 支持多种 AI 模型


## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI 集成工具
- [Shadcn/UI](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Dexie.js](https://dexie.org/) - IndexedDB 封装库

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator/issues)
- 发起 [Discussion](https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator/discussions)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=systemoutprintlnhelloworld/interactive-prompt-iterator&type=Date)](https://star-history.com/#systemoutprintlnhelloworld/interactive-prompt-iterator&Date)

⭐ 如果这个项目对你有帮助，欢迎给个 Star！

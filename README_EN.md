<div align="center">
  <img src="icon.png" alt="Prompt Iterator Logo" style="max-width: 100%;" />

  # 🚀 Interactive Prompt Iterator

  ### Interactive Prompt Iterator

  A modern web application for prompt optimization built with **Next.js 14**, **Shadcn UI**, and **Vercel AI SDK**.

  Helps users transform vague ideas into structured, high-quality AI prompts through multi-turn interactive dialogue.

  [简体中文](README.md) | [English](README_EN.md)

  ### 🚀 Quick Deploy

  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator)

  Click the button above to deploy to Vercel with one click, no configuration required!

</div>

## 📺 Feature Demos

### 1. Interactive Prompt Generation Flow
> **Scenario**: From vague requirements to precise prompts
>
> Demo: User inputs "Help me write an article about AI" → AI provides multi-dimensional options (Role, Tone, Depth, Format) → User selects preferences → Structured prompt generated

![Interactive Flow](docs/screenshots/demo-interactive-flow.webp)

### 2. File Upload & Analysis
> **Scenario**: Prompt generation based on document content
>
> Demo: Upload PDF paper/DOCX report/Image screenshot → Automatic content parsing → AI provides optimization suggestions based on file content → Targeted prompt generation

![File Upload Demo](docs/screenshots/demo-file-upload.webp)

### 3. Multi-Scenario Examples

#### 📝 Content Creation
> Demo: Prompt generation for blog posts, technical documentation, marketing copy, etc.

#### 💼 Professional Work
> Demo: Prompt optimization for data analysis reports, project proposals, meeting minutes, etc.

#### 🎓 Academic Research
> Demo: Prompt construction for paper abstracts, literature reviews, research plans, etc.

#### 🎨 Creative Design
> Demo: Prompt iteration for UI design requirements, brand stories, creative planning, etc.

![Multi-Scenario Demo](docs/screenshots/demo-multi-scenarios.webp)

### 4. Custom Template Management
> **Scenario**: Save and reuse common prompt templates
>
> Demo: Create custom prompt template → Save locally → Switch between templates → Quickly apply to new conversations

![Template Management Demo](docs/screenshots/demo-template-management.webp)

## ✨ Core Features

- **🎯 Intelligent Interactive Guidance**: Step-by-step requirements clarification through interactive forms and multi-turn dialogue
- **💾 Local-First**:
  - Configuration Storage: `Zustand` + `LocalStorage` for API Keys and model preferences
  - History: `Dexie.js` (IndexedDB) for chat history storage, supporting offline access
- **🎨 Modern UI**:
  - Built with Tailwind CSS + Shadcn/UI design system
  - Dark mode support
  - Responsive design for mobile
- **📁 File Support**:
  - Image upload and paste (PNG, JPG, WebP)
  - PDF document parsing
  - Multi-modal model support (GPT-4o, Claude 3.5, Gemini, etc.)
- **🔧 Flexible Configuration**:
  - Support for multiple AI models (OpenAI, Claude, etc.)
  - Custom API Base URL
  - Adjustable system prompts

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.16 (App Router)
- **UI**: Tailwind CSS 3.4, Shadcn/UI, Lucide React
- **State Management**: Zustand 5.0
- **Database**: Dexie.js 4.2 (IndexedDB wrapper)
- **AI Integration**: Vercel AI SDK 6.0 (@ai-sdk/react, @ai-sdk/openai)
- **File Processing**: pdfjs-dist 5.4 (PDF parsing)

## 🚀 Quick Start

### 🚢 One-Click Deploy (Recommended)

Click the button below to deploy to Vercel instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator)

After deployment:
1. Visit the generated URL
2. Click the settings icon ⚙️ in the top right
3. Click "Test Preset (One-Click Config)" to automatically fill in deepseek-v3.2-exp configuration
4. Or manually enter your API Key and configuration
5. Start using!

### 💻 Local Development

1. **Clone Repository**
```bash
git clone https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator.git
cd interactive-prompt-iterator
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Access Application**
Open browser and visit [http://localhost:3000](http://localhost:3000)

### Configuration Instructions

1. Click **Settings Icon (⚙️)** in top right
2. Enter your AI API configuration:
   - **API Key**: Your OpenAI/Claude/Compatible API Key
   - **Base URL**: API Endpoint (Default: `https://api.openai.com/v1`)
   - **Model**: Select the model to use
   - **System Prompt**: Custom system prompt (Optional)

3. Click Save and start using

> 💡 **Note**: All configurations are stored locally in your browser and are never uploaded to any server.

### Supported Models

- **OpenAI**: gpt-4o, gpt-4o-mini, gpt-4-turbo, o1, o1-mini
- **Anthropic Claude**: claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus
- **Others**: deepseek-chat, deepseek-reasoner, GLM-4-Plus, Qwen-Max, moonshot-v1-128k, etc.

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/chat/       # AI Chat API Route
│   │   └── page.tsx        # Main Page
│   ├── components/          # React Components
│   │   ├── ui/             # Shadcn UI Base Components
│   │   ├── chat-sidebar.tsx
│   │   ├── settings-dialog.tsx
│   │   └── ...
│   └── lib/                # Utilities
│       ├── store.ts        # Zustand State Management
│       ├── db.ts           # Dexie.js Database
│       └── utils.ts
├── public/                 # Static Assets
└── package.json
```

## 🚢 Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

Click the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator)

### Option 2: Manual Deploy

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator.git
git push -u origin main
```

2. **Connect Vercel**
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and configure build settings

3. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Visit generated URL

### Environment Variables (Optional)

To set default values on the server, create a `.env.local` file:

```env
# Optional: Set default API config (Users can still override in frontend)
NEXT_PUBLIC_DEFAULT_API_KEY=your_api_key_here
NEXT_PUBLIC_DEFAULT_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_DEFAULT_MODEL=gpt-4o
```

> ⚠️ **Warning**: Do not commit `.env.local` containing real API Keys to Git.

## 🎯 Features

### Interactive Prompt Optimization
- Clarify requirements through multi-turn dialogue
- Intelligent questioning guides user thinking
- Generate structured final prompts

### File Processing
- **Image Recognition**: Support upload/paste, Vision model analysis
- **PDF Parsing**: Automatic text extraction
- **Multi-modal**: Mixed text and image input

### Chat Management
- Auto-save chat history
- Multi-session switching
- Collapsible sidebar
- Independent scroll area

### User Experience
- Real-time streaming response
- Loading animations
- Message editing and deletion
- One-click copy
- Responsive design

## 🔧 Development Guide

### Build for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

### Technical Highlights

- **Streaming**: Vercel AI SDK `streamText` for real-time responses
- **Tool Calling**: AI proactively calls tools to generate interactive forms
- **Persistence**: Zustand + localStorage for config persistence
- **Database**: Dexie.js wrapper for IndexedDB, supporting complex queries

## ❓ FAQ

### Q: Is my API Key safe?
A: Yes. All configurations (including API Keys) are stored only in your browser's local localStorage and are never uploaded to any server.

### Q: Which AI models are supported?
A: Supports all OpenAI API compatible models, including:
- OpenAI Official Models (GPT-4o, GPT-4-turbo, etc.)
- Anthropic Claude (via compatible interface)
- Others (DeepSeek, Zhipu GLM, Qwen, etc.)

### Q: How to use a custom API endpoint?
A: Change "Base URL" in settings to your API endpoint address.

### Q: What if PDF parsing fails?
A: Ensure:
1. PDF is not a scanned version (must contain extractable text)
2. File size is moderate (recommended < 10MB)
3. Browser supports WebAssembly

### Q: Image upload not supported?
A: Check if your selected model supports Vision capabilities. Supported models include:
- GPT-4o, GPT-4-turbo
- Claude 3.5 Sonnet, Claude 3 Opus
- Gemini Pro Vision
- Qwen VL, GLM-4V, etc.

### Q: Where is chat history stored?
A: Chat history is stored in browser's IndexedDB. Clearing browser data will result in history loss.

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### v0.1.0 (2026-01-15)
- ✨ Initial release
- 🎯 Support multi-turn interactive prompt optimization
- 📁 Support image and PDF file upload
- 💾 Local storage for chat history
- 🎨 Modern UI design
- 🔧 Support multiple AI models

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI Integration
- [Shadcn/UI](https://ui.shadcn.com/) - UI Components
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Dexie.js](https://dexie.org/) - IndexedDB Wrapper

## 📧 Contact

If you have any questions or suggestions, please contact via:

- Submit [Issue](https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator/issues)
- Start [Discussion](https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator/discussions)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=systemoutprintlnhelloworld/interactive-prompt-iterator&type=Date)](https://star-history.com/#systemoutprintlnhelloworld/interactive-prompt-iterator&Date)

⭐ If this project helps you, please give it a Star!

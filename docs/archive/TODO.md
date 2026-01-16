# TODO List

## 🚀 高优先级 (High Priority)

### 🎨 UI/UX 改进
- [ ] **重新设计 Icon** - 当前图标不够美观，需要更专业的设计
- [ ] **优化整体 UI 风格** - 避免过于大众化的设计，增加独特性
- [ ] **美化切换按钮** - 单选/多选切换按钮改为扁平化设计
- [ ] **优化搜索对话 UI** - 改进搜索框和结果展示的视觉效果
- [ ] **修复模型选择框** - 确保下拉框宽度适应最长的模型名称
- [ ] **改进动画效果** - 优化加载、过渡等动画，使其更流畅自然

### 🔧 核心功能
- [ ] **接入 Vibe Coding** - 实现交互式 Vibe Coding 提示词增强
- [ ] **提示词收藏与管理** - 允许用户保存和管理常用提示词
- [ ] **优化元提示词** - 改进系统提示词，提高指令遵从性
  - 特别针对 Grok 等模型的流程偏离问题

### 🐛 Bug 修复
- [x] 修复 PDF worker 加载问题
- [x] 修复 PDF 文本未传递给 AI 的问题
- [x] 修复表单按钮编辑后提交仍使用原始内容的问题
- [x] 修复附件显示问题
- [ ] **修复各种交互 Bug** - 收集并修复用户反馈的交互问题

## 📝 中优先级 (Medium Priority)

### 用户体验 (User Experience)
- [ ] 添加快捷键支持（Ctrl+Enter发送等）
- [ ] 添加消息搜索功能
- [ ] 支持导出对话历史为Markdown
- [ ] 添加提示词收藏功能
- [ ] 优化加载动画和过渡效果

### 文档 (Documentation)
- [x] 优化中文README，减少重复内容
- [x] 创建英文版README
- [ ] 添加贡献指南 (CONTRIBUTING.md)
- [ ] 添加更多使用示例和教程
- [ ] 创建API文档

## 🔧 低优先级 (Low Priority)

### 技术优化 (Technical Improvements)
- [ ] 添加单元测试
- [ ] 添加E2E测试
- [ ] 优化构建体积
- [ ] 添加性能监控
- [ ] 实现PWA支持

### 新功能 (New Features)
- [ ] 支持多语言界面（i18n）
- [ ] 添加提示词版本管理
- [ ] 支持团队协作功能
- [ ] 添加提示词市场/分享功能
- [ ] 集成更多AI模型

## 📅 已完成 (Completed)

### 2026-01-16
- [x] 修复PDF worker加载问题 - 使用public静态文件
- [x] 修复PDF文本未传递给AI的问题
- [x] 修复表单按钮编辑后提交仍使用原始内容的问题
- [x] 优化README文档
- [x] 添加Star History图表
- [x] 将默认模型改为deepseek-v3.2-exp

### 2026-01-15
- [x] 修复附件显示问题
- [x] 添加文件上传功能
- [x] 实现交互式表单
- [x] 添加对话历史功能
- [x] 部署到Vercel

---

## 💡 想法和建议 (Ideas & Suggestions)

欢迎通过 [Issues](https://github.com/systemoutprintlnhelloworld/interactive-prompt-iterator/issues) 提出新的想法和建议！

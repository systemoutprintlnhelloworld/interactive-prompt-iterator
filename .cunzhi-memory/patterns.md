# 常用模式和最佳实践

- Vercel AI SDK 3.x (Legacy) 中实现 Generative UI 的最佳实践是利用 tool-calling。
后端在 streamText 中定义 tools (如 suggest_options, ask_questions)。
前端在 useChat 的 messages 循环中检查 toolInvocations，并渲染对应的 React 组件（Checkbox, Radio 等），而非仅显示文本。
最后将用户的选择作为 toolResult 发回给 AI。
- Vercel AI SDK 3.x 更新提示: createOpenAI 返回的 provider 实例可以直接调用(modelId)返回模型，但遇到类型推断问题时可能需要检查具体是 Chat 还是 Completion 模型。
- # AI 自动分析维度生成机制设计要点

## 核心挑战
如何让 AI 根据用户的粗提示词，自动分析并生成针对性的优化维度？

## 可能的实现方向

### 方向 1：元提示词分析
- AI 先分析用户提示词的类型（任务型/创意型/分析型）
- 根据类型匹配对应的优化维度模板
- 动态生成表单选项

### 方向 2：缺陷检测
- AI 识别提示词中缺失的关键要素
- 例如：缺少上下文、目标不明确、约束条件不足
- 针对性生成补充维度

### 方向 3：混合策略
- 基础维度（通用）+ 动态维度（针对性）
- 通用维度：语气、格式、思考深度
- 动态维度：根据内容分析生成

## 技术实现考虑
- 需要设计专门的分析工具（tool）
- 工具输入：用户原始提示词
- 工具输出：结构化的维度配置（JSON）
- 前端根据配置动态渲染表单
- # 优化对比可视化方案

## 可视化目标
让用户直观看到提示词优化前后的差异和改进点

## 可能的展示方式

### 方案 1：并排对比视图
```
┌─────────────────┬─────────────────┐
│   优化前         │   优化后         │
├─────────────────┼─────────────────┤
│ 原始提示词       │ 增强后的提示词   │
│ (高亮缺失部分)   │ (高亮新增部分)   │
└─────────────────┴─────────────────┘
```

### 方案 2：差异标注视图
- 使用颜色标记：删除（红色）、新增（绿色）、修改（黄色）
- 类似 Git diff 的展示方式
- 支持折叠/展开详细差异

### 方案 3：维度改进卡片
```
📊 改进摘要
✅ 新增了明确的角色定义
✅ 补充了 3 个约束条件
✅ 优化了输出格式说明
✅ 增强了上下文信息
```

## 技术实现
- 使用 diff 算法计算文本差异
- React 组件：DiffViewer, ImprovementSummary
- 支持切换视图模式（并排/内联/摘要）
- ## 项目优化记录 (2026-01-16)

### 已完成的四大优化

1. **对话列表滚动位置保存**
   - 修改文件: `src/components/chat-sidebar.tsx`, `src/components/ui/scroll-area.tsx`
   - 解决方案: 使用 useRef 保存滚动位置，在轮询刷新前保存，刷新后恢复
   - 问题: 每2秒轮询导致滚动位置重置

2. **输入框放大按钮显示逻辑优化**
   - 修改文件: `src/components/auto-resize-textarea.tsx`
   - 优化: 当内容超过一行时就显示放大按钮（原逻辑是超过最大高度阈值）
   - 实现: 通过计算 lineHeight + padding 判断是否超过单行

3. **文本附件显示优化**
   - 新增文件: `src/components/file-attachment-icon.tsx`
   - 修改文件: `src/app/page.tsx`
   - 优化: 只有图片显示预览，PDF/DOCX/TXT 使用 SVG 图标+文件名
   - 效果: 大幅节省空间，视觉更清晰

4. **提示词收藏功能**
   - 数据库扩展: `src/lib/db.ts` 新增 FavoritePrompt 表
   - 新增组件: `src/components/favorites-dialog.tsx` (收藏管理)
   - 修改组件: `src/components/prompt-proposal-card.tsx` (添加收藏按钮)
   - 主页集成: `src/app/page.tsx` (顶部导航栏收藏入口)
   - 功能: 收藏、浏览、搜索、编辑、删除、复制

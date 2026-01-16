# 部署指南

本文档详细说明如何将项目部署到 GitHub 和 Vercel。

## 准备工作

### 1. 确保项目可以正常运行

在部署前，请先在本地测试：

```bash
npm install
npm run build
npm run start
```

访问 http://localhost:3000 确认应用正常运行。

### 2. 清理不必要的文件

项目已配置 `.gitignore`，以下文件不会被提交：
- `node_modules/`
- `.next/`
- 测试文件 (`test-*.js`)
- 截图文件 (`screenshots/`)
- AI 工具目录 (`.ace-tool/`, `.ai_memory/` 等)


## 部署到 GitHub

### 步骤 1: 初始化 Git 仓库

如果还没有初始化 Git，执行：

```bash
git init
git add .
git commit -m "Initial commit: Interactive Prompt Iterator"
```

### 步骤 2: 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: 例如 `prompt-iterator`
   - **Description**: 交互式提示词迭代器
   - **Public/Private**: 根据需要选择
   - **不要**勾选 "Initialize with README"（我们已有 README）

4. 点击 "Create repository"


### 步骤 3: 推送代码到 GitHub

复制 GitHub 提供的命令，或执行：

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

> 将 `YOUR_USERNAME` 和 `YOUR_REPO_NAME` 替换为你的实际信息

### 步骤 4: 验证

访问你的 GitHub 仓库页面，确认代码已成功上传。


## 部署到 Vercel

### 方式一：通过 Vercel Dashboard（推荐）

#### 步骤 1: 连接 GitHub

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 如果没有账号，使用 GitHub 账号注册/登录
3. 点击 "Add New..." → "Project"


#### 步骤 2: 导入仓库

1. 在 "Import Git Repository" 页面，找到你的仓库
2. 点击 "Import"

#### 步骤 3: 配置项目

Vercel 会自动检测到这是 Next.js 项目，并配置：
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

通常不需要修改这些设置。


#### 步骤 4: 环境变量（可选）

如果需要设置默认 API 配置，点击 "Environment Variables"：

- `NEXT_PUBLIC_DEFAULT_API_KEY`: 默认 API Key（不推荐）
- `NEXT_PUBLIC_DEFAULT_BASE_URL`: 默认 API 端点
- `NEXT_PUBLIC_DEFAULT_MODEL`: 默认模型

> ⚠️ 注意：由于这是纯前端应用，环境变量会暴露给客户端，不建议在此设置真实 API Key


#### 步骤 5: 部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（通常需要 1-3 分钟）
3. 构建成功后，Vercel 会提供一个 URL，例如：
   - `https://your-project.vercel.app`

#### 步骤 6: 访问应用

点击提供的 URL，访问你的应用。首次使用需要在设置中配置 API Key。


### 方式二：通过 Vercel CLI

#### 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 登录

```bash
vercel login
```

#### 部署

在项目根目录执行：

```bash
vercel
```

按照提示完成配置，首次部署会询问：
- 项目名称
- 是否链接到现有项目
- 项目设置

#### 生产部署

```bash
vercel --prod
```


## 自动部署

### GitHub 集成

Vercel 会自动监听 GitHub 仓库的变化：

- **Push to main**: 自动触发生产部署
- **Pull Request**: 自动创建预览部署
- **每次提交**: 生成唯一的预览 URL

### 查看部署状态

1. 访问 Vercel Dashboard
2. 选择你的项目
3. 查看 "Deployments" 标签页


## 自定义域名（可选）

### 添加自定义域名

1. 在 Vercel Dashboard 中选择项目
2. 进入 "Settings" → "Domains"
3. 输入你的域名，点击 "Add"
4. 按照提示配置 DNS 记录

### DNS 配置

Vercel 支持两种方式：
- **A Record**: 指向 Vercel 的 IP
- **CNAME**: 指向 `cname.vercel-dns.com`


## 常见问题

### 构建失败

**问题**: 构建时出现依赖错误

**解决方案**:
```bash
# 清理依赖
rm -rf node_modules package-lock.json
npm install
npm run build
```


### 环境变量不生效

**问题**: 设置的环境变量在应用中无法访问

**解决方案**:
- 确保环境变量以 `NEXT_PUBLIC_` 开头
- 修改环境变量后需要重新部署
- 在 Vercel Dashboard 中检查环境变量是否正确设置


### 部署后无法访问

**问题**: 部署成功但访问 URL 显示错误

**解决方案**:
1. 检查 Vercel 部署日志是否有错误
2. 确认 `package.json` 中的 scripts 配置正确
3. 检查 Next.js 版本兼容性

### API 请求失败

**问题**: 部署后 API 请求失败

**解决方案**:
- 检查 CORS 配置
- 确认 API Key 已在前端设置中配置
- 检查 Base URL 是否正确


## 性能优化建议

### 1. 启用 Vercel Analytics

在 Vercel Dashboard 中启用 Analytics 以监控性能。

### 2. 配置缓存

Vercel 会自动为静态资源配置缓存，无需额外配置。

### 3. 图片优化

使用 Next.js Image 组件自动优化图片。


## 安全建议

### 1. 不要在代码中硬编码 API Key

所有敏感信息应由用户在前端设置中配置。

### 2. 使用环境变量

如需设置默认值，使用环境变量而非硬编码。

### 3. 定期更新依赖

```bash
npm audit
npm update
```

## 监控和维护

### 查看日志

在 Vercel Dashboard 的 "Logs" 标签页查看运行日志。

### 回滚部署

如果新版本有问题，可以在 Vercel Dashboard 中一键回滚到之前的版本。

---

部署完成后，记得更新 README.md 中的 GitHub 仓库链接和 Vercel 部署按钮链接。

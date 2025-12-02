# Aura Timer

A minimalist macOS-style floating timer widget with AI-powered time editing and eye-friendly rotating backgrounds.

![Aura Timer Preview](header.jpeg)

## 🚀 Try It Now

**Live Demo:** [timer.xrf.sh](https://timer.xrf.sh)

### 💡 Recommended Usage

Aura Timer now has **built-in Picture-in-Picture support**:

1. Visit [timer.xrf.sh](https://timer.xrf.sh)
2. Start a timer
3. Use PiP in different browsers:
   - **Chrome / Edge:** Click the **PiP button** under the widget → 使用 `Document Picture-in-Picture API` 打开可交互悬浮窗  
   - **其他支持元素 PiP 的浏览器:** 点击 PiP 按钮 → 使用 Canvas + `HTMLVideoElement.requestPictureInPicture()` 打开只读 PiP（是否支持由运行时特性检测决定）  
   - **Firefox:** 鼠标移动到计时器中间的时间区域，会看到浏览器自带的 PiP 按钮。点击该按钮即可进入 PiP（不再使用 Web PiP JS API）。

If your browser does not support these APIs, you can still use a **PiP browser extension** as a fallback:

- Chrome/Edge: [Picture-in-Picture Extension](https://chrome.google.com/webstore/detail/picture-in-picture-extens/hkgfoiooedgoejojocmhlaklaeopbecg)
- Firefox: Built-in PiP（悬停视频 → 点击 PiP 按钮，或右键视频 → “画中画”）

## Features

- **Glassmorphism Design** - macOS-inspired floating widget with backdrop blur
- **AI Time Editing** - Natural language time input powered by Google Gemini
- **Smart Backgrounds** - 12 curated HD nature photos rotating every 5 minutes
- **Keyboard Shortcuts** - `Space` to play/pause, `R` to reset
- **Fully Draggable** - Position the timer anywhere on screen
- **Built-in Picture-in-Picture** - One-click floating window with cross-browser strategies (Document PiP + Canvas fallback)

## Usage

- **Drag** the timer widget to reposition
- **Click** the time display for AI-powered editing
- **Space** to play/pause
- **R** to reset timer

## Tech Stack

- React 19.2 + TypeScript
- Vite 7.2
- Tailwind CSS
- Google Gemini AI
- Cloudflare Workers

## Local Development

```bash
# Install dependencies
npm install

# Local Development with Worker
# 1. Create .dev.vars for the API key
echo "GEMINI_API_KEY=your_key_here" > .dev.vars

# 2. Start development server
npm run dev
```

## Deployment

Deploy to Cloudflare Workers:

```bash
# 1. Deploy the worker and assets
npm run deploy

# 2. Set the Gemini API Key (Required)
npx wrangler secret put GEMINI_API_KEY
```

Visit `http://localhost:5173`

### Commands

```bash
npm run dev      # Development server with hot reload
npm run build    # TypeScript + Vite production build
npm run preview  # Preview production build locally
npm run deploy   # Deploy to Cloudflare Workers
```

### Architecture

Built with strict TypeScript configuration and React 19.2 best practices. See [CLAUDE.md](.claude/CLAUDE.md) for detailed architecture decisions and coding conventions.

**Technical Documentation:**
- [PiP Architecture](docs/pip-architecture.md) - Cross-browser Picture-in-Picture implementation
- [Timer Precision](docs/timer-precision.md) - High-precision timestamp-based timer algorithm

## License

MIT

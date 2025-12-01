# Aura Timer

A minimalist macOS-style floating timer widget with AI-powered time editing and eye-friendly rotating backgrounds.

![Aura Timer Preview](header.jpeg)

## 🚀 Try It Now

**Live Demo:** [timer.xrf.sh](https://timer.xrf.sh)

### 💡 Recommended Usage

Aura Timer now has **built-in Picture-in-Picture support**:

1. Visit [timer.xrf.sh](https://timer.xrf.sh)
2. Start a timer
3. Click the **PiP button** under the widget to open an always-on-top mini window  
   - Chrome / Edge: uses the **Document Picture-in-Picture API**  
   - Firefox / Safari: uses a **Canvas + Video Picture-in-Picture** fallback

If your browser does not support these APIs, you can still use a **PiP browser extension** as a fallback:

- Chrome/Edge: [Picture-in-Picture Extension](https://chrome.google.com/webstore/detail/picture-in-picture-extens/hkgfoiooedgoejojocmhlaklaeopbecg)
- Firefox: Built-in PiP (right-click video → "Picture-in-Picture")

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

# Set API key (optional, for AI editing)
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev
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

## License

MIT

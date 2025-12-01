import { IPiPStrategy, PiPState, PiPCallbacks } from './IPiPStrategy.ts';
import { TimerStatus } from '../../../types';

export class DocumentPiPStrategy implements IPiPStrategy {
    public isActive: boolean = false;
    private pipWindow: Window | null = null;
    private callbacks: PiPCallbacks | null = null;

    // Cache elements for updates
    private timeDisplay: HTMLElement | null = null;
    private statusIcon: HTMLElement | null = null;
    private container: HTMLElement | null = null;

    async open(initialState: PiPState, callbacks?: PiPCallbacks): Promise<void> {
        this.callbacks = callbacks || null;

        const pipApi = window.documentPictureInPicture;
        if (!pipApi) {
            throw new Error('Document Picture-in-Picture is not supported in this browser.');
        }

        // 1. Request Window
        // Use a fixed size that fits the timer content comfortably
        const width = 340;
        const height = 200;

        try {
            this.pipWindow = await pipApi.requestWindow({
                width,
                height,
            });
        } catch (e) {
            console.error('Failed to open Document PiP window:', e);
            throw e;
        }

        this.isActive = true;

        // 2. Copy Styles
        this.copyStyles();

        // 3. Render Content
        this.render(initialState);

        // 4. Bind Close Event
        this.pipWindow.addEventListener('pagehide', () => {
            this.isActive = false;
            this.pipWindow = null;
            if (this.callbacks) {
                this.callbacks.onClose();
            }
        });
    }

    private copyStyles() {
        const pipWin = this.pipWindow;
        if (!pipWin) return;

        // Copy all stylesheets from the main window to the PiP window
        [...document.styleSheets].forEach((styleSheet) => {
            try {
                // Try to access cssRules (might fail for cross-origin stylesheets)
                const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                const style = document.createElement('style');
                style.textContent = cssRules;
                pipWin.document.head.appendChild(style);
            } catch (e) {
                // Fallback: Link to the external stylesheet
                if (styleSheet.href) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = styleSheet.type;
                    link.media = styleSheet.media.toString();
                    link.href = styleSheet.href;
                    pipWin.document.head.appendChild(link);
                }
            }
        });
    }

    private render(state: PiPState) {
        if (!this.pipWindow) return;
        const doc = this.pipWindow.document;

        // Base styles for the body
        doc.body.style.margin = '0';
        doc.body.style.backgroundColor = 'rgba(30, 30, 35, 1)'; // Solid background for PiP
        doc.body.style.display = 'flex';
        doc.body.style.justifyContent = 'center';
        doc.body.style.alignItems = 'center';
        doc.body.style.height = '100vh';
        doc.body.style.overflow = 'hidden';
        doc.body.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

        // Container
        this.container = doc.createElement('div');
        this.container!.className = 'flex flex-col items-center justify-center w-full h-full select-none';

        // Time Display
        this.timeDisplay = doc.createElement('div');
        this.updateTimeDisplay(state);

        // Controls Container
        const controls = doc.createElement('div');
        controls.className = 'flex gap-4 mt-4';

        // Toggle Button
        const toggleBtn = doc.createElement('button');
        toggleBtn.className = 'p-3 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors cursor-pointer border-none outline-none flex items-center justify-center';
        toggleBtn.innerHTML = this.getPlayPauseIcon(state.status);
        toggleBtn.onclick = () => this.callbacks?.onToggle();
        this.statusIcon = toggleBtn;

        // Reset Button
        const resetBtn = doc.createElement('button');
        resetBtn.className = 'p-3 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors cursor-pointer border-none outline-none flex items-center justify-center';
        resetBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path><path d="M3 3v9h9"></path></svg>';
        resetBtn.onclick = () => this.callbacks?.onReset();

        controls.appendChild(toggleBtn);
        controls.appendChild(resetBtn);

        if (this.container && this.timeDisplay) {
            this.container.appendChild(this.timeDisplay);
            this.container.appendChild(controls);
            doc.body.appendChild(this.container);
        }
    }

    update(state: PiPState): void {
        if (!this.isActive || !this.pipWindow) return;

        this.updateTimeDisplay(state);

        if (this.statusIcon) {
            this.statusIcon.innerHTML = this.getPlayPauseIcon(state.status);
        }
    }

    private updateTimeDisplay(state: PiPState) {
        if (!this.timeDisplay) return;

        const { hours, minutes, seconds } = state.timeString;
        const showHours = parseInt(hours) > 0;

        // Format: HH:MM:SS or MM:SS
        let text = `${minutes}:${seconds}`;
        if (showHours) {
            text = `${hours}:${text}`;
        }

        // Handle Overtime/Warning colors
        let colorClass = 'text-zinc-200';
        if (state.isOvertime) {
            text = `-${text}`;
            colorClass = 'text-amber-300';
        } else if (state.isWarning) {
            colorClass = 'text-rose-400';
        }

        // Re-apply classes
        this.timeDisplay.className = `text-6xl font-mono tracking-tighter drop-shadow-sm ${colorClass}`;
        this.timeDisplay.textContent = text;
    }

    private getPlayPauseIcon(status: TimerStatus): string {
        if (status === TimerStatus.RUNNING) {
            // Pause Icon
            return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        } else {
            // Play Icon
            return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        }
    }

    close(): void {
        if (this.pipWindow) {
            this.pipWindow.close();
            this.pipWindow = null;
        }
        this.isActive = false;
    }
}

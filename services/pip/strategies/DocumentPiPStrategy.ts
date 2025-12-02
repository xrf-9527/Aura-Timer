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

    // Responsive design support
    private resizeObserver: ResizeObserver | null = null;
    private rafPending: boolean = false;

    // Cached button elements for resize
    private toggleBtn: HTMLElement | null = null;
    private resetBtn: HTMLElement | null = null;

    // Cached time display elements for smooth animation
    private timePartSpans: HTMLElement[] = [];
    private colonSpans: HTMLElement[] = [];
    private negativeSignSpan: HTMLElement | null = null;
    private lastShowHours: boolean = false;

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

        // 4. Setup ResizeObserver for responsive sizing
        this.setupResizeObserver();

        // 5. Bind Close Event
        this.pipWindow.addEventListener('pagehide', () => {
            this.cleanup();
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
            } catch {
                // Fallback: Link to the external stylesheet
                // Cross-origin stylesheets can't be read, link them instead
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
        this.timeDisplay.style.display = 'flex';
        this.timeDisplay.style.alignItems = 'center';
        this.timeDisplay.style.justifyContent = 'center';
        this.updateTimeDisplay(state);

        // Controls Container
        const controls = doc.createElement('div');
        controls.className = 'flex gap-4 mt-4';

        // Toggle Button
        this.toggleBtn = doc.createElement('button');
        this.toggleBtn.className = 'rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors cursor-pointer border-none outline-none flex items-center justify-center';
        this.toggleBtn.innerHTML = this.getPlayPauseIcon(state.status);
        this.toggleBtn.onclick = () => this.callbacks?.onToggle();
        this.statusIcon = this.toggleBtn;

        // Reset Button
        this.resetBtn = doc.createElement('button');
        this.resetBtn.className = 'rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors cursor-pointer border-none outline-none flex items-center justify-center';
        this.resetBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path><path d="M3 3v9h9"></path></svg>';
        this.resetBtn.onclick = () => this.callbacks?.onReset();

        controls.appendChild(this.toggleBtn);
        controls.appendChild(this.resetBtn);

        if (this.container && this.timeDisplay) {
            this.container.appendChild(this.timeDisplay);
            this.container.appendChild(controls);
            doc.body.appendChild(this.container);
        }

        // Initial resize to set correct sizes
        this.handleResize();
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

        // Build time parts array
        const timeParts: string[] = [];
        if (showHours) {
            timeParts.push(hours, minutes, seconds);
        } else {
            timeParts.push(minutes, seconds);
        }

        // Calculate colon opacity based on running state and current second
        const isRunning = state.status === TimerStatus.RUNNING;
        const absSeconds = Math.abs(state.timeLeft);
        const colonOpacity = isRunning && absSeconds % 2 === 1 ? '0.4' : '1';

        // Determine color
        let colorClass = 'text-zinc-200';
        if (state.isOvertime) {
            colorClass = 'text-amber-300';
        } else if (state.isWarning) {
            colorClass = 'text-rose-400';
        }

        // Check if we need to rebuild DOM (format changed or first render)
        const needsRebuild = showHours !== this.lastShowHours || this.timePartSpans.length === 0;

        if (needsRebuild) {
            // Full rebuild when format changes
            this.buildTimeDisplayStructure(timeParts, colonOpacity, state.isOvertime);
            this.lastShowHours = showHours;
        } else {
            // Incremental update: only change text content and colon opacity
            // This preserves CSS transitions for smooth breathing animation
            timeParts.forEach((part, index) => {
                if (this.timePartSpans[index]) {
                    this.timePartSpans[index].textContent = part;
                }
            });

            // Update colon opacity (CSS transition will animate smoothly)
            this.colonSpans.forEach((colon) => {
                colon.style.opacity = colonOpacity;
            });

            // Update negative sign visibility
            if (state.isOvertime) {
                if (!this.negativeSignSpan) {
                    this.negativeSignSpan = document.createElement('span');
                    this.negativeSignSpan.textContent = '-';
                    this.negativeSignSpan.style.marginRight = '0.1em';
                    this.timeDisplay.insertBefore(this.negativeSignSpan, this.timeDisplay.firstChild);
                }
            } else if (this.negativeSignSpan) {
                this.negativeSignSpan.remove();
                this.negativeSignSpan = null;
            }
        }

        // Update color class
        this.timeDisplay.className = `font-mono font-bold tracking-tight drop-shadow-sm ${colorClass}`;
        this.timeDisplay.style.lineHeight = '1';

        // Font size will be set by handleResize
    }

    /**
     * Build the DOM structure for time display and cache element references
     * Only called when format changes or on first render
     */
    private buildTimeDisplayStructure(timeParts: string[], colonOpacity: string, isOvertime: boolean) {
        if (!this.timeDisplay) return;

        // Clear existing content and caches
        this.timeDisplay.innerHTML = '';
        this.timePartSpans = [];
        this.colonSpans = [];
        this.negativeSignSpan = null;

        // Add negative sign if overtime
        if (isOvertime) {
            this.negativeSignSpan = document.createElement('span');
            this.negativeSignSpan.textContent = '-';
            this.negativeSignSpan.style.marginRight = '0.1em';
            this.timeDisplay.appendChild(this.negativeSignSpan);
        }

        // Create and cache time part spans and colons
        timeParts.forEach((part, index) => {
            const span = document.createElement('span');
            span.textContent = part;
            this.timePartSpans.push(span);
            this.timeDisplay!.appendChild(span);

            // Add colon after each part except the last
            if (index < timeParts.length - 1) {
                const colon = document.createElement('span');
                colon.textContent = ':';
                colon.className = 'colon';
                colon.style.opacity = colonOpacity;
                colon.style.transition = 'opacity 0.5s ease-in-out';
                colon.style.margin = '0 0.05em';
                this.colonSpans.push(colon);
                this.timeDisplay!.appendChild(colon);
            }
        });
    }

    private getPlayPauseIcon(status: TimerStatus): string {
        if (status === TimerStatus.RUNNING) {
            // Pause Icon (viewBox only, size set dynamically)
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        } else {
            // Play Icon (viewBox only, size set dynamically)
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        }
    }

    /**
     * Setup ResizeObserver to handle PiP window size changes
     * Uses RAF debouncing for optimal performance
     */
    private setupResizeObserver() {
        if (!this.pipWindow) return;

        this.resizeObserver = new ResizeObserver(() => {
            // Use RAF to debounce resize events and prevent excessive repaints
            if (!this.rafPending) {
                this.rafPending = true;
                requestAnimationFrame(() => {
                    this.handleResize();
                    this.rafPending = false;
                });
            }
        });

        this.resizeObserver.observe(this.pipWindow.document.body);
    }

    /**
     * Calculate responsive sizes based on current window dimensions
     */
    private calculateSizes() {
        if (!this.pipWindow) return { fontSize: 110, buttonSize: 40, buttonIconSize: 26 };

        const width = this.pipWindow.innerWidth;
        const height = this.pipWindow.innerHeight;

        // Font size calculation: balance between width and height constraints
        // Base ratio: 340px width -> 110px font (32%), 200px height -> 96px font (48%)
        const fontSizeFromWidth = width * 0.32;
        const fontSizeFromHeight = height * 0.48;
        const fontSize = Math.min(fontSizeFromWidth, fontSizeFromHeight);

        // Button size calculation: proportional to width with min/max bounds
        // Base ratio: 340px width -> 40px button (11.7%)
        const buttonSize = Math.max(32, Math.min(56, width * 0.11));

        // Icon size: 65% of button size for proper padding
        const buttonIconSize = buttonSize * 0.65;

        return { fontSize, buttonSize, buttonIconSize };
    }

    /**
     * Handle window resize by updating element sizes
     */
    private handleResize() {
        if (!this.pipWindow || !this.timeDisplay) return;

        const { fontSize, buttonSize, buttonIconSize } = this.calculateSizes();

        // Update time display font size
        this.timeDisplay.style.fontSize = `${fontSize}px`;

        // Update button sizes
        if (this.toggleBtn) {
            this.toggleBtn.style.width = `${buttonSize}px`;
            this.toggleBtn.style.height = `${buttonSize}px`;
            // Update SVG size within button
            const svg = this.toggleBtn.querySelector('svg');
            if (svg) {
                svg.setAttribute('width', buttonIconSize.toString());
                svg.setAttribute('height', buttonIconSize.toString());
            }
        }

        if (this.resetBtn) {
            this.resetBtn.style.width = `${buttonSize}px`;
            this.resetBtn.style.height = `${buttonSize}px`;
            // Update SVG size within button
            const svg = this.resetBtn.querySelector('svg');
            if (svg) {
                svg.setAttribute('width', buttonIconSize.toString());
                svg.setAttribute('height', buttonIconSize.toString());
            }
        }
    }

    /**
     * Cleanup resources when PiP closes
     */
    private cleanup() {
        this.isActive = false;

        // Disconnect ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        // Call user's close callback
        if (this.callbacks) {
            this.callbacks.onClose();
        }

        // Clear references
        this.pipWindow = null;
        this.timeDisplay = null;
        this.statusIcon = null;
        this.container = null;
        this.toggleBtn = null;
        this.resetBtn = null;

        // Clear cached time display elements
        this.timePartSpans = [];
        this.colonSpans = [];
        this.negativeSignSpan = null;
        this.lastShowHours = false;
    }

    close(): void {
        if (this.pipWindow) {
            this.pipWindow.close();
        }
        this.cleanup();
    }
}

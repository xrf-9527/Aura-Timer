import { IPiPStrategy, PiPState, PiPCallbacks } from './IPiPStrategy.ts';
import { TimerStatus } from '../../../types';

export class CanvasStreamStrategy implements IPiPStrategy {
    public isActive: boolean = false;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private video: HTMLVideoElement | null = null;
    private callbacks: PiPCallbacks | null = null;

    private _rafId: number | null = null;
    private _lastDraw: number = 0;
    private currentState: PiPState | null = null;
    private readonly fps: number = 10;

    // Responsive sizing
    private pipWindow: PictureInPictureWindow | null = null;
    private defaultCanvasWidth: number = 600;
    private defaultCanvasHeight: number = 340;

    async open(initialState: PiPState, callbacks?: PiPCallbacks): Promise<void> {
        this.callbacks = callbacks || null;
        this.currentState = initialState;

        // 1. Create Canvas with default size
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.defaultCanvasWidth;
        this.canvas.height = this.defaultCanvasHeight;
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for performance

        // Enable high-quality text rendering
        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }

        // 2. Create Video
        this.video = document.createElement('video');
        this.video.muted = true;
        this.video.autoplay = true;
        this.video.playsInline = true; // Important for Safari
        this.video.style.position = 'absolute';
        this.video.style.width = '0';
        this.video.style.height = '0';
        this.video.style.opacity = '0';
        this.video.style.pointerEvents = 'none';
        document.body.appendChild(this.video);

        // 3. Start Render Loop
        this.isActive = true;
        this.startRenderLoop();

        // 4. Capture Stream
        // TypeScript might not know captureStream exists on HTMLCanvasElement
        const stream = (this.canvas as HTMLCanvasElement & { captureStream(frameRate?: number): MediaStream }).captureStream(this.fps);
        this.video.srcObject = stream;

        // 5. Request PiP
        try {
            await this.video.play();
            await this.video.requestPictureInPicture();
        } catch (e) {
            console.error('CanvasStreamStrategy: Failed to open PiP', e);
            this.close();
            throw e;
        }

        // 6. Bind Events
        this.video.addEventListener('leavepictureinpicture', () => {
            this.close();
            if (this.callbacks) {
                this.callbacks.onClose();
            }
        });

        // 7. Setup responsive sizing on PiP window
        this.video.addEventListener('enterpictureinpicture', (event) => {
            this.pipWindow = event.pictureInPictureWindow;

            // Listen for PiP window resize
            this.pipWindow.addEventListener('resize', () => {
                this.handlePiPResize();
            });

            // Initial resize to match PiP window
            this.handlePiPResize();
        });
    }

    update(state: PiPState): void {
        if (!this.isActive) return;
        this.currentState = state;
        // We don't draw immediately, let the loop handle it
    }

    private startRenderLoop() {
        const loop = (timestamp: number) => {
            if (!this.isActive) return;

            const interval = 1000 / this.fps;
            if (timestamp - this._lastDraw >= interval) {
                if (this.currentState) {
                    this.draw(this.currentState);
                }
                this._lastDraw = timestamp;
            }
            this._rafId = requestAnimationFrame(loop);
        };
        this._rafId = requestAnimationFrame(loop);
    }

    private draw(state: PiPState) {
        if (!this.ctx || !this.canvas) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // 1. Clear background
        this.ctx.fillStyle = '#1e1e23'; // Matches Aura Timer dark theme
        this.ctx.fillRect(0, 0, width, height);

        // 2. Calculate dynamic font size based on canvas dimensions
        // Responsive scaling: min of 28% width or 50% height
        const fontSize = Math.min(width * 0.28, height * 0.5);

        // 3. Text Configuration
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `700 ${fontSize}px ui-monospace, Menlo, Monaco, Consolas, monospace`;

        // 4. Determine Color
        if (state.isOvertime) {
            this.ctx.fillStyle = '#fcd34d'; // Amber-300
        } else if (state.isWarning) {
            this.ctx.fillStyle = '#fb7185'; // Rose-400
        } else {
            this.ctx.fillStyle = '#e4e4e7'; // Zinc-200
        }

        // 5. Build time parts and draw with breathing colons
        const { hours, minutes, seconds } = state.timeString;
        const showHours = parseInt(hours) > 0;

        const timeParts: string[] = [];
        if (showHours) {
            timeParts.push(hours, minutes, seconds);
        } else {
            timeParts.push(minutes, seconds);
        }

        // Calculate colon opacity for breathing effect
        const isRunning = state.status === TimerStatus.RUNNING;
        const absSeconds = Math.abs(state.timeLeft);
        const colonOpacity = (isRunning && absSeconds % 2 === 1) ? 0.4 : 1.0;

        // 6. Calculate total width for centering
        let fullText = timeParts.join(':');
        if (state.isOvertime) {
            fullText = `-${fullText}`;
        }
        const totalWidth = this.ctx.measureText(fullText).width;
        let x = (width - totalWidth) / 2;
        const y = height / 2;

        // 7. Draw negative sign if overtime
        if (state.isOvertime) {
            this.ctx.globalAlpha = 1.0;
            this.ctx.fillText('-', x, y);
            x += this.ctx.measureText('-').width;
        }

        // 8. Draw time parts with breathing colons
        timeParts.forEach((part, index) => {
            // Draw number part
            this.ctx!.globalAlpha = 1.0;
            this.ctx!.fillText(part, x, y);
            x += this.ctx!.measureText(part).width;

            // Draw colon with breathing effect (except after last part)
            if (index < timeParts.length - 1) {
                this.ctx!.globalAlpha = colonOpacity;
                this.ctx!.fillText(':', x, y);
                x += this.ctx!.measureText(':').width;
            }
        });

        // 9. Reset alpha
        this.ctx.globalAlpha = 1.0;

        // 10. Draw status indicator for paused state
        if (state.status === TimerStatus.PAUSED) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            const statusFontSize = fontSize * 0.12; // 12% of main font
            this.ctx.font = `600 ${statusFontSize}px ui-monospace, Menlo, Monaco, Consolas, monospace`;
            this.ctx.fillText('PAUSED', width / 2, height / 2 + fontSize * 0.6);
        }
    }

    /**
     * Handle PiP window resize by updating canvas dimensions
     * Canvas automatically scales content when dimensions change
     */
    private handlePiPResize() {
        if (!this.pipWindow || !this.canvas) return;

        const newWidth = this.pipWindow.width;
        const newHeight = this.pipWindow.height;

        // Only resize if dimensions actually changed (avoid unnecessary redraws)
        if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;

            // Force immediate redraw with new dimensions
            if (this.currentState) {
                this.draw(this.currentState);
            }
        }
    }

    close(): void {
        this.isActive = false;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }

        if (this.video) {
            // Stop tracks
            if (this.video.srcObject) {
                const stream = this.video.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                this.video.srcObject = null;
            }

            // Exit PiP if this video is the one in PiP
            if (document.pictureInPictureElement === this.video) {
                document.exitPictureInPicture().catch(() => { });
            }

            this.video.remove();
            this.video = null;
        }

        this.canvas = null;
        this.ctx = null;
        this.pipWindow = null;
    }
}

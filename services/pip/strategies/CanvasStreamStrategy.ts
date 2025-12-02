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

    async open(initialState: PiPState, callbacks?: PiPCallbacks): Promise<void> {
        this.callbacks = callbacks || null;
        this.currentState = initialState;

        // 1. Create Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 340;
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

        // 1. Background
        this.ctx.fillStyle = '#1e1e23'; // Matches Aura Timer dark theme
        this.ctx.fillRect(0, 0, width, height);

        // 2. Text Configuration
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        // Use high-quality font stack matching Document PiP (700 = bold weight, increased from 120px for better prominence)
        this.ctx.font = '700 180px ui-monospace, Menlo, Monaco, Consolas, monospace';

        // 3. Determine Color
        if (state.isOvertime) {
            this.ctx.fillStyle = '#fcd34d'; // Amber-300
        } else if (state.isWarning) {
            this.ctx.fillStyle = '#fb7185'; // Rose-400
        } else {
            this.ctx.fillStyle = '#e4e4e7'; // Zinc-200
        }

        // 4. Format Text
        const { hours, minutes, seconds } = state.timeString;
        const showHours = parseInt(hours) > 0;

        let text = `${minutes}:${seconds}`;
        if (showHours) {
            text = `${hours}:${text}`;
        }
        if (state.isOvertime) {
            text = `-${text}`;
        }

        // 5. Draw Text
        this.ctx.fillText(text, width / 2, height / 2);

        // 6. Draw Status Icon (Simple shapes)
        // Draw small indicator for paused state
        if (state.status === TimerStatus.PAUSED) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '600 20px ui-monospace, Menlo, Monaco, Consolas, monospace';
            this.ctx.fillText('PAUSED', width / 2, height / 2 + 60);
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
    }
}

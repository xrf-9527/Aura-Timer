import { IPiPStrategy, PiPState, PiPCallbacks } from './IPiPStrategy.ts';
import { drawTimerOnCanvas } from '../drawTimerCanvas.ts';

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

        // 5. Request PiP and bind window events
        try {
            await this.video.play();
            const pipWindow = await this.video.requestPictureInPicture();
            this.pipWindow = pipWindow;

            // Listen for PiP window resize
            this.pipWindow.addEventListener('resize', () => {
                this.handlePiPResize();
            });

            // Initial resize to match PiP window
            this.handlePiPResize();

            // 6. Bind leave PiP event
            this.video.addEventListener('leavepictureinpicture', () => {
                this.close();
            });
        } catch (e) {
            console.error('CanvasStreamStrategy: Failed to open PiP', e);
            this.close();
            throw e;
        }
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

        drawTimerOnCanvas(this.canvas, this.ctx, state);
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
        if (!this.isActive && !this.video && !this.canvas) {
            // Already cleaned up
            return;
        }

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

        if (this.callbacks) {
            this.callbacks.onClose();
            this.callbacks = null;
        }
    }
}

import { IPiPStrategy, PiPState, PiPCallbacks } from './strategies/IPiPStrategy.ts';
import { DocumentPiPStrategy } from './strategies/DocumentPiPStrategy.ts';
import { CanvasStreamStrategy } from './strategies/CanvasStreamStrategy.ts';

// Silent audio to prevent background tab throttling
const SILENT_AUDIO_URL = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAGZGF0YQAAAAA=';

// Type augmentation for Document PiP API
declare global {
    interface Window {
        documentPictureInPicture: any;
    }
}

export class PiPManager {
    private static instance: PiPManager;
    private strategy: IPiPStrategy | null = null;
    private audio: HTMLAudioElement | null = null;

    private constructor() {
        // Lazy init audio to prevent issues in non-browser environments
    }

    public static getInstance(): PiPManager {
        if (!PiPManager.instance) {
            PiPManager.instance = new PiPManager();
        }
        return PiPManager.instance;
    }

    private getBestStrategy(): IPiPStrategy {
        // 1. Try Document Picture-in-Picture (Chrome 111+)
        if ('documentPictureInPicture' in window) {
            console.log('PiPManager: Using DocumentPiPStrategy');
            return new DocumentPiPStrategy();
        }

        // 2. Try Video/Canvas Picture-in-Picture (Firefox/Safari)
        // Note: Firefox requires 'pictureInPictureEnabled' to be true
        if (document.pictureInPictureEnabled) {
            console.log('PiPManager: Using CanvasStreamStrategy');
            return new CanvasStreamStrategy();
        }

        throw new Error('Picture-in-Picture is not supported in this browser.');
    }

    public async toggle(state: PiPState, callbacks: PiPCallbacks): Promise<void> {
        if (this.strategy && this.strategy.isActive) {
            this.strategy.close();
            this.strategy = null;
            this.stopAudio();
            callbacks.onClose(); // Notify that we closed it
            return;
        }

        try {
            this.playAudio();
            this.strategy = this.getBestStrategy();
            await this.strategy.open(state, callbacks);
        } catch (error) {
            console.error('PiPManager: Failed to open PiP', error);
            this.strategy = null;
            this.stopAudio();
            throw error;
        }
    }

    public update(state: PiPState): void {
        if (this.strategy && this.strategy.isActive) {
            this.strategy.update(state);
        }
    }

    public close(): void {
        if (this.strategy) {
            this.strategy.close();
            this.strategy = null;
        }
        this.stopAudio();
    }

    private playAudio() {
        if (!this.audio && typeof Audio !== 'undefined') {
            this.audio = new Audio(SILENT_AUDIO_URL);
            this.audio.loop = true;
        }
        if (this.audio) {
            this.audio.play().catch(e => console.warn('PiPManager: Audio play failed', e));
        }
    }

    private stopAudio() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    public get isActive(): boolean {
        return this.strategy?.isActive ?? false;
    }
}

export const pipManager = PiPManager.getInstance();

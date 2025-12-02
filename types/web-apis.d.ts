// Type definitions for experimental Web APIs

export {};

declare global {
    // Wake Lock API
    interface WakeLockSentinel extends EventTarget {
        readonly released: boolean;
        readonly type: WakeLockType;
        release(): Promise<void>;
        onrelease: ((this: WakeLockSentinel, ev: Event) => void) | null;
    }

    type WakeLockType = 'screen';

    interface WakeLock {
        request(type?: WakeLockType): Promise<WakeLockSentinel>;
    }

    interface Navigator {
        wakeLock?: WakeLock;
    }

    // Document Picture-in-Picture API
    interface DocumentPictureInPicture {
        requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
        window: Window | null;
        onenter: ((this: DocumentPictureInPicture, ev: Event) => void) | null;
    }

    interface Window {
        documentPictureInPicture?: DocumentPictureInPicture;
    }
}

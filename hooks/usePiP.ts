import { useEffect, useState } from 'react';
import { pipManager } from '../services/pip/PiPManager';
import { PiPState, PiPCallbacks } from '../services/pip/strategies/IPiPStrategy';

export const usePiP = (state: PiPState, callbacks: PiPCallbacks) => {
    const [isPiPActive, setIsPiPActive] = useState(false);
    const [isPiPSupported, setIsPiPSupported] = useState(false);

    // Sync state to PiP Manager whenever it changes
    // Deconstruct state to avoid effect triggering on object reference change if parent doesn't memoize state
    const { timeLeft, totalSeconds, status, timeString, isOvertime, isWarning } = state;

    // Feature-detect PiP support based on MDN Picture-in-Picture API guidance:
    // - Document PiP: window.documentPictureInPicture (Chrome 111+)
    // - Element PiP: HTMLVideoElement.requestPictureInPicture (Chrome/Edge/Safari)
    // Firefox currently exposes only built-in PiP UI and does not support these Web APIs.
    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            setIsPiPSupported(false);
            return;
        }

        const hasDocumentPiP = 'documentPictureInPicture' in window && !!window.documentPictureInPicture;

        const video = document.createElement('video') as HTMLVideoElement & {
            requestPictureInPicture?: () => Promise<unknown>;
        };
        const hasElementPiP = typeof video.requestPictureInPicture === 'function';

        setIsPiPSupported(hasDocumentPiP || hasElementPiP);
    }, []);

    useEffect(() => {
        if (pipManager.isActive) {
            // Reconstruct state object from primitives to avoid dependency on state reference
            pipManager.update({ timeLeft, totalSeconds, status, timeString, isOvertime, isWarning });
        }
    }, [timeLeft, totalSeconds, status, timeString, isOvertime, isWarning]);

    const togglePiP = async () => {
        if (!isPiPSupported) {
            console.info('Picture-in-Picture is not supported in this browser.');
            return;
        }

        try {
            // Wrap callbacks to handle local state update
            const wrappedCallbacks: PiPCallbacks = {
                ...callbacks,
                onClose: () => {
                    setIsPiPActive(false);
                    callbacks.onClose();
                }
            };

            await pipManager.toggle(state, wrappedCallbacks);
            setIsPiPActive(pipManager.isActive);
        } catch (e) {
            console.error('Failed to toggle PiP:', e);
            setIsPiPActive(false);
        }
    };

    return {
        isPiPActive,
        togglePiP,
        isPiPSupported
    };
};

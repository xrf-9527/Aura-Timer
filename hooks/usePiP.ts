import { useEffect, useState } from 'react';
import { pipManager } from '../services/pip/PiPManager';
import { PiPState, PiPCallbacks } from '../services/pip/strategies/IPiPStrategy';

export const usePiP = (state: PiPState, callbacks: PiPCallbacks) => {
    const [isPiPActive, setIsPiPActive] = useState(false);

    // Sync state to PiP Manager whenever it changes
    // Deconstruct state to avoid effect triggering on object reference change if parent doesn't memoize state
    const { timeLeft, totalSeconds, status, timeString, isOvertime, isWarning } = state;

    useEffect(() => {
        if (pipManager.isActive) {
            pipManager.update(state);
        }
    }, [timeLeft, totalSeconds, status, timeString, isOvertime, isWarning]);

    const togglePiP = async () => {
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
        togglePiP
    };
};

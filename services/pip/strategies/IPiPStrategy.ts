import { TimerStatus } from '../../../types';

export interface PiPState {
    timeLeft: number;
    totalSeconds: number;
    status: TimerStatus;
    timeString: {
        hours: string;
        minutes: string;
        seconds: string;
    };
    isOvertime: boolean;
    isWarning: boolean;
}

export interface IPiPStrategy {
    isActive: boolean;

    /**
     * Open the PiP window/overlay
     * @param initialState Initial state of the timer
     * @param callbacks Optional callbacks for interaction (e.g. toggle, reset)
     */
    open(initialState: PiPState, callbacks?: PiPCallbacks): Promise<void>;

    /**
     * Update the PiP content with new state
     * @param state New state
     */
    update(state: PiPState): void;

    /**
     * Close the PiP window
     */
    close(): void;
}

export interface PiPCallbacks {
    onToggle: () => void;
    onReset: () => void;
    onClose: () => void;
}

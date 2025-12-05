/**
 * Format current date and time for PiP display.
 * Uses user's locale for natural weekday/time formatting.
 *
 * @returns Object with weekday (e.g., "周四", "Thu") and time (e.g., "14:32")
 */
export function formatDateTime(): { weekday: string; time: string } {
    const now = new Date();
    const weekday = now.toLocaleDateString(undefined, { weekday: 'short' });
    const time = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });
    return { weekday, time };
}

/**
 * Format total seconds into human-readable English duration string.
 * Follows iOS Timer UX pattern (e.g., "15 min" or "1 hr 30 min").
 *
 * @param seconds - Total duration in seconds
 * @returns Formatted string in English (e.g., "15 min", "1 hr", "1 hr 30 min")
 */
export function formatTotalTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
        return `${hours} hr ${minutes} min`;
    } else if (hours > 0) {
        return `${hours} hr`;
    } else {
        return `${minutes} min`;
    }
}

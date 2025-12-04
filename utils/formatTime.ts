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

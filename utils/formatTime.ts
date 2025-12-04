/**
 * Format total seconds into human-readable Chinese duration string.
 * Follows iOS Timer UX pattern (e.g., "15分钟" or "1小时30分钟").
 *
 * @param seconds - Total duration in seconds
 * @returns Formatted string in Chinese (e.g., "15分钟", "1小时", "1小时30分钟")
 */
export function formatTotalTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
        return `${hours}小时${minutes}分钟`;
    } else if (hours > 0) {
        return `${hours}小时`;
    } else {
        return `${minutes}分钟`;
    }
}

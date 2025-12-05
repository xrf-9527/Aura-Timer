import { TimerStatus } from '../../types';
import type { PiPState } from './strategies/IPiPStrategy';
import { formatDateTime, formatTotalTime } from '../../utils/formatTime';

export function drawTimerOnCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    state: PiPState
): void {
    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear background
    ctx.fillStyle = '#1e1e23'; // Matches Aura Timer dark theme
    ctx.fillRect(0, 0, width, height);

    // 2. Calculate base font size based on canvas dimensions
    // Responsive scaling: min of 28% width or 50% height
    const baseFontSize = Math.min(width * 0.28, height * 0.5);

    // 3. Text Configuration
    // Use left alignment so we can manually position each character
    // based on cumulative measured width and still keep the whole
    // string visually centered.
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${baseFontSize}px ui-monospace, Menlo, Monaco, Consolas, monospace`;

    // 4. Determine Color (keep digits in a soft, high-contrast gray)
    ctx.fillStyle = '#e4e4e7'; // Zinc-200

    // Apply a soft colored glow for warning / overtime while keeping digits readable
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    if (state.isOvertime) {
        ctx.shadowColor = 'rgba(251, 191, 36, 0.28)';
        ctx.shadowBlur = baseFontSize * 0.1;
    } else if (state.isWarning && state.status === TimerStatus.RUNNING) {
        ctx.shadowColor = 'rgba(251, 113, 133, 0.22)';
        ctx.shadowBlur = baseFontSize * 0.08;
    }

    // 5. Build time parts and draw with breathing colons
    const { hours, minutes, seconds } = state.timeString;
    const showHours = parseInt(hours, 10) > 0;

    // Build full text representation for accurate centering
    // Examples: "15:00", "01:23:45", "-00:30"
    let fullText = '';
    if (state.isOvertime) {
        fullText += '-';
    }
    if (showHours) {
        fullText += `${hours}:${minutes}:${seconds}`;
    } else {
        fullText += `${minutes}:${seconds}`;
    }

    // Calculate colon opacity for breathing effect
    const isRunning = state.status === TimerStatus.RUNNING;
    const absSeconds = Math.abs(state.timeLeft);
    const colonOpacity = (isRunning && absSeconds % 2 === 1) ? 0.55 : 1.0;

    // 6. Fit text into available width by scaling font size down when necessary
    const maxTextWidth = width * 0.9; // Keep a small horizontal margin
    let effectiveFontSize = baseFontSize;
    let totalWidth = ctx.measureText(fullText).width;
    if (totalWidth > maxTextWidth && totalWidth > 0) {
        const scale = maxTextWidth / totalWidth;
        effectiveFontSize = baseFontSize * scale;
        ctx.font = `700 ${effectiveFontSize}px ui-monospace, Menlo, Monaco, Consolas, monospace`;
        totalWidth = ctx.measureText(fullText).width;
    }

    // 7. Calculate starting x position for perfect centering
    const xBase = (width - totalWidth) / 2;
    const y = height / 2;

    // 8. Draw character by character using cumulative advance width
    for (let i = 0; i < fullText.length; i++) {
        const char = fullText[i];
        const isColonChar = char === ':';

        const prevText = fullText.slice(0, i);
        const advance = ctx.measureText(prevText).width;

        ctx.globalAlpha = isColonChar ? colonOpacity : 1.0;
        ctx.fillText(char, xBase + advance, y);
    }

    // 9. Reset alpha and shadow
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // 10. Draw current date and time above main countdown
    const { weekday, time } = formatDateTime();
    const dateTimeText = `${weekday} ${time}`;
    const dateTimeFontSize = Math.max(10, effectiveFontSize * 0.14); // Min 10px for readability
    ctx.fillStyle = 'rgba(161, 161, 170, 0.7)'; // zinc-400 at 70% opacity (slightly dimmer than total time)
    ctx.textAlign = 'center';
    ctx.font = `500 ${dateTimeFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(dateTimeText, width / 2, y - effectiveFontSize * 0.7);

    // 11. Draw total time display (iOS-style) below main countdown
    const totalTimeText = formatTotalTime(state.totalSeconds);
    const totalTimeFontSize = effectiveFontSize * 0.16; // 16% of main font for readability
    ctx.fillStyle = 'rgba(161, 161, 170, 0.8)'; // zinc-400 at 80% opacity
    ctx.textAlign = 'center';
    ctx.font = `500 ${totalTimeFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(totalTimeText, width / 2, y + effectiveFontSize * 0.45);

    // 12. Draw status indicator for paused state
    if (state.status === TimerStatus.PAUSED) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        const statusFontSize = effectiveFontSize * 0.12; // 12% of main font
        ctx.font = `600 ${statusFontSize}px ui-monospace, Menlo, Monaco, Consolas, monospace`;
        ctx.fillText('PAUSED', width / 2, y + effectiveFontSize * 0.75);
    }
}

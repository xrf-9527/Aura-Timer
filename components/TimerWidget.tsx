import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerStatus } from '../types';
import { useDraggable } from '../hooks/useDraggable';
import { getDurationFromQuery } from '../services/geminiService';

// Icons
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path><path d="M3 3v9h9"></path></svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"></path></svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const DEFAULT_TIME = 15 * 60; // 15 minutes

export const TimerWidget: React.FC = () => {
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_TIME);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("15");
  const [isHovering, setIsHovering] = useState(false);
  const [smartPrompt, setSmartPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [now, setNow] = useState(new Date());
  
  // Use a ref to hold the wake lock sentinel (using any to bypass strict TS checks for experimental API)
  const wakeLockRef = useRef<any>(null);

  // Widget dimensions (must match actual rendered size)
  const WIDGET_WIDTH = 340;
  const WIDGET_HEIGHT = 200;

  // Initial center position
  const { position, handleMouseDown, handleTouchStart, isDragging } = useDraggable(
    {
      x: window.innerWidth / 2 - WIDGET_WIDTH / 2,
      y: window.innerHeight / 2 - WIDGET_HEIGHT / 2
    },
    { width: WIDGET_WIDTH, height: WIDGET_HEIGHT }
  );

  // Clock Tick (Current Time)
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === TimerStatus.RUNNING) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Wake Lock Logic (Prevent Sleep)
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        const lock = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = lock;
        // console.log('Wake Lock acquired');
        lock.addEventListener('release', () => {
          // console.log('Wake Lock released');
          wakeLockRef.current = null;
        });
      } catch (err: any) {
        // If the error is "NotAllowedError", it means the browser or system policy blocked it.
        // We suppress this specific warning to keep the console clean as the app works fine without it.
        if (err.name !== 'NotAllowedError') {
          console.warn(`Wake Lock request failed: ${err.name}, ${err.message}`);
        }
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err: any) {
        console.warn(`Wake Lock release failed: ${err.name}, ${err.message}`);
      }
    }
  }, []);

  // Manage Wake Lock based on Timer Status
  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    
    // Cleanup on unmount
    return () => {
      releaseWakeLock();
    };
  }, [status, requestWakeLock, releaseWakeLock]);

  // Re-acquire Wake Lock on visibility change (browsers release it when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === TimerStatus.RUNNING) {
         requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [status, requestWakeLock]);

  // Format Time Helper
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const resetTimer = useCallback(() => {
    setStatus(TimerStatus.IDLE);
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  const toggleTimer = useCallback(() => {
    setStatus((prev) => (prev === TimerStatus.RUNNING ? TimerStatus.PAUSED : TimerStatus.RUNNING));
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing || showAiInput) return; // Disable shortcuts while editing
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      }
      if (e.code === 'KeyR') {
        resetTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, resetTimer, isEditing, showAiInput]);

  // Handle Edit
  const handleTimeClick = () => {
    setStatus(TimerStatus.PAUSED);
    setIsEditing(true);
    // When editing, default to showing minutes total (e.g. 90 mins instead of 1h 30m) for simplicity
    // Use Math.abs in case we are editing while negative
    setEditValue(Math.floor(Math.abs(timeLeft) / 60).toString());
  };

  const submitEdit = () => {
    const minutes = parseInt(editValue, 10);
    if (!isNaN(minutes) && minutes >= 0) {
      const newSeconds = minutes * 60;
      setTotalSeconds(newSeconds);
      setTimeLeft(newSeconds);
    }
    setIsEditing(false);
    setShowAiInput(false);
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartPrompt.trim()) return;

    setIsAiLoading(true);
    const seconds = await getDurationFromQuery(smartPrompt);
    setIsAiLoading(false);

    if (seconds) {
      setTotalSeconds(seconds);
      setTimeLeft(seconds);
      setStatus(TimerStatus.IDLE); // Let user start it manually
      setIsEditing(false);
      setShowAiInput(false);
      setSmartPrompt("");
    } else {
      // Simple error feedback
      setSmartPrompt("Could not understand. Try '5 mins'");
    }
  };

  // State Logic
  const isOvertime = timeLeft < 0;
  // Warning only applies if not in overtime and within last 5 minutes
  const isWarning = !isOvertime && timeLeft <= 5 * 60 && status === TimerStatus.RUNNING;
  
  const absSeconds = Math.abs(timeLeft);
  const timeDisplay = formatTime(absSeconds);
  
  // Show hours if the timer was set to > 1hr OR if we have drifted past 1hr in overtime
  const showHours = totalSeconds >= 3600 || absSeconds >= 3600;

  // Colon breathing logic:
  // Toggle opacity based on even/odd seconds when running.
  // Using absSeconds ensures smooth cycle even in negatives.
  const colonOpacityClass = status === TimerStatus.RUNNING 
    ? (absSeconds % 2 === 0 ? 'opacity-100' : 'opacity-40') 
    : 'opacity-100';
    
  // Adjust font size and alignment based on whether hours are shown
  const fontSizeClass = showHours ? 'text-5xl' : 'text-7xl';
  // Vertical alignment adjustment for the colon to keep it centered
  // Also applied to the negative sign
  const verticalOffsetClass = showHours ? '-top-1' : '-top-2';

  // Determine Styles based on state
  // Using softer "Eye Friendly" colors
  // Standard: Zinc-200 (Soft Grey-White)
  // Overtime: Amber-300 (Soft Gold)
  // Warning: Rose-400 (Soft Pastel Red)
  
  let textColorClass = 'text-zinc-200 drop-shadow-sm';
  let boxGlowStyle = '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)';

  if (isOvertime) {
    textColorClass = 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]';
    boxGlowStyle = '0 0 40px rgba(251, 191, 36, 0.3), inset 0 0 0 1px rgba(252, 211, 77, 0.3)';
  } else if (isWarning) {
    textColorClass = 'text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]';
    boxGlowStyle = '0 0 40px rgba(244, 63, 94, 0.3), inset 0 0 0 1px rgba(251, 113, 133, 0.3)';
  }

  // Current Date Formatting
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div
      className={`fixed select-none transition-shadow duration-300 ease-in-out ${
        isDragging ? 'cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: '340px',
        // Glassmorphism Styles
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        // Softer dark background for better eye protection (less contrast strain)
        backgroundColor: 'rgba(30, 30, 35, 0.60)', 
        boxShadow: boxGlowStyle,
        borderRadius: '24px',
        zIndex: 9999,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative px-8 py-8 flex flex-col items-center justify-center min-h-[160px]">
        
        {/* Top Date/Time Header */}
        <div className="absolute top-6 w-full flex justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-zinc-500/80 tracking-[0.2em] font-sans">
            {dayName} {timeString}
          </span>
        </div>

        {/* Toggle between Time Display and AI Input */}
        {!isEditing ? (
            <div 
              className="relative group cursor-pointer mt-2" // Added mt-2 to offset slightly for header
              onClick={handleTimeClick}
              title="Click to edit duration"
            >
              <div 
                className={`flex items-center justify-center ${fontSizeClass} font-mono tracking-tighter transition-colors duration-300 ${textColorClass}`}
              >
                {/* Negative sign for overtime - Aligned with colons */}
                {isOvertime && (
                  <span className={`mr-2 relative ${verticalOffsetClass}`}>-</span>
                )}

                {showHours && (
                  <>
                    <span>{timeDisplay.hours}</span>
                    <span className={`mx-1 relative ${verticalOffsetClass} transition-opacity duration-500 ease-in-out ${colonOpacityClass}`}>:</span>
                  </>
                )}
                <span>{timeDisplay.minutes}</span>
                {/* Colon with synced breathing effect and vertical adjustment */}
                <span className={`mx-1 relative ${verticalOffsetClass} transition-opacity duration-500 ease-in-out ${colonOpacityClass}`}>:</span>
                <span>{timeDisplay.seconds}</span>
              </div>
              {/* Subtle hint to click */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-zinc-400 font-sans">
                Edit
              </div>
            </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-200 mt-2">
             {!showAiInput ? (
                // Manual Minutes Input
                <div className="flex items-center gap-2">
                   <input
                    type="number"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitEdit()}
                    className="w-32 bg-transparent text-6xl text-center font-mono text-zinc-200 border-b-2 border-zinc-500 focus:border-zinc-200 focus:outline-none placeholder-zinc-600"
                  />
                  <span className="text-xl text-zinc-400 font-sans">min</span>
                  
                  {/* Smart Set Button */}
                  <button 
                    onClick={() => setShowAiInput(true)}
                    className="ml-4 p-2 rounded-full bg-white/5 hover:bg-indigo-500/30 text-zinc-400 hover:text-indigo-200 transition-all hover:scale-105"
                    title="Ask AI to set time"
                  >
                    <SparklesIcon />
                  </button>
                </div>
             ) : (
                // AI Input
                <form onSubmit={handleAiSubmit} className="w-full flex items-center gap-2">
                  <div className="relative w-full">
                    <div className="absolute left-2.5 top-2.5 text-zinc-400">
                        <SparklesIcon />
                    </div>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Boil an egg..."
                      value={smartPrompt}
                      onChange={(e) => setSmartPrompt(e.target.value)}
                      className="w-full bg-black/20 text-zinc-200 text-sm pl-9 pr-8 py-2 rounded-lg border border-zinc-700 focus:border-indigo-400/50 focus:outline-none placeholder-zinc-500"
                      disabled={isAiLoading}
                    />
                    {isAiLoading && (
                        <div className="absolute right-2 top-2 w-4 h-4 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin"></div>
                    )}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowAiInput(false)}
                    className="text-zinc-500 hover:text-zinc-200"
                  >
                    <CloseIcon />
                  </button>
                </form>
             )}

             {!showAiInput && (
                <button 
                  onClick={submitEdit}
                  className="mt-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-200 font-semibold"
                >
                  Set Timer
                </button>
             )}
          </div>
        )}

        {/* Controls - Fade in on Hover or Pause */}
        <div 
          className={`absolute -bottom-5 flex items-center gap-4 transition-all duration-300 ease-out transform ${
            isHovering || status === TimerStatus.PAUSED ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
          }`}
        >
          <button 
            onClick={toggleTimer}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 text-zinc-200 shadow-lg transition-transform active:scale-95"
          >
            {status === TimerStatus.RUNNING ? <PauseIcon /> : <PlayIcon />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 text-zinc-400 hover:text-zinc-200 shadow-lg transition-transform active:scale-95"
          >
            <ResetIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
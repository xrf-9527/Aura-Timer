import React, { useState } from 'react';

export const InstructionOverlay: React.FC = () => {
    const [isMinimized, setIsMinimized] = useState(false);

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="absolute top-8 left-8 z-10 group flex items-center justify-center w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:bg-black/40 hover:text-white transition-all duration-300 shadow-lg"
                title="Show Instructions"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </button>
        );
    }

    return (
        <div className="absolute top-8 left-8 z-10 w-80 p-5 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] text-white transition-all duration-300 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-wide text-white/90 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                    Aura Timer
                </h2>
                <button
                    onClick={() => setIsMinimized(true)}
                    className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                    title="Minimize"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 rounded bg-white/5 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="5 9 2 12 5 15"></polyline>
                            <polyline points="9 5 12 2 15 5"></polyline>
                            <polyline points="15 19 12 22 9 19"></polyline>
                            <polyline points="19 9 22 12 19 15"></polyline>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <line x1="12" y1="2" x2="12" y2="22"></line>
                        </svg>
                    </div>
                    <span>Drag the widget anywhere on screen.</span>
                </li>
                <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 rounded bg-white/5 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </div>
                    <span>Click time to edit directly (or ask AI).</span>
                </li>
                <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 rounded bg-white/5 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <rect x="7" y="7" width="3" height="9"></rect>
                            <rect x="14" y="7" width="3" height="5"></rect>
                        </svg>
                    </div>
                    <span>Hover for controls (PiP available).</span>
                </li>
                <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 rounded bg-white/5 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    </div>
                    <span>
                        <kbd className="font-mono bg-white/10 px-1 rounded text-xs">Space</kbd> Play/Pause | <kbd className="font-mono bg-white/10 px-1 rounded text-xs">R</kbd> Reset
                    </span>
                </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-white/40 italic">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Background changes every 5 min
            </div>
        </div>
    );
};

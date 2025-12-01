import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const InstructionOverlay: React.FC = () => {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <AnimatePresence mode="wait" initial={false}>
            {isMinimized ? (
                <motion.button
                    key="minimized-button"
                    layoutId="overlay-container"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                    }}
                    onClick={() => setIsMinimized(false)}
                    className="absolute top-8 left-8 z-10 group flex items-center justify-center w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:bg-black/40 hover:text-white shadow-lg"
                    title="Show Instructions"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </motion.button>
            ) : (
                <motion.div
                    key="expanded-panel"
                    layoutId="overlay-container"
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                    }}
                    className="absolute top-8 left-8 z-10 w-80 p-5 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] text-white overflow-hidden"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between mb-4"
                    >
                        <h2 className="text-lg font-medium tracking-wide text-white/90 flex items-center gap-2 font-sans">
                            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                            Aura Timer
                        </h2>
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                            title="Minimize"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </motion.div>

                    <motion.ul
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3 text-[13px] text-white/80 font-sans tracking-wide"
                    >
                        <li className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/5 border border-white/10 shadow-sm">
                                {/* Drag Icon: 4-way arrow */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M15 19l-3 3-3-3M2 12h20M12 2v20" />
                                </svg>
                            </div>
                            <span>Drag the widget anywhere.</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/5 border border-white/10 shadow-sm">
                                {/* Edit Icon: I-beam cursor */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8 4h8M8 20h8M12 4v16" />
                                </svg>
                            </div>
                            <span>Click time to edit (or ask AI).</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/5 border border-white/10 shadow-sm">
                                {/* Controls Icon: Sliders */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line>
                                    <line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line>
                                    <line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>
                                </svg>
                            </div>
                            <span>Hover for controls (PiP available).</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/5 border border-white/10 shadow-sm">
                                {/* Play/Pause Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            </div>
                            <span>
                                <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px] border border-white/10">Space</kbd> Play/Pause | <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px] border border-white/10">R</kbd> Reset
                            </span>
                        </li>
                    </motion.ul>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-white/40 italic font-sans"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        Background changes every 5 min
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

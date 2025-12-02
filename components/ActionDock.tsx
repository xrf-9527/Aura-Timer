import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- Icons ---

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{
            scale: filled ? 1.1 : 1,
            color: filled ? "#f43f5e" : "#d4d4d8" // rose-500 : zinc-300
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`group-hover:text-rose-400 ${!filled && 'text-zinc-300'}`}
    >
        <motion.path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            initial={false}
            animate={{
                fillOpacity: filled ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
        />
    </motion.svg>
);

const GitHubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
);

const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

// --- Components ---

const NumberTicker = ({ value }: { value: number }) => {
    return (
        <div className="relative h-5 w-auto min-w-[1.5rem] overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={value}
                    initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute text-sm font-mono font-medium text-zinc-300 group-hover:text-white"
                >
                    {value.toLocaleString()}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

const ParticleBurst = () => {
    const particles = Array.from({ length: 6 });
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                    animate={{
                        scale: 0,
                        opacity: 0,
                        x: Math.cos(i * 60 * (Math.PI / 180)) * 20,
                        y: Math.sin(i * 60 * (Math.PI / 180)) * 20,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute w-1 h-1 bg-rose-400 rounded-full"
                />
            ))}
        </div>
    );
};

export const ActionDock: React.FC = () => {
    const [likes, setLikes] = useState<number>(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showParticles, setShowParticles] = useState(false);

    // Fetch initial likes
    useEffect(() => {
        fetch('/api/likes')
            .then(res => res.json())
            .then((data: unknown) => {
                const { likes } = data as { likes: number };
                setLikes(likes);
            })
            .catch(err => console.error('Failed to fetch likes:', err));
    }, []);

    // React 19.2 best practice: Plain function without useCallback
    // Only used in onClick handler, no need for memoization
    const handleLike = async () => {
        // Optimistic update
        setLikes(prev => prev + 1);
        setIsLiked(true);
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 1000);

        try {
            await fetch('/api/likes', { method: 'POST' });
        } catch (error) {
            // Revert on failure
            setLikes(prev => prev - 1);
            setIsLiked(false);
            console.error('Failed to update likes:', error);
        }
    };

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-black/20 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)_inset] ring-1 ring-white/20">

                {/* Like Section */}
                <motion.button
                    onClick={handleLike}
                    whileTap={{ scale: 0.9 }}
                    className="group relative flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 transition-colors duration-300"
                    title="Like this timer"
                >
                    <div className="relative">
                        <HeartIcon filled={isLiked} />
                        {showParticles && <ParticleBurst />}
                    </div>

                    <NumberTicker value={likes} />
                </motion.button>

                {/* Divider */}
                <div className="w-px h-6 bg-white/30 mx-1"></div>

                {/* Social Links */}
                <div className="flex items-center gap-1">
                    <a
                        href="https://github.com/xrf-9527/Aura-Timer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                        title="View on GitHub"
                    >
                        <GitHubIcon />
                    </a>
                    <a
                        href="https://x.com/joey_cn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                        title="Follow on X (Twitter)"
                    >
                        <TwitterIcon />
                    </a>
                </div>

            </div>
        </div>
    );
};

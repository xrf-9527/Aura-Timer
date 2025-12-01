import React, { useState, useEffect, useCallback } from 'react';

// --- Icons ---

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-300 ${filled ? 'scale-110 text-rose-500' : 'scale-100 text-zinc-400 group-hover:text-rose-400'}`}
    >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
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

// --- Component ---

export const ActionDock: React.FC = () => {
    const [likes, setLikes] = useState<number>(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

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

    const handleLike = useCallback(async () => {
        // Optimistic update
        setLikes(prev => prev + 1);
        setIsLiked(true);
        setIsAnimating(true);

        // Reset animation state
        setTimeout(() => setIsAnimating(false), 1000);

        try {
            await fetch('/api/likes', { method: 'POST' });
        } catch (error) {
            // Revert on failure
            setLikes(prev => prev - 1);
            setIsLiked(false);
            console.error('Failed to update likes:', error);
        }
    }, []);

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-black/5">

                {/* Like Section */}
                <button
                    onClick={handleLike}
                    className="group relative flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-300"
                    title="Like this timer"
                >
                    <div className={`relative ${isAnimating ? 'animate-bounce' : ''}`}>
                        <HeartIcon filled={isLiked} />
                    </div>
                    <span className="text-sm font-mono font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors min-w-[1.5rem] text-center">
                        {likes.toLocaleString()}
                    </span>

                    {/* Particle/Glow Effect on Click */}
                    {isAnimating && (
                        <div className="absolute inset-0 rounded-full animate-ping bg-rose-500/10 pointer-events-none"></div>
                    )}
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10 mx-1"></div>

                {/* Social Links */}
                <div className="flex items-center gap-1">
                    <a
                        href="https://github.com/xrf-9527/Aura-Timer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                        title="View on GitHub"
                    >
                        <GitHubIcon />
                    </a>
                    <a
                        href="https://x.com/joey_cn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                        title="Follow on X (Twitter)"
                    >
                        <TwitterIcon />
                    </a>
                </div>

            </div>
        </div>
    );
};

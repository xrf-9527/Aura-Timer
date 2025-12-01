import React, { useState, useEffect, useCallback } from 'react';

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-300 ${filled ? 'scale-110 text-rose-500' : 'scale-100 text-zinc-400'}`}
    >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);

export const LikeButton: React.FC = () => {
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
        <div className="fixed bottom-8 left-8 z-50 flex items-center gap-3">
            <button
                onClick={handleLike}
                className="group relative p-4 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                title="Like this timer"
            >
                <div className={`relative z-10 ${isAnimating ? 'animate-bounce' : ''}`}>
                    <HeartIcon filled={isLiked} />
                </div>

                {/* Particle/Glow Effect on Click */}
                {isAnimating && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-rose-500/20"></div>
                )}
            </button>

            {/* Counter Badge */}
            <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 text-zinc-300 text-sm font-mono font-medium min-w-[3rem] text-center transition-all duration-300">
                {likes.toLocaleString()}
            </div>
        </div>
    );
};

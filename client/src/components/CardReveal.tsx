import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Eye, EyeOff } from 'lucide-react';

const CardReveal: React.FC = () => {
    const { gameState, socket } = useGame();
    const [isRevealed, setIsRevealed] = useState(false);

    const me = gameState?.players.find(p => p.id === socket?.id);
    const isImpostor = me?.role === 'impostor';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background select-none">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-8"
            >
                <span className="text-gray-400 uppercase tracking-widest text-sm mb-2 block">
                    Category
                </span>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                    {gameState?.currentRound.category}
                </h2>
            </motion.div>

            <div
                className="relative w-full max-w-sm aspect-[3/4] cursor-pointer touch-none"
                onPointerDown={() => setIsRevealed(true)}
                onPointerUp={() => setIsRevealed(false)}
                onPointerLeave={() => setIsRevealed(false)}
            >
                <AnimatePresence>
                    {!isRevealed ? (
                        <motion.div
                            initial={{ rotateY: 0 }}
                            animate={{ rotateY: 0 }}
                            exit={{ rotateY: 90, opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-br from-surface to-background border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center group transition-all hover:scale-[1.02]"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                                <Eye size={32} className="text-gray-400" />
                            </div>
                            <p className="text-xl font-medium text-gray-300">
                                Hold to reveal your secret
                            </p>
                            <p className="text-sm text-gray-500 mt-4">
                                Don't let anyone else see!
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ rotateY: -90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            className={`absolute inset-0 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center border-2 
                ${isImpostor
                                    ? 'bg-red-500/10 border-red-500/50'
                                    : 'bg-primary/10 border-primary/50'}`}
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 
                 ${isImpostor ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                                <EyeOff size={32} />
                            </div>

                            {isImpostor ? (
                                <>
                                    <h3 className="text-red-400 font-bold text-2xl mb-2">YOU ARE THE IMPOSTOR</h3>
                                    <div className="bg-surface/50 p-4 rounded-xl border border-red-500/20 w-full">
                                        <span className="text-gray-400 text-xs uppercase block mb-1">Your Hint Word</span>
                                        <p className="text-3xl font-black text-white">{me?.word}</p>
                                    </div>
                                    <p className="text-xs text-red-300/70 mt-4">
                                        Blend in. Don't let them catch you.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-primary font-bold text-2xl mb-2">YOU ARE INNOCENT</h3>
                                    <div className="bg-surface/50 p-4 rounded-xl border border-primary/20 w-full">
                                        <span className="text-gray-400 text-xs uppercase block mb-1">Secret Word</span>
                                        <p className="text-3xl font-black text-white">{me?.word}</p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CardReveal;

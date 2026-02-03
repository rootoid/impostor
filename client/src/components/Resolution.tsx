import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import { Trophy, Skull } from 'lucide-react';
import { motion } from 'framer-motion';

const Resolution: React.FC = () => {
    const { gameState, playAgain } = useGame();

    const winner = gameState?.winner;
    const isImpostorWin = winner === 'impostor';

    useEffect(() => {
        if (winner) {
            const colors = isImpostorWin ? ['#ef4444', '#b91c1c'] : ['#3b82f6', '#1d4ed8'];
            const end = Date.now() + 3000;

            (function frame() {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [winner, isImpostorWin]);

    if (!gameState) return null;

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-6 text-center 
      ${isImpostorWin ? 'bg-red-950 text-red-50' : 'bg-slate-900 text-slate-50'}`}>

            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 border-4 
          ${isImpostorWin ? 'bg-red-900 border-red-500' : 'bg-blue-900 border-blue-500'}`}
            >
                {isImpostorWin ? <Skull size={64} /> : <Trophy size={64} />}
            </motion.div>

            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">
                {isImpostorWin ? 'Impostor Wins' : 'Innocents Win'}
            </h1>

            <p className={`text-lg mb-12 ${isImpostorWin ? 'text-red-300' : 'text-blue-300'}`}>
                {isImpostorWin
                    ? 'Deception was successful.'
                    : 'The hidden threat was eliminated.'}
            </p>

            <div className="bg-black/20 p-6 rounded-2xl max-w-sm w-full backdrop-blur-sm border border-white/10">
                <div className="mb-4">
                    <span className="text-xs uppercase text-white/50 block mb-1">Secret Word</span>
                    <span className="text-2xl font-bold">{gameState.currentRound.secretWord}</span>
                </div>
                <div>
                    <span className="text-xs uppercase text-white/50 block mb-1">Impostor Word</span>
                    <span className="text-2xl font-bold">{gameState.currentRound.impostorWord}</span>
                </div>
            </div>

            <button
                onClick={playAgain}
                className="mt-12 group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-white/10 rounded-full hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95"
            >
                <span>PLAY AGAIN</span>
                <span className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/50 transition-all" />
            </button>
        </div>
    );
};

export default Resolution;

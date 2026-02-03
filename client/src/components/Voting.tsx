import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Fingerprint, AlertTriangle } from 'lucide-react';

const Voting: React.FC = () => {
    const { gameState, votePlayer, socket } = useGame();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (!gameState) return null;

    const handleConfirmVote = () => {
        if (selectedId) {
            votePlayer(selectedId);
        }
    };

    const myVote = gameState.players.find(p => p.id === socket?.id)?.vote;

    if (myVote) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6"
                >
                    <Fingerprint size={48} className="text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Vote Cast</h2>
                <p className="text-gray-400">Waiting for others to decide...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background p-4">
            <div className="text-center py-6">
                <h2 className="text-2xl font-bold text-white mb-1">Emergency Meeting</h2>
                <p className="text-red-400 font-medium flex items-center justify-center gap-2">
                    <AlertTriangle size={16} />
                    Who is the Impostor?
                </p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto pb-4">
                {gameState.players.map((p) => {
                    const isMe = p.id === socket?.id;
                    if (p.isDead) return null; // Don't vote for dead players

                    return (
                        <motion.button
                            key={p.id}
                            onClick={() => !isMe && setSelectedId(p.id)}
                            whileTap={{ scale: 0.95 }}
                            className={`relative rounded-2xl p-4 flex flex-col items-center justify-center border-2 transition-all
                 ${selectedId === p.id
                                    ? 'bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                    : 'bg-surface border-transparent hover:bg-surface/80'}
                 ${isMe ? 'opacity-50 cursor-not-allowed grayscale' : ''}
               `}
                            disabled={isMe}
                        >
                            <img
                                src={p.avatar}
                                alt={p.name}
                                className={`w-16 h-16 rounded-full mb-3 ${isMe ? 'opacity-50' : ''}`}
                            />
                            <span className="font-bold text-sm truncate w-full text-center">
                                {isMe ? `${p.name} (You)` : p.name}
                            </span>

                            {selectedId === p.id && (
                                <motion.div
                                    layoutId="selection-ring"
                                    className="absolute inset-0 border-4 border-red-500 rounded-2xl"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="pt-4 space-y-3">
                <button
                    onClick={handleConfirmVote}
                    disabled={!selectedId}
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
                >
                    VOTE TO ELIMINATE
                </button>

                <button
                    onClick={() => votePlayer('skip')}
                    className="w-full bg-surface text-gray-400 py-3 rounded-xl font-medium text-sm hover:text-white transition-colors"
                >
                    Skip Vote
                </button>
            </div>
        </div>
    );
};

export default Voting;

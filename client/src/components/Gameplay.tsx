import React from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

const Gameplay: React.FC = () => {
    const { gameState, endTurn, socket } = useGame();

    if (!gameState) return null;

    const currentSpeakerId = gameState.currentRound.speakerOrder[gameState.currentRound.currentSpeakerIndex];
    const isMyTurn = socket?.id === currentSpeakerId;
    const currentSpeaker = gameState.players.find(p => p.id === currentSpeakerId);

    return (
        <div className="flex flex-col h-screen bg-background pt-8 px-4 pb-4">
            {/* HUD */}
            <div className="flex justify-between items-center mb-6">
                <div className="bg-surface/50 backdrop-blur px-4 py-2 rounded-full border border-white/5">
                    <span className="text-xs text-gray-400 uppercase mr-2">Category</span>
                    <span className="font-bold text-accent">{gameState.currentRound.category}</span>
                </div>
                <div className="bg-surface/50 backdrop-blur px-4 py-2 rounded-full border border-white/5">
                    <span className="text-gray-200">Round {gameState.currentRound.roundNumber}/3</span>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Active Speaker Ring */}
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-8 bg-primary/20 rounded-full blur-xl"
                    />
                    <div className="w-32 h-32 rounded-full border-4 border-primary p-1 relative z-10 bg-background">
                        <img
                            src={currentSpeaker?.avatar}
                            alt="Speaker"
                            className="w-full h-full rounded-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full text-white shadow-lg">
                            <Mic size={16} />
                        </div>
                    </div>
                </div>

                <h2 className="mt-6 text-2xl font-bold text-center">
                    {isMyTurn ? "It's your turn!" : `${currentSpeaker?.name} is speaking...`}
                </h2>
                <p className="text-gray-400 mt-2 text-center max-w-xs">
                    {isMyTurn
                        ? "Describe your word without giving it away completely."
                        : "Listen carefully. Look for anything suspicious."}
                </p>
            </div>

            {/* Player List / Turn Order */}
            <div className="mt-8 mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 text-center">Turn Order</div>
                <div className="flex justify-center space-x-3 overflow-x-auto py-2">
                    {gameState.currentRound.speakerOrder.map((pid, idx) => {
                        const p = gameState.players.find(pl => pl.id === pid);
                        const isDone = idx < gameState.currentRound.currentSpeakerIndex;
                        const isCurrent = idx === gameState.currentRound.currentSpeakerIndex;

                        return (
                            <div key={pid} className={`flex flex-col items-center space-y-1 transition-opacity ${isDone ? 'opacity-30' : 'opacity-100'}`}>
                                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isCurrent ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-gray-700'}`}>
                                    <img src={p?.avatar} className="w-full h-full bg-surface" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Action Button */}
            <div className="pb-6 px-4">
                {isMyTurn ? (
                    <button
                        onClick={endTurn}
                        className="w-full bg-white text-black py-4 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-transform"
                    >
                        DONE SPEAKING
                    </button>
                ) : (
                    <div className="w-full py-4 rounded-2xl bg-surface border border-white/5 text-center text-gray-500 font-medium">
                        Waiting for speaker...
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gameplay;

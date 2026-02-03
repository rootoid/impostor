import React, { useEffect, useState } from 'react';
import { useGame } from './context/GameContext';
import Lobby from './components/Lobby';
import CardReveal from './components/CardReveal';
import Gameplay from './components/Gameplay';
import Voting from './components/Voting';
import Resolution from './components/Resolution';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
    const { gameState, isConnected, connectionError } = useGame();
    const [showCard, setShowCard] = useState(false);

    // Manage Card Reveal Transition
    useEffect(() => {
        if (gameState?.state === 'playing' && gameState.currentRound.roundNumber === 1 && gameState.currentRound.currentSpeakerIndex === 0) {
            setShowCard(true);
        } else {
            setShowCard(false);
        }
    }, [gameState?.state, gameState?.currentRound]);

    if (!isConnected) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background text-text">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium animate-pulse">Connecting to server...</p>
                    {connectionError && (
                        <p className="text-red-500 font-bold max-w-md text-center bg-red-950/50 p-4 rounded-lg border border-red-500/20">
                            {connectionError}
                            <br />
                            <span className="text-xs font-normal text-red-300">
                                Make sure the backend 'npm run dev' is running on port 3000!
                            </span>
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Specialized view for initial card reveal "phase" overlay
    if (showCard && gameState?.state === 'playing') {
        return (
            <div className="relative h-screen w-screen bg-background overflow-hidden">
                {/* Render Gameplay underneath so it's ready */}
                <div className="absolute inset-0 opacity-20 pointer-events-none filter blur-sm">
                    <Gameplay />
                </div>

                {/* Overlay Card Reveal */}
                <div className="absolute inset-0 z-50">
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={() => setShowCard(false)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur transition-all"
                        >
                            Skip / I'm Ready
                        </button>
                    </div>
                    <CardReveal />
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {!gameState || gameState.state === 'lobby' ? (
                <motion.div key="lobby" exit={{ opacity: 0 }} className="h-full">
                    <Lobby />
                </motion.div>
            ) : gameState.state === 'playing' ? (
                <motion.div key="gameplay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <Gameplay />
                </motion.div>
            ) : gameState.state === 'voting' ? (
                <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <Voting />
                </motion.div>
            ) : gameState.state === 'game_over' ? (
                <motion.div key="resolution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                    <Resolution />
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

export default App;

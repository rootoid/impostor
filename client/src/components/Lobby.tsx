import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Users, Play, Copy } from 'lucide-react';

const Lobby: React.FC = () => {
    const { gameState, createGame, joinGame, startGame, socket } = useGame();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [isJoinMode, setIsJoinMode] = useState(false);

    if (gameState) {
        const isHost = gameState.players.find(p => p.id === socket?.id)?.isHost;

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-text">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-surface p-8 rounded-2xl shadow-xl w-full max-w-md border border-primary/20"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                            Lobby
                        </h2>
                        <div className="flex items-center justify-center space-x-2 bg-background/50 p-2 rounded-lg cursor-pointer hover:bg-background/80 transition-colors"
                            onClick={() => navigator.clipboard.writeText(gameState.roomCode)}>
                            <span className="text-xl font-mono tracking-widest">{gameState.roomCode}</span>
                            <Copy size={16} className="text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-gray-400 text-sm uppercase tracking-wider">
                            <span>Players ({gameState.players.length})</span>
                            <Users size={16} />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {gameState.players.map((p) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex flex-col items-center space-y-2"
                                >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary bg-background">
                                        <img src={p.avatar} alt={p.name} className="w-full h-full" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">{p.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {isHost ? (
                        <button
                            onClick={startGame}
                            disabled={gameState.players.length < 3}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all
                ${gameState.players.length < 3
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-[1.02]'}`}
                        >
                            <Play size={20} />
                            <span>Start Game</span>
                        </button>
                    ) : (
                        <div className="text-center text-gray-400 animate-pulse">
                            Waiting for host to start...
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-text">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md space-y-6"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                        Impostor
                    </h1>
                    <p className="text-gray-400">Find the spy among us.</p>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-xl border border-white/5 space-y-6">
                    <div className="flex bg-background rounded-lg p-1">
                        <button
                            onClick={() => setIsJoinMode(false)}
                            className={`flex-1 py-2 rounded-md transition-all ${!isJoinMode ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Create
                        </button>
                        <button
                            onClick={() => setIsJoinMode(true)}
                            className={`flex-1 py-2 rounded-md transition-all ${isJoinMode ? 'bg-secondary text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Join
                        </button>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-background border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                        />

                        {isJoinMode && (
                            <input
                                type="text"
                                placeholder="Room Code (4 letters)"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={4}
                                className="w-full bg-background border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors font-mono tracking-widest text-center uppercase"
                            />
                        )}

                        <button
                            onClick={() => isJoinMode ? joinGame(code, name) : createGame(name)}
                            disabled={!name || (isJoinMode && code.length !== 4)}
                            className="w-full bg-white text-background py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isJoinMode ? 'Join Lobby' : 'Create Lobby'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;

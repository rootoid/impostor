import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define mirroring types from server for type safety
export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    avatar?: string;
    role?: 'innocent' | 'impostor';
    word?: string;
    isDead: boolean;
    vote?: string;
}

export interface GameSession {
    roomCode: string;
    state: 'lobby' | 'playing' | 'voting' | 'resolution' | 'game_over';
    players: Player[];
    currentRound: {
        category: string;
        roundNumber: number;
        speakerOrder: string[];
        currentSpeakerIndex: number;
    };
    winner?: 'innocents' | 'impostor';
}

interface GameContextType {
    socket: Socket | null;
    gameState: GameSession | null;
    isConnected: boolean;
    connectionError: string | null;
    createGame: (name: string) => void;
    joinGame: (code: string, name: string) => void;
    startGame: () => void;
    endTurn: () => void;
    votePlayer: (targetId: string | 'skip') => void;
    playAgain: () => void; // TODO
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameSession | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        // Connect to backend - use env var in production, dynamic host in dev
        const serverUrl = import.meta.env.VITE_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:3000`;

        console.log('Attempting connection to:', serverUrl);

        const s = io(serverUrl, {
            transports: ['polling', 'websocket'], // Force polling first
            reconnectionAttempts: 10,
        });
        setSocket(s);

        s.on('connect', () => {
            console.log('Socket connected:', s.id);
            setIsConnected(true);
            setConnectionError(null);
        });

        s.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        s.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setConnectionError(err.message);
        });

        s.on('game_updated', (session: GameSession) => {
            setGameState(session);
        });

        return () => {
            s.disconnect();
        };
    }, []);

    const createGame = (name: string) => {
        socket?.emit('create_game', { playerName: name });
    };

    const joinGame = (code: string, name: string) => {
        socket?.emit('join_game', { roomCode: code, playerName: name });
    };

    const startGame = () => {
        if (gameState) {
            socket?.emit('start_game', { roomCode: gameState.roomCode });
        }
    };

    const endTurn = () => {
        if (gameState) {
            socket?.emit('end_turn', { roomCode: gameState.roomCode });
        }
    };

    const votePlayer = (targetId: string | 'skip') => {
        if (gameState) {
            socket?.emit('vote', { roomCode: gameState.roomCode, targetId });
        }
    };

    const playAgain = () => {
        if (gameState) {
            socket?.emit('play_again', { roomCode: gameState.roomCode });
        }
    };

    return (
        <GameContext.Provider value={{
            socket,
            gameState,
            isConnected,
            connectionError,
            createGame,
            joinGame,
            startGame,
            endTurn,
            votePlayer,
            playAgain
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
};

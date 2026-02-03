export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    avatar?: string;
    role?: 'innocent' | 'impostor';
    word?: string; // The word they see (Secret Word or Impostor Hint)
    vote?: string; // ID of player they voted for
    score: number;
    isDead: boolean;
}

export interface GameSession {
    roomCode: string;
    state: 'lobby' | 'playing' | 'voting' | 'resolution' | 'game_over';
    players: Player[];
    settings: {
        roundTime: number;
        impostorCount: number;
    };
    currentRound: {
        category: string;
        secretWord: string;
        impostorWord: string;
        speakerOrder: string[];
        currentSpeakerIndex: number;
        roundNumber: number;
        totalRounds: number;
        votes: Record<string, number>;
    };
    winner?: 'innocents' | 'impostor';
}

export interface WordPair {
    secret: string;
    impostor: string; // Match actual JSON
}

export interface Category {
    name: string; // Match actual JSON
    words: WordPair[];
}

export interface WordData {
    categories: Category[]; // Match actual JSON
}

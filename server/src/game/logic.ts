import { GameSession, Player, WordData } from '../types';
import fs from 'fs';
import path from 'path';

// --- Global State ---
// In a production app, use Redis. For this MVP, in-memory is fine.
const sessions: Record<string, GameSession> = {};
let wordData: WordData = { categories: [] };
try {
    const rawData = fs.readFileSync(path.join(__dirname, '../data/words.json'), 'utf-8');
    wordData = JSON.parse(rawData);
    console.log(`Loaded ${wordData.categories.length} categories from words.json`);
} catch (err) {
    console.error("FAILED TO LOAD WORDS.JSON:", err);
}

// --- Helpers ---
const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sessions[code] ? generateRoomCode() : code;
};

// --- Game Logic Managers ---

export const createSession = (hostName: string, hostId: string): GameSession => {
    const roomCode = generateRoomCode();
    const host: Player = {
        id: hostId,
        name: hostName,
        isHost: true,
        score: 0,
        isDead: false,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${hostName}`,
    };

    const session: GameSession = {
        roomCode,
        state: 'lobby',
        players: [host],
        settings: {
            roundTime: 60,
            impostorCount: 1,
        },
        currentRound: {
            category: '',
            secretWord: '',
            impostorWord: '',
            speakerOrder: [],
            currentSpeakerIndex: 0,
            roundNumber: 0,
            totalRounds: 3,
            votes: {},
        },
    };

    sessions[roomCode] = session;
    return session;
};

export const joinSession = (roomCode: string, playerName: string, playerId: string): GameSession | null => {
    const session = sessions[roomCode];
    if (!session) return null;
    if (session.state !== 'lobby') return null;

    const safeName = session.players.some(p => p.name === playerName)
        ? `${playerName} ${Math.floor(Math.random() * 100)}`
        : playerName;

    const newPlayer: Player = {
        id: playerId,
        name: safeName,
        isHost: false,
        score: 0,
        isDead: false,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${safeName}`,
    };

    session.players.push(newPlayer);
    return session;
};

export const startGame = (roomCode: string): GameSession | null => {
    const session = sessions[roomCode];
    if (!session || session.players.length < 3) return null;

    // 1. Pick Category & Word Pair
    const randomCat = wordData.categories[Math.floor(Math.random() * wordData.categories.length)];
    const randomPair = randomCat.words[Math.floor(Math.random() * randomCat.words.length)];

    session.currentRound.category = randomCat.name;
    session.currentRound.secretWord = randomPair.secret;
    session.currentRound.impostorWord = randomPair.impostor;

    // 2. Assign Roles
    const players = [...session.players];
    players.forEach(p => {
        p.role = 'innocent';
        p.word = session.currentRound.secretWord;
        p.isDead = false;
        p.vote = undefined;
    });

    const impostorIndex = Math.floor(Math.random() * players.length);
    players[impostorIndex].role = 'impostor';
    players[impostorIndex].word = session.currentRound.impostorWord;

    // 3. Set Turn Order
    const shuffledIds = players.map(p => p.id).sort(() => Math.random() - 0.5);

    session.currentRound.speakerOrder = shuffledIds;
    session.currentRound.currentSpeakerIndex = 0;
    session.currentRound.roundNumber = 1;

    session.state = 'playing';
    return session;
};

export const handleVote = (roomCode: string, voterId: string, targetId: string | 'skip'): GameSession | null => {
    const session = sessions[roomCode];
    if (!session || session.state !== 'voting') return null;

    const player = session.players.find(p => p.id === voterId);
    if (!player || player.isDead) return null;

    player.vote = targetId;

    const livingPlayers = session.players.filter(p => !p.isDead);
    const votesCast = livingPlayers.filter(p => p.vote !== undefined).length;

    if (votesCast === livingPlayers.length) {
        return resolveVoting(session);
    }

    return session;
};

const resolveVoting = (session: GameSession): GameSession => {
    const voteCounts: Record<string, number> = {};
    session.players.forEach(p => {
        if (p.vote && p.vote !== 'skip') {
            voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1;
        }
    });

    let maxVotes = 0;
    let kickedPlayerId: string | null = null;
    let isTie = false;

    Object.entries(voteCounts).forEach(([pid, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            kickedPlayerId = pid;
            isTie = false;
        } else if (count === maxVotes) {
            isTie = true;
        }
    });

    if (kickedPlayerId && !isTie) {
        const kickedPlayer = session.players.find(p => p.id === kickedPlayerId);
        if (kickedPlayer) {
            kickedPlayer.isDead = true;

            if (kickedPlayer.role === 'impostor') {
                session.winner = 'innocents';
                session.state = 'game_over';
                return session;
            }
        }
    }

    const livingImpostors = session.players.filter(p => !p.isDead && p.role === 'impostor').length;
    const livingInnocents = session.players.filter(p => !p.isDead && p.role === 'innocent').length;

    if (livingImpostors >= livingInnocents) {
        session.winner = 'impostor';
        session.state = 'game_over';
    } else {
        session.currentRound.speakerOrder = session.players.filter(p => !p.isDead).map(p => p.id).sort(() => Math.random() - 0.5);
        session.currentRound.currentSpeakerIndex = 0;
        session.currentRound.roundNumber += 1;
        session.players.forEach(p => p.vote = undefined);
        session.state = 'playing';
    }

    return session;
};

export const nextTurn = (roomCode: string): GameSession | null => {
    const session = sessions[roomCode];
    if (!session) return null;

    session.currentRound.currentSpeakerIndex += 1;

    if (session.currentRound.currentSpeakerIndex >= session.currentRound.speakerOrder.length) {
        session.state = 'voting';
    }

    return session;
};

export const getSession = (roomCode: string) => sessions[roomCode];
export const removePlayer = (socketId: string) => {
    for (const code in sessions) {
        const s = sessions[code];
        const idx = s.players.findIndex(p => p.id === socketId);
        if (idx !== -1) {
            s.players.splice(idx, 1);
            if (s.players.length === 0) {
                delete sessions[code];
            }
            return code;
        }
    }
    return null;
}

export const resetToLobby = (roomCode: string): GameSession | null => {
    const session = sessions[roomCode];
    if (!session) return null;

    // Reset Session State
    session.state = 'lobby';
    session.winner = undefined;

    // Clear Round Data
    session.currentRound = {
        category: '',
        secretWord: '',
        impostorWord: '',
        speakerOrder: [],
        currentSpeakerIndex: 0,
        roundNumber: 0,
        totalRounds: 3,
        votes: {},
    };

    // Reset Players (keep score? maybe reset score if it's a new game)
    session.players.forEach(p => {
        p.role = undefined;
        p.word = undefined;
        p.vote = undefined;
        p.isDead = false;
        // p.score = 0; // Optional: Reset score
    });

    return session;
};

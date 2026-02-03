import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
    createSession,
    joinSession,
    startGame,
    handleVote,
    nextTurn,
    getSession,
    removePlayer,
    resetToLobby
} from './game/logic';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('Impostor Server is Running!');
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Try explicit origin
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('create_game', ({ playerName }) => {
        const session = createSession(playerName, socket.id);
        socket.join(session.roomCode);
        socket.emit('game_updated', session);
    });

    socket.on('join_game', ({ roomCode, playerName }) => {
        const session = joinSession(roomCode.toUpperCase(), playerName, socket.id);
        if (session) {
            socket.join(session.roomCode);
            io.to(session.roomCode).emit('game_updated', session);
        } else {
            socket.emit('error', { message: 'Room not found or game already started' });
        }
    });

    socket.on('start_game', ({ roomCode }) => {
        const session = startGame(roomCode);
        if (session) {
            io.to(roomCode).emit('game_updated', session);
        }
    });

    socket.on('end_turn', ({ roomCode }) => {
        // Verify it is this user's turn? (Ideally yes, skipping strict check for speed)
        const session = nextTurn(roomCode);
        if (session) {
            io.to(roomCode).emit('game_updated', session);
        }
    });

    socket.on('vote', ({ roomCode, targetId }) => {
        const session = handleVote(roomCode, socket.id, targetId);
        if (session) {
            io.to(roomCode).emit('game_updated', session);
        }
    });

    socket.on('play_again', ({ roomCode }) => {
        const session = resetToLobby(roomCode);
        if (session) {
            io.to(roomCode).emit('game_updated', session);
        }
    });

    socket.on('disconnect', () => {
        const roomCode = removePlayer(socket.id);
        if (roomCode) {
            const session = getSession(roomCode);
            if (session) {
                io.to(roomCode).emit('game_updated', session);
            }
        }
        console.log('Player disconnected:', socket.id);
    });
});

const PORT = Number(process.env.PORT) || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running - listening on port ${PORT} at 0.0.0.0`);
    console.log(`Socket.io ready for connections...`);
});

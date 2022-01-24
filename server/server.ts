import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
// import https from 'https';
import { Server, Socket } from 'socket.io';
// import fs from 'fs';
// import path from 'path';
import { Message, Chat } from '../src/interfaces';
const app = express();
const httpServer = http.createServer(app);
// const options = {
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// };
// const httpsServer = https.createServer(options, app);
const io = new Server(httpServer);
const { env } = process;
const port: number = Number(env.PORT) || 8000;

app.use('/', express.static('public'));

io.on('connection', (socket) => {
    console.log('a user has been connected')
    io.emit('connection', {
        socketId: socket.id
    });
    socket.on('text message', ({ message, chat }: { message: string, chat: Chat }) => {
        io.emit('text message', {
            message,
            chat
        });
    });
    socket.on('room creation', (chat: Chat) => {
        io.emit('room creation', chat);
    });
    socket.on('last seen update', ({ name, update }: { name: string; update: boolean; }) => {
        io.emit('last seen update', {
            name,
            update
        });
    });
});

io.on('disconnect', () => {
    console.log('a user has been disconnected')
    io.emit('connection', {
        socketId: null
    });
});

httpServer.listen(port, () => console.log(`Server has been starting with port ${port}`));

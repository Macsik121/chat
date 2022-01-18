import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
// import https from 'https';
import { Server } from 'socket.io';
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
    socket.on('text message', (message: Message, chatID: number) => {
        io.emit('text message', {
            message,
            chatID
        });
    });
    socket.on('room creation', (chat: Chat) => {
        io.emit('room creation', chat);
    });
});

httpServer.listen(port, () => console.log(`Server has been starting with port ${port}`));

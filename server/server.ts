import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import https from 'https';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
// import render from './render';
import { Message } from '../src/interfaces';
const app = express();
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key: fs.readFileSync(path.resolve(__dirname, '../key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../cert.pem'))
}, app);
const io = new Server(httpsServer);
const { env } = process;
const port: number | string = env.PORT || 8000;

// app.use('/', express.static(path.resolve(__dirname, './public')));
app.use('/', express.static('public'));
// app.get('*', render);

io.on('connection', (socket) => {
    socket.on('text message', (message: Message, chatID: number) => {
        io.emit('text message', {
            message,
            chatID
        });
    });
});

httpsServer.listen(port, () => console.log(`Server has been starting with port ${port}`));

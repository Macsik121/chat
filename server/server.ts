import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
// import '@babel/polyfill';
// import render from './render';
import { Message } from '../src/interfaces';
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT;

// app.use('/', express.static(path.resolve(__dirname, './public')));
app.use('/', express.static('public'));
// app.get('*', render);

io.on('connection', (socket) => {
    socket.on('text message', async (message: Message, chatID: number) => {
        io.emit('text message', {
            message,
            chatID
        });
    });
});

server.listen(port, () => console.log(`Server has been starting with port ${port}`));

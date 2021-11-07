import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import globals from '../src/globals';
// import '@babel/polyfill';
// import render from './render';
import { Message } from '../src/interfaces';
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const { env } = process;
const port = env.PORT;
const mode = env.mode;
globals.__API_ENDPOINT__ = (
    mode == 'development'
        ? env.apiDevEndpoint || 'http://localhost:3000/graphql'
        : env.apiProdEndpoint || 'https://macsik121s-first-chat-api.herokuapp.com/graphql'
);

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

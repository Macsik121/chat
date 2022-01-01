import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
// import http from 'http';
import https from 'https';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
// import cors from 'cors';
// import render from './render';
import { Message } from '../src/interfaces';
const app = express();
// const httpServer = http.createServer(app);
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};
const httpsServer = https.createServer(options, app);
const io = new Server(httpsServer);
const { env } = process;
const port: number = Number(env.PORT) || 8000;

// app.use(cors());
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

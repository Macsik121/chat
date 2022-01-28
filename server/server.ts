import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
// import https from 'https';
import { Server } from 'socket.io';
// import fs from 'fs';
// import path from 'path';
import { Chat, User } from '../src/interfaces';
import updateLastSeen from '../src/fetchData/updateLastSeen';
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
interface ServerUser {
    id: string;
    userId: number;
    name: string;
}

interface LastSeenUpdate {
    name: string,
    online: boolean,
    id: number
}

const connectedUsers: Array<ServerUser> = [];

async function updateLastSeenCompletely(io: any, {
    name,
    online,
    id
}: LastSeenUpdate) {
    io.emit('last seen update', {
        name,
        online
    });
    await updateLastSeen(id, online);
}

app.use('/', express.static('public'));

io.on('connection', (socket) => {
    io.emit('connection', {
        socketId: socket.id
    });
    socket.on('user connection', async ({ name, id }: { name: string, id: number }) => {
        console.log('a user has been connected');
        const cond = !connectedUsers.some(user => user.name == name);
        const user: ServerUser = {
            name,
            userId: id,
            id: socket.id
        };
        if (cond) {
            connectedUsers.push(user);
            await updateLastSeenCompletely(io, {
                name: user.name,
                online: true,
                id: user.userId
            });
            // io.emit('last seen update', {
            //     name: user.name,
            //     online: true
            // });
            // await updateLastSeen(user.userId, true);
        }
        console.log('connected users:', connectedUsers);
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
    socket.on('last seen update', async ({
        name,
        online,
        id
    }: LastSeenUpdate) => {
        if (!online)
            socket.emit('disconnect');
        else
            socket.emit('user connection', {
                name,
                id
            });
    });
    socket.on('disconnect', async () => {
        console.log('a user has been disconnected');
        let connectedUser: ServerUser = {
            id: '',
            name: '',
            userId: 0
        };
        connectedUsers.find((user, i) => {
            connectedUser = user;
            if (user.id == socket.id)
                connectedUsers.splice(i, 1);
            return connectedUser.id == socket.id;
        });
        if (connectedUser.userId !== 0 && connectedUser.name !== '') {
            await updateLastSeenCompletely(io, {
                name: connectedUser.name,
                online: false,
                id: connectedUser.userId
            });
            // io.emit('last seen update', {
            //     name: connectedUser.name,
            //     online: false
            // });
            // await updateLastSeen(connectedUser.userId, false);
        }
    });
});

httpServer.listen(port, () => console.log(`Server has been starting with port ${port}`));

import socketClient from 'socket.io-client';
import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import Chat from './Chat';
import Auth from './Auth';
import globals from './globals';

const uiEndpoint = globals.__UI_SERVER_ENDPOINT__;

const socket = socketClient(uiEndpoint);

const Routing: FC = () => {
    return (
        <Switch>
            <Route path="/auth" render={() => <Auth socket={socket} />} />
            <Route path="/" render={() => <Chat socket={socket} />} />
        </Switch>
    )
}

export default Routing;

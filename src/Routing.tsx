import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import Chat from './Chat';
import Auth from './Auth';

const Routing: FC = () => {
    return (
        <Switch>
            <Route path="/auth" render={() => <Auth />} />
            <Route path="/" render={() => <Chat />} />
        </Switch>
    )
}

export default Routing;

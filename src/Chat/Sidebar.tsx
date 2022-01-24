import React, { FC, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { withRouter } from 'react-router';
import {
    Menu,
    ArrowBack,
    Send
} from '@material-ui/icons';
import { User, VoidFunction } from '../interfaces';

const SidebarChats: FC<any> = (props) => {
    const [opened, setOpened] = useState(false);

    let user: User = {
        name: '',
        email: '',
        password: '',
        chats: [],
        id: 0,
        lastSeen: new Date(),
        online: false
    };
    if (localStorage.getItem('token')) {
        user = jwtDecode(localStorage.getItem('token') || '');
    }
    const logout: VoidFunction = () => {
        localStorage.removeItem('token');
        props.history.push('/auth');
    }

    return (
        <div className="sidebar-wrap">
            <ArrowBack
                className="menu-icon"
                style={{
                    transform: opened ? 'rotate(0)' : 'rotate(180deg)',
                    opacity: opened ? 1 : 0
                }}
                onClick={() => setOpened(!opened)}
            />
            <Menu
                className="menu-icon"
                style={{
                    transform: opened ? 'rotate(0)' : 'rotate(180deg)',
                    opacity: opened ? 0 : 1
                }}
                onClick={() => setOpened(!opened)}
            />
            <div
                className="sidebar"
                style={{
                    transform: opened ? 'translateX(0)' : 'translateX(-350px)'
                }}
            >
                <h1>Telegram Copy</h1>
                <div className="user-info">
                    <div
                        className="avatar"
                        style={{
                            backgroundColor: '#1E75FF'
                        }}
                    >
                        {user.name.substr(0, 2)}
                    </div>
                    <div className="info-labels">
                        <label className="name">{user.name}</label>
                        <label className="e-mail">{user.email}</label>
                    </div>
                </div>
                <div
                    className="logout"
                    onClick={logout}
                >
                    Logout
                </div>
            </div>
        </div>
    )
}

export default withRouter(SidebarChats);

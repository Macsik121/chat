import React, { FC } from 'react';
import jwtDecode from 'jwt-decode';
import { withRouter } from 'react-router';
import { User, VoidFunction } from '../interfaces';

const SidebarChats: FC<any> = (props) => {
    let user: User = {
        name: '',
        email: '',
        password: '',
        chats: [],
        id: 0
    };
    if (localStorage.getItem('token')) {
        user = jwtDecode(localStorage.getItem('token') || '');
    }
    const logout: VoidFunction = () => {
        localStorage.removeItem('token');
        props.history.push('/auth');
    }

    return (
        <div
            className="sidebar"
            style={{
                transform: props.open ? 'translateX(0)' : 'translateX(-350px)'
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
    )
}

export default withRouter(SidebarChats);

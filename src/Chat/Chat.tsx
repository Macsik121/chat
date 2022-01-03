import React, { FC } from 'react';
import { VoidFunction, Chat } from '../interfaces';

interface ChatProps {
    keyProp: any;
    clickHandler: VoidFunction;
    chat: Chat
}

const UserChat: FC<ChatProps> = (props) => {
    const {
        keyProp,
        clickHandler,
        chat
    } = props;
    console.log(keyProp);
    return (
        <div
            className="chat"
            key={keyProp}
            onClick={clickHandler}
        >
            <div className="chat-info">
                <div className="chat-title">{chat.title}</div>
            </div>
        </div>
    )
}

export default UserChat;

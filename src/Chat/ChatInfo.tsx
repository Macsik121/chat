import React, { FC } from 'react';

const ChatInfo: FC<{
    name: string;
}> = ({
    name
}) => {
    return (
        <div
            className={`${name ? 'active ' : ''}chat-info`}
        >
            <div className="title">{name}</div>
        </div>
    )
}

export default ChatInfo;

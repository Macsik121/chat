import { ArrowBack } from '@material-ui/icons';
import React, { FC } from 'react';

const ChatInfo: FC<{
    name: string;
    close: () => void;
}> = ({
    name,
    close
}) => {
    return (
        <div
            className={`${name ? 'active ' : ''}chat-info`}
        >
            {window.screen.width <= 700 &&
                <ArrowBack className="arrow-back" onClick={close} />
            }
            <div className="title">{name}</div>
        </div>
    )
}

export default ChatInfo;

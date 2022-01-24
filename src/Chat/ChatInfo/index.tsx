import { ArrowBack } from '@material-ui/icons';
import React, { FC } from 'react';
import LastSeen from './LastSeen';
import { User } from '../../interfaces';

const ChatInfo: FC<{
    user: User;
    close: () => void;
}> = ({
    user,
    close
}) => {
    return (
        <div
            className={`${user && user.name ? 'active ' : ''}chat-info`}
            id="chatInfo"
        >
            {window.screen.width <= 700 &&
                <ArrowBack className="arrow-back" onClick={close} />
            }
            <div className="chat-info-wrap">
                <div className="title">{user.name}</div>
                {user.lastSeen &&
                    <LastSeen
                        lastSeen={user.lastSeen}
                        online={user.online}
                    />
                }
            </div>
        </div>
    )
}

export default ChatInfo;

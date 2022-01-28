import React, { FC } from 'react';

const LastSeen: FC<{
    lastSeen: Date;
    online: boolean;
}> = ({
    lastSeen,
    online
}) => {
    return (
        <div className="last-seen">
            {online
                ? 'Online'
                : 'Last seen ' + new Date(lastSeen).toDateString()
            }
        </div>
    )
}

export default LastSeen;

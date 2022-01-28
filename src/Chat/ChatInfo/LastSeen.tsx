import React, { FC } from 'react';

const LastSeen: FC<{
    lastSeen: Date;
    online: boolean | undefined;
}> = ({
    lastSeen,
    online
}) => {
    return (
        <div className="last-seen">
            {online !== undefined  && online
                ? 'Online'
                : 'Last seen ' + new Date(lastSeen).toDateString()
            }
        </div>
    )
}

export default LastSeen;

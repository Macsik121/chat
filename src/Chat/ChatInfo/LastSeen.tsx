import React, {
    FC,
    useEffect,
    useState
} from 'react';

const LastSeen: FC<{
    lastSeen: Date;
    online: boolean | undefined;
}> = ({
    lastSeen,
    online
}) => {
    const [intervalSet, setIntervalSet] = useState(false);
    const [intervalID, setIntervalID] = useState<any>(0);
    const [text, setText] = useState('1 second');
    const [previousLastSeen, setPreviousLastSeen] = useState(new Date());
    useEffect(() => {
        return () => {
            setIntervalID((intervalID: any) => {
                clearInterval(intervalID);
                return intervalID;
            });
        }
    }, []);
    console.log(lastSeen);
    useEffect(() => {
        setIntervalID(false);
    }, [lastSeen]);

    function divideLastSeen(time: number) {
        return Math.floor((
            new Date(
                // '01/30/2022, 2:03:08 PM'
            ).getTime() -
            new Date(lastSeen).getTime()
        ) / time);
    }

    const timeSecs = 1000;
    const timeMins = timeSecs * 60;
    const timeHrs = timeMins * 60;
    const timeDays = timeHrs * 24;
    const timeMonth = timeDays * 30;
    const timeYrs = timeMonth * 12;

    let seconds = divideLastSeen(timeSecs);
    let minutes = divideLastSeen(timeMins);
    let hours = divideLastSeen(timeHrs);
    let days = divideLastSeen(timeDays);
    let month = divideLastSeen(timeMonth);
    let years = divideLastSeen(timeYrs);

    function setLastSeenInterval(duration: number) {
        clearInterval(intervalID);
        const intervalId = setInterval(() => {
            if (seconds < 60) {
                seconds++;
                if (seconds >= 60)
                    setIntervalSet(false);
                else
                    setText(seconds + ' seconds');
            } else if (minutes < 60) {
                minutes++;
                if (minutes >= 60)
                    setIntervalSet(false);
                else
                    setText(minutes + ' minutes');
            } else if (hours < 24) {
                hours++;
                if (hours >= 24)
                    setIntervalSet(false);
                else
                    setText(hours + ' hours');
            } else if (days < 30) {
                days++;
                if (days >= 30)
                    setIntervalSet(false)
                else
                    setText(days + ' days');
            } else if (month < 12) {
                month++;
                if (month >= 12)
                    setIntervalSet(false);
                else
                    setText(month + ' month')
            } else if (month >= 12) {
                years++;
                setText(years + ' years');
            }
        }, duration);
        setIntervalID(intervalId);
        setIntervalSet(true);
    }

    if (!intervalSet) {
        console.log('last seen interval is going to be set again:');
        if (seconds + 1 < 60) {
            setText(`${seconds} ${seconds == 1 ? 'second' : 'seconds'}`);
            setLastSeenInterval(timeSecs);
        } else if (minutes + 1 < 60) {
            setText(`${minutes} ${minutes == 1 ? 'minute' : 'minutes'}`);
            setLastSeenInterval(timeMins);
        } else if (hours < 24) {
            setText(`${hours} ${hours == 1 ? 'hour' : 'hours'}`);
            setLastSeenInterval(timeHrs);
        } else if (days < 30) {
            setText(`${days} ${days == 1 ? 'day' : 'days'}`);
            setLastSeenInterval(timeDays);
        } else if (month < 12) {
            setText(`${month} ${month == 1 ? 'month' : 'months'}`);
            setLastSeenInterval(timeMonth);
        } else if (month >= 12) {
            setText(`${years} ${years == 1 ? 'year' : 'years'}`);
            setLastSeenInterval(timeYrs);
        }
    }

    return (
        <div className="last-seen">
            {online !== undefined  && online
                ? 'Online'
                : 'Last seen ' + text + ' ago'
            }
        </div>
    )
}

export default LastSeen;

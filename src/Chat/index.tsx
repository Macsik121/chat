import React, {
    FC,
    useEffect,
    useReducer,
    useState
} from 'react';
import { withRouter } from 'react-router-dom';
import socketClient from 'socket.io-client';
import { TextField, CircularProgress } from '@material-ui/core';
import jwtDecode from 'jwt-decode';
import fetchData from '../fetchData';
import SidebarChats from './Sidebar';
import Search from './Search';
import ChatInfo from './ChatInfo';
import UserChat from './Chat';
import { User, Chat, Message, Competitor } from '../interfaces';
import globals from '../globals';

const uiEndpoint = globals.__UI_SERVER_ENDPOINT__;

const socket = socketClient(uiEndpoint);

interface ChatState {
    requestMaking: boolean
    isMounted: boolean
    socket: any
    userChats: Array<Chat>
    selectedChat: number
    searchUsers: Array<User>
    socketConfigured: boolean
}

type Reducer = (state: any, action: any) => any;

const reducer: Reducer = function(state: any, action) {
    if (state[action.type] == undefined) {
        throw Error('You called dispatch. You wrote a wrong action.type. Check if dispatch has state variable you passed, or you just made a typo');
    }
    const newState = {
        ...state,
        [action.type]: action.payload
    };
    return newState;
}

const initState = {
    searchUsers: [],
    requestMaking: false,
    isMounted: false,
    userChats: [],
    selectedChat: 0,
    socketConfigured: false,
    choosenUser: {},
    chatBody: {},
    chatBodySet: false
};

const Chat: FC<any> = (props) => {
    const [state, dispatch] = useReducer(reducer, initState);
    const [userChats, setUserChats] = useState<Array<Chat>>([]);
    let user: User = {
        name: '',
        email: '',
        id: 0,
        chats: []
    };
    function closeChat() {
        if (window.screen.width > 700) {
            dispatch({ type: 'selectedChat', payload: 0 });
            dispatch({ type: 'choosenUser', payload: {} });
        }
        const main = document.getElementById('main') as HTMLDivElement;
        if (main) main.classList.remove('active');
    }
    window.onkeydown = function(e) {
        if (e.keyCode == 27) {
            closeChat();
        }
    }
    useEffect(() => {
        (async function() {
            if (!localStorage.getItem('token')) {
                props.history.push('/auth');
                return;
            }
            configureSocket();
            user = jwtDecode(localStorage.getItem('token') || '');
            const { chats } = await fetchData(`
                query chats($id: Int!) {
                    chats(id: $id) {
                        id
                        title
                        competitors {
                            id
                            name
                        }
                        messages {
                            text
                            owner
                            date
                        }
                    }
                }
            `, {
                id: user.id
            })
            dispatch({ type: 'isMounted', payload: true });
            setUserChats(chats);
            // dispatch({ type: 'userChats', payload: chats });
        })();
        return () => {
            socket.removeAllListeners();
        };
    }, []);
    if (user.id == 0) {
        if (localStorage.getItem('token')) {
            user = jwtDecode(localStorage.getItem('token') || '');
        }
    }
    // useEffect(() => {
    //     if (JSON.stringify(state.userChats) !== JSON.stringify([])) {
    //         configureSocket();
    //         if (!state.socketConfigured) dispatch({ type: 'socketConfigured', payload: true });
    //     }
    // }, [state.userChats]);
    function configureSocket() {
        socket.on('text message',
            ({
                chat,
                message
            }: {
                chat: Chat;
                message: Message
            }) => {
                setUserChats((userChats) => {
                    console.log(chat);
                    const correctUser = chat.competitors.find(competitor => competitor.id == user.id);
                    console.log('userChats before:', userChats);
                    if (correctUser) {
                        userChats.find(userChat => {
                            if (userChat.id == chat.id) {
                                if (!message.date) message.date = new Date();
                                userChat.messages.push(message);
                                return;
                            }
                        });
                        const chatBody = document.getElementById('chat-body-container') as HTMLDivElement;
                        chatBody.scrollIntoView({ block: 'end', behavior: 'smooth' });
                    }
                    console.log(userChats);
                    return [ ...userChats ];
                });
                // const userChatsCopy: Array<Chat> = [...userChats];
                // const certainChat = userChatsCopy.find(chat => chat.id == chatID);
                // if (certainChat) {
                    // dispatch({ type: 'userChats', payload: userChats });
                // }
            }
        );
        socket.on('room creation', (chat: Chat) => {
            console.log(chat);
            const chatExists = userChats.find((userChat: Chat) => userChat.id == chat.id);
            if (
                !chatExists &&
                chat.competitors[0].name == user.name ||
                chat.competitors[1].name == user.name
            ) {
                if (user.id == chat.messages[0].owner) dispatch({ type: 'selectedChat', payload: chat.id });
                // dispatch({ type: 'userChats', payload: userChats });
                setUserChats((userChats) => [ ...userChats, chat ]);
            }
        });
    }
    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        const message = e.target as typeof e.target & { sendMessage: { value: string } };
        if (message.sendMessage.value == '') {
            return;
        }
        const msg: Message = {
            text: message.sendMessage.value,
            owner: user.id,
            date: new Date()
        }
        message.sendMessage.value = '';
        let id = state.selectedChat;
        let msgSent = false;
        if (state.searchUsers.length != 0) {
            if (
                JSON.stringify(state.choosenUser) != '{}' &&
                !state.selectedChat
            ) {
                const competitors = [
                    {
                        id: state.choosenUser.id,
                        name: state.choosenUser.name
                    },
                    {
                        id: user.id,
                        name: user.name
                    }
                ];
                const { chatId } = await fetchData(`
                    query {
                        chatId
                    }
                `);
                id = chatId;
                const newChat: Chat = {
                    id,
                    messages: [ msg ],
                    competitors
                }
                socket.emit('room creation', newChat);
                await fetchData(`
                    mutation createRoom(
                        $competitors: [CompetitorsInput!]!,
                        $message: MessageInput!,
                        $id: Int!
                    ) {
                        createRoom(
                            competitors: $competitors,
                            message: $message,
                            id: $id
                        )
                    }
                `, {
                    competitors,
                    message: msg,
                    id
                });
                msgSent = true;
            }
        }
        if (!msgSent) {
            const chat: any = userChats.find(userChat => userChat.id == id);
            console.log(chat);
            socket.emit('text message', { message: msg, chat });
            const query = `
                mutation saveMessage($message: MessageInput!, $chat: Int!) {
                    saveMessage(message: $message, chat: $chat)
                }
            `;
            const vars = {
                message: msg,
                chat: id
            };
            await fetchData(query, vars);
        }
    }

    async function searchUsers(search: string) {
        const query = `
            query searchUsers($search: String!, $id: Int!) {
                searchUsers(search: $search, id: $id) {
                    id
                    name
                    email
                }
            }
        `;
        const vars = {
            search,
            id: user.id
        }
        let { searchUsers } = await fetchData(query, vars);
        searchUsers.forEach((user: any, i: number) => {
            const certainUser: any = userChats.find((chatUser: Chat) => (
                chatUser.competitors[0].name == user.name ||
                chatUser.competitors[1].name == user.name
            ));
            if (certainUser) {
                user.id = certainUser.id;
                user.chatId = certainUser.id;
            } else
                user.chatId = null;
        });
        dispatch({ type: 'searchUsers', payload: searchUsers });
    }

    function cancelSearching() {
        dispatch({ type: 'searchUsers', payload: [] });
    }

    let messages: Array<JSX.Element> = [ <div></div> ];
    if (state.selectedChat) {
        const certainChat: any = userChats.find((chat: Chat) => chat.id == state.selectedChat);
        if (certainChat && certainChat.messages) {
            messages = certainChat.messages.map((message: Message, i: number) => {
                const key = message.text + message.owner + i + certainChat.id;
                const msgDate = new Date(message.date);
                const minutes = msgDate.getMinutes();
                const hours = msgDate.getHours();
                return (
                    <div
                        className={`${
                            user.id == message.owner
                                ? 'my-msg '
                                : ''
                            }msg`
                        }
                        key={key}
                    >
                        <div className="wrap">
                            <div className="text">
                                {message.text}
                            </div>
                            <div className="date">
                                {
                                    hours < 10
                                        ? '0' + hours
                                        : hours
                                }:{
                                    minutes < 10
                                        ? '0' + minutes
                                        : minutes
                                }
                            </div>
                        </div>
                    </div>
                )
            });
        }
    }

    let chats: Array<JSX.Element> = [
        <div
            key="start-messaging"
            className="start-messaging"
        >
            Start messaging!
        </div>
    ];
    if (
        userChats.length != 0 ||
        state.searchUsers.length != 0
    ) {
        if (state.searchUsers.length == 0 && userChats.length != 0) {
            chats = userChats.map((chat: Chat, i: number) => {
                const key = `${chat.id} ${i} ${chat.messages[0] ? chat.messages[0].text + chat.messages[0].owner : ''}`;
                return (
                    <div
                        className="chat"
                        key={key}
                        onClick={() => {
                            dispatch({ type: 'selectedChat', payload: chat.id });
                            dispatch({
                                type: 'choosenUser',
                                payload: {
                                    name: (
                                        chat.title ||
                                        chat.competitors[0].name == user.name
                                            ? chat.competitors[1].name
                                            : chat.competitors[0].name
                                    )
                                }
                            });
                            const main = document.getElementById('main') as HTMLDivElement;
                            if (main) main.classList.add('active');
                            // if (state.chatBody && JSON.stringify(state.chatBody) != '{}')
                            //     state.chatBody.scrollIntoView({ block: 'end', behavior: 'smooth' });
                            // const chatBody = document.getElementById('chat-body-container') as HTMLDivElement;
                            // if (chatBody) chatBody.scrollIntoView({ block: 'end', behavior: 'smooth' });
                        }}
                    >
                        <div className="chat-info">
                            <div className="chat-title">
                                {chat.competitors[0].name == user.name
                                    ? chat.competitors[1].name
                                    : chat.competitors[0].name
                                }
                            </div>
                        </div>
                    </div>
                )
            });
        } else if (state.searchUsers.length != 0) {
            chats = state.searchUsers.map((searchedUser: any, i: number) => {
                const key = `${searchedUser.id} ${i} ${searchedUser.email}`;
                return (
                    <div
                        className="chat"
                        key={key}
                        onClick={() => {
                            const chatExists = userChats.find((chat: Chat) => chat.id == searchedUser.chatId);
                            dispatch({ type: 'selectedChat', payload: chatExists ? searchedUser.chatId : false });
                            dispatch({ type: 'choosenUser', payload: searchedUser });
                            const main = document.getElementById('main') as HTMLDivElement;
                            if (main) main.classList.add('active');
                        }}
                    >
                        <div className="chat-info">
                            <div className="chat-title">{searchedUser.name}</div>
                        </div>
                    </div>
                )
            });
        }
    }

    return (
        <div
            className="chat"
            style={{
                opacity: state.isMounted ? 1 : 0,
                pointerEvents: state.isMounted ? 'all' : 'none'
            }}
        >
            <header className="header">
                <Search
                    searchUsers={searchUsers}
                    cancelSearching={cancelSearching}
                />
                <div className="chats">
                    {chats}
                </div>
            </header>
            <SidebarChats />
            <main id="main" className="main">
                <ChatInfo
                    name={state.choosenUser.name}
                    close={closeChat}
                />
                <div className="chatting">
                    {!(typeof state.selectedChat == 'boolean') && state.selectedChat == 0
                        ? (
                            <div className="select-chat">
                                Choose the chat to send message to someone
                            </div>
                        ) : (
                            <>
                                <div
                                    className="chat-wrap"
                                >
                                    <div id="chat-body" className="chatBody">
                                        {state.requestMaking &&
                                            <CircularProgress className="circular-progress" />
                                        }
                                        <div
                                            className="container"
                                            style={{
                                                opacity: state.requestMaking ? 0 : 1
                                            }}
                                            id="chat-body-container"
                                        >
                                            {messages}
                                        </div>
                                    </div>
                                    <form
                                        onSubmit={sendMessage}
                                        className="send-message-form col s6"
                                    >
                                        <TextField
                                            name="sendMessage"
                                            id="send-message"
                                            type="text"
                                            className="send-message"
                                            label="Send message"
                                            variant="standard"
                                        />
                                    </form>
                                </div>
                            </>
                        )
                    }
                </div>
            </main>
        </div>
    )
}

export default withRouter(Chat);

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

interface ChatState {
    requestMaking: boolean
    isMounted: boolean
    socket: any
    userChats: Array<Chat>
    selectedChat: number
    searchUsers: Array<User>
    socketConfigured: boolean
}

type Reducer = (state: ChatState, action: any) => any;

const reducer: Reducer = function(state: any, action) {
    if (state[action.type] == undefined) {
        throw Error('You have called dispatch. You wrote a wrong action.type. Check if dispatch has state variable you passed, or you just made a typo');
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
    socket: {},
    userChats: [],
    selectedChat: 0,
    socketConfigured: false,
    choosenUser: {}
};

const Chat: FC<any> = (props) => {
    const [state, dispatch] = useReducer(reducer, initState);
    let user: User = {
        name: '',                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
        email: '',
        id: 0,
        chats: []
    };
    let isSnitch = false;
    useEffect(() => {
        (async () => {
            if (!localStorage.getItem('token')) {
                props.history.push('/auth');
                isSnitch = true;
                return;
            }
            configureSocket();
            // const query = `
            //     query generateNewJwt($name: String!) {
            //         generateNewJwt(name: $name)
            //     }
            // `;
            // const oldUser: User = jwtDecode(localStorage.getItem('token') || '');
            // const vars = {
            //     name: oldUser.name
            // };
            // const { generateNewJwt } = await fetchData(query, vars);
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
                        }
                    }
                }
            `, {
                id: user.id
            })
            // localStorage.setItem('token', generateNewJwt);
            dispatch({ type: 'isMounted', payload: true });
            dispatch({ type: 'userChats', payload: chats });
        })()
    }, []);
    if (user.id == 0) {
        if (localStorage.getItem('token')) {
            user = jwtDecode(localStorage.getItem('token') || '');
        }
    }
    useEffect(() => {
        if (JSON.stringify(state.userChats) !== JSON.stringify([]) && !state.socketConfigured) {
            configureSocket();
            dispatch({ type: 'socketConfigured', payload: true });
        }
    }, [state.userChats]);
    function configureSocket() {
        const socket = socketClient(uiEndpoint);
        socket.on('text message', ({ message: { chatID, message } }) => {
	    alert('text .essage is sent');
            const certainChat = state.userChats.find((chat: Chat) => chat.id == chatID);
            if (certainChat) {
                const msg: Message = {
                    text: message.text,
                    owner: message.owner
                };
                const userChats = [...state.userChats];
                certainChat.messages.push(msg);
                dispatch({ type: 'userChats', payload: userChats });
                const chatBody = document.getElementById('chat-body') as HTMLDivElement;
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        });
        dispatch({ type: 'socket', payload: socket });
    }
    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        const message = e.target as typeof e.target & { sendMessage: { value: string } };
        if (message.sendMessage.value == '') {
            return;
        }
        const msg = {
            text: message.sendMessage.value,
            owner: user.id
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
                const newUserChats = state.userChats.slice();
                const newChat: Chat = {
                    id: chatId,
                    messages: [ msg ],
                    competitors
                }
                newUserChats.push(newChat);
                id = chatId;
                dispatch({ type: 'socketConfigured', payload: false });
                dispatch({ type: 'userChats', payload: newUserChats });
                dispatch({ type: 'selectedChat', payload: chatId });
                state.socket.emit('text message', { message: msg, chatID: id });
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
                    id: chatId
                });
                msgSent = true;
            }
        }
        if (!msgSent) {
            state.socket.emit('text message', { message: msg, chatID: id });
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
        searchUsers.map((user: any, i: number) => {
            const certainUser: Chat = state.userChats.find((chatUser: Chat) => (
                chatUser.competitors[0].name == user.name ||
                chatUser.competitors[1].name == user.name
            ));
            if (certainUser) {
                user.id = certainUser.id;
            }
        });
        dispatch({ type: 'searchUsers', payload: searchUsers });
    }

    function cancelSearching() {
        dispatch({ type: 'searchUsers', payload: [] });
    }

    let messages: Array<JSX.Element> = [ <div></div> ];
    if (state.selectedChat) {
        const certainChat: Chat = state.userChats.find((chat: Chat) => chat.id == state.selectedChat);
        if (certainChat && certainChat.messages) {
            messages = certainChat.messages.map((message: Message, i: number) => {
                return (
                    <div
                        className={`${
                            user.id == message.owner
                                ? 'my-msg '
                                : ''
                            }msg`}
                        key={message.text + message.owner + i + certainChat.id}
                    >
                        <span className="wrap">
                            {message.text}
                        </span>
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
        state.userChats.length != 0 ||
        state.searchUsers.length != 0
    ) {
        if (state.searchUsers.length == 0 && state.userChats.length != 0) {
            chats = state.userChats.map((chat: Chat, i: number) => {
                return (
                    // <UserChat
                    //     keyProp={`${chat.id}_${i}_${chat.messages[0].text + chat.messages[0].owner}`}
                    //     clickHandler={() => {
                    //         dispatch({ type: 'selectedChat', payload: chat.id });
                    //         // const chatBody = document.getElementById('chat-body') as HTMLDivElement;
                    //         // chatBody.scroll(0, chatBody.scrollHeight);
                    //     }}
                    //     chat={chat}
                    // />
                    <div
                        className="chat"
                        key={`${chat.id}_${i}_${chat.messages[0] ? chat.messages[0].text + chat.messages[0].owner : chat.messages}`}
                        onClick={() => {
                            dispatch({ type: 'selectedChat', payload: chat.id });
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
            chats = state.searchUsers.map((user: User, i: number) => {
                return (
                    // <UserChat
                    //     keyProp={`${user.id}_${i}`}
                    //     clickHandler={() => {
                        
                    //     }}
                    //     chat={chat}
                    // />
                    <div
                        className="chat"
                        key={`${user.id}_${i}_${user.email}`}
                        onClick={() => {
                            const chatExists = state.userChats.find((chat: Chat) => chat.id == user.id);
                            dispatch({ type: 'selectedChat', payload: chatExists ? user.id : false });
                            dispatch({ type: 'choosenUser', payload: user });
                        }}
                    >
                        <div className="chat-info">
                            <div className="chat-title">{user.name}</div>
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
                pointerEvents: state.isMounted ? 'all' : 'none',
                overflow: state.isMounted ? 'visible' : 'hidden'
            }}
        >
            <header className="header">
                <Search
                    searchUsers={searchUsers}
                    cancelSearching={cancelSearching}
                />
            </header>
            <SidebarChats />
            <main className="main">
                <div className="chatting">
                    <div className="chats">
                        {chats}
                    </div>
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
                                            color="primary"
                                        />
                                    </form>
                                    <div id="chat-body" className="chatBody">
                                        {state.requestMaking &&
                                            <CircularProgress className="circular-progress" />
                                        }
                                        <div
                                            className="container"
                                            style={{
                                                opacity: state.requestMaking ? 0 : 1
                                            }}
                                        >
                                            {messages}
                                        </div>
                                    </div>
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

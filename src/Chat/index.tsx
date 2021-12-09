import React, {
    FC,
    useEffect,
    useReducer
} from 'react';
import { withRouter } from 'react-router-dom';
import socketClient from 'socket.io-client';
import { TextField, CircularProgress } from '@material-ui/core';
import jwtDecode from 'jwt-decode';
import {
    Menu,
    ArrowBack,
    Search,
    Send
} from '@material-ui/icons';
import fetchData from '../fetchData';
import SidebarChats from './Sidebar';
import { User, Chat, Message } from '../interfaces';
import UserChat from './Chat';
import globals from '../globals';

const uiEndpoint = globals.__UI_SERVER_ENDPOINT__;

interface ChatState {
    requestMaking: boolean
    isMounted: boolean
    socket: any
    open: boolean
    userChats: Array<Chat>
    searchFocused: boolean
    selectedChat: number
    searchValue: string
    searchUsers: Array<User>
    socketConfigured: boolean
}

type Reducer = (state: ChatState, action: any) => any;

const reducer: Reducer = function(state: any, action) {
    if (state[action.type] == undefined) {
        throw Error('You have called dispatch. You wrote a wrong action.type. Check if dispatch has state variable you passed, or you just made a typo');
    }
    return {
        ...state,
        [action.type]: action.payload
    }
}

const initState: ChatState = {
    searchUsers: [],
    requestMaking: false,
    isMounted: false,
    socket: {},
    open: false,
    userChats: [],
    searchFocused: false,
    selectedChat: 0,
    searchValue: '',
    socketConfigured: false
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
            // loadMessages();
            configureSocket();
            const query = `
                query generateNewJwt($name: String!) {
                    generateNewJwt(name: $name)
                }
            `;
            const oldUser: User = jwtDecode(localStorage.getItem('token') || '');
            const vars = {
                name: oldUser.name
            };
            const { generateNewJwt } = await fetchData(query, vars);
            user = jwtDecode(generateNewJwt);
            const { chats } = await fetchData(`
                query chats($id: Int!) {
                    chats(id: $id) {
                        id
                        messages {
                            text
                            owner
                        }
                    }
                }
            `, {
                id: user.id
            })
            localStorage.setItem('token', generateNewJwt);
            dispatch({ type: 'isMounted', payload: true });
            dispatch({ type: 'userChats', payload: chats });
        })()
    }, []);
    if (isSnitch) {
        return <div></div>;
    }
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
            console.log(state.userChats);
            if (state.userChats.some((chat: Chat) => chat.id == chatID)) {
                const msg: Message = {
                    text: message.text,
                    owner: message.owner
                };
                const userChats = [...state.userChats];
                for(let i = 0; i < userChats.length; i++) {
                    const currentChat: Chat = userChats[i];
                    if (currentChat.id == chatID) {
                        currentChat.messages.push(msg);
                    }
                }
                dispatch({ type: 'userChats', payload: userChats });
                const chatBody: any = document.getElementById('chat-body');
                if (chatBody) {
                    chatBody.scrollTop = chatBody.scrollHeight;
                }
            }
        });
        dispatch({ type: 'socket', payload: socket });
    }
    // async function loadMessages() {
    //     dispatch({ type: 'requestMaking', payload: true });
    //     const query = `
    //         query {
    //             messages {
    //                 text
    //                 owner
    //             }
    //         }
    //     `;

    //     const res = await fetchData(query);
    //     dispatch({ type: 'chatMessages', payload: res.messages });
    //     dispatch({ type: 'requestMaking', payload: false });
    //     const chatBody: any = document.getElementById('chat-body');
    //     chatBody.scrollTop = chatBody.scrollHeight;
    // }
    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        const message = e.target as typeof e.target & { sendMessage: { value: string } };
        const msg = {
            text: message.sendMessage.value,
            owner: user.id
        }
        // let chatExists = false;
        // for(let i = 0; i < state.userChats.length; i++) {
        //     const currentChat = state.userChats[i];
        //     if (currentChat.id == state.selectedChat) {
        //         chatExists = true;
        //     }
        // }
        // if (!chatExists) {
        //     fetchData(`
        //         mutation createRoom($competitors: [Int!]) {
        //             createRoom(competitors: $competitors) {
        //                 message
        //                 success
        //             }
        //         }
        //     `, {
        //         competitors: [ user.id,  ]
        //     })
        // }
        state.socket.emit('text message', { message: msg, chatID: state.selectedChat });
        message.sendMessage.value = '';
        const query = `
            mutation saveMessage($message: MessageInput!, $chat: Int!) {
                saveMessage(message: $message, chat: $chat)
            }
        `;
        const vars = {
            message: msg,
            chat: state.selectedChat
        };
        await fetchData(query, vars);
    }

    async function searchUsers() {
        const query = `
            query searchUsers($search: String!) {
                searchUsers(search: $search) {
                    name
                    email
                    id
                }
            }
        `;
        const vars = {
            search: state.searchValue
        }
        let { searchUsers } = await fetchData(query, vars);
        const newSearchUsers = [];
        for(let i = 0; i < searchUsers.length; i++) {
            const currentUser: User = searchUsers[i];
            if (!(currentUser.name == user.name)) {
                newSearchUsers.push(currentUser);
            }
        }
        searchUsers = newSearchUsers;
        dispatch({ type: 'searchValue', payload: '' });
        dispatch({ type: 'searchUsers', payload: searchUsers });
    }
    let messages: Array<JSX.Element> = state.userChats.map((chat: Chat) => {
        let renderedMessages: Array<JSX.Element> = [];
        if (chat.id == state.selectedChat) {
            const { messages } = chat;
            if (messages) {
                renderedMessages = messages.map((message: Message, i) => {
                    return (
                        <div
                            className={`${
                                user.id == message.owner
                                    ? 'my-msg '
                                    : ''
                                }msg`}
                            key={message.text + message.owner + i}
                        >
                            <span className="wrap">
                                {message.text}
                            </span>
                        </div>
                    )
                });
                return renderedMessages;
            }
        }
    });

    let chats: Array<JSX.Element> = [
        <div
            key="start-messaging"
            className="start-messaging"
        >
            Start messaging!
        </div>
    ];
    if (state.searchUsers.length != 0) {
        chats = state.searchUsers.map((currentUser: User, i: number) => {
            return (
                <div
                    className="chat"
                    onClick={() => {
                        dispatch({ type: 'selectedChat', payload: currentUser.id });
                        // const arrayExists = state.userChats.some((chat: Chat) => currentUser.id == chat.id);
                        // if (!arrayExists) {
                        //     state.userChats.push({
                        //         id: currentUser.id,
                        //         messages: []
                        //     });
                        // }
                        // dispatch({ type: 'searchUsers', payload: [] });
                        const chatBody = document.getElementById('chat-body') as HTMLDivElement;
                        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
                    }}
                    key={currentUser.id + currentUser.email + i}
                >
                    <div className="chat-info">
                        <div className="chat-title">{currentUser.id}</div>
                    </div>
                </div>
            )
            // currentUser.chats?.map((chat: Chat) => {
            //     if (chat.id == user.id) {
            //         return (
            //             <UserChat
            //                 keyProp={user.name + user.email + i}
            //                 clickHandler={() => {
            //                     dispatch({ type: 'selectedChat', payload: chat.id });
            //                     dispatch({ type: 'searchUsers', payload: [] })
            //                 }}
            //                 chat={chat}
            //             />
            //         )
            //     }
            // });
        });
    } else if (state.userChats.length != 0) {
        chats = state.userChats.map((chat: Chat, i: number) => {
            // if (chat.id == user.name) {
            //     return;
            // }
            return (
                // <UserChat
                //     keyProp={chat.id + i}
                //     clickHandler={() => {
                //         dispatch({ type: 'selectedChat', payload: chat.id })
                //     }}
                //     chat={chat}
                // />
                <div
                    key={chat.id}
                    className="chat"
                    onClick={() => {
                        dispatch({ type: 'selectedChat', payload: chat.id });
                        const chatBody = document.getElementById('chat-body') as HTMLDivElement;
                        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
                    }}
                >
                    {/* <img className="avatar" src={user.avatar} alt={user.title} /> */}
                    <div className="chat-info">
                        <div className="chat-title">{chat.id}</div>
                        {/* <label className="last-message">{chat.messages[0]}</label> */}
                    </div>
                </div>
            )
        });
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
            <Menu
                className="menu-icon"
                style={{
                    transform: state.open ? 'rotate(0)' : 'rotate(180deg)',
                    opacity: state.open ? 0 : 1
                }}
                onClick={() => dispatch({ type: 'open', payload: !state.open })}
            />
            <ArrowBack
                className="menu-icon"
                style={{
                    transform: state.open ? 'rotate(0)' : 'rotate(180deg)',
                    opacity: state.open ? 1 : 0
                }}
                onClick={() => dispatch({ type: 'open', payload: !state.open })}
            />
            <SidebarChats
                open={state.open}
            />
            <div className="search">
                <input
                    type="text"
                    className="search-input"
                    id="searchInput"
                    placeholder="Search people..."
                    onFocus={() => dispatch({ type: 'searchFocused', payload: !state.searchFocused })}
                    onBlur={() => dispatch({ type: 'searchFocused', payload: !state.searchFocused })}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        dispatch({ type: 'searchValue', payload: e.target.value })
                    }}
                    value={state.searchValue}
                />
                <Send
                    className="search-icon"
                    style={{
                        transform: state.searchValue || state.searchFocused ? 'rotate(0)' : 'rotate(-180deg)',
                        opacity: state.searchValue || state.searchFocused ? 1 : 0,
                        pointerEvents: state.searchValue || state.searchFocused ? 'all' : 'none'
                    }}
                    onClick={searchUsers}
                />
                <Search
                    className="search-icon"
                    style={{
                        transform: state.searchValue || state.searchFocused ? 'rotate(180deg)' : 'rotate(0)',
                        opacity: state.searchValue || state.searchFocused ? 0 : 1,
                        pointerEvents: 'none'
                    }}
                    onClick={searchUsers}
                />
            </div>
            <div
                className="chatting"
                onClick={() => {
                    if (state.open == true) dispatch({ type: 'open', payload: false })
                }}
            >
                <div className="chats">
                    {chats}
                </div>
                {state.selectedChat == 0
                    ? (
                        <div className="select-chat">
                            Choose the chat to send message to someone
                        </div>
                    ) : (
                        <>
                            <div
                                className="chat-wrap"
                                style={{
                                    opacity: state.open ? .5 : 1,
                                    cursor: state.open ? 'default' : 'auto'
                                }}
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
        </div>
    )
}

export default withRouter(Chat);

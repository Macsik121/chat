export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    chats?: Array<Chat>
}

export type VoidFunction = () => void

export interface Chat {
    id: number;
    competitors: Array<Number>;
    messages: Array<Message>
};

export interface Message {
    text: string
    owner: number
}

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
    title?: string;
    competitors: Array<Competitor>;
    messages: Array<Message>
};

export interface Competitor {
    id: number;
    name: string;
}

export interface Message {
    text: string
    owner: number
}

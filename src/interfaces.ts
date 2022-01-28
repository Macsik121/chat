export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    chats?: Array<Chat>
    lastSeen: Date;
    online: boolean;
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
    lastSeen?: Date;
    online?: boolean;
}

export interface Message {
    text: string
    owner: number
    date: Date
}

export interface ChoosenUser {
    id: number;
    name: string;
    lastSeen?: Date;
    online?: boolean;
}

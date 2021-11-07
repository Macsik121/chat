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
    title: string;
    avatar?: string;
    messages: Array<Message>
};
export interface Message {
    text: string
    owner: number
}

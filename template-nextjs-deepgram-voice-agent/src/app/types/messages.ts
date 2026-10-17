export interface TranscriptMessage {
    role: string;
    content: string;
}

export interface MessageWithId extends TranscriptMessage {
    id: number;
}
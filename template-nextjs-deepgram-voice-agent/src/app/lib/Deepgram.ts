import { DeepgramClient, type AgentLiveClient } from "@deepgram/sdk";

/**
 * Singleton manager for Deepgram Agent clients
 * Ensures single client instance across the application to prevent connection issues
 */
class DeepgramAgent {
    private static instance: DeepgramAgent | null = null;
    private agentClient: AgentLiveClient | null = null;
    private apiKey: string | null = null;

    private constructor() {
        // Private constructor to enforce singleton pattern
    }

    public static getInstance(): DeepgramAgent {
        if (this.instance === null) {
            this.instance = new DeepgramAgent();
        }
        return this.instance;
    }

    public setApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    public getClient(): AgentLiveClient | null {
        if (this.agentClient) {
            return this.agentClient;
        }
        if (this.apiKey) {
            const client = new DeepgramClient({ key: this.apiKey });
            this.agentClient = client.agent();
            return this.agentClient;
        }
        return null;
    }
}

export const getDeepgramClient = (apiKey: string): AgentLiveClient | null => {
    const deepgram = DeepgramAgent.getInstance();
    deepgram.setApiKey(apiKey);
    return deepgram.getClient();
}
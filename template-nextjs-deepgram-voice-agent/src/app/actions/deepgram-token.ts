'use server'

import { DeepgramClient } from "@deepgram/sdk";

/**
 * Server action to generate a temporary Deepgram token
 * Keeps the main API key secure on the server while allowing
 * frontend components to authenticate with Deepgram services.
 */
export async function getDeepgramToken(): Promise<string> {
  // This should be set in your .env.local file as DEEPGRAM_API_KEY
  const key = process.env.DEEPGRAM_API_KEY;

  if (!key) {
    throw new Error("Deepgram API key is not set");
  }

  const client = new DeepgramClient({ key });

  // 1-hour expiration for security
  const tokenResponse = await client.auth.grantToken({ ttl_seconds: 3600 });

  if (tokenResponse.error) {
    throw new Error(`Error generating token: ${tokenResponse.error.message}`);
  }

  const token = tokenResponse.result.access_token;

  return token;
}
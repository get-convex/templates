"use server"
import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile'

const verifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const secret = process.env.TURNSTILE_SECRET_KEY!

export async function verifyToken(token: string) {
    try {
        const res = await fetch(verifyEndpoint, {
        method: 'POST',
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
        headers: {
        'content-type': 'application/x-www-form-urlencoded'
        }
    })

  const data = (await res.json()) as TurnstileServerValidationResponse 
  return data
    } catch (error) {
        console.error("Failed to verify token:", error);
        return null;
    }
 
}

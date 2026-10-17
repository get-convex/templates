# Next.js + Convex + Deepgram Voice Agent

A starter template for building **realtime voice-based conversational agents** and dynamic forms/surveys.

- **Convex** — realtime database & serverless functions  
- **Next.js** (App Router) — modern frontend  
- **Deepgram** — realtime speech-to-text  
- **Vercel AI SDK** + OpenRouter — agentic routing & structured outputs  
- **Clerk** — optional authentication  

Turn static forms into natural voice conversations: users speak answers, AI dynamically guides the flow, and everything syncs in realtime.

---

## Get Started

Create a new project with this template:

```bash
npm create convex@latest my-voice-agent -- -t nextjs-deepgram-voice-agent
```

(After merge, use the short name above. For now, test with your branch/fork using `-- -t YOUR-USERNAME/templates#add-template-nextjs-deepgram-voice-agent`)

Then:

1. Navigate to the project:
   ```bash
   cd my-voice-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   # or pnpm install / bun install
   ```

3. Copy and configure environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your keys in `.env.local`:
   - `DEEPGRAM_API_KEY=` (from Deepgram dashboard)  
   - `OPENROUTER_API_KEY=` (from OpenRouter)  
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=` & `CLERK_SECRET_KEY=` (if using auth)  
   - Convex vars are auto-handled by `npx convex dev`

4. Start the Convex backend:
   ```bash
   npx convex dev
   ```

5. Run the app:
   ```bash
   npm run dev
   ```

Open http://localhost:3000 — grant microphone access, sign in (if auth enabled), describe/generate a form, or start a voice conversation.

---

## Features

- Realtime speech-to-text with Deepgram streaming  
- AI-powered dynamic question routing & follow-ups  
- Natural language form generation  
- Realtime response storage & subscriptions via Convex  
- Optional Clerk auth + Cloudflare Turnstile bot protection  
- Tailwind CSS styling (minimal, no extra UI libraries)

---

## Customization

- Edit `convex/schema.ts` for your data model (e.g. sessions, questions, responses)  
- Modify agent logic in `convex/` functions/actions (Vercel AI SDK tools/calls)  
- Tweak voice UI in `app/page.tsx` or components  
- Remove Clerk auth if not needed — it's optional

---

## Learn More

- [Convex Docs](https://docs.convex.dev)  
- [Convex Auth Guide](https://docs.convex.dev/auth)  
- [Deepgram Realtime API](https://developers.deepgram.com/docs)  
- [Vercel AI SDK](https://sdk.vercel.ai/docs)  
- [OpenRouter Docs](https://openrouter.ai/docs)  

Join the [Convex Discord](https://discord.gg/convex) for help & community!

Built with ❤️ by [your-name-or-handle] — inspired by exploratory realtime AI projects.

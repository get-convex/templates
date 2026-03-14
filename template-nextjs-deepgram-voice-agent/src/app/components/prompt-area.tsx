import React, { useState } from "react"
import { ArrowUp } from "lucide-react"
import toast from "react-hot-toast"
import { Turnstile } from '@marsidev/react-turnstile'
import { verifyToken } from "@/app/actions/verify-token";

interface AiPromptProps {
  onGenerate: (prompt: string) => void
  isGenerating: boolean
}

export default function PromptArea({ onGenerate, isGenerating }: AiPromptProps) {
  const [prompt, setPrompt] = useState("")
    const [isLoading, setIsLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleToken = (token: string) => {
  setTurnstileToken(token);
}

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return

    if (prompt.length < 10) {
      toast.error("Prompt must be at least 10 characters long")
      return
    }
    const verified = await verifyToken(turnstileToken || "");
      if (!verified) {
        toast.error("Human verification failed. Please try again.");
        setIsLoading(false);
        return;
      }

    try {
      toast.loading("Generating questions...")
      onGenerate(prompt)
      toast.success("Questions generated successfully")
      setPrompt("")
      toast.dismiss()
    } catch (error) {
      toast.error("Failed to generate questions")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] sm:w-full max-w-2xl px-0 sm:px-6">
      <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-gray-100/70 backdrop-blur-sm shadow-lg">
        <div className="flex items-end gap-2 sm:gap-3 p-2 sm:p-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Create or update questions with AI..."
            className="flex-1 resize-none text-[13px] sm:text-[14px] text-gray-700 placeholder:text-gray-400 outline-none h-[30px] bg-transparent px-1"
          />

          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
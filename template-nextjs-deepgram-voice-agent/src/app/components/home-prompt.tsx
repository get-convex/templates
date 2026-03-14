import React, { useState } from "react"
import { ArrowUp, Sparkles, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { generateQuestions } from "@/app/actions/new_responses"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import toast from 'react-hot-toast'
import { nanoid } from "nanoid"
import { useUser } from "@clerk/nextjs"
import type {Question} from "@/app/types/question"
import {slugGenerator} from "@/app/lib/utils"
import { Turnstile } from '@marsidev/react-turnstile'
import { verifyToken } from "@/app/actions/verify-token";

export const HomePrompt = () => {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const router = useRouter()
  const { user } = useUser()
  const createFormMutation = useMutation(api?.form?.createForm)
  
const handleToken = (token: string) => {
  setTurnstileToken(token);
}

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return

      const verified = await verifyToken(turnstileToken || "");
      if (!verified) {
        toast.error("Human verification failed. Please try again.");
        setIsLoading(false);
        return;
      }

    try {
      setIsLoading(true)
      toast.loading("Generating form...", { id: "loading" })
      
      // 1. Fetch generated questions
      const generatedResult = await generateQuestions(prompt, [])
      
      // Extract the data array from the response
      // Handle both {data: [...], success: true} and direct array responses
      let cleanQuestions: Question[] = []
      
      if (Array.isArray(generatedResult)) {
        cleanQuestions = generatedResult
      } else if (generatedResult?.data && Array.isArray(generatedResult.data)) {
        cleanQuestions = generatedResult.data
      } else {
        toast.dismiss("loading")
        toast.error("Invalid response format from question generator.")
        setIsLoading(false)
        return
      }

      if (cleanQuestions.length === 0) {
        toast.dismiss("loading")
        toast.error("No questions were generated. Try a different prompt.")
        setIsLoading(false)
        return
      }

      const formTitle = "Untitled form"
      const formId = nanoid()

      // 2. Call the mutation
      // Note: We pass the cleaned array 'cleanQuestions' to the questions field
      const res = await createFormMutation({
        form_schema: {
          id: formId,
          slug: slugGenerator(formTitle),
          title: formTitle,
          user_id: user?.id,
          questions: cleanQuestions, // Cleaned array
        },
      })

      toast.dismiss("loading")

      if (res) {
        toast.success("Form created!")
        router.push(`/form/${formId}`)
      } else {
        toast.error("Failed to create form")
        setIsLoading(false)
      }
    } catch (error) {
      toast.dismiss("loading")
      console.error("Failed to save form:", error)
      toast.error("Failed to create form")
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 mb-6 sm:mb-8">
      <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} onSuccess={handleToken} />
      <div className="rounded-4xl sm:rounded-4xl border border-gray-200 bg-white shadow-sm hover:border-gray-200 transition-shadow">
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the form you want to create..."
            className="flex-1 text-sm sm:text-[15px] text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
            disabled={isLoading}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowUp size={16} className="sm:w-[18px] sm:h-[18px]" />
            )}
          </button>
        </div>
      </div>
      
      {/* Optional: Show example prompts */}
      {!prompt && !isLoading && (
        <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 justify-center">
          {["Customer feedback survey", "Event registration form", "Job application"].map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="px-3 py-1.5 text-xs sm:text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-200 rounded-full transition-colors border border-gray-200 touch-manipulation"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
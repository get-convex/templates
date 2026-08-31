"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import PromptArea from "@/app/components/prompt-area"
import { generateQuestions } from "@/app/actions/new_responses"
import { NotFound } from "@/app/components/not-found"
import toast from "react-hot-toast"
import { EditorNav, SideNav } from "@/app/components/editor-nav"
import { EditorQuestions } from "@/app/components/editor-questions"


type QuestionType =
  | "short-text"
  | "long-text"
  | "multiple-choice"
  | "email"
  | "number"
  | "date"
  | "single-choice"

interface Question {
  id: string
  type: string
  title: string
  description?: string
  options?: string[]
  required: boolean
}

export default function FormBuilder() {
  const params = useParams<{ formID: string }>()
  const { user } = useUser()

  const formData = useQuery(api.form.getForm, { id: params.formID as string })
  const updateForm = useMutation(api.form.updateForm)

  const [questions, setQuestions] = useState<Question[]>([])
  const [formTitle, setFormTitle] = useState("Untitled form")
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const isInitialized = useRef(false)

  useEffect(() => {
    if (formData && !isInitialized.current) {
      setFormTitle(formData.title)
      setQuestions(formData.questions || [])
      isInitialized.current = true
    }
    console.log("formData", formData)
  }, [formData])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateForm({
        id: params.formID as string,
        title: formTitle,
        questions: questions,
      })
      toast.success("Changes saved successfully")
    } catch (error) {
      console.error("Failed to save form:", error)
      toast.error("Failed to save form")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAiGenerate = async (prompt: string) => {
    setIsGenerating(true)
    try {
      const { success, data } = await generateQuestions(prompt, questions)
      console.log("success", success)
      console.log("data", data)
      if (success) {
        setQuestions(data as Question[])
      }
    } catch (error) {
      console.error("Failed to generate:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const addQuestion = (type: QuestionType) => {
    const q: Question = {
      id: `q-${Date.now()}`,
      type,
      title: "",
      required: false,
      options: type === "multiple-choice" || type === "single-choice" ? ["", ""] : undefined,
    }
    setQuestions([...questions, q])
    setSelectedQuestion(q.id)
  }

  const updateQuestion = (id: string, updates: Partial<Question>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...updates } : q)))

  const deleteQuestion = (id: string) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id))
    if (selectedQuestion === id) setSelectedQuestion(null)
  }

  if (formData === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-500" />
      </div>
    )
  }
  if (formData === null) {
    return <NotFound />
  }

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-500/10">
      <EditorNav
        formTitle={formTitle}
        formId={params.formID}
        handleSave={handleSave}
        isSaving={isSaving}
      />
      <SideNav addQuestion={addQuestion} />

      <main className="mx-auto max-w-[680px] px-4 sm:px-6 py-12 sm:py-16 lg:py-20 lg:ml-72 pb-32 sm:pb-40">
        <header className="mb-12 sm:mb-16">
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Untitled form"
            className="w-full bg-transparent text-[28px] sm:text-[36px] lg:text-[40px] font-semibold leading-tight tracking-tight text-gray-900 outline-none placeholder:text-gray-300"
          />
          <div className="mt-3 flex items-center gap-2">
            <p className="text-sm font-medium text-gray-500">
              {questions.length} {questions.length === 1 ? "question" : "questions"}
            </p>
          </div>
        </header>

        <EditorQuestions
          questions={questions}
          updateQuestion={updateQuestion}
          deleteQuestion={deleteQuestion}
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
          hoveredQuestion={hoveredQuestion}
          setHoveredQuestion={setHoveredQuestion}
        />
      </main>

      <PromptArea onGenerate={handleAiGenerate} isGenerating={isGenerating} />
    </div>
  )
}
"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Plus,
  Loader2,
} from "lucide-react"
import { UserButton, useUser } from '@clerk/nextjs'
import { usePaginatedQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import toast, { Toaster } from 'react-hot-toast'
import { HomePrompt } from '@/app/components/home-prompt'
import { FormCard } from '@/app/components/form-card'
import { useRouter } from "next/navigation"
import {slugGenerator, randomId, formatRelativeDate} from "@/app/lib/utils"
import {LoadingPage} from "@/app/components/loading"


export default function FormsHomepage() {
  const { user } = useUser()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement|null>(null)
    const newFormId = useRef<string>("")
  const createFormMutation = useMutation(api?.form?.createForm)
  
  const router = useRouter()
  // Paginated data from Convex
  const { results: forms, status, loadMore } = usePaginatedQuery(
    api.form.getUserFormsPaginated,
    user?.id ? { user_id: user.id } : "skip",
    { initialNumItems: 6 } // Load 12 forms initially
  );

  // Add delete mutation
  const deleteForm = useMutation(api.form.deleteForm);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDelete = async (formId: string, formTitle: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Create a custom confirmation toast
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">Delete form?</p>
          <p className="text-sm text-gray-600 mt-1">
           {` Are you sure you want to delete ${formTitle}? This action cannot be undone.`}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id)
            }}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              const deletePromise = deleteForm({ id: formId })
              
              toast.promise(
                deletePromise,
                {
                  loading: 'Deleting form...',
                  success: 'Form deleted successfully',
                  error: 'Failed to delete form',
                }
              )
              
              try {
                await deletePromise
                setActiveDropdown(null)
              } catch (error) {
                console.error("Failed to delete form:", error)
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
       {"Delete"}
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    })
  }

  

  const newForm = async ()=>{
  console.log("user", user)

  const formTitle = "Untitled form"
    newFormId.current = await randomId()
     toast.loading("Creating form...",{
      duration: 2000,
      position: 'top-center',
     })

   
  try {
    const res = await createFormMutation({ form_schema: { id: newFormId.current, slug: slugGenerator(formTitle), title: formTitle, user_id:user?.id, questions: [] } })
   

    if(res) router.push(`/form/${newFormId.current}`)
      toast.dismiss()

  } catch (error) {
    console.error("Failed to save form:", error)
    toast.error("Failed to create form")
  }
  }

  // Manual load more handler
  const handleLoadMore = () => {
    loadMore(12) // Load 12 more forms
  }

  // Loading state
  if (status === "LoadingFirstPage") {
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster />

      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Home</h1>
          <div className="flex items-center gap-3">
            <button onClick={newForm} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2">
              <Plus size={18} strokeWidth={2} />
              Create form
            </button>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 flex flex-col" style={{ height: 'calc(100vh - 73px)' }}>
        {/* Prompt Area */}
        <div className="pt-12 pb-8 flex-shrink-0">
          <HomePrompt />
        </div>

        {/* Scrollable Forms Area */}
        <div className="flex-1 overflow-y-auto pb-8">
          {forms.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms.map((form) => (
                <FormCard key={form.id} formatRelativeDate={formatRelativeDate} form={form} handleDelete={handleDelete} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} dropdownRef={dropdownRef} />
                ))}
              </div>

              {/* Load More Button or Loading Indicator */}
              {(status === "CanLoadMore" || status === "LoadingMore") && (
                <div className="flex justify-center py-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={status === "LoadingMore"}
                    className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "LoadingMore" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Load More</>
                    )}
                  </button>
                </div>
              )}

              {/* End of results message */}
              {status === "Exhausted" && forms.length > 12 && (
                <div className="flex justify-center py-8">
                  <p className="text-sm text-gray-500">{`You've reached the end`}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24">
              <h3 className="text-base font-semibold text-gray-900">{`No forms yet`}</h3>
              <p className="text-sm text-gray-600 mt-1">{`Use the prompt above or click "Create form" to get started`}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
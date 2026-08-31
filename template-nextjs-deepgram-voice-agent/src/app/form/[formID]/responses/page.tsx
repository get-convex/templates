"use client"

import { useState } from "react"
import { ArrowLeft, ChevronDown, FileText, Users } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { usePaginatedQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"

const ITEMS_PER_PAGE = 5

export default function SubmissionsPage() {
  const params = useParams()
  const formId = params.formID as string

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Use Convex's usePaginatedQuery
  const { results, status, loadMore } = usePaginatedQuery(
    api.form.getSessionsWithResponsesByForm,
    { form_id: formId },
    { initialNumItems: ITEMS_PER_PAGE }
  )

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  if (status === "LoadingFirstPage") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading responses...</p>
      </div>
    )
  }

  const submissions = results || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 py-4">
            <Link
              href="/home"
              className="p-1.5 -ml-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-base font-medium text-gray-900">
             Home
           
            </h1>
          </div>

          <div className="flex gap-6 -mb-px">
            <Link
              href={`/form/${formId}`}
              className="flex items-center gap-2 px-1 py-3 text-sm text-gray-500 hover:text-gray-700 border-b-2 border-transparent transition-colors"
            >
              <FileText size={16} />
              Questions
            </Link>
            <button className="flex items-center gap-2 px-1 py-3 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
              <Users size={16} />
              Responses
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {submissions.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-5">Respondent ID</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Rows */}
          {submissions.map((submission) => {
            const isExpanded = expandedId === submission._id

            return (
              <div key={submission._id} className="border-b border-gray-100 last:border-b-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : submission._id)}
                  className="w-full grid grid-cols-12 gap-4 px-4 py-4 items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600">
                      {submission.surveyed_user_id.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        User: {submission.surveyed_user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-gray-600">
                    {formatDate(submission._creationTime)}
                  </div>
                  <div className="col-span-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      {submission.status}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50">
                    <div className="ml-11 space-y-4 pt-4 border-t border-gray-100">
                      {submission.responses.map((resp) => (
                        <div key={resp.question_id} className="grid grid-cols-2 gap-4">
                          <p className="text-sm font-medium text-gray-500">{resp.question}</p>
                          <p className="text-sm text-gray-900">{resp.answer || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {submissions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-gray-500">No submissions found for this form.</p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {/* Status Info */}
          <p className="text-sm text-gray-500">
           
            {status === "LoadingMore" && "Loading more responses..."}
            {status === "CanLoadMore" && `Showing ${submissions.length} response${submissions.length !== 1 ? 's' : ''}`}
            {status === "Exhausted" && submissions.length > 0 && `All ${submissions.length} response${submissions.length !== 1 ? 's' : ''} loaded`}
          </p>

          {/* Load More Button */}
          {status === "CanLoadMore" && (
            <button
              onClick={() => loadMore(ITEMS_PER_PAGE)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
            >
              Load More Responses
            </button>
          )}

          {/* Loading State */}
          {status === "LoadingMore" && (
            <div className="flex items-center gap-2 px-6 py-2.5">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
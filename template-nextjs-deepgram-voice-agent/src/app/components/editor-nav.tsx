import Link from "next/link"
import { Save, Link2, Type, ListChecks, Circle, Calendar, Mail, Hash, AlignLeft, ChevronLeft, Menu, X } from "lucide-react"
import toast from "react-hot-toast"
import type { QuestionType } from "@/app/types/question"
import { useState } from "react"

const questionTypes = [
  { type: "short-text", icon: Type, label: "Short answer" },
  { type: "long-text", icon: AlignLeft, label: "Long answer" },
  { type: "multiple-choice", icon: ListChecks, label: "Multiple choice" },
  { type: "single-choice", icon: Circle, label: "Single choice" },
  { type: "email", icon: Mail, label: "Email" },
  { type: "number", icon: Hash, label: "Number" },
  { type: "date", icon: Calendar, label: "Date" },
] as const

export const EditorNav = ({
  formTitle,
  handleSave,
  isSaving,
  formId,
}: {
  formTitle: string
  handleSave: () => void
  isSaving: boolean
  formId: string
}) => {
  const shareForm = async () => {
    if (!formId) {
      toast.error("Save form first")
      return
    }

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/c/${formId}`)
      toast.success("Link copied successfully")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full h-[70px] flex items-center justify-between px-4 sm:px-8 md:px-12 lg:px-20 bg-white border-b border-gray-100">
      <Link
        href={`/home`}
        className="w-[35px] h-[35px] grid place-items-center rounded-full text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
      >
        <ChevronLeft size={20} />
      </Link>

      <span className="hidden sm:block text-[13px] font-medium text-gray-400 truncate max-w-[200px] md:max-w-none">
        Drafting: {formTitle}
      </span>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-medium rounded-lg transition-all shadow-sm"
        >
          <Save size={14} className="sm:w-4 sm:h-4" />
          <span>{ "Save"}</span>
        </button>

        <button
          onClick={shareForm}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium rounded-lg transition-all"
        >
          <Link2 size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </nav>
  )
}

export const SideNav = ({ addQuestion }: { addQuestion: (type: QuestionType) => void }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed left-4 bottom-24 z-50 w-12 h-12 rounded-full bg-gray-600 text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side panel */}
      <aside
        className={`
        fixed z-50 
        lg:left-6 lg:top-1/2 lg:-translate-y-1/2
        transition-transform duration-300
        ${
          isOpen
            ? "left-4 bottom-40 translate-x-0"
            : "left-4 bottom-40 -translate-x-[calc(100%+2rem)] lg:translate-x-0"
        }
      `}
      >
        <div className="w-56 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Add block
            </p>
          </div>
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            {questionTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => {
                  addQuestion(type)
                  setIsOpen(false)
                }}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-gray-50"
              >
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className="text-gray-400 transition group-hover:text-gray-700"
                />
                <span className="whitespace-nowrap text-[13px] font-medium text-gray-600 transition group-hover:text-gray-900">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
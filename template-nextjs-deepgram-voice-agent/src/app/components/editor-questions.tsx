
import {
  Plus,
  Type,
  ListChecks,
  Circle,
  Calendar,
  Mail,
  Hash,
  AlignLeft,
  Trash2,
} from "lucide-react"
import type {Question} from "@/app/types/question"


const questionTypes = [
  { type: "short-text", icon: Type, label: "Short answer" },
  { type: "long-text", icon: AlignLeft, label: "Long answer" },
  { type: "multiple-choice", icon: ListChecks, label: "Multiple choice" },
  { type: "single-choice", icon: Circle, label: "Single choice" },
  { type: "email", icon: Mail, label: "Email" },
  { type: "number", icon: Hash, label: "Number" },
  { type: "date", icon: Calendar, label: "Date" },
] as const

export const EditorQuestions = ({questions, updateQuestion, deleteQuestion, selectedQuestion, setSelectedQuestion, hoveredQuestion, setHoveredQuestion}: {questions: Question[], updateQuestion: (id: string, updates: Partial<Question>) => void, deleteQuestion: (id: string) => void, selectedQuestion: string | null, setSelectedQuestion: (id: string | null) => void, hoveredQuestion: string | null, setHoveredQuestion: (id: string | null) => void}) => {

return (
    <section className="space-y-3">
            {questions.map((q, i) => {
              const Icon =
                questionTypes.find(t => t.type === q.type)?.icon ?? Type
              const selected = selectedQuestion === q.id
              const hovered = hoveredQuestion === q.id
  
              return (
                <article
                  key={q.id}
                  onClick={() => setSelectedQuestion(q.id)}
                  onMouseEnter={() => setHoveredQuestion(q.id)}
                  onMouseLeave={() => setHoveredQuestion(null)}
                  className={`cursor-pointer rounded-xl border bg-white p-8 transition-all duration-150 ease-out hover:-translate-y-[1px]
                    ${
                      selected
                        ? "border-indigo-100 ring-1 ring-indigo-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {/* Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon size={20} strokeWidth={1.5} className="text-gray-400" />
                      <span className="text-xs font-medium tracking-wide text-gray-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
  
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        deleteQuestion(q.id)
                      }}
                      className={`rounded-lg p-2 transition ${
                        hovered || selected ? "opacity-100" : "opacity-0"
                      } hover:bg-red-50 text-gray-400 hover:text-red-500`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
  
                  <input
                    value={q.title}
                    onChange={e =>
                      updateQuestion(q.id, { title: e.target.value })
                    }
                    placeholder="Write a question"
                    className="mb-3 w-full bg-transparent text-[22px] font-medium leading-snug text-gray-900 outline-none placeholder:text-gray-300"
                  />
  
                  <input
                    value={q.description ?? ""}
                    onChange={e =>
                      updateQuestion(q.id, { description: e.target.value })
                    }
                    placeholder="Description (optional)"
                    className="mb-6 w-full bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-300"
                  />
  
                  {/* Multiple Choice Options */}
                  {q.type === "multiple-choice" && q.options && (
                    <div className="space-y-3">
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
                          <input
                            value={option}
                            onChange={e => {
                              const newOptions = [...q.options!]
                              newOptions[optIndex] = e.target.value
                              updateQuestion(q.id, { options: newOptions })
                            }}
                            onClick={e => e.stopPropagation()}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-300 py-2 border-b border-gray-200 focus:border-indigo-500 transition-colors"
                          />
                          {q.options!.length > 2 && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                const newOptions = q.options!.filter((_, i) => i !== optIndex)
                                updateQuestion(q.id, { options: newOptions })
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          updateQuestion(q.id, { options: [...q.options!, ""] })
                        }}
                        className="flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-600 transition-colors mt-2"
                      >
                        <Plus size={16} />
                        Add option
                      </button>
                    </div>
                  )}
  
                  {/* Single Choice Options */}
                  {q.type === "single-choice" && q.options && (
                    <div className="space-y-3">
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          <input
                            value={option}
                            onChange={e => {
                              const newOptions = [...q.options!]
                              newOptions[optIndex] = e.target.value
                              updateQuestion(q.id, { options: newOptions })
                            }}
                            onClick={e => e.stopPropagation()}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-300 py-2 border-b border-gray-200 focus:border-indigo-500 transition-colors"
                          />
                          {q.options!.length > 2 && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                const newOptions = q.options!.filter((_, i) => i !== optIndex)
                                updateQuestion(q.id, { options: newOptions })
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          updateQuestion(q.id, { options: [...q.options!, ""] })
                        }}
                        className="flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-600 transition-colors mt-2"
                      >
                        <Plus size={16} />
                        Add option
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </section>
     )
}


import React from "react"
import Link from "next/link"
import {
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  FileText,
  Calendar,
  Share
} from "lucide-react"
import toast from "react-hot-toast"
export const FormCard = ({form,handleDelete,activeDropdown,setActiveDropdown,dropdownRef,formatRelativeDate}:{form:any,handleDelete:(formId:string,title:string,e:React.MouseEvent<HTMLButtonElement>)=>void,activeDropdown:any,setActiveDropdown:any,dropdownRef:React.RefObject<HTMLDivElement|null>,formatRelativeDate:any})=>{
    return(
           <div
                    key={form.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 group relative hover:border-gray-400 transition-all duration-200 hover:shadow-sm"
                  >
                    {/* Ellipsis Menu */}
                    <div className="absolute top-3 right-3" ref={activeDropdown === form.id ? dropdownRef : null}>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setActiveDropdown(activeDropdown === form.id ? null : form.id)
                        }}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === form.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              navigator.clipboard.writeText(`${window.location.origin}/c/${form.id}`)
                              toast.success("Link copied to clipboard")
                            }}
                            className="flex w-full rounded-t-2xl items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Share size={16} className="text-gray-500" />
                            Share form
                          </button>
                          <Link
                            href={`/form/${form.id}/responses`}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Eye size={16} className="text-gray-500" />
                            View responses
                          </Link>
                          <Link
                            href={`/form/${form.id}`}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Edit size={16} className="text-gray-500" />
                            Edit form
                          </Link>
                          <button
                            onClick={(e) => handleDelete(form.id, form.title, e)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                            Delete form
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Make the card clickable */}
                    <Link href={`/form/${form.id}/responses`} className="block">
                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                          published
                        </span>
                      </div>

                      <h3 className="text-[15px] font-semibold text-gray-700 mb-2 line-clamp-2 pr-6 group-hover:text-gray-800 transition-colors">
                        {form.title}
                      </h3>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <FileText size={14} className="text-gray-400" strokeWidth={1.5} />
                          {form.questions?.length || 0} questions
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar size={14} className="text-gray-400" strokeWidth={1.5} />
                          {formatRelativeDate(form._creationTime)}
                        </div>
                      </div>
                    </Link>
                  </div>
    )
}
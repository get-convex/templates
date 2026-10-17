export type QuestionType =
  | "short-text"
  | "long-text"
  | "multiple-choice"
  | "email"
  | "number"
  | "date"
  | "single-choice"

export interface Question {
  id: string
  type: string
  title: string
  description?: string
  options?: string[]
  required: boolean
}
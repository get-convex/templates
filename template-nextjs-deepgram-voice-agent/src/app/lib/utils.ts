import {nanoid} from "nanoid"
import { TranscriptMessage } from "../types/messages"

export const slugGenerator = (title: string) => {
    const slug = title.replace(/\s+/g, "-").toLowerCase()
    return slug
  }

export const randomId = async () => {
    return nanoid(8)
  }


export const formatRelativeDate = (date: number): string => {
  const diffDays = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}


export const convertTranscriptToText = (transcript: TranscriptMessage[]): string => {
  return transcript
    .map((item) => `role: "${item.role}", content: "${item.content}"`)
    .join("\n");
};
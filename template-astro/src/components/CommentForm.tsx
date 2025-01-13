import { useMutation } from "convex/react"
import { useState } from "react"
import { api } from "../../convex/_generated/api"
import { withConvexProvider } from "../lib/convex.tsx"

export default withConvexProvider(function CommentForm() {
	const createComment = useMutation(api.comments.create)
	const [author, setAuthor] = useState("")
	const [content, setContent] = useState("")
	const [error, setError] = useState<string>()

	const handleSubmit = async () => {
		if (!author.trim() || !content.trim()) return

		setError(undefined)
		try {
			await createComment({ author, content })
			setAuthor("")
			setContent("")
		} catch (error) {
			console.error(error)
			setError("Submission failed, try again.")
		}
	}

	return (
		<form action={handleSubmit} className="space-y-4 mb-8">
			<input
				type="text"
				placeholder="Your name"
				value={author}
				onChange={(e) => setAuthor(e.target.value)}
				className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
			/>
			<textarea
				placeholder="Leave a comment..."
				value={content}
				onChange={(e) => setContent(e.target.value)}
				className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] resize-y"
			/>
			<button
				type="submit"
				className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
			>
				Post Comment
			</button>
			{error && <p className="text-red-600 text-sm mt-2">{error}</p>}
		</form>
	)
})

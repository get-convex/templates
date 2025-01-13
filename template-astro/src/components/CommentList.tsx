import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { withConvexProvider } from "../lib/convex.tsx"

export default withConvexProvider(function CommentList() {
	const comments = useQuery(api.comments.list)
	return comments === undefined ? (
		<p className="text-gray-500 text-center py-4">Loading comments...</p>
	) : comments.length === 0 ? (
		<p className="text-gray-500 text-center py-4">No comments found.</p>
	) : (
		<div className="space-y-6">
			{comments.map((comment) => (
				<article
					key={comment._id}
					className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
				>
					<header className="flex justify-between items-center mb-2">
						<strong className="font-medium text-gray-900">
							{comment.author}
						</strong>
						<span className="text-sm text-gray-500">
							{new Date(comment._creationTime).toLocaleDateString()}
						</span>
					</header>
					<main className="text-gray-700 leading-relaxed">
						<p className="whitespace-pre-line">{comment.content}</p>
					</main>
				</article>
			))}
		</div>
	)
})

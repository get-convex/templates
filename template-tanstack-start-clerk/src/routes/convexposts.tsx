import { api } from 'convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { useAction } from 'convex/react'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/convexposts')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      ...convexQuery(api.posts.list, {}),
      gcTime: 10000,
    })
  },
  component: PostsComponent,
})

function PostsComponent() {
  const {
    data: posts,
    isPending,
    error,
  } = useQuery({
    ...convexQuery(api.posts.list, {}),
  })

  // Not server-rendered
  const { data: count } = useQuery(convexQuery(api.posts.count, {}))

  if (isPending) return <>loading..</>
  if (error) return <>error..</>

  const populatePosts = useAction(api.posts.populate)

  return (
    <div className="p-2 flex gap-2 flex-col">
      <div>client-rendered but no auth required (pops in): {count}</div>

      {(!count || count === 0) && (
        <button
          onClick={() => populatePosts()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Populate Posts
        </button>
      )}

      <ul className="list-disc pl-4">
        {[...posts, { id: 'i-do-not-exist', title: 'Non-existent Post' }].map(
          (post) => {
            return (
              <li key={post.id} className="whitespace-nowrap">
                <Link
                  to="/posts/$postId"
                  params={{
                    postId: post.id,
                  }}
                  className="block py-1 text-blue-800 hover:text-blue-600"
                  activeProps={{ className: 'text-black font-bold' }}
                >
                  <div>{post.title.substring(0, 20)}</div>
                </Link>
              </li>
            )
          },
        )}
      </ul>
      <hr />
      <Outlet />
    </div>
  )
}

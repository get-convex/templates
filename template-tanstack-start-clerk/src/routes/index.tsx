import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-2">
      <h1>Tanstack Start Convex with Clerk</h1>
    </div>
  )
}

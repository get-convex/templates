import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_authed/user')({
  component: RouteComponent,
})

function RouteComponent() {
  // Not server-rendered and null until authed
  const { data: profile } = useQuery(convexQuery(api.user.profile, {}))
  // Server-rendered
  const { data: email } = useSuspenseQuery(convexQuery(api.user.email, {}))

  return (
    <div className="p-2 flex gap-2 flex-col">
      <div>server-rendered email: {email}</div>
      <div>
        {
          'client-rendered and requires auth (could be momentarily null if not protected by <Authenticated>): '
        }
        {profile?.email} - {profile?.name}
      </div>
    </div>
  )
}

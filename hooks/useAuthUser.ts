    import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import type { User } from "@/lib/types"

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    apiService.getCurrentUser()
      .then(u => { if (isMounted) setUser(u) })
      .catch(() => { if (isMounted) setUser(null) })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  return { user, loading }
}

import { Redirect, Stack, usePathname } from 'expo-router'
import { useAuthContext } from '../providers/AuthProvider'

export default function AuthRoutesLayout() {
  const { user, loading } = useAuthContext()
  const pathname = usePathname()

  if (loading) return null;

  if (user && user.emailVerified) return <Redirect href={'/'} />
  if (user && !user.emailVerified) {
    // Force unverified users to the verify page; compare actual path '/verify'
    if (pathname !== '/verify') {
      return <Redirect href={'/verify'} />
    }
    return <Stack />
  }

  return <Stack />
}
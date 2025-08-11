import { Redirect, Stack } from 'expo-router'
import { useAuthContext } from '../providers/AuthProvider'

export default function AuthRoutesLayout() {
  const { user, loading } = useAuthContext()

  if (loading) return null;

  if (user) {
    return <Redirect href={'/'} />
  }

  return <Stack />
}
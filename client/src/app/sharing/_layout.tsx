import { Stack } from 'expo-router'
import { Redirect } from 'expo-router'
import { useAuthContext } from '../providers/AuthProvider'

export default function SharingLayout() {
  const { user, loading } = useAuthContext();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  return <Stack />
}

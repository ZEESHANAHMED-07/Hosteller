import { Stack } from 'expo-router'
import { Redirect } from 'expo-router'
import { useAuthContext } from '../providers/AuthProvider'
import { usePathname } from 'expo-router'

export default function CardsLayout() {
  const { user, loading } = useAuthContext();
  const pathname = usePathname();

  if (loading) {
    return null;
  }

  // If unauthenticated and currently inside cards/*, send to auth entry
  if (!user && !pathname.startsWith('/(auth)')) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Stack />
}

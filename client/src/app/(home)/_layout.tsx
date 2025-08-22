import { Stack, Redirect } from 'expo-router';
import { useAuthContext } from '../providers/AuthProvider';

export default function HomeLayout() {
  const { user, loading } = useAuthContext();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (user && !user.emailVerified) return <Redirect href="/verify" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

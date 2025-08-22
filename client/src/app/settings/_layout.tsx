import { Stack, Redirect } from 'expo-router';
import { useAuthContext } from '../providers/AuthProvider';

export default function SettingsLayout() {
  const { user, loading } = useAuthContext();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (user && !user.emailVerified) return <Redirect href="/(auth)/verify" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-of-service" />
      <Stack.Screen name="help-center" />
    </Stack>
  );
}

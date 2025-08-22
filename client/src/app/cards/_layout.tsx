import { Stack } from 'expo-router';

export default function CardsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="createcards" />
      <Stack.Screen name="createtypes" />
      <Stack.Screen name="mycards" />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function BusinessLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="post-opportunity" />
      <Stack.Screen name="manage-opportunities" />
      <Stack.Screen name="candidates" />
      <Stack.Screen name="candidate-profile" />
      <Stack.Screen name="applications" />
      <Stack.Screen name="company-profile" />
    </Stack>
  );
}
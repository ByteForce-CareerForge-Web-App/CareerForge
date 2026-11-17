import { Stack } from 'expo-router';

export default function BusinessLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="applications" />
      <Stack.Screen name="candidate-profile" />
      <Stack.Screen name="candidates" />
      <Stack.Screen name="company-profile" />
      <Stack.Screen name="manage-opportunities" />
      <Stack.Screen name="post-opportunity" />
    </Stack>
  );
}
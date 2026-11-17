import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="approvals" />
      <Stack.Screen name="users" />
      <Stack.Screen name="opportunities" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="rewards" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
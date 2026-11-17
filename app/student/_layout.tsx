import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="skills" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="opportunities" />
      <Stack.Screen name="opportunity-details" />
      <Stack.Screen name="apply-opportunity" />
      <Stack.Screen name="applications" />
      <Stack.Screen name="career-roadmap" />
      <Stack.Screen name="ai-career-assistant" />
      <Stack.Screen name="improve-cv" />
      <Stack.Screen name="launch-career" />
      <Stack.Screen name="notification" />
    </Stack>
  );
}
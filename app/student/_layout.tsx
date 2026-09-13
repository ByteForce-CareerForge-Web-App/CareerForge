import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="ai-career-assistant" />
      <Stack.Screen name="career-roadmap" />
      <Stack.Screen name="opportunities" />
      <Stack.Screen name="opportunity-details" />
      <Stack.Screen name="apply-opportunity" />
      <Stack.Screen name="applications" />
      <Stack.Screen name="connections" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="social-feed" />
      <Stack.Screen name="create-post" />
      <Stack.Screen name="comments" />
      <Stack.Screen name="events" />
      <Stack.Screen name="event-details" />
      <Stack.Screen name="my-events" />
      <Stack.Screen name="career-goals" />
      <Stack.Screen name="career-pathways" />
      <Stack.Screen name="career-path-details" />
      <Stack.Screen name="my-career-paths" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="improve-cv" />
      <Stack.Screen name="launch-career" />
      <Stack.Screen name="skills" />
      <Stack.Screen name="employability-analysis" />
      <Stack.Screen name="saved-opportunities" />
    </Stack>
  );
}
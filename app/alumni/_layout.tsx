import { Stack } from 'expo-router';

export default function AlumniLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="add-experience" />
      <Stack.Screen name="mentor-students" />
      <Stack.Screen name="networking" />
      <Stack.Screen name="share-experience" />
      <Stack.Screen name="career-insights" />
      <Stack.Screen name="career-roadmap" />
      <Stack.Screen name="opportunities" />
      <Stack.Screen name="opportunity-details" />
      <Stack.Screen name="saved-opportunities" />
      <Stack.Screen name="my-applications" />
      <Stack.Screen name="notifications" />
      
    </Stack>
  );
}
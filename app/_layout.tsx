import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Main Screens */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        {/* Student Section */}
        <Stack.Screen name="student" />

        {/* Alumni Section */}
        <Stack.Screen name="alumni" />

        {/* Business Section */}
        <Stack.Screen name="business" />

        {/* Modal */}
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal' }}
        />

        {/* Admin Section */}
        <Stack.Screen name="admin" />
      </Stack>

      <StatusBar style="auto" />
    </>
  );
}
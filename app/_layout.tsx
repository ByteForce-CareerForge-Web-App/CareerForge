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

      {/* Registration Screens */}
      <Stack.Screen name="student-register" />
      <Stack.Screen name="alumni-register" />
      <Stack.Screen name="business-register" />

      {/* Student Section */}
      <Stack.Screen name="student" />

      {/* Alumni Section */}
      <Stack.Screen name="alumni" />

      {/* Business Section */}
      <Stack.Screen name="business" />

      {/* Admin Section */}
      <Stack.Screen name="admin" />

      {/* Modal */}
      <Stack.Screen
        name="modal"
        options={{ presentation: 'modal' }}
      />
      </Stack>

      <StatusBar style="auto" />
    </>
  );
}
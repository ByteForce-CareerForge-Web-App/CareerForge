import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>CF</Text>
      </View>

      {/* App Name */}
      <Text style={styles.title}>CareerForgeAI</Text>

      {/* Description */}
      <Text style={styles.subtitle}>
        Empowering graduates to build their careers with AI.
      </Text>

      {/* Login */}
      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.primaryButtonText}>
          Login
        </Text>
      </Pressable>

      {/* Register */}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push('/register')}
      >
        <Text style={styles.secondaryButtonText}>
          Create Account
        </Text>
      </Pressable>

      {/* Temporary Business Dashboard Test Button */}
      <Pressable
        style={styles.testButton}
        onPress={() => router.push('/business/dashboard')}
      >
        <Text style={styles.testButtonText}>
          Test Business Dashboard
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 25,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  secondaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E7FF',
    marginBottom: 12,
  },

  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },

  testButton: {
    width: '100%',
    backgroundColor: '#EEF2FF',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },

  testButtonText: {
    color: '#4338CA',
    fontSize: 14,
    fontWeight: '600',
  },
});

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>CF</Text>
      </View>

      <Text style={styles.title}>CareerForgeAI</Text>

      <Text style={styles.subtitle}>
        Empowering graduates to build their careers with AI.
      </Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.primaryButtonText}>
          Login
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push('/register')}
      >
        <Text style={styles.secondaryButtonText}>
          Create Account
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
  },

  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
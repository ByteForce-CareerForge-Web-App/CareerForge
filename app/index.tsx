import { router } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/careerforge-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
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
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
},

logo: {
  width: 220,
  height: 120,
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
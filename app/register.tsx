import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <Text style={styles.subtitle}>
        Choose your CareerForgeAI account type
      </Text>

      
      <Pressable
        style={styles.option}
        onPress={() =>
          router.push({
            pathname: '/student/career-goals',
            params: {
              mode: 'registration',
            },
          })
        }
      >
        <Text style={styles.icon}>🎓</Text>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Student</Text>
          <Text style={styles.optionDescription}>
            Find opportunities and build your career
          </Text>
        </View>
      </Pressable>



      <Pressable
        style={styles.option}
        onPress={() => router.push('/alumni-register')}
      >
        <Text style={styles.icon}>🎓</Text>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Alumni</Text>
          <Text style={styles.optionDescription}>
            Connect with opportunities and mentor others
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.option}
        onPress={() => router.push('/business-register')}
      >
        <Text style={styles.icon}>🏢</Text>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Business</Text>
          <Text style={styles.optionDescription}>
            Post opportunities and find qualified graduates
          </Text>
        </View>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
  },

  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  icon: {
    fontSize: 30,
    marginRight: 15,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 3,
  },

  optionDescription: {
    fontSize: 13,
    color: '#64748B',
  },

  back: {
    textAlign: 'center',
    color: '#4338CA',
    fontWeight: '600',
    marginTop: 15,
  },
});
import { View, Text, StyleSheet } from 'react-native';

export default function CompanyProfile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Company Profile</Text>
      <Text>This page is coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
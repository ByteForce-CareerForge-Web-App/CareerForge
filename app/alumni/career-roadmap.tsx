import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlumniCareerRoadmapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Career Roadmap</Text>
      <Text style={styles.text}>
        Alumni career roadmap coming soon.
      </Text>
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
    fontWeight: '700',
    marginBottom: 10,
  },

  text: {
    fontSize: 16,
    color: '#666',
  },
});
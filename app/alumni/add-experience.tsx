import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const ALUMNI_EXPERIENCE_KEY = 'careerforge_alumni_experience';

type Experience = {
  id: string;
  jobTitle: string;
  company: string;
  startYear: string;
  endYear: string;
  description: string;
};

export default function AddExperienceScreen() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!jobTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter your job title.');
      return;
    }

    if (!company.trim()) {
      Alert.alert('Missing Information', 'Please enter the company name.');
      return;
    }

    if (!startYear.trim()) {
      Alert.alert('Missing Information', 'Please enter your start year.');
      return;
    }

    setSaving(true);

    try {
      const existingData = await AsyncStorage.getItem(
        ALUMNI_EXPERIENCE_KEY
      );

      const existingExperiences: Experience[] = existingData
        ? JSON.parse(existingData)
        : [];

      const newExperience: Experience = {
        id: Date.now().toString(),
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        startYear: startYear.trim(),
        endYear: endYear.trim() || 'Present',
        description: description.trim(),
      };

      const updatedExperiences = [
        ...existingExperiences,
        newExperience,
      ];

      await AsyncStorage.setItem(
        ALUMNI_EXPERIENCE_KEY,
        JSON.stringify(updatedExperiences)
      );

      Alert.alert(
        'Experience Added',
        'Your professional experience has been added successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/alumni/profile');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error saving alumni experience:', error);

      Alert.alert(
        'Error',
        'Something went wrong while saving your experience.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>Add Experience</Text>
          <Text style={styles.subtitle}>
            Add your professional experience
          </Text>
        </View>
      </View>

      {/* Job Title */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Job Title *</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Data Analyst"
          placeholderTextColor="#9CA3AF"
          value={jobTitle}
          onChangeText={setJobTitle}
        />
      </View>

      {/* Company */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Company *</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. ABC Technologies"
          placeholderTextColor="#9CA3AF"
          value={company}
          onChangeText={setCompany}
        />
      </View>

      {/* Start Year */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Start Year *</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 2024"
          placeholderTextColor="#9CA3AF"
          value={startYear}
          onChangeText={setStartYear}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      {/* End Year */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>End Year</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 2026 or leave blank"
          placeholderTextColor="#9CA3AF"
          value={endYear}
          onChangeText={setEndYear}
          keyboardType="numeric"
          maxLength={4}
        />

        <Text style={styles.helperText}>
          Leave blank if you currently work here.
        </Text>
      </View>

      {/* Description */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Description</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your responsibilities, achievements, and experience..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Save */}
      <Pressable
        style={[
          styles.saveButton,
          saving && styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Experience'}
        </Text>
      </Pressable>

      {/* Cancel */}
      <Pressable
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={saving}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  backText: {
    fontSize: 32,
    color: '#4F46E5',
    lineHeight: 34,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 3,
  },

  fieldContainer: {
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },

  textArea: {
    minHeight: 130,
    paddingTop: 14,
  },

  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },

  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },

  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
  },
});

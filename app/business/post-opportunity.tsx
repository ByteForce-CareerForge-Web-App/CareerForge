import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPPORTUNITIES_KEY =
  'careerforge_business_opportunities';

export default function PostOpportunityScreen() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [workArrangement, setWorkArrangement] =
    useState('');
  const [deadline, setDeadline] = useState('');
  const [positions, setPositions] = useState('');
  const [qualification, setQualification] =
    useState('');

  const handlePostOpportunity = async () => {
    if (
      !title.trim() ||
      !type ||
      !description.trim() ||
      !skills.trim() ||
      !location.trim() ||
      !workArrangement ||
      !deadline.trim() ||
      !positions.trim() ||
      !qualification.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete all fields before posting the opportunity.'
      );
      return;
    }

    try {
      const existingData =
        await AsyncStorage.getItem(
          OPPORTUNITIES_KEY
        );

      const existingOpportunities =
        existingData
          ? JSON.parse(existingData)
          : [];

      const newOpportunity = {
        id: Date.now().toString(),
        title: title.trim(),
        type,
        description: description.trim(),
        skills: skills.trim(),
        location: location.trim(),
        arrangement: workArrangement,
        deadline: deadline.trim(),
        positions: positions.trim(),
        qualification: qualification.trim(),
        applications: 0,
        shortlisted: 0,
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      const updatedOpportunities = [
        newOpportunity,
        ...existingOpportunities,
      ];

      await AsyncStorage.setItem(
        OPPORTUNITIES_KEY,
        JSON.stringify(updatedOpportunities)
      );

      Alert.alert(
        'Opportunity Posted',
        'Your opportunity has been posted successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                '/business/manage-opportunities'
              ),
          },
        ]
      );
    } catch (error) {
      console.log(
        'Error saving opportunity:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to save the opportunity. Please try again.'
      );
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
          <Text style={styles.headerTitle}>
            Post Opportunity
          </Text>

          <Text style={styles.headerSubtitle}>
            Find the right graduate talent for your
            business.
          </Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Opportunity Details
        </Text>

        <Text style={styles.label}>
          Opportunity Title
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Graduate Data Analyst"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>
          Opportunity Type
        </Text>

        <View style={styles.optionsRow}>
          {[
            'Internship',
            'Graduate Job',
            'Learnership',
          ].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.optionButton,
                type === option &&
                  styles.optionSelected,
              ]}
              onPress={() => setType(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  type === option &&
                    styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          placeholder="Describe the opportunity, responsibilities and expectations..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>
          Required Skills
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Python, SQL, Excel, Data Analysis"
          placeholderTextColor="#94A3B8"
          value={skills}
          onChangeText={setSkills}
        />
      </View>

      {/* Job Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Job Information
        </Text>

        <Text style={styles.label}>
          Location
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Durban, KwaZulu-Natal"
          placeholderTextColor="#94A3B8"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>
          Work Arrangement
        </Text>

        <View style={styles.optionsRow}>
          {[
            'On-site',
            'Hybrid',
            'Remote',
          ].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.optionButton,
                workArrangement === option &&
                  styles.optionSelected,
              ]}
              onPress={() =>
                setWorkArrangement(option)
              }
            >
              <Text
                style={[
                  styles.optionText,
                  workArrangement === option &&
                    styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>
          Application Deadline
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 30 September 2026"
          placeholderTextColor="#94A3B8"
          value={deadline}
          onChangeText={setDeadline}
        />

        <Text style={styles.label}>
          Number of Positions
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 5"
          placeholderTextColor="#94A3B8"
          value={positions}
          onChangeText={setPositions}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Minimum Qualification
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. BSc in Computer Science or related field"
          placeholderTextColor="#94A3B8"
          value={qualification}
          onChangeText={setQualification}
        />
      </View>

      {/* AI Matching */}
      <View style={styles.aiCard}>
        <Text style={styles.aiTitle}>
          ✨ AI Candidate Matching
        </Text>

        <Text style={styles.aiText}>
          CareerForgeAI will help identify students
          whose skills, qualifications and career
          goals match this opportunity.
        </Text>
      </View>

      {/* Buttons */}
      <Pressable
        style={styles.postButton}
        onPress={handlePostOpportunity}
      >
        <Text style={styles.postButtonText}>
          Post Opportunity
        </Text>
      </Pressable>

      <Pressable
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>
          Cancel
        </Text>
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
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#0D1B3E',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 32,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    color: '#A5B4FC',
    fontSize: 12,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 18,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },

  textArea: {
    height: 120,
    paddingTop: 12,
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },

  optionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },

  optionText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },

  optionTextSelected: {
    color: '#4F46E5',
  },

  aiCard: {
    backgroundColor: '#4338CA',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 18,
    padding: 18,
  },

  aiTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 7,
  },

  aiText: {
    color: '#C7D2FE',
    fontSize: 13,
    lineHeight: 19,
  },

  postButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  postButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
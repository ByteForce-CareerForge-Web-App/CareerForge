import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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
  const [salary, setSalary] = useState('');
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
        'Please complete all required fields before posting the opportunity.'
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
        salary: salary.trim(),
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
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerEyebrow}>
                RECRUITMENT
              </Text>

              <Text style={styles.headerTitle}>
                Post Opportunity
              </Text>

              <Text style={styles.headerSubtitle}>
                Find the right graduate talent for your business.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="briefcase-outline"
                size={21}
                color="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.headerAccent} />
        </View>

        {/* FORM INTRO */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="megaphone-outline"
              size={21}
              color="#2563EB"
            />
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              Create a new opportunity
            </Text>

            <Text style={styles.introText}>
              Provide clear details so the right candidates
              can discover and apply for your opportunity.
            </Text>
          </View>
        </View>

        {/* OPPORTUNITY DETAILS */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBlue}>
              <Ionicons
                name="document-text-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Opportunity Details
              </Text>

              <Text style={styles.sectionSubtitle}>
                Tell candidates what you are offering
              </Text>
            </View>
          </View>

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
                {type === option && (
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color="#2563EB"
                  />
                )}

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

          <Text style={styles.helperText}>
            Separate multiple skills with commas.
          </Text>
        </View>

        {/* JOB INFORMATION */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconGold}>
              <Ionicons
                name="briefcase-outline"
                size={19}
                color="#B88A17"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Job Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Provide the practical details
              </Text>
            </View>
          </View>

          <Text style={styles.label}>
            Location
          </Text>

          <View style={styles.inputWithIcon}>
            <Ionicons
              name="location-outline"
              size={17}
              color="#64748B"
            />

            <TextInput
              style={styles.iconInput}
              placeholder="e.g. Durban, KwaZulu-Natal"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
            />
          </View>

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
                {workArrangement === option && (
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color="#2563EB"
                  />
                )}

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

          {/* SALARY */}
          <Text style={styles.label}>
            Salary
            <Text style={styles.optionalText}>
              {' '}
              Optional
            </Text>
          </Text>

          <View style={styles.inputWithIcon}>
            <Ionicons
              name="cash-outline"
              size={17}
              color="#64748B"
            />

            <TextInput
              style={styles.iconInput}
              placeholder="e.g. R8,000 - R12,000 per month"
              placeholderTextColor="#94A3B8"
              value={salary}
              onChangeText={setSalary}
            />
          </View>

          <Text style={styles.helperText}>
            Leave blank if the salary is not specified.
          </Text>

          {/* DEADLINE */}
          <Text style={styles.label}>
            Application Deadline
          </Text>

          <View style={styles.inputWithIcon}>
            <Ionicons
              name="calendar-outline"
              size={17}
              color="#64748B"
            />

            <TextInput
              style={styles.iconInput}
              placeholder="e.g. 30 September 2026"
              placeholderTextColor="#94A3B8"
              value={deadline}
              onChangeText={setDeadline}
            />
          </View>

          {/* POSITIONS */}
          <Text style={styles.label}>
            Number of Positions
          </Text>

          <View style={styles.inputWithIcon}>
            <Ionicons
              name="people-outline"
              size={17}
              color="#64748B"
            />

            <TextInput
              style={styles.iconInput}
              placeholder="e.g. 5"
              placeholderTextColor="#94A3B8"
              value={positions}
              onChangeText={setPositions}
              keyboardType="numeric"
            />
          </View>

          {/* QUALIFICATION */}
          <Text style={styles.label}>
            Minimum Qualification
          </Text>

          <View style={styles.inputWithIcon}>
            <Ionicons
              name="school-outline"
              size={17}
              color="#64748B"
            />

            <TextInput
              style={styles.iconInput}
              placeholder="e.g. BSc in Computer Science or related field"
              placeholderTextColor="#94A3B8"
              value={qualification}
              onChangeText={setQualification}
            />
          </View>
        </View>

        {/* AI MATCHING */}
        <View style={styles.aiCard}>
          <View style={styles.aiTopRow}>
            <View style={styles.aiIcon}>
              <Ionicons
                name="sparkles-outline"
                size={20}
                color="#D4A72C"
              />
            </View>

            <View style={styles.aiHeading}>
              <Text style={styles.aiTitle}>
                AI Candidate Matching
              </Text>

              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>
                  CAREERFORGE AI
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.aiText}>
            CareerForgeAI will help identify students
            whose skills, qualifications and career
            goals match this opportunity.
          </Text>

          <View style={styles.aiFeatures}>
            <View style={styles.aiFeature}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color="#10B981"
              />

              <Text style={styles.aiFeatureText}>
                Skills matching
              </Text>
            </View>

            <View style={styles.aiFeature}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color="#10B981"
              />

              <Text style={styles.aiFeatureText}>
                Qualification matching
              </Text>
            </View>

            <View style={styles.aiFeature}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color="#10B981"
              />

              <Text style={styles.aiFeatureText}>
                Career goal matching
              </Text>
            </View>
          </View>
        </View>

        {/* BUTTONS */}
        <Pressable
          style={styles.postButton}
          onPress={handlePostOpportunity}
        >
          <Ionicons
            name="paper-plane-outline"
            size={18}
            color="#FFFFFF"
          />

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

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  content: {
    paddingBottom: 35,
  },

  /* HEADER */

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#9FB3CC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  headerAccent: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D4A72C',
    marginTop: 14,
    marginLeft: 54,
  },

  /* INTRO */

  introCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 17,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 7,
    elevation: 1,
  },

  introIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },

  introText: {
    color: '#64748B',
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 4,
  },

  /* FORM CARDS */

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 15,
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1F3A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  sectionIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionIconGold: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
    marginTop: 15,
  },

  optionalText: {
    color: '#94A3B8',
    fontWeight: '500',
  },

  input: {
    minHeight: 45,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13,
    color: '#0F172A',
  },

  textArea: {
    height: 115,
    paddingTop: 12,
  },

  inputWithIcon: {
    minHeight: 45,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    paddingVertical: 11,
    paddingLeft: 9,
  },

  helperText: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 5,
    lineHeight: 14,
  },

  /* OPTIONS */

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    minHeight: 39,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    paddingHorizontal: 11,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  optionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },

  optionText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },

  optionTextSelected: {
    color: '#1D4ED8',
  },

  /* AI */

  aiCard: {
    backgroundColor: '#0B1F3A',
    marginHorizontal: 18,
    marginTop: 15,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#17355B',
  },

  aiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      'rgba(212,167,44,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor:
      'rgba(212,167,44,0.25)',
  },

  aiHeading: {
    flex: 1,
  },

  aiTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor:
      'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 4,
  },

  aiBadgeText: {
    color: '#D4A72C',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  aiText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 13,
  },

  aiFeatures: {
    marginTop: 13,
    gap: 7,
  },

  aiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiFeatureText: {
    color: '#E2E8F0',
    fontSize: 10.5,
    marginLeft: 7,
  },

  /* BUTTONS */

  postButton: {
    backgroundColor: '#2563EB',
    marginHorizontal: 18,
    marginTop: 21,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 2,
  },

  postButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  cancelButton: {
    marginHorizontal: 18,
    marginTop: 7,
    minHeight: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 20,
  },
});
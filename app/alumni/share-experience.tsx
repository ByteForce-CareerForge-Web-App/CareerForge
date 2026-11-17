import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/api';

type Experience = {
  id: string;
  title: string;
  category: string;
  description: string;
  fullExperience: string;
  advice: string;
  date: string;
};

export default function ShareExperience() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Career Advice');
  const [experience, setExperience] = useState('');
  const [advice, setAdvice] = useState('');

  const [sharedExperiences, setSharedExperiences] = useState<Experience[]>(
    []
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Career Advice',
    'Industry Experience',
    'Graduate Journey',
    'Leadership',
    'Skills & Learning',
  ];

  const handleUnauthorized = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');

    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  const loadExperiences = useCallback(async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        await handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/alumni/shared-experiences.php`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 401) {
        await handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to load shared experiences.'
        );
      }

      const experiences = Array.isArray(result.data?.experiences)
        ? result.data.experiences
        : [];

      const mappedExperiences: Experience[] = experiences.map(
        (item: any) => ({
          id: String(item.id),
          title: String(item.title ?? ''),
          category: String(item.category ?? ''),
          description: String(
            item.description ??
              String(item.experience ?? '').substring(0, 150)
          ),
          fullExperience: String(
            item.experience ?? ''
          ),
          advice: String(item.advice ?? ''),
          date: String(item.date ?? 'Recently shared'),
        })
      );

      setSharedExperiences(mappedExperiences);
    } catch (error) {
      console.log('Error loading shared experiences:', error);

      Alert.alert(
        'Error',
        'There was a problem loading your shared experiences.'
      );

      setSharedExperiences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExperiences();
    }, [loadExperiences])
  );

  async function handlePublish() {
    if (!title.trim()) {
      Alert.alert(
        'Missing Title',
        'Please enter a title for your experience.'
      );
      return;
    }

    if (!experience.trim()) {
      Alert.alert(
        'Missing Experience',
        'Please share your career experience before publishing.'
      );
      return;
    }

    if (!advice.trim()) {
      Alert.alert(
        'Missing Advice',
        'Please add some advice for students and graduates.'
      );
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        await handleUnauthorized();
        return;
      }

      const payload = {
        title: title.trim(),
        category,
        experience: experience.trim(),
        advice: advice.trim(),
      };

      let response;

      if (editingId) {
        response = await fetch(
          `${API_BASE_URL}/alumni/shared-experiences.php`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              id: Number(editingId),
              ...payload,
            }),
          }
        );
      } else {
        response = await fetch(
          `${API_BASE_URL}/alumni/shared-experiences.php`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );
      }

      if (response.status === 401) {
        await handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            (editingId
              ? 'Unable to update your experience.'
              : 'Unable to publish your experience.')
        );
      }

      await loadExperiences();

      if (editingId) {
        Alert.alert(
          'Experience Updated',
          'Your career experience has been updated successfully.'
        );
      } else {
        Alert.alert(
          'Experience Published',
          'Your career experience has been published successfully.'
        );
      }

      clearForm();
    } catch (error) {
      console.log('Error saving shared experience:', error);

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'There was a problem saving your experience.'
      );
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setTitle('');
    setCategory('Career Advice');
    setExperience('');
    setAdvice('');
    setEditingId(null);
  }

  function handlePreview() {
    if (!title.trim() && !experience.trim()) {
      Alert.alert(
        'Nothing to Preview',
        'Please enter some content first.'
      );
      return;
    }

    Alert.alert(
      'Experience Preview',
      `${title || 'Untitled Experience'}\n\n${
        experience || 'No experience added yet.'
      }\n\nAdvice:\n${advice || 'No advice added yet.'}`
    );
  }

  function handleEdit(item: Experience) {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setExperience(item.fullExperience);
    setAdvice(item.advice);

    Alert.alert(
      'Edit Mode',
      'The experience has been loaded into the form. Make your changes and tap Update Experience.'
    );
  }

  function handleDelete(item: Experience) {
    Alert.alert(
      'Delete Experience',
      `Are you sure you want to delete "${item.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const token = await AsyncStorage.getItem('authToken');

              if (!token) {
                await handleUnauthorized();
                return;
              }

              const response = await fetch(
                `${API_BASE_URL}/alumni/shared-experiences.php`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                  },
                  body: JSON.stringify({
                    id: Number(item.id),
                  }),
                }
              );

              if (response.status === 401) {
                await handleUnauthorized();
                return;
              }

              const result = await response.json();

              if (!response.ok || !result.success) {
                throw new Error(
                  result.message ||
                    'Unable to delete your experience.'
                );
              }

              setSharedExperiences((currentExperiences) =>
                currentExperiences.filter(
                  (experienceItem) =>
                    experienceItem.id !== item.id
                )
              );

              if (editingId === item.id) {
                clearForm();
              }

              Alert.alert(
                'Experience Deleted',
                'Your career experience has been deleted successfully.'
              );
            } catch (error) {
              console.log(
                'Error deleting shared experience:',
                error
              );

              Alert.alert(
                'Error',
                error instanceof Error
                  ? error.message
                  : 'There was a problem deleting your experience.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>
            Share Experience
          </Text>

          <Text style={styles.subtitle}>
            Share your career journey and inspire the next generation.
          </Text>
        </View>
      </View>

      {/* Introduction */}
      <View style={styles.introCard}>
        <View style={styles.introIcon}>
          <Text style={styles.introIconText}>
            💡
          </Text>
        </View>

        <View style={styles.introInfo}>
          <Text style={styles.introTitle}>
            Your experience matters
          </Text>

          <Text style={styles.introDescription}>
            Share the lessons, challenges and achievements that shaped
            your career. Your story could help another student make
            better career decisions.
          </Text>
        </View>
      </View>

      {/* Create Experience */}
      <Text style={styles.sectionTitle}>
        {editingId ? 'Edit Your Experience' : 'Create Your Experience'}
      </Text>

      {/* Title */}
      <Text style={styles.label}>
        Experience Title
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. How I Started My Career in Technology"
        placeholderTextColor="#94A3B8"
        value={title}
        onChangeText={setTitle}
      />

      {/* Category */}
      <Text style={styles.label}>
        Category
      </Text>

      <View style={styles.categoryContainer}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              category === item && styles.categoryButtonActive,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && styles.categoryTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Experience */}
      <Text style={styles.label}>
        Your Career Experience
      </Text>

      <TextInput
        style={styles.textArea}
        placeholder="Tell students about your career journey, challenges, achievements and important experiences..."
        placeholderTextColor="#94A3B8"
        value={experience}
        onChangeText={setExperience}
        multiline
        textAlignVertical="top"
      />

      {/* Advice */}
      <Text style={styles.label}>
        Advice for Students & Graduates
      </Text>

      <TextInput
        style={styles.textArea}
        placeholder="What advice would you give students preparing for their careers?"
        placeholderTextColor="#94A3B8"
        value={advice}
        onChangeText={setAdvice}
        multiline
        textAlignVertical="top"
      />

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.previewButton}
          onPress={handlePreview}
        >
          <Text style={styles.previewButtonText}>
            Preview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.publishButton}
          onPress={handlePublish}
          disabled={loading}
        >
          <Text style={styles.publishButtonText}>
            {editingId
              ? 'Update Experience'
              : 'Publish Experience'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cancel Edit */}
      {editingId && (
        <TouchableOpacity
          style={styles.cancelEditButton}
          onPress={clearForm}
        >
          <Text style={styles.cancelEditText}>
            Cancel Editing
          </Text>
        </TouchableOpacity>
      )}

      {/* Shared Experiences */}
      <Text style={styles.sectionTitle}>
        Your Shared Experiences
      </Text>

      {sharedExperiences.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💡</Text>

          <Text style={styles.emptyTitle}>
            No experiences shared yet
          </Text>

          <Text style={styles.emptyDescription}>
            Share your first career experience and inspire
            students on their career journey.
          </Text>
        </View>
      ) : (
        sharedExperiences.map((item) => (
          <View
            key={item.id}
            style={styles.experienceCard}
          >
            <View style={styles.experienceHeader}>
              <View style={styles.experienceIcon}>
                <Text style={styles.experienceIconText}>
                  💡
                </Text>
              </View>

              <View style={styles.experienceHeaderInfo}>
                <Text style={styles.experienceTitle}>
                  {item.title}
                </Text>

                <Text style={styles.experienceCategory}>
                  {item.category}
                </Text>
              </View>
            </View>

            <Text style={styles.experienceDescription}>
              {item.description}
              {item.fullExperience.length > 150 ? '...' : ''}
            </Text>

            <View style={styles.experienceFooter}>
              <Text style={styles.dateText}>
                {item.date}
              </Text>

              <View style={styles.manageButtons}>
                <TouchableOpacity
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.editText}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteText}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}

      {/* Community Message */}
      <View style={styles.communityCard}>
        <Text style={styles.communityTitle}>
          Inspire someone today 🌟
        </Text>

        <Text style={styles.communityDescription}>
          Your experience could give a student the confidence,
          knowledge or direction they need to take their next step.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 25,
    color: '#4F46E5',
    fontWeight: '600',
  },

  headerInfo: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#24243A',
  },

  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
    lineHeight: 18,
  },

  introCard: {
    backgroundColor: '#EAE8FF',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  introIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  introIconText: {
    fontSize: 27,
  },

  introInfo: {
    flex: 1,
  },

  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 6,
  },

  introDescription: {
    fontSize: 13,
    color: '#5F5F70',
    lineHeight: 19,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 14,
    marginTop: 5,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#424255',
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D8E5',
    borderRadius: 13,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#24243A',
    marginBottom: 8,
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },

  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D8E5',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginRight: 7,
    marginBottom: 8,
  },

  categoryButtonActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  textArea: {
    minHeight: 145,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D8E5',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingTop: 14,
    fontSize: 14,
    color: '#24243A',
    lineHeight: 21,
    marginBottom: 10,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 15,
  },

  previewButton: {
    width: '32%',
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  previewButtonText: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '700',
  },

  publishButton: {
    width: '65%',
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },

  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  cancelEditButton: {
    borderWidth: 1,
    borderColor: '#DD4444',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 25,
  },

  cancelEditText: {
    color: '#DD4444',
    fontSize: 13,
    fontWeight: '700',
  },

  experienceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
  },

  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  experienceIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  experienceIconText: {
    fontSize: 21,
  },

  experienceHeaderInfo: {
    flex: 1,
  },

  experienceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 4,
  },

  experienceCategory: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
  },

  experienceDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 19,
    marginBottom: 15,
  },

  experienceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateText: {
    fontSize: 11,
    color: '#999999',
  },

  manageButtons: {
    flexDirection: 'row',
    gap: 18,
  },

  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },

  deleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DD4444',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#24243A',
    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 19,
  },

  communityCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 20,
    marginTop: 10,
  },

  communityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 7,
  },

  communityDescription: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 20,
  },
});
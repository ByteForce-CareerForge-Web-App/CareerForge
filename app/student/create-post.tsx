import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const SOCIAL_POSTS_KEY = 'careerforge_social_posts';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const createPost = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      Alert.alert('Empty Post', 'Please write something before posting.');
      return;
    }

    if (trimmedContent.length > 500) {
      Alert.alert(
        'Post Too Long',
        'Your post can contain a maximum of 500 characters.'
      );
      return;
    }

    try {
      setPosting(true);

      const existingPosts = await AsyncStorage.getItem(
        SOCIAL_POSTS_KEY
      );

      const posts = existingPosts
        ? JSON.parse(existingPosts)
        : [];

      const newPost = {
        id: Date.now().toString(),
        name: 'You',
        role: 'Student • CareerForgeAI',
        initials: 'YO',
        time: 'Just now',
        content: trimmedContent,
        likes: 0,
        comments: 0,
        liked: false,
      };

      await AsyncStorage.setItem(
        SOCIAL_POSTS_KEY,
        JSON.stringify([newPost, ...posts])
      );

      Alert.alert(
        'Post Published 🎉',
        'Your post has been added to the social feed.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.log('Error creating post:', error);

      Alert.alert(
        'Error',
        'Something went wrong while creating your post.'
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/student/social-feed');
              }
            }}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Create Post</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.title}>Share something 🚀</Text>

          <Text style={styles.subtitle}>
            Share your career journey, achievements, advice,
            projects or opportunities with the CareerForgeAI
            community.
          </Text>
        </View>

        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>YO</Text>
          </View>

          <View>
            <Text style={styles.profileName}>You</Text>
            <Text style={styles.profileRole}>
              Student • CareerForgeAI
            </Text>
          </View>
        </View>

        {/* Post Input */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#8A94A6"
            multiline
            maxLength={500}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          <Text style={styles.characterCount}>
            {content.length}/500
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Post ideas</Text>

          <Text style={styles.tip}>
            • Share a project you are working on
          </Text>

          <Text style={styles.tip}>
            • Celebrate a new achievement
          </Text>

          <Text style={styles.tip}>
            • Give career advice to other students
          </Text>

          <Text style={styles.tip}>
            • Share useful learning resources
          </Text>

          <Text style={styles.tip}>
            • Ask the community a career-related question
          </Text>
        </View>

        {/* Post Button */}
        <Pressable
          style={[
            styles.postButton,
            posting && styles.postButtonDisabled,
          ]}
          onPress={createPost}
          disabled={posting}
        >
          <Text style={styles.postButtonText}>
            {posting ? 'Publishing...' : 'Publish Post'}
          </Text>
        </Pressable>

        {/* Cancel */}
        <Pressable
          style={styles.cancelButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/student/social-feed');
            }
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    height: 90,
    backgroundColor: '#0B1F3A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 30,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  headerSpacer: {
    width: 42,
  },

  intro: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 18,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
  },

  profileCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  profileName: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
  },

  profileRole: {
    color: '#667085',
    fontSize: 13,
    marginTop: 3,
  },

  inputCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    padding: 16,
    minHeight: 190,
  },

  input: {
    flex: 1,
    minHeight: 140,
    color: '#0B1F3A',
    fontSize: 16,
    lineHeight: 24,
  },

  characterCount: {
    textAlign: 'right',
    color: '#8A94A6',
    fontSize: 12,
    marginTop: 8,
  },

  tipsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },

  tipsTitle: {
    color: '#0B1F3A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },

  tip: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 22,
  },

  postButton: {
    marginHorizontal: 20,
    marginTop: 22,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  postButtonDisabled: {
    opacity: 0.6,
  },

  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  cancelButton: {
    height: 50,
    marginHorizontal: 20,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '700',
  },
});
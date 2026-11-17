
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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/api';

const SOCIAL_POSTS_KEY = 'careerforge_social_posts';

const COLORS = {
  primary: '#2457E6',
  primaryDark: '#173FBD',
  deepBlue: '#102A72',
  darkBlue: '#172A55',
  brightBlue: '#4C7DFF',
  light: '#E8F0FF',
  veryLight: '#F3F6FF',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#172033',
  secondaryText: '#667085',
  muted: '#98A2B3',
  border: '#E4E7EC',
  green: '#258A50',
};

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access to add an image to your post.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Image picker error:', error);

      Alert.alert(
        'Unable to Select Image',
        'Something went wrong while selecting the image.'
      );
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const createPost = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent && !selectedImage) {
      Alert.alert(
        'Empty Post',
        'Please write something or add an image before posting.'
      );
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

      /*
      |--------------------------------------------------------------------------
      | AUTH TOKEN
      |--------------------------------------------------------------------------
      */

      const token =
        await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in again before creating a post.'
        );
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE POST IN BACKEND
      |--------------------------------------------------------------------------
      */

      const response = await fetch(
        `${API_BASE_URL}/create-post.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            content: trimmedContent,
            image_uri: selectedImage || '',
          }),
        }
      );

      let result: any = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        console.log(
          'Create post backend error:',
          result
        );

        if (response.status === 401) {
          Alert.alert(
            'Session Expired',
            'Please log in again before creating a post.'
          );
          return;
        }

        Alert.alert(
          'Unable to Publish',
          result?.message ||
            'Something went wrong while creating your post.'
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | LOCAL SYNC
      |--------------------------------------------------------------------------
      |
      | Keep the existing local storage behavior so the
      | current app flow remains compatible.
      |
      */

      const existingPosts =
        await AsyncStorage.getItem(
          SOCIAL_POSTS_KEY
        );

      let posts: any[] = [];

      if (existingPosts) {
        try {
          const parsed = JSON.parse(existingPosts);

          if (Array.isArray(parsed)) {
            posts = parsed;
          }
        } catch {
          posts = [];
        }
      }

      const newPost = {
        id: String(result.id),
        name: 'You',
        role: 'Student • CareerForgeAI',
        initials: 'YO',
        time: 'Just now',
        content: trimmedContent,
        imageUri: selectedImage || undefined,
        likes: 0,
        comments: 0,
        liked: false,
      };

      await AsyncStorage.setItem(
        SOCIAL_POSTS_KEY,
        JSON.stringify([
          newPost,
          ...posts,
        ])
      );

      setContent('');
      setSelectedImage(null);

      Alert.alert(
        'Post Published',
        'Your post has been added to the CareerForge community.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.log(
        'Error creating post:',
        error
      );

      Alert.alert(
        'Error',
        'Something went wrong while creating your post.'
      );
    } finally {
      setPosting(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/student/social-feed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
      keyboardVerticalOffset={
        Platform.OS === 'ios' ? 0 : 20
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={goBack}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={COLORS.primary}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Create Post
            </Text>

            <Text style={styles.headerSubtitle}>
              Share with your network
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Intro */}
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons
              name="create-outline"
              size={24}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.introTextContainer}>
            <Text style={styles.title}>
              Share with the community
            </Text>

            <Text style={styles.subtitle}>
              Share your career journey,
              achievements, projects, advice or
              opportunities with other CareerForge
              students and alumni.
            </Text>
          </View>
        </View>

        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              YO
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              You
            </Text>

            <Text style={styles.profileRole}>
              Student • CareerForgeAI
            </Text>
          </View>

          <View style={styles.studentBadge}>
            <Ionicons
              name="school-outline"
              size={14}
              color={COLORS.primary}
            />

            <Text style={styles.studentBadgeText}>
              Student
            </Text>
          </View>
        </View>

        {/* Text Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>
            Your post
          </Text>

          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#98A2B3"
            multiline
            maxLength={500}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            returnKeyType="default"
          />

          <View style={styles.inputFooter}>
            <View style={styles.inputHint}>
              <Ionicons
                name="text-outline"
                size={14}
                color={COLORS.muted}
              />

              <Text style={styles.inputHintText}>
                Keep your community updated
              </Text>
            </View>

            <Text style={styles.characterCount}>
              {content.length}/500
            </Text>
          </View>
        </View>

        {/* Selected Image */}
        {selectedImage && (
          <View style={styles.imageCard}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
              resizeMode="cover"
            />

            <Pressable
              style={styles.removeImageButton}
              onPress={removeImage}
            >
              <Ionicons
                name="close"
                size={18}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.imageAttachedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.green}
              />

              <Text style={styles.imageAttachedText}>
                Image attached
              </Text>
            </View>
          </View>
        )}

        {/* Add Image */}
        <Pressable
          style={styles.imageButton}
          onPress={pickImage}
        >
          <View style={styles.imageIconContainer}>
            <Ionicons
              name="image-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.imageButtonText}>
            <Text style={styles.imageButtonTitle}>
              {selectedImage
                ? 'Change Image'
                : 'Add Image'}
            </Text>

            <Text style={styles.imageButtonSubtitle}>
              Add a photo to your post
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="#98A2B3"
          />
        </Pressable>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIcon}>
              <Ionicons
                name="bulb-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.tipsTitle}>
              Post ideas
            </Text>
          </View>

          <View style={styles.tipRow}>
            <View style={styles.tipBullet}>
              <Ionicons
                name="folder-outline"
                size={15}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.tip}>
              Share a project you are working on
            </Text>
          </View>

          <View style={styles.tipRow}>
            <View style={styles.tipBullet}>
              <Ionicons
                name="trophy-outline"
                size={15}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.tip}>
              Celebrate a new achievement
            </Text>
          </View>

          <View style={styles.tipRow}>
            <View style={styles.tipBullet}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={15}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.tip}>
              Give career advice to other students
            </Text>
          </View>

          <View style={styles.tipRow}>
            <View style={styles.tipBullet}>
              <Ionicons
                name="book-outline"
                size={15}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.tip}>
              Share useful learning resources
            </Text>
          </View>

          <View style={styles.tipRow}>
            <View style={styles.tipBullet}>
              <Ionicons
                name="help-circle-outline"
                size={15}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.tip}>
              Ask the community a career-related question
            </Text>
          </View>
        </View>

        {/* Publish */}
        <Pressable
          style={[
            styles.postButton,
            posting &&
              styles.postButtonDisabled,
          ]}
          onPress={createPost}
          disabled={posting}
        >
          <Ionicons
            name={
              posting
                ? 'hourglass-outline'
                : 'paper-plane-outline'
            }
            size={18}
            color="#FFFFFF"
            style={styles.postIcon}
          />

          <Text style={styles.postButtonText}>
            {posting
              ? 'Publishing...'
              : 'Publish Post'}
          </Text>
        </Pressable>

        {/* Cancel */}
        <Pressable
          style={styles.cancelButton}
          onPress={goBack}
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 45,
  },

  header: {
    minHeight: 90,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#D9E2F5',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 2,
  },

  headerSpacer: {
    width: 42,
  },

  intro: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.veryLight,
    borderRadius: 17,
    padding: 17,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#C9D8FF',
  },

  introIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  introTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.secondaryText,
  },

  profileCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  profileRole: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 3,
  },

  studentBadge: {
    backgroundColor: COLORS.light,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  inputCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    minHeight: 200,
  },

  inputLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },

  input: {
    minHeight: 130,
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
  },

  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },

  inputHint: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  inputHintText: {
    color: COLORS.muted,
    fontSize: 11,
    marginLeft: 5,
  },

  characterCount: {
    color: COLORS.muted,
    fontSize: 11,
    marginLeft: 10,
  },

  imageCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  previewImage: {
    width: '100%',
    height: 230,
  },

  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(23,42,85,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageAttachedBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageAttachedText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  imageButton: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 68,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageButtonText: {
    flex: 1,
    marginLeft: 12,
  },

  imageButtonTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  imageButtonSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 2,
  },

  tipsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  tipsIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  tipsTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  tipBullet: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: COLORS.veryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  tip: {
    flex: 1,
    color: COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },

  postButton: {
    marginHorizontal: 20,
    marginTop: 22,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  postButtonDisabled: {
    opacity: 0.6,
  },

  postIcon: {
    marginRight: 8,
  },

  postButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },

  cancelButton: {
    height: 50,
    marginHorizontal: 20,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    color: COLORS.secondaryText,
    fontSize: 15,
    fontWeight: '700',
  },
});

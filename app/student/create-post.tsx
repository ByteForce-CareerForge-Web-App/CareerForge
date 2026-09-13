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

const SOCIAL_POSTS_KEY = 'careerforge_social_posts';

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
        id: Date.now().toString(),
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
              name="arrow-back"
              size={23}
              color="#FFFFFF"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Create Post
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Intro */}
        <View style={styles.intro}>
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
        </View>

        {/* Text Input */}
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
            returnKeyType="default"
          />

          <Text style={styles.characterCount}>
            {content.length}/500
          </Text>
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
              color="#2563EB"
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
            color="#94A3B8"
          />
        </Pressable>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>
            Post ideas
          </Text>

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
    backgroundColor: '#F5F7FA',
  },

  scrollContent: {
    paddingBottom: 45,
  },

  header: {
    minHeight: 90,
    backgroundColor: '#0B1F3A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
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

  profileInfo: {
    flex: 1,
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

  imageCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: 'rgba(11,31,58,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageButton: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    minHeight: 68,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageButtonText: {
    flex: 1,
    marginLeft: 12,
  },

  imageButtonTitle: {
    color: '#0B1F3A',
    fontSize: 14,
    fontWeight: '800',
  },

  imageButtonSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Comment = {
  id: string;
  name: string;
  initials: string;
  text: string;
  time: string;
};

const COMMENTS_KEY = 'careerforge_post_comments';

export default function CommentsScreen() {
  const params = useLocalSearchParams();

  const postId = String(params.postId || '');
  const postName = String(params.postName || 'Post');
  const postContent = String(params.postContent || '');

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const savedComments =
        await AsyncStorage.getItem(COMMENTS_KEY);

      if (savedComments) {
        const allComments = JSON.parse(savedComments);

        setComments(allComments[postId] || []);
      }
    } catch (error) {
      console.log('Error loading comments:', error);
    }
  };

  const addComment = async () => {
    const trimmedComment = newComment.trim();

    if (!trimmedComment) {
      Alert.alert(
        'Empty Comment',
        'Please write something before posting.'
      );
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      name: 'You',
      initials: 'YO',
      text: trimmedComment,
      time: 'Just now',
    };

    const updatedComments = [comment, ...comments];

    setComments(updatedComments);
    setNewComment('');

    try {
      const savedComments =
        await AsyncStorage.getItem(COMMENTS_KEY);

      const allComments = savedComments
        ? JSON.parse(savedComments)
        : {};

      allComments[postId] = updatedComments;

      await AsyncStorage.setItem(
        COMMENTS_KEY,
        JSON.stringify(allComments)
      );
    } catch (error) {
      console.log('Error saving comment:', error);
    }
  };

  const renderComment = ({
    item,
  }: {
    item: Comment;
  }) => {
    return (
      <View style={styles.commentCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.initials}
          </Text>
        </View>

        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentName}>
              {item.name}
            </Text>

            <Text style={styles.commentTime}>
              {item.time}
            </Text>
          </View>

          <Text style={styles.commentText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
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
          <Ionicons
            name="chevron-back"
            size={24}
            color="#2457E6"
          />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Comments
          </Text>

          <Text style={styles.headerSubtitle}>
            Join the conversation
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Original Post */}
      <View style={styles.postPreview}>
        <View style={styles.postLabelRow}>
          <View style={styles.postIcon}>
            <Ionicons
              name="document-text-outline"
              size={17}
              color="#2457E6"
            />
          </View>

          <Text style={styles.postLabel}>
            ORIGINAL POST
          </Text>
        </View>

        <Text style={styles.postAuthor}>
          {postName}
        </Text>

        <Text
          style={styles.postPreviewText}
          numberOfLines={4}
        >
          {postContent}
        </Text>
      </View>

      {/* Comments */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={styles.commentsList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {comments.length === 0
                ? 'No comments yet'
                : `${comments.length} ${
                    comments.length === 1
                      ? 'Comment'
                      : 'Comments'
                  }`}
            </Text>

            {comments.length > 0 && (
              <View style={styles.commentCountBadge}>
                <Text style={styles.commentCountText}>
                  {comments.length}
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={30}
                color="#2457E6"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Start the conversation
            </Text>

            <Text style={styles.emptyText}>
              Be the first person to comment on this
              post.
            </Text>
          </View>
        }
      />

      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            placeholderTextColor="#98A2B3"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
        </View>

        <Pressable
          style={[
            styles.sendButton,
            !newComment.trim() &&
              styles.sendButtonDisabled,
          ]}
          onPress={addComment}
          disabled={!newComment.trim()}
        >
          <Ionicons
            name="send"
            size={18}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  header: {
    minHeight: 96,
    paddingTop: 38,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: '#172A55',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#102247',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#C9D7F5',
    fontSize: 11,
    marginTop: 2,
  },

  headerSpacer: {
    width: 42,
  },

  postPreview: {
    backgroundColor: '#F3F6FF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 18,
    padding: 17,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#D5E1F7',
    shadowColor: '#102A72',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  postLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  postIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  postLabel: {
    color: '#173FBD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  postAuthor: {
    color: '#172A55',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  postPreviewText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
  },

  commentsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#172A55',
    fontSize: 17,
    fontWeight: '800',
  },

  commentCountBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  commentCountText: {
    color: '#2457E6',
    fontSize: 11,
    fontWeight: '800',
  },

  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D9E2F2',
    shadowColor: '#102A72',
    shadowOpacity: 0.045,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '800',
  },

  commentContent: {
    flex: 1,
    marginLeft: 11,
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  commentName: {
    color: '#172A55',
    fontSize: 14,
    fontWeight: '800',
  },

  commentTime: {
    color: '#98A2B3',
    fontSize: 11,
  },

  commentText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 38,
    paddingHorizontal: 35,
  },

  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#E8F0FF',
    borderWidth: 1,
    borderColor: '#C9D8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    color: '#172A55',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },

  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D9E2F2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  inputWrapper: {
    flex: 1,
    minHeight: 46,
    maxHeight: 100,
    backgroundColor: '#F5F7FC',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#D9E2F2',
    justifyContent: 'center',
  },

  input: {
    minHeight: 44,
    maxHeight: 98,
    paddingHorizontal: 16,
    paddingVertical: 11,
    color: '#172A55',
    fontSize: 14,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2457E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#2457E6',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  sendButtonDisabled: {
    backgroundColor: '#B8C1D1',
  },
});

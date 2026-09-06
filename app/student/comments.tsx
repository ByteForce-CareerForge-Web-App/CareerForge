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
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Comments
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Original Post */}
      <View style={styles.postPreview}>
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
          <Text style={styles.sectionTitle}>
            {comments.length === 0
              ? 'No comments yet'
              : `${comments.length} ${
                  comments.length === 1
                    ? 'Comment'
                    : 'Comments'
                }`}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              💬
            </Text>

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
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          placeholderTextColor="#94A3B8"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />

        <Pressable
          style={styles.sendButton}
          onPress={addComment}
        >
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#0B1F3A',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    color: '#FFFFFF',
    fontSize: 30,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  headerSpacer: {
    width: 42,
  },

  postPreview: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  postAuthor: {
    color: '#0B1F3A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },

  postPreviewText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
  },

  commentsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  sectionTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },

  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  commentContent: {
    flex: 1,
    marginLeft: 10,
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  commentName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  commentTime: {
    color: '#94A3B8',
    fontSize: 11,
  },

  commentText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 17,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },

  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    color: '#0F172A',
    fontSize: 14,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  sendText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

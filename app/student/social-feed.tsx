import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/constants/api';

type Post = {
  id: string;
  name: string;
  role: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  icon?: string;
  initials?: string;
  imageUri?: string;
  liked?: boolean;
};

type Comment = {
  id: string;
  postId: string;
  name: string;
  text: string;
  time: string;
};

type BackendPost = {
  id: number | string;
  user_id?: number | string;
  content?: string | null;
  image_uri?: string | null;
  created_at?: string;
  full_name?: string;
  role?: string;
  likes_count?: number | string;
  comments_count?: number | string;
  liked?: boolean | number;
  initials?: string;
};

type BackendComment = {
  id: number | string;
  post_id: number | string;
  user_id?: number | string;
  comment_text?: string;
  full_name?: string;
  created_at?: string;
};

const formatTime = (dateString?: string) => {
  if (!dateString) {
    return 'Just now';
  }

  const date = new Date(
    dateString.includes('T')
      ? dateString
      : dateString.replace(' ', 'T')
  );

  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return 'Yesterday';
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
};

const mapBackendPost = (
  post: BackendPost
): Post => {
  const likes = Number(post.likes_count ?? 0);
  const comments = Number(post.comments_count ?? 0);

  return {
    id: String(post.id),
    name: post.full_name || 'CareerForge User',
    role: post.role || 'CareerForgeAI Community Member',
    time: formatTime(post.created_at),
    content: post.content || '',
    likes: Number.isFinite(likes) ? likes : 0,
    comments: Number.isFinite(comments)
      ? comments
      : 0,
    icon: 'person',
    initials: post.initials,
    imageUri: post.image_uri || undefined,
    liked:
      post.liked === true ||
      post.liked === 1 ||
      post.liked === '1',
  };
};

const mapBackendComment = (
  comment: BackendComment
): Comment => {
  return {
    id: String(comment.id),
    postId: String(comment.post_id),
    name: comment.full_name || 'CareerForge User',
    text: comment.comment_text || '',
    time: formatTime(comment.created_at),
  };
};

/*
|--------------------------------------------------------------------------
| SAFE JSON RESPONSE PARSER
|--------------------------------------------------------------------------
|
| This prevents:
|
| SyntaxError: JSON Parse error: Unexpected character: <
|
| from hiding the actual PHP/server response.
|
*/

const parseJsonResponse = async (
  response: Response,
  endpointName: string
) => {
  const rawResponse = await response.text();

  console.log(
    `${endpointName} HTTP status:`,
    response.status
  );

  console.log(
    `${endpointName} raw response:`,
    rawResponse
  );

  let result: any;

  try {
    result = JSON.parse(rawResponse);
  } catch (error) {
    console.log(
      `${endpointName} JSON parse error:`,
      error
    );

    throw new Error(
      `${endpointName} returned invalid JSON. HTTP ${response.status}. Check the console for the raw PHP response.`
    );
  }

  console.log(
    `${endpointName} parsed response:`,
    result
  );

  return result;
};

export default function SocialFeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>(
    []
  );
  const [comments, setComments] = useState<Comment[]>(
    []
  );

  const [selectedPost, setSelectedPost] =
    useState<Post | null>(null);

  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadComments = async (
    postId?: string
  ) => {
    try {
      const token = await AsyncStorage.getItem(
        'authToken'
      );

      if (!token) {
        return;
      }

      const url = postId
        ? `${API_BASE_URL}/comments.php?post_id=${encodeURIComponent(
            postId
          )}`
        : `${API_BASE_URL}/comments.php`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const result = await parseJsonResponse(
        response,
        'Comments API'
      );

      if (!response.ok || !result.success) {
        console.log(
          'Comments API error:',
          result?.message
        );
        return;
      }

      const backendComments = Array.isArray(
        result.data
      )
        ? result.data
        : [];

      const mappedComments =
        backendComments.map(mapBackendComment);

      if (postId) {
        setComments((currentComments) => {
          const otherComments =
            currentComments.filter(
              (comment) =>
                comment.postId !== String(postId)
            );

          return [
            ...otherComments,
            ...mappedComments,
          ];
        });
      } else {
        setComments(mappedComments);
      }
    } catch (error) {
      console.log(
        'Error loading comments:',
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadFeed = async () => {
        try {
          setLoading(true);

          const token = await AsyncStorage.getItem(
            'authToken'
          );

          if (!token) {
            if (active) {
              setPosts([]);
              setLikedPosts([]);
              setComments([]);
            }

            return;
          }

          const response = await fetch(
            `${API_BASE_URL}/social-feed.php`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }
          );

          /*
          |--------------------------------------------------------------------------
          | IMPORTANT DIAGNOSTIC CHANGE
          |--------------------------------------------------------------------------
          |
          | Do NOT use response.json() directly here.
          |
          | If PHP returns HTML, such as a PHP warning,
          | fatal error, 404 page, etc., response.json()
          | produces:
          |
          | SyntaxError: JSON Parse error:
          | Unexpected character: <
          |
          | We now read the response as text first so
          | the actual PHP response appears in the console.
          |
          */

          const result = await parseJsonResponse(
            response,
            'Social feed'
          );

          if (response.status === 401) {
            if (active) {
              router.replace('/login');
            }

            return;
          }

          if (!response.ok || !result.success) {
            throw new Error(
              result?.message ||
                `Social feed request failed. HTTP ${response.status}`
            );
          }

          const backendPosts: BackendPost[] =
            Array.isArray(result.data)
              ? result.data
              : [];

          if (!active) {
            return;
          }

          const mappedPosts =
            backendPosts.map(mapBackendPost);

          setPosts(mappedPosts);

          const backendLikedPosts =
            mappedPosts
              .filter((post) => post.liked)
              .map((post) => post.id);

          setLikedPosts(backendLikedPosts);

          
        } catch (error) {
          console.log(
            'Error loading social feed:',
            error
          );

          if (active) {
            setPosts([]);
            setLikedPosts([]);
            setComments([]);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadFeed();

      return () => {
        active = false;
      };
    }, [])
  );

  const handleLike = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem(
        'authToken'
      );

      if (!token) {
        Alert.alert(
          'Login required',
          'Please log in to like posts.'
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/social-feed.php`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            action: 'like',
            post_id: Number(postId),
          }),
        }
      );

      const result = await parseJsonResponse(
        response,
        'Like API'
      );

      if (response.status === 401) {
        router.replace('/login');
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message ||
            'Unable to update like.'
        );
      }

      const liked =
        result.liked === true ||
        result.liked === 1 ||
        result.liked === '1';

      const likeCount = Number(
        result.likes_count ??
          result.likes ??
          0
      );

      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          return {
            ...post,
            liked,
            likes: Number.isFinite(likeCount)
              ? likeCount
              : post.likes,
          };
        })
      );

      setLikedPosts((currentLikedPosts) => {
        if (liked) {
          if (
            currentLikedPosts.includes(postId)
          ) {
            return currentLikedPosts;
          }

          return [
            ...currentLikedPosts,
            postId,
          ];
        }

        return currentLikedPosts.filter(
          (id) => id !== postId
        );
      });
    } catch (error) {
      console.log(
        'Error updating like:',
        error
      );

      Alert.alert(
        'Like failed',
        'Unable to update the like right now.'
      );
    }
  };

  const openComments = async (post: Post) => {
    setSelectedPost(post);
    setCommentText('');

    await loadComments(post.id);
  };

  const closeComments = () => {
    setSelectedPost(null);
    setCommentText('');
  };

  const handleAddComment = async () => {
    if (!selectedPost) {
      return;
    }

    const trimmedComment =
      commentText.trim();

    if (!trimmedComment) {
      Alert.alert(
        'Add a comment',
        'Please enter a comment first.'
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem(
        'authToken'
      );

      if (!token) {
        Alert.alert(
          'Login required',
          'Please log in to comment.'
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/comments.php?post_id=${Number(selectedPost.id)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            post_id: Number(
              selectedPost.id
            ),
            text: trimmedComment,
          }),
        }
      );

      const result = await parseJsonResponse(
        response,
        'Comment API'
      );

      if (response.status === 401) {
        router.replace('/login');
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message ||
            'Unable to add comment.'
        );
      }

      setCommentText('');

      await loadComments(
        selectedPost.id
      );

      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (
            post.id !== selectedPost.id
          ) {
            return post;
          }

          return {
            ...post,
            comments: post.comments + 1,
          };
        })
      );

      setSelectedPost((currentPost) =>
        currentPost
          ? {
              ...currentPost,
              comments:
                currentPost.comments + 1,
            }
          : null
      );
    } catch (error) {
      console.log(
        'Error adding comment:',
        error
      );

      Alert.alert(
        'Comment failed',
        'Unable to add your comment right now.'
      );
    }
  };

  const handleShare = (post: Post) => {
    Alert.alert(
      'Share Post',
      'This post is ready to be shared with your CareerForgeAI community.'
    );
  };

  const getPostComments = (
    postId: string
  ) => {
    return comments.filter(
      (comment) =>
        comment.postId === postId
    );
  };

  return (
    <View style={styles.screen}>
      <View
        pointerEvents="none"
        style={styles.backgroundShapeOne}
      />

      <View
        pointerEvents="none"
        style={styles.backgroundShapeTwo}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerBack}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#172A55"
            />
          </Pressable>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerEyebrow}>
              CAREERFORGE COMMUNITY
            </Text>

            <Text style={styles.headerTitle}>
              Social Feed
            </Text>
          </View>

          <Pressable
            style={styles.headerAction}
            onPress={() =>
              Alert.alert(
                'Social Feed',
                'Connect, share ideas and support other students in the CareerForgeAI community.'
              )
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={23}
              color="#2457E6"
            />
          </Pressable>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="people"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              Your career community
            </Text>

            <Text style={styles.introText}>
              Share ideas, ask questions, celebrate
              progress and learn from other students
              and alumni.
            </Text>
          </View>
        </View>

        {/* Create Post Button */}
        <Pressable
          style={styles.createPostButton}
          onPress={() =>
            router.push(
              '/student/create-post'
            )
          }
        >
          <View style={styles.createPostIcon}>
            <Ionicons
              name="create-outline"
              size={20}
              color="#2457E6"
            />
          </View>

          <View style={styles.createPostTextArea}>
            <Text style={styles.createPostTitle}>
              Create a post
            </Text>

            <Text
              style={styles.createPostSubtitle}
            >
              Share something with the community
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="#94A3B8"
          />
        </Pressable>

        {/* Feed heading */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              COMMUNITY
            </Text>

            <Text style={styles.sectionTitle}>
              Latest Posts
            </Text>
          </View>

          <View style={styles.postCount}>
            <Ionicons
              name="chatbubbles-outline"
              size={14}
              color="#2457E6"
            />

            <Text style={styles.postCountText}>
              {posts.length} posts
            </Text>
          </View>
        </View>

        {/* Posts */}
        {loading ? (
          <View style={styles.loadingCard}>
            <Ionicons
              name="sync-outline"
              size={25}
              color="#2457E6"
            />

            <Text style={styles.loadingText}>
              Loading community...
            </Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyFeedCard}>
            <View style={styles.emptyFeedIcon}>
              <Ionicons
                name="chatbubbles-outline"
                size={27}
                color="#2457E6"
              />
            </View>

            <Text style={styles.emptyFeedTitle}>
              No posts yet
            </Text>

            <Text style={styles.emptyFeedText}>
              Be the first to share something with
              the CareerForge community.
            </Text>

            <Pressable
              style={styles.emptyFeedButton}
              onPress={() =>
                router.push(
                  '/student/create-post'
                )
              }
            >
              <Ionicons
                name="create-outline"
                size={17}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.emptyFeedButtonText
                }
              >
                Create Post
              </Text>
            </Pressable>
          </View>
        ) : (
          posts.map((post) => {
            const isLiked =
              likedPosts.includes(post.id);

            const postComments =
              getPostComments(post.id);

            return (
              <View
                key={post.id}
                style={styles.postCard}
              >
                {/* Post header */}
                <View style={styles.postHeader}>
                  <View style={styles.avatar}>
                    {post.initials ? (
                      <Text style={styles.avatarText}>
                        {post.initials}
                      </Text>
                    ) : (
                      <Ionicons
                        name="person"
                        size={23}
                        color="#2457E6"
                      />
                    )}
                  </View>

                  <View style={styles.authorInfo}>
                    <Text
                      style={styles.authorName}
                    >
                      {post.name}
                    </Text>

                    <Text
                      style={styles.authorRole}
                    >
                      {post.role}
                    </Text>
                  </View>

                  <Text style={styles.postTime}>
                    {post.time}
                  </Text>
                </View>

                {/* Post content */}
                {post.content ? (
                  <Text
                    style={styles.postContent}
                  >
                    {post.content}
                  </Text>
                ) : null}

                {/* Post Image */}
                {post.imageUri ? (
                  <View
                    style={
                      styles.postImageContainer
                    }
                  >
                    <Image
                      source={{
                        uri: post.imageUri,
                      }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}

                {/* Engagement */}
                <View style={styles.engagementRow}>
                  <View style={styles.engagementLeft}>
                    <View
                      style={
                        styles.engagementStat
                      }
                    >
                      <Ionicons
                        name="heart"
                        size={15}
                        color={
                          isLiked
                            ? '#2457E6'
                            : '#94A3B8'
                        }
                      />

                      <Text
                        style={[
                          styles.engagementText,
                          isLiked &&
                            styles.engagementTextActive,
                        ]}
                      >
                        {post.likes}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.engagementStat
                      }
                    >
                      <Ionicons
                        name="chatbubble"
                        size={14}
                        color="#94A3B8"
                      />

                      <Text
                        style={
                          styles.engagementText
                        }
                      >
                        {post.comments}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.communityLabel}
                  >
                    COMMUNITY
                  </Text>
                </View>

                {/* Actions */}
                <View
                  style={styles.actionDivider}
                />

                <View style={styles.actionRow}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      isLiked &&
                        styles.actionButtonActive,
                    ]}
                    onPress={() =>
                      handleLike(post.id)
                    }
                  >
                    <Ionicons
                      name={
                        isLiked
                          ? 'heart'
                          : 'heart-outline'
                      }
                      size={20}
                      color={
                        isLiked
                          ? '#2457E6'
                          : '#5F6F89'
                      }
                    />

                    <Text
                      style={[
                        styles.actionText,
                        isLiked &&
                          styles.actionTextActive,
                      ]}
                    >
                      Like
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionButton}
                    onPress={() =>
                      openComments(post)
                    }
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#5F6F89"
                    />

                    <Text
                      style={styles.actionText}
                    >
                      Comment
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionButton}
                    onPress={() =>
                      handleShare(post)
                    }
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={20}
                      color="#5F6F89"
                    />

                    <Text
                      style={styles.actionText}
                    >
                      Share
                    </Text>
                  </Pressable>
                </View>

                {/* Latest comments preview */}
                {postComments.length > 0 && (
                  <Pressable
                    style={styles.commentPreview}
                    onPress={() =>
                      openComments(post)
                    }
                  >
                    <View
                      style={
                        styles.commentPreviewIcon
                      }
                    >
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={16}
                        color="#2457E6"
                      />
                    </View>

                    <View
                      style={
                        styles.commentPreviewContent
                      }
                    >
                      <Text
                        style={
                          styles.commentPreviewTitle
                        }
                      >
                        View discussion
                      </Text>

                      <Text
                        style={
                          styles.commentPreviewText
                        }
                        numberOfLines={1}
                      >
                        {
                          postComments[
                            postComments.length - 1
                          ].name
                        }
                        :{' '}
                        {
                          postComments[
                            postComments.length - 1
                          ].text
                        }
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#94A3B8"
                    />
                  </Pressable>
                )}
              </View>
            );
          })
        )}

        {/* Community tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="sparkles"
              size={22}
              color="#2457E6"
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipEyebrow}>
              COMMUNITY TIP
            </Text>

            <Text style={styles.tipTitle}>
              Help others grow
            </Text>

            <Text style={styles.tipText}>
              Share useful resources, answer questions
              and support fellow students on their
              career journey.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Comments Modal */}
      <Modal
        visible={selectedPost !== null}
        animationType="slide"
        transparent
        onRequestClose={closeComments}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.commentsSheet}>
              {/* Sheet header */}
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetEyebrow}>
                    COMMUNITY DISCUSSION
                  </Text>

                  <Text style={styles.sheetTitle}>
                    Comments
                  </Text>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={closeComments}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color="#172A55"
                  />
                </Pressable>
              </View>

              {/* Original post */}
              {selectedPost && (
                <View style={styles.originalPost}>
                  <View style={styles.originalAvatar}>
                    {selectedPost.initials ? (
                      <Text
                        style={
                          styles.originalAvatarText
                        }
                      >
                        {selectedPost.initials}
                      </Text>
                    ) : (
                      <Ionicons
                        name="person"
                        size={17}
                        color="#2457E6"
                      />
                    )}
                  </View>

                  <View style={styles.originalContent}>
                    <Text style={styles.originalName}>
                      {selectedPost.name}
                    </Text>

                    {selectedPost.content ? (
                      <Text
                        style={styles.originalText}
                        numberOfLines={3}
                      >
                        {selectedPost.content}
                      </Text>
                    ) : (
                      <Text
                        style={styles.originalText}
                        numberOfLines={2}
                      >
                        Image post
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Comments */}
              <ScrollView
                style={styles.commentsList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {selectedPost &&
                  getPostComments(
                    selectedPost.id
                  ).map((comment) => (
                    <View
                      key={comment.id}
                      style={styles.commentItem}
                    >
                      <View
                        style={styles.commentAvatar}
                      >
                        <Ionicons
                          name="person"
                          size={17}
                          color="#2457E6"
                        />
                      </View>

                      <View
                        style={
                          styles.commentBubble
                        }
                      >
                        <View
                          style={
                            styles.commentTopRow
                          }
                        >
                          <Text
                            style={
                              styles.commentName
                            }
                          >
                            {comment.name}
                          </Text>

                          <Text
                            style={
                              styles.commentTime
                            }
                          >
                            {comment.time}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.commentText
                          }
                        >
                          {comment.text}
                        </Text>
                      </View>
                    </View>
                  ))}

                {selectedPost &&
                  getPostComments(
                    selectedPost.id
                  ).length === 0 && (
                    <View
                      style={
                        styles.emptyComments
                      }
                    >
                      <View
                        style={
                          styles.emptyCommentsIcon
                        }
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={25}
                          color="#2457E6"
                        />
                      </View>

                      <Text
                        style={
                          styles.emptyCommentsTitle
                        }
                      >
                        No comments yet
                      </Text>

                      <Text
                        style={
                          styles.emptyCommentsText
                        }
                      >
                        Start the conversation.
                      </Text>
                    </View>
                  )}

                <View
                  style={styles.modalBottomSpace}
                />
              </ScrollView>

              {/* Add comment */}
              <View
                style={styles.commentInputArea}
              >
                <View
                  style={
                    styles.commentInputWrapper
                  }
                >
                  <TextInput
                    value={commentText}
                    onChangeText={
                      setCommentText
                    }
                    placeholder="Write a comment..."
                    placeholderTextColor="#94A3B8"
                    style={styles.commentInput}
                    multiline
                    maxLength={500}
                  />

                  <Pressable
                    style={[
                      styles.sendButton,
                      !commentText.trim() &&
                        styles.sendButtonDisabled,
                    ]}
                    disabled={!commentText.trim()}
                    onPress={handleAddComment}
                  >
                    <Ionicons
                      name="send"
                      size={18}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 35,
  },

  backgroundShapeOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E5EEFF',
    top: -150,
    right: -120,
    opacity: 0.8,
  },

  backgroundShapeTwo: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#EDF3FF',
    bottom: 100,
    left: -120,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  headerBack: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F2',
    marginRight: 12,
  },

  headerTitleArea: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 3,
  },

  headerTitle: {
    color: '#172A55',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* INTRO */

  introCard: {
    backgroundColor: '#102A72',
    borderRadius: 25,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#173FBD',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 6,
  },

  introIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#2457E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },

  introText: {
    color: '#D7E3FF',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '500',
  },

  /* CREATE POST */

  createPostButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    minHeight: 70,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE5F5',
    marginBottom: 25,
    shadowColor: '#172A55',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  createPostIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createPostTextArea: {
    flex: 1,
    marginLeft: 11,
  },

  createPostTitle: {
    color: '#172A55',
    fontSize: 14,
    fontWeight: '900',
  },

  createPostSubtitle: {
    color: '#7A879B',
    fontSize: 10.5,
    marginTop: 3,
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },

  sectionEyebrow: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 3,
  },

  sectionTitle: {
    color: '#172A55',
    fontSize: 22,
    fontWeight: '900',
  },

  postCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FF',
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  postCountText: {
    color: '#2457E6',
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 5,
  },

  /* LOADING */

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5EAF2',
  },

  loadingText: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 9,
  },

  /* EMPTY FEED */

  emptyFeedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E9F2',
  },

  emptyFeedIcon: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyFeedTitle: {
    color: '#172A55',
    fontSize: 17,
    fontWeight: '900',
  },

  emptyFeedText: {
    color: '#718096',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 5,
    maxWidth: 270,
  },

  emptyFeedButton: {
    backgroundColor: '#2457E6',
    borderRadius: 13,
    paddingHorizontal: 18,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
  },

  emptyFeedButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 7,
  },

  /* POST */

  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    shadowColor: '#172A55',
    shadowOpacity: 0.055,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  avatarText: {
    color: '#2457E6',
    fontSize: 12,
    fontWeight: '900',
  },

  authorInfo: {
    flex: 1,
  },

  authorName: {
    color: '#172A55',
    fontSize: 14,
    fontWeight: '900',
  },

  authorRole: {
    color: '#7A879B',
    fontSize: 10.5,
    marginTop: 3,
    fontWeight: '600',
  },

  postTime: {
    color: '#A0AABA',
    fontSize: 9.5,
    fontWeight: '700',
  },

  postContent: {
    color: '#46566F',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 15,
    fontWeight: '500',
  },

  postImageContainer: {
    marginTop: 14,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: '#EDF3FF',
    borderWidth: 1,
    borderColor: '#E1E8F5',
  },

  postImage: {
    width: '100%',
    height: 230,
  },

  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },

  engagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  engagementStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },

  engagementText: {
    color: '#8A96A8',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 5,
  },

  engagementTextActive: {
    color: '#2457E6',
  },

  communityLabel: {
    color: '#A0AABA',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 1,
  },

  actionDivider: {
    height: 1,
    backgroundColor: '#EDF0F5',
    marginTop: 14,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 11,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
  },

  actionButtonActive: {
    backgroundColor: '#F1F5FF',
  },

  actionText: {
    color: '#5F6F89',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },

  actionTextActive: {
    color: '#2457E6',
  },

  commentPreview: {
    marginTop: 10,
    padding: 10,
    borderRadius: 13,
    backgroundColor: '#F5F8FE',
    flexDirection: 'row',
    alignItems: 'center',
  },

  commentPreviewIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  commentPreviewContent: {
    flex: 1,
  },

  commentPreviewTitle: {
    color: '#2457E6',
    fontSize: 10,
    fontWeight: '900',
  },

  commentPreviewText: {
    color: '#718096',
    fontSize: 9.5,
    marginTop: 2,
  },

  /* TIP */

  tipCard: {
    backgroundColor: '#EAF1FF',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 3,
    borderWidth: 1,
    borderColor: '#D9E5FF',
  },

  tipIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipEyebrow: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 3,
  },

  tipTitle: {
    color: '#173FBD',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },

  tipText: {
    color: '#536B9B',
    fontSize: 11,
    lineHeight: 17,
  },

  bottomSpacer: {
    height: 25,
  },

  /* COMMENTS MODAL */

  modalContainer: {
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 60, 0.35)',
    justifyContent: 'flex-end',
  },

  commentsSheet: {
    backgroundColor: '#F5F7FC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '86%',
    overflow: 'hidden',
  },

  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 9,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 19,
    paddingTop: 14,
    paddingBottom: 12,
  },

  sheetEyebrow: {
    color: '#2457E6',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 3,
  },

  sheetTitle: {
    color: '#172A55',
    fontSize: 23,
    fontWeight: '900',
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F2',
  },

  originalPost: {
    marginHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E3E9F2',
  },

  originalAvatar: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  originalAvatarText: {
    color: '#2457E6',
    fontSize: 9,
    fontWeight: '900',
  },

  originalContent: {
    flex: 1,
  },

  originalName: {
    color: '#172A55',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },

  originalText: {
    color: '#718096',
    fontSize: 10.5,
    lineHeight: 16,
  },

  commentsList: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  commentAvatar: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  commentBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E5EAF2',
  },

  commentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  commentName: {
    color: '#172A55',
    fontSize: 10.5,
    fontWeight: '900',
  },

  commentTime: {
    color: '#A0AABA',
    fontSize: 8.5,
    fontWeight: '600',
  },

  commentText: {
    color: '#536176',
    fontSize: 10.5,
    lineHeight: 16,
  },

  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 45,
  },

  emptyCommentsIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  emptyCommentsTitle: {
    color: '#172A55',
    fontSize: 14,
    fontWeight: '900',
  },

  emptyCommentsText: {
    color: '#8793A6',
    fontSize: 10.5,
    marginTop: 4,
  },

  modalBottomSpace: {
    height: 15,
  },

  commentInputArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E9F2',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  commentInputWrapper: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#F3F6FA',
    borderWidth: 1,
    borderColor: '#E0E6EF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 13,
    paddingRight: 5,
  },

  commentInput: {
    flex: 1,
    color: '#172A55',
    fontSize: 12,
    maxHeight: 80,
    paddingVertical: 9,
  },

  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#2457E6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: '#B8C3D5',
  },
});
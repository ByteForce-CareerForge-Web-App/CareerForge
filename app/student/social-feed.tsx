import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Post = {
  id: string;
  name: string;
  role: string;
  initials: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
};

type Comment = {
  id: string;
  name: string;
  initials: string;
  text: string;
  time: string;
};

const POSTS_KEY = 'careerforge_social_posts';
const COMMENTS_KEY = 'careerforge_post_comments';

const defaultPosts: Post[] = [
  {
    id: '1',
    name: 'Sarah Williams',
    role: 'Alumni • Data Analyst',
    initials: 'SW',
    time: '2h ago',
    content:
      'Just completed my first year as a Data Analyst! Keep learning, building projects and applying for opportunities. Your first opportunity can be closer than you think. 🚀',
    likes: 24,
    comments: 6,
    liked: false,
  },
  {
    id: '2',
    name: 'Michael Naidoo',
    role: 'Student • BSc Data Science',
    initials: 'MN',
    time: '5h ago',
    content:
      'Working on a new Python data analysis project this week. Looking forward to adding it to my portfolio!',
    likes: 15,
    comments: 3,
    liked: false,
  },
  {
    id: '3',
    name: 'Jessica Smith',
    role: 'Alumni • Software Developer',
    initials: 'JS',
    time: 'Yesterday',
    content:
      'A reminder for students: your projects matter. Even small projects can demonstrate your problem-solving skills to potential employers. 💻',
    likes: 31,
    comments: 8,
    liked: false,
  },
];

export default function SocialFeedScreen() {
  const [posts, setPosts] =
    useState<Post[]>(defaultPosts);

  const [search, setSearch] =
    useState('');

  /*
   * Load posts and their saved comments.
   */
  const loadPosts = useCallback(async () => {
    try {
      const savedPosts =
        await AsyncStorage.getItem(
          POSTS_KEY
        );

      let storedPosts: Post[] =
        defaultPosts;

      if (savedPosts) {
        try {
          const parsedPosts =
            JSON.parse(savedPosts);

          if (Array.isArray(parsedPosts)) {
            storedPosts = parsedPosts;
          }
        } catch {
          storedPosts = defaultPosts;
        }
      } else {
        await AsyncStorage.setItem(
          POSTS_KEY,
          JSON.stringify(defaultPosts)
        );
      }

      /*
       * Load comments separately.
       *
       * The comments screen stores comments like:
       *
       * {
       *   "1": [comment, comment],
       *   "2": [comment],
       * }
       *
       * We use the number of saved comments to
       * update the count shown on the post.
       */
      const savedComments =
        await AsyncStorage.getItem(
          COMMENTS_KEY
        );

      let allComments: Record<
        string,
        Comment[]
      > = {};

      if (savedComments) {
        try {
          const parsedComments =
            JSON.parse(savedComments);

          if (
            parsedComments &&
            typeof parsedComments === 'object' &&
            !Array.isArray(parsedComments)
          ) {
            allComments = parsedComments;
          }
        } catch {
          allComments = {};
        }
      }

      /*
       * Update each post's displayed comment
       * count using the comments actually saved
       * for that post.
       *
       * The default count represents the existing
       * comments on the demo post.
       *
       * Any comments added by the user are added
       * on top of that number.
       */
      const updatedPosts =
        storedPosts.map((post) => {
          const savedForPost =
            allComments[post.id] || [];

          const defaultPost =
            defaultPosts.find(
              (defaultPost) =>
                defaultPost.id === post.id
            );

          const baseCommentCount =
            defaultPost
              ? defaultPost.comments
              : post.comments;

          return {
            ...post,
            comments:
              baseCommentCount +
              savedForPost.length,
          };
        });

      setPosts(updatedPosts);
    } catch (error) {
      console.log(
        'Error loading posts:',
        error
      );

      setPosts(defaultPosts);
    }
  }, []);

  /*
   * Reload whenever the user returns to
   * the Social Feed.
   *
   * This means adding a comment and pressing
   * Back will immediately update the count.
   */
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  /*
   * Like / Unlike a post
   */
  const toggleLike = async (
    postId: string
  ) => {
    const updatedPosts =
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked
              ? post.likes - 1
              : post.likes + 1,
          };
        }

        return post;
      });

    setPosts(updatedPosts);

    try {
      await AsyncStorage.setItem(
        POSTS_KEY,
        JSON.stringify(updatedPosts)
      );
    } catch (error) {
      console.log(
        'Error saving like:',
        error
      );
    }
  };

 /*
 * Share a post
 */
const sharePost = async (
  post: Post
) => {
  const postUrl =
  `careerforgeai://post/${post.id}`;

  const message =
    `Check out my post on CareerForgeAI! 🚀\n\n` +
    `${post.name}\n\n` +
    `${post.content}\n\n` +
    `View the post:\n${postUrl}`;

  try {
    await Share.share({
      title: 'Share CareerForgeAI Post',
      message,
    });
  } catch (error) {
    console.log(
      'Share error:',
      error
    );
  }
};
  /*
   * Filter posts
   */
  const filteredPosts =
    posts.filter((post) =>
      `${post.name} ${post.role} ${post.content}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  /*
   * Render individual post
   */
  const renderPost = ({
    item,
  }: {
    item: Post;
  }) => {
    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text
              style={styles.avatarText}
            >
              {item.initials}
            </Text>
          </View>

          <View style={styles.authorInfo}>
            <Text
              style={styles.authorName}
            >
              {item.name}
            </Text>

            <Text
              style={styles.authorRole}
            >
              {item.role}
            </Text>

            <Text
              style={styles.postTime}
            >
              {item.time}
            </Text>
          </View>
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>
          {item.content}
        </Text>

        {/* Engagement */}
        <View
          style={styles.engagementRow}
        >
          <Text
            style={styles.engagementText}
          >
            ❤️ {item.likes} likes
          </Text>

          <Text
            style={styles.engagementText}
          >
            💬 {item.comments}{' '}
            {item.comments === 1
              ? 'comment'
              : 'comments'}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {/* Like */}
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              toggleLike(item.id)
            }
          >
            <Text
              style={[
                styles.actionText,
                item.liked &&
                  styles.likedText,
              ]}
            >
              {item.liked
                ? '❤️ Liked'
                : '♡ Like'}
            </Text>
          </Pressable>

          {/* Comment */}
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname:
                  '/student/comments',
                params: {
                  postId: item.id,
                  postName: item.name,
                  postContent:
                    item.content,
                },
              })
            }
          >
            <Text
              style={styles.actionText}
            >
              💬 Comment
            </Text>
          </Pressable>

          {/* Share */}
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              sharePost(item)
            }
          >
            <Text
              style={styles.actionText}
            >
              ↗ Share
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(
                '/student/dashboard'
              );
            }
          }}
        >
          <Text style={styles.backIcon}>
            ←
          </Text>
        </Pressable>

        <View
          style={styles.headerTextContainer}
        >
          <Text
            style={styles.headerTitle}
          >
            Social Feed
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Connect, learn and grow together
          </Text>
        </View>

        {/* Create Post */}
        <Pressable
          style={styles.createButton}
          onPress={() => {
            router.push(
              '/student/create-post'
            );
          }}
        >
          <Text
            style={styles.createButtonText}
          >
            +
          </Text>
        </Pressable>
      </View>

      {/* Search */}
      <View
        style={styles.searchContainer}
      >
        <Text style={styles.searchIcon}>
          🔍
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Feed */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={renderPost}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.feed
        }
        ListHeaderComponent={
          <Text
            style={styles.sectionTitle}
          >
            Latest Posts
          </Text>
        }
        ListEmptyComponent={
          <View
            style={styles.emptyState}
          >
            <Text
              style={styles.emptyIcon}
            >
              📰
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No posts found
            </Text>

            <Text
              style={styles.emptyText}
            >
              Try searching for something else.
            </Text>
          </View>
        }
      />
    </View>
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
    marginRight: 8,
  },

  backIcon: {
    color: '#FFFFFF',
    fontSize: 30,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 3,
  },

  createButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  createButtonText: {
    color: '#0B1F3A',
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 30,
  },

  searchContainer: {
    margin: 16,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
  },

  feed: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 12,
  },

  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },

  authorName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },

  authorRole: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },

  postTime: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },

  postContent: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },

  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  engagementText: {
    color: '#64748B',
    fontSize: 12,
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },

  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 4,
  },

  actionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },

  likedText: {
    color: '#0B1F3A',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#0B1F3A',
    fontSize: 18,
    fontWeight: '800',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 6,
  },
});
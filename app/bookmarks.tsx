import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { bookmarksApi } from '../lib/api';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookmarks = async () => {
    try {
      const { data } = await bookmarksApi.list();
      setBookmarks(data.data || data.bookmarks || data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookmarks();
  };

  const renderPost = ({ item }: { item: any }) => {
    const post = item.post || item;
    return (
      <TouchableOpacity style={styles.postCard} onPress={() => router.push({ pathname: '/post/[uuid]', params: { uuid: post.uuid } })}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.user?.name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.userName}>{post.user?.name}</Text>
            <Text style={styles.userHandle}>@{post.user?.username}</Text>
          </View>
        </View>
        <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
        <View style={styles.postStats}>
          <Text style={styles.stat}>❤️ {post.likes_count || 0}</Text>
          <Text style={styles.stat}>💬 {post.replies_count || 0}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favoritos</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <Text style={styles.count}>{bookmarks.length}</Text>
      </View>
      <FlatList
        data={bookmarks}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        renderItem={renderPost}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Nenhum favorito ainda</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { fontSize: 16, color: '#4f46e5', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  count: { fontSize: 14, color: '#6b7280' },
  list: { padding: 10 },
  postCard: { padding: 15, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 10 },
  postHeader: { flexDirection: 'row', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  postInfo: { marginLeft: 10, justifyContent: 'center' },
  userName: { fontWeight: '600', color: '#1f2937' },
  userHandle: { fontSize: 12, color: '#6b7280' },
  postContent: { fontSize: 15, color: '#1f2937', lineHeight: 22 },
  postStats: { flexDirection: 'row', gap: 15, marginTop: 10 },
  stat: { fontSize: 13, color: '#6b7280' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

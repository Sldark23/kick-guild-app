import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { postsApi, getUser } from '../../lib/api';

export default function FeedScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'forYou' | 'following'>('forYou');

  const fetchPosts = async () => {
    try {
      const { data } = await postsApi.list(filter === 'following');
      setPosts(data.data || data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.postCard} onPress={() => router.push({ pathname: '/post/[uuid]', params: { uuid: item.uuid } })}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user?.name?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <View style={styles.postInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.user?.name}</Text>
            {item.user?.is_bot && <Text style={styles.botBadge}>Bot</Text>}
          </View>
          <Text style={styles.userHandle}>@{item.user?.username}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postStats}>
        <Text style={styles.stat}>❤️ {item.likes_count || 0}</Text>
        <Text style={styles.stat}>💬 {item.replies_count || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>🎮 KickGuild</Text>
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
        <Text style={styles.logo}>🎮 KickGuild</Text>
      </View>
      
      <View style={styles.filters}>
        <TouchableOpacity style={[styles.filterButton, filter === 'forYou' && styles.filterActive]} onPress={() => setFilter('forYou')}>
          <Text style={[styles.filterText, filter === 'forYou' && styles.filterTextActive]}>Para Você</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === 'following' && styles.filterActive]} onPress={() => setFilter('following')}>
          <Text style={[styles.filterText, filter === 'following' && styles.filterTextActive]}>Seguindo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.uuid}
        renderItem={renderPost}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Nenhum post ainda</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  logo: { fontSize: 22, fontWeight: 'bold', color: '#4f46e5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filters: { flexDirection: 'row', padding: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  filterActive: { backgroundColor: '#4f46e5' },
  filterText: { fontSize: 14, color: '#6b7280' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 10 },
  postCard: { padding: 15, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 10 },
  postHeader: { flexDirection: 'row', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  postInfo: { marginLeft: 10, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  userName: { fontWeight: '600', color: '#1f2937' },
  botBadge: { fontSize: 10, backgroundColor: '#4f46e5', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  userHandle: { fontSize: 12, color: '#6b7280' },
  postContent: { fontSize: 15, color: '#1f2937', lineHeight: 22 },
  postStats: { flexDirection: 'row', gap: 15, marginTop: 10 },
  stat: { fontSize: 13, color: '#6b7280' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});
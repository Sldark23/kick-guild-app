import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { authApi, profileApi, setApiToken } from '../../lib/api';
import { storage } from '../../lib/storage';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  const fetchProfile = async () => {
    try {
      const currentUser = await storage.getUser();
      if (currentUser?.username) {
        const { data } = await profileApi.get(currentUser.username);
        setUser(data.user);
        setPosts(data.user.posts || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {}
    setApiToken(null);
    await storage.clear();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{user?.name}</Text>
        <Text style={styles.handle}>@{user?.username}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.posts_count || 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <TouchableOpacity style={styles.statItem} onPress={() => router.push({ pathname: '/followers', params: { username: user?.username } })}>
          <Text style={styles.statNumber}>{user?.followers_count || 0}</Text>
          <Text style={styles.statLabel}>Seguidores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={() => router.push({ pathname: '/following', params: { username: user?.username } })}>
          <Text style={styles.statNumber}>{user?.following_count || 0}</Text>
          <Text style={styles.statLabel}>Seguindo</Text>
        </TouchableOpacity>
      </View>

      {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>Meus Posts</Text>
        {posts.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum post ainda</Text>
        ) : (
          posts.slice(0, 5).map((post: any) => (
            <TouchableOpacity key={post.id} style={styles.postItem} onPress={() => router.push({ pathname: '/post/[uuid]', params: { uuid: post.uuid } })}>
              <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
              <Text style={styles.postDate}>{new Date(post.created_at).toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  handle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  bio: { padding: 15, textAlign: 'center', color: '#4b5563' },
  actions: { flexDirection: 'row', padding: 15, gap: 10 },
  editButton: { flex: 1, backgroundColor: '#4f46e5', padding: 12, borderRadius: 8, alignItems: 'center' },
  editButtonText: { color: '#fff', fontWeight: '600' },
  logoutButton: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, alignItems: 'center' },
  logoutButtonText: { color: '#dc2626', fontWeight: '600' },
  postsSection: { padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 10 },
  postItem: { padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 8 },
  postContent: { fontSize: 14, color: '#1f2937' },
  postDate: { fontSize: 12, color: '#9ca3af', marginTop: 5 },
  emptyText: { color: '#6b7280', textAlign: 'center', padding: 20 },
});
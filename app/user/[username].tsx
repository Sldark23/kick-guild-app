import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { profileApi } from '../../lib/api';
import { storage } from '../../lib/storage';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const currentUser = await storage.getUser();
      setIsOwnProfile(currentUser?.username === username);

      const { data } = await profileApi.get(username!);
      const profileData = data.user || data;
      setUser(profileData);
      setPosts(profileData.posts || []);
      setIsFollowing(profileData.is_following || false);
    } catch (error) {
      Alert.alert('Erro', 'Usuário não encontrado');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!user || actionLoading) return;
    setActionLoading(true);
    try {
      if (isFollowing) {
        await profileApi.unfollow(user.id);
        setIsFollowing(false);
        setUser((prev: any) => ({ ...prev, followers_count: Math.max(0, (prev.followers_count || 1) - 1) }));
      } else {
        await profileApi.follow(user.id);
        setIsFollowing(true);
        setUser((prev: any) => ({ ...prev, followers_count: (prev.followers_count || 0) + 1 }));
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível completar a ação');
    } finally {
      setActionLoading(false);
    }
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.uuid || item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.postCard} onPress={() => router.push({ pathname: '/post/[uuid]', params: { uuid: item.uuid } })}>
            <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>
            <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarTextLarge}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
              </View>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userHandle}>@{user?.username}</Text>
              {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
              {user?.location && <Text style={styles.meta}>📍 {user.location}</Text>}
              {user?.website && <Text style={styles.meta}>🔗 {user.website}</Text>}
            </View>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.posts_count || posts.length}</Text>
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

            {!isOwnProfile && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.followButton, isFollowing && styles.followingButton]}
                  onPress={handleFollow}
                  disabled={actionLoading}
                >
                  <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                    {actionLoading ? '...' : isFollowing ? 'Seguindo' : 'Seguir'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {posts.length > 0 && <Text style={styles.sectionTitle}>Posts</Text>}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum post ainda</Text>
          </View>
        }
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
  list: { padding: 10 },
  profileHeader: { alignItems: 'center', paddingVertical: 20 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTextLarge: { color: '#fff', fontWeight: 'bold', fontSize: 32 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  userHandle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  bio: { fontSize: 15, color: '#4b5563', textAlign: 'center', marginTop: 8, paddingHorizontal: 30, lineHeight: 22 },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  actionRow: { padding: 15, alignItems: 'center' },
  followButton: { backgroundColor: '#4f46e5', paddingVertical: 10, paddingHorizontal: 32, borderRadius: 20 },
  followingButton: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' },
  followButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  followingButtonText: { color: '#374151' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginVertical: 10 },
  postCard: { padding: 15, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 8 },
  postContent: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
  postDate: { fontSize: 12, color: '#9ca3af', marginTop: 6 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

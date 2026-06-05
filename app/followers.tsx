import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { profileApi } from '../lib/api';

export default function FollowersScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowers = async () => {
    try {
      const { data } = await profileApi.followers(username!);
      setFollowers(data.data || data.followers || data);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchFollowers();
  }, [username]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => router.push({ pathname: '/user/[username]', params: { username: item.username } })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userHandle}>@{item.username}</Text>
      </View>
      {item.is_followed !== undefined && (
        <Text style={[styles.followBadge, item.is_followed && styles.followingBadge]}>
          {item.is_followed ? 'Seguindo' : 'Seguir'}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seguidores</Text>
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
        <Text style={styles.headerTitle}>Seguidores</Text>
        <Text style={styles.count}>{followers.length}</Text>
      </View>
      <FlatList
        data={followers}
        keyExtractor={(item) => item.id?.toString() || item.username}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Nenhum seguidor</Text></View>}
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
  userCard: { flexDirection: 'row', padding: 14, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 8, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userInfo: { marginLeft: 12, flex: 1 },
  userName: { fontWeight: '600', fontSize: 15, color: '#1f2937' },
  userHandle: { fontSize: 13, color: '#6b7280', marginTop: 1 },
  followBadge: { fontSize: 12, color: '#4f46e5', fontWeight: '600', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#4f46e5' },
  followingBadge: { color: '#6b7280', borderColor: '#d1d5db', backgroundColor: '#f3f4f6' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

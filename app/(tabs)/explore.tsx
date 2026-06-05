import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { searchApi, profileApi } from '../../lib/api';

type SearchTab = 'users' | 'posts' | 'guilds';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('users');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const performSearch = useCallback(async (q: string, tab: SearchTab) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await searchApi.all(q);
      switch (tab) {
        case 'users': setResults(data.users || []); break;
        case 'posts': setResults(data.posts || []); break;
        case 'guilds': setResults(data.guilds || []); break;
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(query, activeTab), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, activeTab]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await profileApi.discover();
        setDiscoverUsers(data.data || data);
      } catch (_) {}
    })();
  }, []);

  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/user/[username]', params: { username: item.username } })}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text></View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardHandle}>@{item.username}</Text>
        <Text style={styles.cardSub}>{item.followers_count || 0} seguidores</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/post/[uuid]', params: { uuid: item.uuid } })}>
      <View style={styles.postHeader}>
        <View style={styles.avatarSmall}><Text style={styles.avatarTextSmall}>{item.user?.name?.charAt(0)?.toUpperCase()}</Text></View>
        <Text style={styles.cardName}>{item.user?.name}</Text>
      </View>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
      <Text style={styles.cardSub}>❤️ {item.likes_count || 0}  💬 {item.replies_count || 0}</Text>
    </TouchableOpacity>
  );

  const renderGuildItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/guilds/[slug]', params: { slug: item.slug } })}>
      <Text style={styles.guildName}>{item.name}</Text>
      <Text style={styles.cardSub}>{item.members_count || 0} membros</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => {
    switch (activeTab) {
      case 'users': return renderUserItem({ item });
      case 'posts': return renderPostItem({ item });
      case 'guilds': return renderGuildItem({ item });
    }
  };

  const showDiscover = !query.trim() && activeTab === 'users';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pessoas, posts, guildas..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.tabs}>
        {(['users', 'posts', 'guilds'] as SearchTab[]).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'users' ? 'Pessoas' : tab === 'posts' ? 'Posts' : 'Guildas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>
      ) : showDiscover ? (
        <FlatList
          data={discoverUsers}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); profileApi.discover().then(({ data }) => { setDiscoverUsers(data.data || data); setRefreshing(false); }).catch(() => setRefreshing(false)); }} colors={['#4f46e5']} />}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Pessoas para seguir</Text>}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>Nenhuma sugestão no momento</Text></View>}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => item.id?.toString() || item.uuid || idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>Nenhum resultado</Text></View>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  searchBar: { padding: 10, backgroundColor: '#fff' },
  searchInput: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 20, fontSize: 15, color: '#1f2937', paddingLeft: 16 },
  tabs: { flexDirection: 'row', paddingHorizontal: 10, paddingBottom: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: '#4f46e5' },
  tabText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  list: { padding: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 10, marginTop: 5 },
  card: { padding: 14, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarTextSmall: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cardInfo: { marginLeft: 12, justifyContent: 'center', flex: 1 },
  cardName: { fontWeight: '600', fontSize: 15, color: '#1f2937', marginLeft: 10 },
  cardHandle: { fontSize: 13, color: '#6b7280' },
  cardSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postContent: { fontSize: 14, color: '#1f2937', lineHeight: 20, marginLeft: 0, marginBottom: 4 },
  guildName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  emptyText: { color: '#6b7280', fontSize: 16 },
});
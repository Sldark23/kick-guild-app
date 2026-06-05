import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { searchApi } from '../lib/api';

type SearchTab = 'users' | 'posts' | 'hashtags';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('users');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
        case 'users':
          setResults(data.users || []);
          break;
        case 'posts':
          setResults(data.posts || []);
          break;
        case 'hashtags':
          setResults(data.guilds || []);
          break;
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
    debounceRef.current = setTimeout(() => {
      performSearch(query, activeTab);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeTab]);

  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => router.push({ pathname: '/user/[username]', params: { username: item.username } })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultHandle}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => router.push({ pathname: '/post/[uuid]', params: { uuid: item.uuid } })}>
      <View style={styles.postResultHeader}>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarTextSmall}>{item.user?.name?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.resultName}>{item.user?.name}</Text>
          <Text style={styles.resultHandle}>@{item.user?.username}</Text>
        </View>
      </View>
      <Text style={styles.postResultContent} numberOfLines={2}>{item.content}</Text>
    </TouchableOpacity>
  );

  const renderHashtagItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.resultCard}>
      <Text style={styles.hashtagText}>#{item.name || item.hashtag || item.tag}</Text>
      <Text style={styles.hashtagCount}>{item.count || item.posts_count || 0} posts</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => {
    switch (activeTab) {
      case 'users': return renderUserItem({ item });
      case 'posts': return renderPostItem({ item });
      case 'hashtags': return renderHashtagItem({ item });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pesquisar</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.tabs}>
        {(['users', 'posts', 'hashtags'] as SearchTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'users' ? 'Pessoas' : tab === 'posts' ? 'Posts' : 'Hashtags'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => item.id?.toString() || item.uuid || idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{query ? 'Nenhum resultado encontrado' : 'Digite algo para pesquisar'}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { fontSize: 16, color: '#4f46e5', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  searchBar: { padding: 10, backgroundColor: '#fff' },
  searchInput: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 20, fontSize: 15, color: '#1f2937', paddingLeft: 16 },
  tabs: { flexDirection: 'row', paddingHorizontal: 10, paddingBottom: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: '#4f46e5' },
  tabText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  list: { padding: 10 },
  resultCard: { padding: 14, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarTextSmall: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  resultInfo: { marginLeft: 12, justifyContent: 'center' },
  resultName: { fontWeight: '600', fontSize: 15, color: '#1f2937' },
  resultHandle: { fontSize: 13, color: '#6b7280', marginTop: 1 },
  resultCard: { padding: 12, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 8 },
  postResultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  postResultContent: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
  hashtagText: { fontSize: 16, fontWeight: '600', color: '#4f46e5' },
  hashtagCount: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

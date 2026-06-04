import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { chatApi } from '../../lib/api';

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const { data } = await chatApi.conversations();
      setConversations(data.data || data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const getOtherParticipant = (participants: any[]) => {
    return participants?.[0];
  };

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.conversationCard} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(item.name || item.participants?.[0]?.name || '?').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.conversationInfo}>
        <Text style={styles.conversationName}>{item.name || item.participants?.[0]?.name || 'Conversa'}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage?.content || 'Sem mensagens'}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mensagens</Text>
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
        <Text style={styles.title}>Mensagens</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversation}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Nenhuma conversa ainda</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 10 },
  conversationCard: { flexDirection: 'row', padding: 15, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 10, alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  conversationInfo: { marginLeft: 15, flex: 1 },
  conversationName: { fontWeight: '600', fontSize: 16, color: '#1f2937' },
  lastMessage: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});
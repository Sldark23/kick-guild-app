import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { notificationsApi } from '../lib/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationsApi.list();
      setNotifications(data.data || data.notifications || data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const handleNotificationPress = (item: any) => {
    if (!item.is_read) handleMarkRead(item.id);
    if (item.type === 'follow') {
      router.push({ pathname: '/user/[username]', params: { username: item.actor?.username || item.data?.username } });
    } else if (item.type === 'like' || item.type === 'reply') {
      router.push({ pathname: '/post/[uuid]', params: { uuid: item.post_uuid || item.data?.post_uuid } });
    }
  };

  const getNotificationText = (item: any) => {
    const actorName = item.actor?.name || item.data?.actor_name || 'Alguém';
    switch (item.type) {
      case 'follow': return `${actorName} seguiu você`;
      case 'like': return `${actorName} curtiu seu post`;
      case 'reply': return `${actorName} respondeu seu post`;
      case 'mention': return `${actorName} mencionou você`;
      default: return item.message || `${actorName} interagiu com você`;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return d.toLocaleDateString('pt-BR');
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.notiAvatar, !item.is_read && styles.unreadDot]}>
        <Text style={styles.notiAvatarText}>{item.actor?.name?.charAt(0)?.toUpperCase() || item.data?.actor_name?.charAt(0) || '?'}</Text>
      </View>
      <View style={styles.notiInfo}>
        <Text style={styles.notiText}>{getNotificationText(item)}</Text>
        <Text style={styles.notiTime}>{formatTimeAgo(item.created_at)}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificações</Text>
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
        <Text style={styles.headerTitle}>Notificações</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Marcar todas</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        renderItem={renderNotification}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Nenhuma notificação</Text></View>}
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
  markAllText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
  list: { padding: 10 },
  notificationCard: { flexDirection: 'row', padding: 14, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 8, alignItems: 'center' },
  unreadCard: { backgroundColor: '#eef2ff' },
  notiAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  unreadDot: {},
  notiAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  notiInfo: { marginLeft: 12, flex: 1 },
  notiText: { fontSize: 14, color: '#1f2937', lineHeight: 19 },
  notiTime: { fontSize: 12, color: '#9ca3af', marginTop: 3 },
  unreadIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4f46e5', marginLeft: 8 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

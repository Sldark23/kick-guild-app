import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { guildsApi } from '../../lib/api';
import { storage } from '../../lib/storage';

export default function GuildDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [guild, setGuild] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedChannel, setExpandedChannel] = useState<number | null>(null);
  const [channelPosts, setChannelPosts] = useState<any>({});
  const [channelLoading, setChannelLoading] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);

  const fetchGuild = async () => {
    try {
      const currentUser = await storage.getUser();
      const { data } = await guildsApi.get(slug!);
      const guildData = data.guild || data;
      setGuild(guildData);
      setChannels(guildData.channels || data.channels || []);

      const channelList = guildData.channels || data.channels || [];
      const initialPosts: any = {};
      for (const ch of channelList) {
        initialPosts[ch.id] = ch.posts || [];
      }
      setChannelPosts(initialPosts);

      const membership = guildData.membership || guildData.is_member;
      setIsMember(membership || false);
      setIsOwner(guildData.owner_id === currentUser?.id || guildData.is_owner);
    } catch (error) {
      Alert.alert('Erro', 'Guilda não encontrada');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchGuild();
  }, [slug]);

  const handleJoinLeave = async () => {
    setActionLoading(true);
    try {
      if (isMember) {
        await guildsApi.leave(slug!);
        setIsMember(false);
        setGuild((prev: any) => ({ ...prev, members_count: Math.max(0, (prev.members_count || 1) - 1) }));
      } else {
        await guildsApi.join(slug!);
        setIsMember(true);
        setGuild((prev: any) => ({ ...prev, members_count: (prev.members_count || 0) + 1 }));
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível completar a ação');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleChannel = async (channelId: number) => {
    if (expandedChannel === channelId) {
      setExpandedChannel(null);
      return;
    }
    setExpandedChannel(channelId);
    if (!channelPosts[channelId] || channelPosts[channelId].length === 0) {
      setChannelLoading(channelId);
      try {
        const { data } = await guildsApi.channelPosts(slug!, channelId);
        setChannelPosts((prev: any) => ({ ...prev, [channelId]: data.data || data.posts || data }));
      } catch (error) {
        console.error('Error fetching channel posts:', error);
      } finally {
        setChannelLoading(null);
      }
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    setActionLoading(true);
    try {
      const { data } = await guildsApi.channelPost(slug!, 0, ''); // placeholder — depends on API
      Alert.alert('Em breve', 'Criação de canais será implementada.');
      setModalVisible(false);
      setNewChannelName('');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar canal');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostToChannel = async () => {
    if (!newPostContent.trim() || selectedChannel === null) return;
    setActionLoading(true);
    try {
      const { data } = await guildsApi.channelPost(slug!, selectedChannel, newPostContent.trim());
      const newPost = data.post || data;
      setChannelPosts((prev: any) => ({ ...prev, [selectedChannel]: [...(prev[selectedChannel] || []), newPost] }));
      setPostModalVisible(false);
      setNewPostContent('');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao postar');
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

  const renderChannel = ({ item }: { item: any }) => {
    const isExpanded = expandedChannel === item.id;
    const posts = channelPosts[item.id] || [];

    return (
      <View style={styles.channelContainer}>
        <TouchableOpacity style={styles.channelHeader} onPress={() => handleToggleChannel(item.id)}>
          <Text style={styles.channelIcon}>#</Text>
          <Text style={styles.channelName}>{item.name}</Text>
          <Text style={styles.channelCount}>{posts.length}</Text>
          <Text style={styles.channelArrow}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.channelPosts}>
            {channelLoading === item.id ? (
              <ActivityIndicator size="small" color="#4f46e5" style={{ padding: 10 }} />
            ) : posts.length === 0 ? (
              <Text style={styles.noPostsText}>Nenhum post neste canal</Text>
            ) : (
              posts.map((post: any) => (
                <View key={post.uuid || post.id} style={styles.channelPost}>
                  <View style={styles.channelPostHeader}>
                    <Text style={styles.channelPostUser}>{post.user?.name}</Text>
                    <Text style={styles.channelPostDate}>{new Date(post.created_at).toLocaleDateString('pt-BR')}</Text>
                  </View>
                  <Text style={styles.channelPostContent}>{post.content}</Text>
                </View>
              ))
            )}
            {isMember && (
              <TouchableOpacity
                style={styles.postInChannelButton}
                onPress={() => { setSelectedChannel(item.id); setPostModalVisible(true); }}
              >
                <Text style={styles.postInChannelText}>+ Postar neste canal</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{guild?.name}</Text>
        <TouchableOpacity style={[styles.joinButton, isMember && styles.joinedButton]} onPress={handleJoinLeave} disabled={actionLoading}>
          <Text style={[styles.joinButtonText, isMember && styles.joinedButtonText]}>
            {actionLoading ? '...' : isMember ? 'Sair' : 'Entrar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={channels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderChannel}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.guildInfo}>
            <View style={styles.guildHeaderInfo}>
              <View style={styles.guildAvatar}>
                <Text style={styles.guildAvatarText}>{guild?.name?.charAt(0)?.toUpperCase() || 'G'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guildName}>{guild?.name}</Text>
                <Text style={styles.guildSlug}>/{guild?.slug}</Text>
              </View>
            </View>
            {guild?.description && <Text style={styles.guildDescription}>{guild.description}</Text>}
            <Text style={styles.guildMemberCount}>👥 {guild?.members_count || 0} membros</Text>

            {isOwner && (
              <View style={styles.ownerActions}>
                <TouchableOpacity style={styles.createChannelButton} onPress={() => setModalVisible(true)}>
                  <Text style={styles.createChannelText}>+ Criar Canal</Text>
                </TouchableOpacity>
              </View>
            )}

            {channels.length > 0 && <Text style={styles.channelsSectionTitle}>Canais</Text>}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum canal ainda</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Canal</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome do canal"
              value={newChannelName}
              onChangeText={setNewChannelName}
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateChannel} disabled={actionLoading}>
                <Text style={styles.modalConfirmText}>{actionLoading ? '...' : 'Criar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={postModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Postar no Canal</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Digite sua mensagem..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={2000}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setPostModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, !newPostContent.trim() && styles.buttonDisabled]} onPress={handlePostToChannel} disabled={actionLoading || !newPostContent.trim()}>
                <Text style={styles.modalConfirmText}>{actionLoading ? '...' : 'Postar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { fontSize: 16, color: '#4f46e5', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', flex: 1, textAlign: 'center' },
  joinButton: { backgroundColor: '#4f46e5', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  joinedButton: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' },
  joinButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  joinedButtonText: { color: '#374151' },
  list: { padding: 10 },
  guildInfo: { marginBottom: 10 },
  guildHeaderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  guildAvatar: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  guildAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  guildName: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  guildSlug: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  guildDescription: { fontSize: 15, color: '#4b5563', lineHeight: 22, marginBottom: 4 },
  guildMemberCount: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  ownerActions: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  createChannelButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe' },
  createChannelText: { color: '#4f46e5', fontWeight: '600', fontSize: 13 },
  channelsSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8, marginTop: 5 },
  channelContainer: { marginBottom: 8, borderRadius: 12, backgroundColor: '#f9fafb', overflow: 'hidden' },
  channelHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  channelIcon: { fontSize: 18, color: '#6b7280', marginRight: 8 },
  channelName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1f2937' },
  channelCount: { fontSize: 12, color: '#9ca3af', marginRight: 8 },
  channelArrow: { fontSize: 12, color: '#9ca3af' },
  channelPosts: { paddingHorizontal: 14, paddingBottom: 10 },
  channelPost: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  channelPostHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  channelPostUser: { fontWeight: '600', fontSize: 13, color: '#4f46e5' },
  channelPostDate: { fontSize: 11, color: '#9ca3af' },
  channelPostContent: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
  noPostsText: { color: '#9ca3af', fontSize: 13, padding: 10, textAlign: 'center' },
  postInChannelButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#4f46e5', borderStyle: 'dashed', alignItems: 'center', marginTop: 4 },
  postInChannelText: { color: '#4f46e5', fontWeight: '600', fontSize: 13 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  modalInput: { backgroundColor: '#f3f4f6', padding: 14, borderRadius: 12, fontSize: 15, color: '#1f2937', marginBottom: 12 },
  modalTextArea: { minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  modalCancelText: { color: '#374151', fontWeight: '600', fontSize: 15 },
  modalConfirm: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#4f46e5', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9ca3af' },
  modalConfirmText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

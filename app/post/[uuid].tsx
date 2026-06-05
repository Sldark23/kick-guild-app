import { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { postsApi } from '../../lib/api';

export default function PostDetailScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [liked, setLiked] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const fetchPost = async () => {
    try {
      const { data } = await postsApi.get(uuid!);
      setPost(data.post || data.data || data);
      setReplies(data.replies || data.post?.replies || []);
      setLiked(data.post?.is_liked || data.is_liked || false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o post');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) fetchPost();
  }, [uuid]);

  const handleLike = async () => {
    try {
      await postsApi.like(uuid!);
      setLiked(!liked);
      setPost((prev: any) => ({
        ...prev,
        likes_count: liked ? (prev.likes_count || 1) - 1 : (prev.likes_count || 0) + 1,
      }));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível curtir');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const { data } = await postsApi.reply(uuid!, replyText.trim());
      setReplies((prev) => [...prev, data.reply || data]);
      setReplyText('');
      setPost((prev: any) => ({ ...prev, replies_count: (prev.replies_count || 0) + 1 }));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível responder');
    } finally {
      setSending(false);
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

  const renderReply = ({ item }: { item: any }) => (
    <View style={styles.replyCard}>
      <View style={styles.replyHeader}>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarTextSmall}>{item.user?.name?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.replyUserName}>{item.user?.name}</Text>
          <Text style={styles.replyHandle}>@{item.user?.username}</Text>
        </View>
        <Text style={styles.replyDate}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
      </View>
      <Text style={styles.replyContent}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          data={replies}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          renderItem={renderReply}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{post?.user?.name?.charAt(0)?.toUpperCase()}</Text>
                </View>
                <View style={styles.postInfo}>
                  <Text style={styles.userName}>{post?.user?.name}</Text>
                  <Text style={styles.userHandle}>@{post?.user?.username}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post?.content}</Text>
              <Text style={styles.postDate}>{new Date(post?.created_at).toLocaleDateString('pt-BR')}</Text>
              <View style={styles.postStats}>
                <TouchableOpacity style={styles.statButton} onPress={handleLike}>
                  <Text style={[styles.stat, liked && styles.statActive]}>{liked ? '❤️' : '🤍'} {post?.likes_count || 0}</Text>
                </TouchableOpacity>
                <Text style={styles.stat}>💬 {post?.replies_count || 0}</Text>
              </View>

              {replies.length > 0 && <Text style={styles.repliesSectionTitle}>Respostas ({replies.length})</Text>}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma resposta ainda</Text>
            </View>
          }
        />

        <View style={styles.replyInputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.replyInput}
            placeholder="Escreva uma resposta..."
            value={replyText}
            onChangeText={setReplyText}
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]} onPress={handleReply} disabled={sending || !replyText.trim()}>
            <Text style={styles.sendButtonText}>{sending ? '...' : 'Enviar'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { fontSize: 16, color: '#4f46e5', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  list: { padding: 10 },
  postCard: { padding: 15, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 15 },
  postHeader: { flexDirection: 'row', marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  postInfo: { marginLeft: 12, justifyContent: 'center' },
  userName: { fontWeight: '600', fontSize: 16, color: '#1f2937' },
  userHandle: { fontSize: 13, color: '#6b7280', marginTop: 1 },
  postContent: { fontSize: 16, color: '#1f2937', lineHeight: 24 },
  postDate: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
  postStats: { flexDirection: 'row', gap: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  statButton: { padding: 2 },
  stat: { fontSize: 14, color: '#6b7280' },
  statActive: { color: '#dc2626' },
  repliesSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginTop: 15, marginBottom: 5 },
  replyCard: { padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarTextSmall: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  replyUserName: { fontWeight: '600', fontSize: 14, color: '#1f2937' },
  replyHandle: { fontSize: 12, color: '#6b7280' },
  replyDate: { marginLeft: 'auto', fontSize: 11, color: '#9ca3af' },
  replyContent: { fontSize: 14, color: '#1f2937', lineHeight: 20, marginLeft: 40 },
  replyInputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff', alignItems: 'flex-end' },
  replyInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, maxHeight: 100, marginRight: 8, color: '#1f2937' },
  sendButton: { backgroundColor: '#4f46e5', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#9ca3af' },
  sendButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

import { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { chatApi } from '../../lib/api';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    try {
      const { data } = await chatApi.messages(Number(id));
      const conv = data.conversation || data;
      setConversation(conv);
      setMessages(conv.messages || data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchMessages();
  }, [id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    setSending(true);
    const text = inputText.trim();
    setInputText('');

    try {
      const { data } = await chatApi.sendMessage(Number(id), text);
      const newMsg = data.message || data;
      setMessages((prev) => [...prev, newMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isSystem = item.type === 'system';
    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemText}>{item.content}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.messageBubble, item.is_mine && styles.myMessage]}>
        {!item.is_mine && <Text style={styles.messageSender}>{item.user?.name || item.sender?.name}</Text>}
        <Text style={[styles.messageContent, item.is_mine && styles.myMessageContent]}>{item.content}</Text>
        <Text style={[styles.messageTime, item.is_mine && styles.myMessageTime]}>{formatTime(item.created_at)}</Text>
      </View>
    );
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

  const convName = conversation?.name || conversation?.participants?.[0]?.name || 'Conversa';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{convName}</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma mensagem ainda</Text>
            </View>
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} onPress={handleSend} disabled={sending || !inputText.trim()}>
            <Text style={styles.sendButtonText}>{sending ? '...' : '➤'}</Text>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', flex: 1, textAlign: 'center' },
  messagesList: { padding: 10, flexGrow: 1 },
  messageBubble: { alignSelf: 'flex-start', maxWidth: '80%', marginBottom: 12, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 16, borderTopLeftRadius: 4 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#4f46e5', borderTopLeftRadius: 16, borderTopRightRadius: 4 },
  messageSender: { fontSize: 12, fontWeight: '600', color: '#4f46e5', marginBottom: 3 },
  messageContent: { fontSize: 15, color: '#1f2937', lineHeight: 20 },
  myMessageContent: { color: '#fff' },
  messageTime: { fontSize: 11, color: '#9ca3af', marginTop: 4, alignSelf: 'flex-end' },
  myMessageTime: { color: 'rgba(255,255,255,0.7)' },
  systemMessage: { alignSelf: 'center', marginVertical: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#f9fafb', borderRadius: 12 },
  systemText: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, marginRight: 8, color: '#1f2937' },
  sendButton: { backgroundColor: '#4f46e5', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#9ca3af' },
  sendButtonText: { color: '#fff', fontSize: 18 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { postsApi } from '../../lib/api';

export default function CreateScreen() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Erro', 'Digite algo para postar');
      return;
    }

    setLoading(true);
    try {
      await postsApi.create(content.trim());
      Alert.alert('Sucesso', 'Post criado!', [{ text: 'OK', onPress: () => router.push('/(tabs)') }]);
      setContent('');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao criar post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Criar Post</Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView>
          <TextInput
            style={styles.input}
            placeholder="O que está pensando?"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
            maxLength={2000}
          />
          <Text style={styles.charCount}>{content.length}/2000</Text>
        </ScrollView>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handlePost} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Postando...' : 'Postar'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  content: { flex: 1, padding: 15 },
  input: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 12, fontSize: 16, color: '#1f2937', minHeight: 150 },
  charCount: { textAlign: 'right', color: '#9ca3af', fontSize: 12, marginTop: 5 },
  button: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { backgroundColor: '#9ca3af' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
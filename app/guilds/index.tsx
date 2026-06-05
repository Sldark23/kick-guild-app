import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl, Alert, TextInput, Modal } from 'react-native';
import { router } from 'expo-router';
import { guildsApi } from '../../lib/api';

export default function GuildsListScreen() {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchGuilds = async () => {
    try {
      const { data } = await guildsApi.list();
      setGuilds(data.data || data.guilds || data);
    } catch (error) {
      console.error('Error fetching guilds:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuilds();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGuilds();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }
    setCreating(true);
    try {
      const { data } = await guildsApi.create(newName.trim(), newDescription.trim() || undefined);
      setModalVisible(false);
      setNewName('');
      setNewDescription('');
      Alert.alert('Sucesso', 'Guilda criada!', [{ text: 'OK', onPress: () => fetchGuilds() }]);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao criar guilda');
    } finally {
      setCreating(false);
    }
  };

  const renderGuild = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.guildCard} onPress={() => router.push({ pathname: '/guilds/[slug]', params: { slug: item.slug } })}>
      <View style={styles.guildIcon}>
        <Text style={styles.guildIconText}>{item.name?.charAt(0)?.toUpperCase() || 'G'}</Text>
      </View>
      <View style={styles.guildInfo}>
        <View style={styles.guildNameRow}>
          <Text style={styles.guildName}>{item.name}</Text>
          {item.is_private && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>🔒</Text>
            </View>
          )}
        </View>
        <Text style={styles.guildDescription} numberOfLines={2}>{item.description || 'Sem descrição'}</Text>
        <Text style={styles.guildMeta}>👥 {item.members_count || 0} membros</Text>
      </View>
      <Text style={styles.guildArrow}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Guildas</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.createButton}>+</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Guildas</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.createButton}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={guilds}
        keyExtractor={(item) => item.slug || item.id.toString()}
        renderItem={renderGuild}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Nenhuma guilda encontrada</Text></View>}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Guilda</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da guilda"
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor="#9ca3af"
              maxLength={100}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Descrição (opcional)"
              value={newDescription}
              onChangeText={setNewDescription}
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setModalVisible(false); setNewName(''); setNewDescription(''); }}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, creating && styles.buttonDisabled]} onPress={handleCreate} disabled={creating}>
                <Text style={styles.modalConfirmText}>{creating ? 'Criando...' : 'Criar'}</Text>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  createButton: { fontSize: 28, color: '#4f46e5', fontWeight: '600', paddingHorizontal: 8 },
  list: { padding: 10 },
  guildCard: { flexDirection: 'row', padding: 15, borderRadius: 12, backgroundColor: '#f9fafb', marginBottom: 10, alignItems: 'center' },
  guildIcon: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  guildIconText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  guildInfo: { marginLeft: 12, flex: 1 },
  guildNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guildName: { fontWeight: '600', fontSize: 16, color: '#1f2937' },
  privateBadge: {},
  privateBadgeText: { fontSize: 12 },
  guildDescription: { fontSize: 13, color: '#6b7280', marginTop: 3 },
  guildMeta: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  guildArrow: { fontSize: 22, color: '#9ca3af', marginLeft: 8 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  modalInput: { backgroundColor: '#f3f4f6', padding: 14, borderRadius: 12, fontSize: 15, color: '#1f2937', marginBottom: 12 },
  modalTextArea: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  modalCancelText: { color: '#374151', fontWeight: '600', fontSize: 15 },
  modalConfirm: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#4f46e5', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9ca3af' },
  modalConfirmText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

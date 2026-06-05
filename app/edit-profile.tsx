import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { profileApi } from '../lib/api';
import { storage } from '../lib/storage';

export default function EditProfileScreen() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await storage.getUser();
      if (user) {
        setName(user.name || '');
        setBio(user.bio || '');
        setLocation(user.location || '');
        setWebsite(user.website || '');
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const { data } = await profileApi.update({ name: name.trim(), bio: bio.trim(), location: location.trim(), website: website.trim() });
      const updatedUser = data.user || data;
      await storage.setUser(updatedUser);
      Alert.alert('Sucesso', 'Perfil atualizado!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao atualizar perfil');
    } finally {
      setSaving(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#9ca3af" maxLength={100} />

        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder="Sobre você" placeholderTextColor="#9ca3af" multiline maxLength={500} />
        <Text style={styles.charCount}>{bio.length}/500</Text>

        <Text style={styles.label}>Localização</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Cidade, País" placeholderTextColor="#9ca3af" maxLength={100} />

        <Text style={styles.label}>Website</Text>
        <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="https://" placeholderTextColor="#9ca3af" autoCapitalize="none" maxLength={200} />

        <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { fontSize: 16, color: '#4f46e5', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 15 },
  input: { backgroundColor: '#f3f4f6', padding: 14, borderRadius: 12, fontSize: 16, color: '#1f2937' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', fontSize: 12, color: '#9ca3af', marginTop: 4 },
  saveButton: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  saveButtonDisabled: { backgroundColor: '#9ca3af' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

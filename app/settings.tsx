import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { authApi, setApiToken } from '../lib/api';
import { storage } from '../lib/storage';

const SETTINGS_SECTIONS = [
  {
    title: 'Conta',
    items: [
      { icon: '🔑', label: 'Alterar Senha', route: null, action: () => Alert.alert('Em breve', 'Esta funcionalidade estará disponível em breve.') },
      { icon: '🔒', label: 'Privacidade', route: null, action: () => Alert.alert('Em breve', 'Esta funcionalidade estará disponível em breve.') },
    ],
  },
  {
    title: 'Segurança',
    items: [
      { icon: '📱', label: 'Autenticação de Dois Fatores', route: null, action: () => Alert.alert('Em breve', 'Esta funcionalidade estará disponível em breve.') },
      { icon: '🚫', label: 'Usuários Bloqueados', route: null, action: () => Alert.alert('Em breve', 'Esta funcionalidade estará disponível em breve.') },
    ],
  },
  {
    title: 'Conteúdo',
    items: [
      { icon: '🔖', label: 'Favoritos', route: '/bookmarks', action: () => router.push('/bookmarks') },
    ],
  },
  {
    title: 'Geral',
    items: [
      { icon: '🔔', label: 'Notificações', route: '/notifications', action: () => router.push('/notifications') },
    ],
  },
];

export default function SettingsScreen() {
  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.logout();
          } catch (error) {}
          setApiToken(null);
          await storage.clear();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {SETTINGS_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity key={iIdx} style={[styles.settingItem, iIdx < section.items.length - 1 && styles.settingBorder]} onPress={item.action}>
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>KickGuild v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  backButton: { fontSize: 16, color: '#4f46e5', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  scroll: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingIcon: { fontSize: 18, marginRight: 12 },
  settingLabel: { flex: 1, fontSize: 16, color: '#1f2937' },
  settingArrow: { fontSize: 22, color: '#9ca3af' },
  logoutButton: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { fontSize: 16, color: '#dc2626', fontWeight: '600' },
  version: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 20 },
});

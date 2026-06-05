import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { authApi, setApiToken } from '../../lib/api';
import { storage } from '../../lib/storage';

export default function LoginScreen() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.login(login, password);
      
      if (data.requires_2fa) {
        router.push({ pathname: '/(auth)/2fa', params: { userId: data.user_id } });
        return;
      }

      await storage.setToken(data.token);
      setApiToken(data.token);
      await storage.setUser(data.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎮</Text>
          <Text style={styles.title}>KickGuild</Text>
          <Text style={styles.subtitle}>Conecte-se com a comunidade</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email ou username"
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>Não tem conta? Criar agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 60, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 5 },
  form: { gap: 15 },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkButton: { alignItems: 'center', marginTop: 20 },
  linkText: { color: '#4f46e5', fontSize: 14 },
});
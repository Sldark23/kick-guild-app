import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { authApi, setToken, setUser } from '../../lib/api';

export default function TwoFactorScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Erro', 'Digite o código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.verifyTwoFactor(parseInt(userId), code);
      setToken(data.token);
      setUser(data.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Autenticação de Dois Fatores</Text>
        <Text style={styles.subtitle}>Digite o código do seu aplicativo autenticador</Text>

        <TextInput
          style={styles.input}
          placeholder="000000"
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          placeholderTextColor="#9ca3af"
        />

        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Verificando...' : 'Verificar'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { padding: 20, alignItems: 'center' },
  icon: { fontSize: 50, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 30, textAlign: 'center' },
  input: { backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, fontSize: 24, width: '100%', textAlign: 'center', letterSpacing: 8, marginBottom: 20 },
  button: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
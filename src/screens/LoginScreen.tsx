import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { setAuthToken } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useServer } from '../context/ServerContext';
import { clearStoredToken } from '../storage';

export function LoginScreen() {
  const { signIn, loading } = useAuth();
  const { clearServerUrl } = useServer();
  const [employeeCode, setEmployeeCode] = useState('405IS');
  const [password, setPassword] = useState('demo123');

  useEffect(() => {
    void clearStoredToken();
    setAuthToken(null);
  }, []);

  const onSubmit = async () => {
    const ok = await signIn(employeeCode, password);
    if (!ok) {
      Alert.alert(
        'Ошибка',
        'Неверный логин/пароль, сервер недоступен или устарел токен. ' +
          'Нажмите «Изменить адрес сервера», сохраните URL снова, затем 405IS / demo123.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Модуль исполнителя</Text>
      <Text style={styles.subtitle}>
        Корпоративная система выездного сервиса и ремонта
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Табельный номер</Text>
        <TextInput
          value={employeeCode}
          onChangeText={setEmployeeCode}
          style={styles.input}
          autoCapitalize="characters"
        />
        <Text style={styles.label}>Пароль</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Вход...' : 'Войти'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.linkButton} onPress={() => clearServerUrl()}>
        <Text style={styles.linkText}>Изменить адрес сервера</Text>
      </Pressable>

      <Text style={styles.hint}>
        Демо: 405IS / demo123. Адрес API задаётся на экране настройки и хранится на устройстве.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

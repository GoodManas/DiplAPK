import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { checkServerHealth } from '../api/health';
import { DEFAULT_SERVER_URL_HINT } from '../config';
import { useServer } from '../context/ServerContext';

type Props = {
  /** Вызов после сохранения (например navigation.goBack из профиля). */
  onDone?: () => void;
};

export function ServerSetupScreen({ onDone }: Props) {
  const { serverUrl, setServerUrl } = useServer();
  const [input, setInput] = useState(serverUrl ?? '');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [checkOk, setCheckOk] = useState<boolean | null>(null);

  const onCheck = async () => {
    setChecking(true);
    setCheckMessage(null);
    setCheckOk(null);
    try {
      const result = await checkServerHealth(input);
      setCheckOk(result.ok);
      setCheckMessage(
        result.ok && result.service
          ? `${result.message} (${result.service})`
          : result.message,
      );
    } finally {
      setChecking(false);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const health = await checkServerHealth(input);
      if (!health.ok) {
        Alert.alert('Сервер недоступен', health.message);
        setCheckOk(false);
        setCheckMessage(health.message);
        return;
      }
      await setServerUrl(input);
      onDone?.();
    } catch (e) {
      Alert.alert(
        'Ошибка',
        e instanceof Error ? e.message : 'Не удалось сохранить адрес',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Адрес сервера</Text>
      <Text style={styles.subtitle}>
        Укажите URL туннеля или локального API. Адрес можно сменить позже в профиле без
        пересборки APK.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Адрес (без /api в конце)</Text>
        <TextInput
          value={input}
          onChangeText={(text) => {
            setInput(text);
            setCheckMessage(null);
            setCheckOk(null);
          }}
          style={styles.input}
          placeholder={DEFAULT_SERVER_URL_HINT}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        {checkMessage ? (
          <Text style={[styles.status, checkOk ? styles.statusOk : styles.statusErr]}>
            {checkMessage}
          </Text>
        ) : null}

        <Pressable
          style={[styles.buttonSecondary, checking && styles.buttonDisabled]}
          onPress={onCheck}
          disabled={checking || !input.trim()}
        >
          {checking ? (
            <ActivityIndicator color="#2563eb" />
          ) : (
            <Text style={styles.buttonSecondaryText}>Проверить подключение</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.button, (saving || !input.trim()) && styles.buttonDisabled]}
          onPress={onSave}
          disabled={saving || !input.trim()}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Сохранение...' : 'Сохранить и продолжить'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        Пример: https://acd606b5090bb0.lhr.life{'\n'}
        Проверка: /api/health. На ПК друга: run_mobile_api.py + открытый ssh-туннель.
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
    gap: 10,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
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
  status: {
    fontSize: 13,
  },
  statusOk: {
    color: '#15803d',
  },
  statusErr: {
    color: '#dc2626',
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
  button: {
    marginTop: 4,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});

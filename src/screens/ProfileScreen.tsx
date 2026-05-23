import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useServer } from '../context/ServerContext';
import { RootStackParamList } from '../navigation/types';
import { getStatusLabel } from '../utils/statusLabels';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { executor, permissions, signOut, changePassword } = useAuth();
  const { serverUrl } = useServer();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const onChangePassword = async () => {
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Готово', 'Пароль изменён');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось сменить пароль');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Профиль</Text>
      <View style={styles.card}>
        <Text style={styles.label}>ФИО</Text>
        <Text style={styles.value}>{executor?.fullName}</Text>
        <Text style={styles.label}>Табельный номер</Text>
        <Text style={styles.value}>{executor?.employeeCode}</Text>
        <Text style={styles.label}>Роль</Text>
        <Text style={styles.value}>{permissions?.label ?? 'Исполнитель'}</Text>
        {executor?.phone && (
          <>
            <Text style={styles.label}>Телефон</Text>
            <Text style={styles.value}>{executor.phone}</Text>
          </>
        )}
      </View>

      <Text style={styles.section}>Сервер API</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Текущий адрес</Text>
        <Text style={styles.value} selectable>
          {serverUrl}
        </Text>
        <Pressable
          style={[styles.button, styles.buttonSpaced]}
          onPress={() => navigation.navigate('ServerSettings')}
        >
          <Text style={styles.buttonText}>Изменить адрес сервера</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Смена пароля</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Текущий пароль"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Новый пароль (от 6 символов)"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Pressable style={styles.button} onPress={onChangePassword}>
          <Text style={styles.buttonText}>Сохранить пароль</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Ваши права</Text>
      <View style={styles.card}>
        <Text style={styles.perm}>• Просмотр назначенных заявок</Text>
        <Text style={styles.perm}>• Обновление статуса работ</Text>
        <Text style={styles.perm}>• Фиксация результата с фото</Text>
        <Text style={styles.perm}>• Навигация к объекту</Text>
      </View>

      <Pressable style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Назад</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  section: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: { fontSize: 12, color: '#64748b', marginTop: 8 },
  value: { fontSize: 16, fontWeight: '500', color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  buttonSpaced: {
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  perm: { color: '#334155', marginBottom: 6 },
  logout: {
    marginTop: 24,
    backgroundColor: '#fee2e2',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: { color: '#dc2626', fontWeight: '600' },
  back: { textAlign: 'center', marginTop: 16, color: '#2563eb', fontWeight: '600' },
});

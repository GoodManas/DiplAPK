import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fetchTaskHistory } from '../api/requests';
import { useTasks } from '../context/TasksContext';
import { RootStackParamList } from '../navigation/types';
import { HistoryEntry, TaskStatus } from '../types';
import { openRouteInMaps } from '../utils/openMaps';
import { getPriorityColor, getPriorityLabel } from '../utils/priorityLabels';
import { getStatusColor, getStatusLabel } from '../utils/statusLabels';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const { tasks, updateStatus } = useTasks();
  const task = useMemo(() => tasks.find((t) => t.id === taskId), [tasks, taskId]);
  const [completionNote, setCompletionNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetchTaskHistory(taskId)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [taskId, tasks]);

  if (!task) {
    return (
      <View style={styles.center}>
        <Text>Заявка не найдена</Text>
      </View>
    );
  }

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Камера', 'Разрешите доступ к камере в настройках');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
    }
  };

  const setStatus = async (status: TaskStatus) => {
    try {
      await updateStatus(
        task.id,
        status,
        completionNote,
        status === 'completed' ? photoBase64 ?? undefined : undefined,
      );
      Alert.alert('Готово', 'Статус отправлен диспетчеру');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось обновить');
    }
  };

  const callClient = () => {
    if (!task.clientPhone) return;
    Linking.openURL(`tel:${task.clientPhone.replace(/\s/g, '')}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.taskId}>{task.id}</Text>
      <Text style={[styles.badge, { color: getStatusColor(task.status) }]}>
        {getStatusLabel(task.status)}
      </Text>
      <Text style={[styles.priority, { color: getPriorityColor(task.priority) }]}>
        Приоритет: {getPriorityLabel(task.priority)}
      </Text>
      <Text style={styles.title}>{task.title}</Text>

      <Text style={styles.label}>Клиент</Text>
      <Text style={styles.value}>{task.clientName}</Text>
      {task.clientPhone && (
        <Pressable onPress={callClient}>
          <Text style={styles.phone}>📞 {task.clientPhone}</Text>
        </Pressable>
      )}

      <Text style={styles.label}>Адрес</Text>
      <Text style={styles.value}>{task.address}</Text>
      <Text style={styles.label}>Описание</Text>
      <Text style={styles.value}>{task.description}</Text>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => openRouteInMaps(task.address, task.latitude, task.longitude)}
      >
        <Text style={styles.secondaryButtonText}>Маршрут в картах</Text>
      </Pressable>

      <Text style={styles.label}>Комментарий</Text>
      <TextInput
        style={styles.note}
        multiline
        placeholder="Результат работ..."
        value={completionNote}
        onChangeText={setCompletionNote}
      />

      {task.status === 'in_progress' && (
        <>
          <Pressable style={styles.photoButton} onPress={pickPhoto}>
            <Text style={styles.secondaryButtonText}>Сфотографировать результат</Text>
          </Pressable>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}
        </>
      )}

      <View style={styles.actions}>
        {task.status === 'assigned' && (
          <Pressable style={styles.primaryButton} onPress={() => setStatus('in_progress')}>
            <Text style={styles.primaryButtonText}>Начать работу</Text>
          </Pressable>
        )}
        {task.status === 'in_progress' && (
          <Pressable style={styles.primaryButton} onPress={() => setStatus('completed')}>
            <Text style={styles.primaryButtonText}>Завершить с отчётом</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.historyTitle}>История по заявке</Text>
      {history.map((h) => (
        <View key={h.id} style={styles.historyRow}>
          <Text style={styles.historyMeta}>
            {new Date(h.createdAt).toLocaleString('ru-RU')} · {h.employeeName}
          </Text>
          <Text style={styles.historyStatus}>
            {h.statusFrom ? `${h.statusFrom} → ` : ''}
            {h.statusTo}
          </Text>
          {h.note && <Text style={styles.historyNote}>{h.note}</Text>}
          {h.hasPhoto && <Text style={styles.historyNote}>📷 Прикреплено фото</Text>}
        </View>
      ))}

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Назад</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  taskId: { fontSize: 14, color: '#64748b' },
  badge: { fontWeight: '700', marginVertical: 4 },
  priority: { fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 13, color: '#64748b', marginTop: 10 },
  value: { fontSize: 16, color: '#1e293b' },
  phone: { color: '#2563eb', fontWeight: '600', marginTop: 4 },
  secondaryButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  photoButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#2563eb', fontWeight: '600' },
  note: {
    marginTop: 8,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  preview: { width: '100%', height: 180, borderRadius: 10, marginTop: 10 },
  actions: { marginTop: 16, gap: 10 },
  primaryButton: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  historyTitle: { fontSize: 18, fontWeight: '700', marginTop: 28, marginBottom: 12 },
  historyRow: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyMeta: { fontSize: 12, color: '#64748b' },
  historyStatus: { fontWeight: '600', marginTop: 4 },
  historyNote: { color: '#475569', marginTop: 4 },
  backButton: { alignItems: 'center', marginTop: 20 },
  backButtonText: { color: '#2563eb', fontWeight: '600' },
});

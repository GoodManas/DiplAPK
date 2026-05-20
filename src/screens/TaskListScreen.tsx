import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import { RootStackParamList } from '../navigation/types';
import { getPriorityColor, getPriorityLabel } from '../utils/priorityLabels';
import { getStatusColor, getStatusLabel } from '../utils/statusLabels';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

const statusFilters = [
  { key: '', label: 'Все' },
  { key: 'assigned', label: 'Назначены' },
  { key: 'in_progress', label: 'В работе' },
  { key: 'completed', label: 'Готово' },
];

export function TaskListScreen({ navigation }: Props) {
  const { executor } = useAuth();
  const {
    tasks,
    loading,
    error,
    refresh,
    filterStatus,
    setFilterStatus,
    search,
    setSearch,
  } = useTasks();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Здравствуйте,</Text>
          <Text style={styles.name}>{executor?.fullName}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.link}>Профиль</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Поиск по номеру, клиенту, адресу..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        {statusFilters.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.chip, filterStatus === f.key && styles.chipActive]}
            onPress={() => setFilterStatus(f.key)}
          >
            <Text style={[styles.chipText, filterStatus === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Мои заявки ({tasks.length})</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        refreshing={loading}
        onRefresh={refresh}
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? <Text style={styles.meta}>Нет заявок по выбранному фильтру</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.taskId}>{item.id}</Text>
              <Text style={[styles.badge, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
            <Text style={[styles.priority, { color: getPriorityColor(item.priority) }]}>
              {getPriorityLabel(item.priority)}
            </Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.clientName}</Text>
            <Text style={styles.meta}>{item.address}</Text>
            <Text style={styles.time}>
              {new Date(item.scheduledAt).toLocaleString('ru-RU')}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  greeting: { color: '#64748b', fontSize: 14 },
  name: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  link: { color: '#2563eb', fontWeight: '600' },
  search: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#334155', fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 8 },
  list: { paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  taskId: { fontWeight: '700', color: '#0f172a' },
  badge: { fontWeight: '600', fontSize: 13 },
  priority: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 6 },
  meta: { color: '#64748b', fontSize: 14 },
  time: { marginTop: 8, color: '#334155', fontSize: 13, fontWeight: '500' },
  error: { color: '#dc2626', marginBottom: 8 },
});

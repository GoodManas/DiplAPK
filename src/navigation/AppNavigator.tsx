import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useServer } from '../context/ServerContext';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ServerSetupScreen } from '../screens/ServerSetupScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function ServerSettingsScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'ServerSettings'>) {
  return <ServerSetupScreen onDone={() => navigation.goBack()} />;
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

export function AppNavigator() {
  const { serverUrl, bootstrapping: serverBootstrapping } = useServer();
  const { executor, bootstrapping: authBootstrapping } = useAuth();

  if (serverBootstrapping || (serverUrl && authBootstrapping)) {
    return <LoadingScreen />;
  }

  if (!serverUrl) {
    return <ServerSetupScreen />;
  }

  if (!executor) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Tasks"
          component={TaskListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{ title: 'Заявка' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Профиль' }}
        />
        <Stack.Screen
          name="ServerSettings"
          component={ServerSettingsScreen}
          options={{ title: 'Адрес сервера' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

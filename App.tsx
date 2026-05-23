import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ServerProvider } from './src/context/ServerContext';
import { TasksProvider } from './src/context/TasksContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ServerProvider>
        <AuthProvider>
          <TasksProvider>
            <AppNavigator />
            <StatusBar style="dark" />
          </TasksProvider>
        </AuthProvider>
      </ServerProvider>
    </SafeAreaProvider>
  );
}

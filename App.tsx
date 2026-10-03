import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProgressProvider } from './src/state/ProgressProvider';
import { MotionProvider } from './src/components/motion';
import { AppNavigator } from './src/navigation/AppNavigator';
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#090919" />
      <MotionProvider>
        <ProgressProvider>
          <AppNavigator />
        </ProgressProvider>
      </MotionProvider>
    </SafeAreaProvider>
  );
}

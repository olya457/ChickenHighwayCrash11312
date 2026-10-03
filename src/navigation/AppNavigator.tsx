import React, { useEffect, useState } from 'react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Motion, useMotionEnabled } from '../components/motion';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParams, TabParams } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import {
  BoostsScreen,
  ChallengesScreen,
  CustomizeScreen,
} from '../screens/StoreScreens';
import { GameScreen } from '../screens/GameScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { LoaderScreen, OnboardingScreen } from '../screens/IntroScreens';
import { useProgress } from '../state/ProgressProvider';
import { Button, colors, ui } from '../components/ui';
const Stack = createNativeStackNavigator<RootStackParams>();
const Tab = createBottomTabNavigator<TabParams>();
const icons = { Home: '⌂', Challenges: '◎', Boosts: '★', Customize: '✎' };
function TabIcon({
  name,
  focused,
}: {
  name: keyof TabParams;
  focused: boolean;
}) {
  return (
    <Motion kind="pop" trigger={focused} active={focused} style={styles.icon}>
      <View style={[styles.indicator, { opacity: focused ? 1 : 0 }]} />
      <Text
        style={{
          fontSize: 26,
          color: focused ? colors.gold : 'white',
          fontWeight: '900',
        }}
      >
        {icons[name]}
      </Text>
    </Motion>
  );
}
function Tabs() {
  const insets = useSafeAreaInsets();
  const { compact } = useResponsiveLayout();
  const motionEnabled = useMotionEnabled();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: motionEnabled ? 'fade' : 'none',
        tabBarStyle: [
          styles.bar,
          {
            height: (compact ? 56 : 64) + Math.max(10, insets.bottom),
            paddingBottom: Math.max(10, insets.bottom),
          },
        ],
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: '#777585',
        tabBarLabelStyle: [
          styles.label,
          compact && { fontSize: 9, letterSpacing: 0 },
        ],
        tabBarAllowFontScaling: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarLabel: route.name.toUpperCase(),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
      <Tab.Screen name="Boosts" component={BoostsScreen} />
      <Tab.Screen name="Customize" component={CustomizeScreen} />
    </Tab.Navigator>
  );
}
export function AppNavigator() {
  const { state, ready, error, retry } = useProgress();
  const motionEnabled = useMotionEnabled();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (state.onboarded) {
      setLoaded(false);
    }
  }, [state.onboarded]);
  if (!ready) {
    return (
      <View style={[ui.page, ui.center]}>
        {error ? (
          <>
            <Text style={ui.body}>{error}</Text>
            <Button title="RETRY" onPress={retry} />
          </>
        ) : (
          <ActivityIndicator color={colors.gold} />
        )}
      </View>
    );
  }
  return (
    <View style={ui.page}>
      {!state.onboarded ? (
        !loaded ? (
          <LoaderScreen onDone={() => setLoaded(true)} />
        ) : (
          <OnboardingScreen />
        )
      ) : (
        <NavigationContainer
          theme={{
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              background: colors.bg,
              card: colors.bg,
              primary: colors.gold,
            },
          }}
        >
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              gestureEnabled: false,
              animation: motionEnabled ? 'fade_from_bottom' : 'none',
              animationDuration: 280,
            }}
          >
            <Stack.Screen name="Main" component={Tabs} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
      {error && (
        <View style={styles.error}>
          <Text style={ui.body}>{error}</Text>
          <Button title="RETRY SAVE" onPress={retry} />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#0c0c20',
    borderTopColor: '#27273e',
    borderTopWidth: 1,
    height: 78,
    paddingBottom: 12,
    paddingTop: 6,
  },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  icon: { alignItems: 'center' },
  indicator: {
    height: 3,
    width: 35,
    backgroundColor: colors.gold,
    borderRadius: 3,
    position: 'absolute',
    top: -8,
    shadowColor: colors.gold,
    shadowRadius: 6,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  error: {
    position: 'absolute',
    bottom: 90,
    left: 18,
    right: 18,
    padding: 16,
    gap: 10,
    backgroundColor: '#391c26',
    borderRadius: 16,
  },
});

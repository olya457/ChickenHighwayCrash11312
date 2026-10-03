import React, { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  Motion,
  MotionPressable as Pressable,
  CountUp,
  useMotionEnabled,
} from '../components/motion';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { CompositeScreenProps } from '@react-navigation/native';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  BottomTabScreenProps,
  useBottomTabBarHeight,
} from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, TabParams } from '../navigation/types';
import { art, chickens, highways } from '../data/catalog';
import { Button, Card, colors, ui } from '../components/ui';
import { useProgress } from '../state/ProgressProvider';
type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParams, 'Home'>,
  NativeStackScreenProps<RootStackParams>
>;
export function HomeScreen({ navigation }: Props) {
  const { state, dispatch } = useProgress();
  const [settings, setSettings] = useState(false);
  const motionEnabled = useMotionEnabled();
  const { height, compact, narrow, gutter, gap } = useResponsiveLayout();
  const tabHeight = useBottomTabBarHeight();
  const heroHeight = Math.max(
    120,
    Math.min(440, height - tabHeight - (compact ? 260 : 290)),
  );
  const chicken = chickens.find(c => c.id === state.chicken)!;
  const highway = highways.find(h => h.id === state.highway)!;
  return (
    <ImageBackground source={art.background} style={ui.page}>
      <LinearGradient
        colors={['#050913a8', 'transparent', '#09091970']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: gutter,
              paddingVertical: compact ? 8 : 18,
              gap: compact ? 6 : 10,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => setSettings(true)}
            style={styles.settings}
          >
            <Text style={styles.gear}>⚙</Text>
          </Pressable>
          <View style={styles.grow}>
            <Text style={styles.brandSmall}>Chicken</Text>
            <Text style={[styles.brand, compact && { fontSize: 14 }]}>
              Highway Crash
            </Text>
          </View>
          <Motion
            kind="pop"
            trigger={state.eggies}
            style={{ maxWidth: narrow ? 108 : 150, flexShrink: 1 }}
          >
            <CountUp
              style={[styles.wallet, compact && { fontSize: 12, padding: 8 }]}
              prefix="🥚 "
              value={state.eggies}
            />
          </Motion>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.homeContent,
            {
              paddingHorizontal: gutter,
              gap,
              paddingBottom: compact ? 12 : 22,
            },
          ]}
        >
          <Motion
            kind="float"
            active={!settings}
            style={[styles.hero, { minHeight: heroHeight }]}
          >
            <Image
              source={chicken.image}
              resizeMode="contain"
              style={{
                width: '85%',
                height: heroHeight,
              }}
            />
          </Motion>
          <Button title="▶ PLAY" onPress={() => navigation.navigate('Game')} />
          <Button
            title="✦ CUSTOMIZE"
            secondary
            onPress={() => navigation.navigate('Customize')}
          />
          <View style={styles.highway}>
            <Image source={highway.image} style={styles.road} />
            <View style={{ flexShrink: 1 }}>
              <Text style={ui.white}>{highway.name}</Text>
              <Text style={ui.caption}>{chicken.name}</Text>
            </View>
          </View>
          <View style={styles.best}>
            <Text style={ui.caption}>
              BEST SCORE <Text style={styles.gold}>{state.bestScore}</Text> ·
              ROWS <Text style={styles.gold}>{state.bestRows}</Text> ·{' '}
              <Text style={styles.gold}>
                {state.bestMultiplier.toFixed(2)}×
              </Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Modal
        visible={settings}
        transparent
        animationType={motionEnabled ? 'slide' : 'none'}
        onRequestClose={() => setSettings(false)}
      >
        <View style={styles.modal}>
          <Pressable
            accessibilityLabel="Close settings"
            style={styles.backdrop}
            onPress={() => setSettings(false)}
          />
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <ScrollView
              contentContainerStyle={[
                styles.sheetContent,
                { padding: gutter, gap },
              ]}
            >
              <View style={ui.row}>
                <Text
                  style={[
                    styles.settingsTitle,
                    { flexShrink: 1, fontSize: compact ? 22 : 26 },
                  ]}
                >
                  ⚙ SETTINGS
                </Text>
                <Button
                  title="✕"
                  secondary
                  onPress={() => setSettings(false)}
                />
              </View>
              {(['sound', 'vibration'] as const).map((key, index) => (
                <Card key={key} delay={index * 90}>
                  <View style={ui.row}>
                    <Text style={[ui.heading, compact && { fontSize: 16 }]}>
                      {key === 'sound' ? '♫ Sound' : '◉ Vibration'}
                    </Text>
                    <Switch
                      accessibilityLabel={key}
                      value={state[key]}
                      trackColor={{ false: '#444', true: colors.gold }}
                      onValueChange={value =>
                        dispatch({ type: 'setting', key, value })
                      }
                    />
                  </View>
                </Card>
              ))}
              <Text style={ui.body}>
                Tap or swipe up to cross. Swipe down to return up to three rows.
                Time your move carefully. All progress stays on this device.
              </Text>
              <Button
                title="RESET PROGRESS"
                secondary
                onPress={() =>
                  Alert.alert(
                    'Reset all progress?',
                    'This deletes your Eggies, skins, boosts, records and challenges.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reset',
                        style: 'destructive',
                        onPress: () => {
                          setSettings(false);
                          dispatch({ type: 'reset' });
                        },
                      },
                    ],
                  )
                }
              />
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  grow: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 10 },
  settings: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171a24cc',
    borderWidth: 1,
    borderColor: '#ffffff30',
    borderRadius: 14,
  },
  gear: { color: 'white', fontSize: 28 },
  brandSmall: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  brand: {
    color: colors.gold,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  wallet: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.yellow,
    borderWidth: 1,
    borderColor: '#997a16',
    borderRadius: 22,
    padding: 10,
    backgroundColor: '#0b1523cc',
  },
  homeContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 22,
    gap: 12,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 240,
  },
  highway: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#090915ad',
    padding: 8,
    borderRadius: 16,
  },
  road: { width: 44, height: 36, borderRadius: 8 },
  best: {
    alignItems: 'center',
    backgroundColor: '#202126df',
    padding: 10,
    borderRadius: 18,
    alignSelf: 'center',
  },
  gold: { color: colors.gold },
  modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#000000a0' },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {
    maxHeight: '85%',
    backgroundColor: '#15152b',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#3c3c55',
  },
  sheetContent: { padding: 24, gap: 18 },
  settingsTitle: { color: 'white', fontSize: 26, fontWeight: '900' },
});

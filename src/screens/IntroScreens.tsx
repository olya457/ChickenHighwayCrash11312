import React, { useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Motion, MotionPressable } from '../components/motion';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import { art } from '../data/catalog';
import { colors, ui } from '../components/ui';
import { useProgress } from '../state/ProgressProvider';
export function LoaderScreen({ onDone }: { onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 393, height / 852, 1.15);
  const done = useRef(false);
  const finish = () => {
    if (!done.current) {
      done.current = true;
      onDone();
    }
  };
  return (
    <ImageBackground source={art.background} style={ui.page}>
      <View style={styles.shade} />
      <View style={[styles.loader, { top: height * 0.285 }]}>
        <Motion
          kind="float"
          style={{ width: 300 * scale, height: 160 * scale }}
        >
          <Image
            source={art.logo}
            resizeMode="contain"
            style={[
              styles.logo,
              { width: 300 * scale, height: 300 * scale, top: -70 * scale },
            ]}
          />
        </Motion>
        <Motion
          delay={100}
          style={[styles.brandPanel, { paddingVertical: 12 * scale }]}
        >
          <View pointerEvents="none" style={styles.brandGlow}>
            {Array.from({ length: 24 }, (_, index) => (
              <LinearGradient
                key={index}
                colors={[
                  '#efa31300',
                  '#efa31380',
                  '#efa313c0',
                  '#efa31380',
                  '#efa31300',
                ]}
                locations={[0, 0.2, 0.5, 0.8, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flex: 1,
                  opacity: Math.sin((Math.PI * (index + 0.5)) / 24) ** 2,
                }}
              />
            ))}
          </View>
          <Text
            maxFontSizeMultiplier={1.2}
            adjustsFontSizeToFit
            numberOfLines={2}
            style={[
              styles.brand,
              { fontSize: 36 * scale, lineHeight: 40 * scale },
            ]}
          >
            <Text style={styles.brandTop}>Feathered</Text>
            {'\n'}Highway
          </Text>
        </Motion>
        <View
          style={[styles.web, { width: 226 * scale, marginTop: 32 * scale }]}
        >
          <WebView
            scrollEnabled={false}
            originWhitelist={['*']}
            style={styles.transparent}
            onMessage={finish}
            source={{
              html: '<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:transparent;overflow:hidden}.track{margin:14px 4px;height:9px;background:#ffffff30;border-radius:20px;overflow:hidden}.bar{height:100%;background:linear-gradient(90deg,#ffac19,#ffe000);animation:load 4s linear forwards}@keyframes load{from{width:0}to{width:100%}}</style><div class="track"><div class="bar"></div></div><script>setTimeout(function(){window.ReactNativeWebView.postMessage("done")},4000)</script></html>',
            }}
            onError={finish}
          />
        </View>
        <Motion kind="pulse">
          <Text style={styles.loading}>CLUCKING IN...</Text>
        </Motion>
      </View>
    </ImageBackground>
  );
}
const slides = [
  {
    title: 'MEET YOUR CHICKEN',
    body: 'Cross the highway. Dodge the traffic. Keep clucking.',
    color: '#ffad19',
  },
  {
    title: 'TRAFFIC NEVER\nSTOPS',
    body: 'Move row by row and watch the cars before you cross.',
    color: '#25ca79',
  },
  {
    title: 'EARN. CUSTOMIZE.\nGO AGAIN.',
    body: 'Earn Eggies, unlock new looks and master every highway.',
    color: '#f3d000',
  },
];
export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const { dispatch } = useProgress();
  const { height, compact } = useResponsiveLayout();
  const { width: viewportWidth, height: viewportHeight } =
    useWindowDimensions();
  const slide = slides[index];
  return (
    <View style={ui.page}>
      <Image
        source={art.onboarding[index]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: viewportWidth,
          height: viewportHeight,
        }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['#00000000', '#00000000', '#00000099', '#000000ed']}
        locations={[0, 0.38, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView
        style={[
          styles.onboard,
          {
            paddingHorizontal: compact ? 20 : 24,
            paddingTop: 10,
            paddingBottom: compact ? 12 : 16,
          },
        ]}
      >
        <View style={styles.skip}>
          {index < 2 && (
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              onPress={() => dispatch({ type: 'onboard' })}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>SKIP</Text>
            </MotionPressable>
          )}
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.copy,
            { paddingTop: compact ? 50 : Math.max(70, height * 0.24) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Motion trigger={index}>
            <Text
              style={[
                styles.slideTitle,
                {
                  color: slide.color,
                  fontSize: compact ? 25 : 30,
                  lineHeight: compact ? 30 : 36,
                },
              ]}
            >
              {slide.title}
            </Text>
            <Text
              style={[
                styles.description,
                compact && { fontSize: 14, lineHeight: 20, marginTop: 10 },
              ]}
            >
              {slide.body}
            </Text>
            <View style={[styles.dots, compact && { marginVertical: 18 }]}>
              {slides.map((s, i) => (
                <Motion
                  kind="pop"
                  active={i === index}
                  trigger={index}
                  key={s.title}
                  style={[
                    styles.dot,
                    i === index && { backgroundColor: slide.color, width: 28 },
                  ]}
                />
              ))}
            </View>
          </Motion>
        </ScrollView>
        <View style={{ paddingTop: 8 }}>
          <MotionPressable
            accessibilityRole="button"
            accessibilityLabel={index === 2 ? 'Get started' : 'Next'}
            onPress={() =>
              index === 2
                ? dispatch({ type: 'onboard' })
                : setIndex(current => Math.min(2, current + 1))
            }
            style={[
              styles.nextButton,
              {
                minHeight: compact ? 56 : 72,
                borderColor: ['#efbe54', '#48d48b', '#f5db43'][index],
                shadowColor: slide.color,
              },
            ]}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[slide.color, ['#c4861b', '#1c9c58', '#bda008'][index]]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.nextText}>
              {index === 2 ? 'GET STARTED!' : 'NEXT →'}
            </Text>
          </MotionPressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  shade: { ...StyleSheet.absoluteFill, backgroundColor: '#050612a6' },
  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logo: { position: 'absolute' },
  brandPanel: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  brandGlow: {
    ...StyleSheet.absoluteFill,
    left: -16,
    right: -16,
  },
  brandTop: { color: '#ffd15a' },
  brand: {
    fontFamily:
      Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'sans-serif-rounded',
    fontWeight: Platform.OS === 'ios' ? 'normal' : '900',
    color: '#f7a20d',
    textShadowColor: '#ffb61980',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  web: { height: 36 },
  transparent: { backgroundColor: 'transparent' },
  loading: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '900',
    letterSpacing: 1,
  },
  onboard: { flex: 1, padding: 24, justifyContent: 'space-between' },
  skip: { alignSelf: 'flex-end', minHeight: 44 },
  skipButton: {
    minWidth: 64,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff30',
    backgroundColor: '#ffffff12',
  },
  skipText: { color: '#ffffffa6', fontSize: 13, fontWeight: '800' },
  nextButton: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  nextText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    fontFamily:
      Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'sans-serif-rounded',
    fontWeight: Platform.OS === 'ios' ? 'normal' : '900',
  },
  copy: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 8 },
  slideTitle: {
    fontSize: 30,
    fontFamily:
      Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'sans-serif-rounded',
    fontWeight: Platform.OS === 'ios' ? 'normal' : '900',
    textAlign: 'center',
  },
  description: {
    maxWidth: 330,
    alignSelf: 'center',
    color: '#d1d0d2',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 14,
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 24,
  },
  dot: { height: 8, width: 8, borderRadius: 9, backgroundColor: '#555' },
});

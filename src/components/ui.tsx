import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
  ScrollView,
} from 'react-native';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Motion, MotionPressable as Pressable, CountUp } from './motion';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
export const colors = {
  bg: '#090919',
  card: '#171728',
  muted: '#92909f',
  gold: '#ffad19',
  yellow: '#ffcf08',
  green: '#24cd7c',
  border: '#303043',
};
export function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
  color,
  style,
  maxFontSizeMultiplier,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
  maxFontSizeMultiplier?: number;
}) {
  const { compact } = useResponsiveLayout();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      <View
        style={[
          ui.button,
          compact && {
            minHeight: 48,
            paddingHorizontal: 10,
            paddingVertical: 10,
          },
          { borderColor: secondary ? '#55545c' : color || '#efbe54' },
        ]}
      >
        <LinearGradient
          pointerEvents="none"
          colors={
            disabled
              ? ['#30303e', '#252533']
              : secondary
              ? ['#303039', '#202025']
              : color
              ? [color, color + 'bb']
              : ['#ffb31b', '#df8800']
          }
          style={StyleSheet.absoluteFill}
        />
        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[ui.buttonText, compact && { fontSize: 14 }]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
export function Balance({ value }: { value: number }) {
  return (
    <Motion kind="pop" trigger={value} style={ui.balance}>
      <Text style={ui.balanceText}>
        🥚 <CountUp value={value} /> <Text style={ui.caption}>EGGIES</Text>
      </Text>
    </Motion>
  );
}
export function Page({
  title,
  subtitle,
  children,
  safeBottom = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  safeBottom?: boolean;
}) {
  const { compact, gutter, gap } = useResponsiveLayout();
  return (
    <SafeAreaView
      edges={
        safeBottom
          ? ['top', 'bottom', 'left', 'right']
          : ['top', 'left', 'right']
      }
      style={ui.page}
    >
      <ScrollView
        contentContainerStyle={[ui.content, { padding: gutter, gap }]}
        showsVerticalScrollIndicator={false}
      >
        <Motion>
          <Text style={[ui.title, compact && { fontSize: 24, marginTop: 6 }]}>
            {title}
          </Text>
        </Motion>
        {subtitle && <Text style={ui.subtitle}>{subtitle}</Text>}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Card({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}) {
  const { compact } = useResponsiveLayout();
  return (
    <Motion
      delay={delay}
      style={[
        ui.card,
        compact && { padding: 13, gap: 10, borderRadius: 20 },
        style,
      ]}
    >
      {children}
    </Motion>
  );
}
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: 18,
    paddingBottom: 28,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 16,
  },
  title: {
    fontSize: 29,
    fontWeight: '900',
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
    overflow: 'hidden',
  },
  button: {
    overflow: 'hidden',
    minHeight: 50,
    minWidth: 48,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
  balance: {
    alignSelf: 'center',
    maxWidth: '100%',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#766019',
    backgroundColor: '#27241b',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  balanceText: {
    fontSize: 21,
    color: colors.yellow,
    fontWeight: '900',
    textAlign: 'center',
  },
  caption: { fontSize: 10, color: colors.muted, fontWeight: '800' },
  heading: { flexShrink: 1, fontSize: 19, fontWeight: '900', color: '#fff' },
  body: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  green: { color: colors.green, fontWeight: '900', textAlign: 'center' },
  track: {
    height: 9,
    borderRadius: 8,
    backgroundColor: '#30303f',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 8, backgroundColor: colors.gold },
  center: { alignItems: 'center', justifyContent: 'center' },
  pill: { padding: 9, borderRadius: 14, backgroundColor: '#29293d' },
  white: { flexShrink: 1, color: 'white', fontWeight: '800' },
});

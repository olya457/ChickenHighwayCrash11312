import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { NavigationContext } from '@react-navigation/native';
const MotionContext = createContext(false);
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(true);
  const [active, setActive] = useState(
    AppState.currentState !== 'background' &&
      AppState.currentState !== 'inactive',
  );
  useEffect(() => {
    let mounted = true;
    let changed = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (mounted && !changed) {
          setReduced(value);
        }
      })
      .catch(() => {});
    const accessibility = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      value => {
        changed = true;
        setReduced(value);
      },
    );
    const app = AppState.addEventListener('change', value =>
      setActive(value === 'active'),
    );
    return () => {
      mounted = false;
      accessibility.remove();
      app.remove();
    };
  }, []);
  return (
    <MotionContext.Provider value={active && !reduced}>
      {children}
    </MotionContext.Provider>
  );
}
export function useMotionEnabled() {
  const enabled = useContext(MotionContext);
  const navigation = useContext(NavigationContext);
  const [focused, setFocused] = useState(() => navigation?.isFocused() ?? true);
  useEffect(() => {
    setFocused(navigation?.isFocused() ?? true);
    if (!navigation) {
      return;
    }
    const focus = navigation.addListener('focus', () => setFocused(true));
    const blur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      focus();
      blur();
    };
  }, [navigation]);
  return enabled && focused;
}
type MotionKind = 'enter' | 'float' | 'pulse' | 'pop' | 'shake';
export function Motion({
  children,
  style,
  kind = 'enter',
  trigger,
  delay = 0,
  active = true,
  ...props
}: ViewProps & {
  kind?: MotionKind;
  trigger?: string | number | boolean;
  delay?: number;
  active?: boolean;
}) {
  const enabled = useMotionEnabled() && active;
  const value = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    value.stopAnimation();
    if (!enabled) {
      value.setValue(1);
      return;
    }
    value.setValue(0);
    const loop = kind === 'float' || kind === 'pulse';
    const timing = (toValue: number, duration: number) =>
      Animated.timing(value, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
        isInteraction: false,
      });
    const animation = loop
      ? Animated.loop(
          Animated.sequence([
            timing(1, kind === 'float' ? 1700 : 1100),
            timing(0, kind === 'float' ? 1700 : 1100),
          ]),
        )
      : Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: kind === 'shake' ? 440 : kind === 'pop' ? 380 : 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
            isInteraction: false,
          }),
        ]);
    animation.start();
    return () => {
      animation.stop();
      value.stopAnimation();
    };
  }, [enabled, kind, trigger, delay, value]);
  const animated = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () =>
      !enabled
        ? {}
        : kind === 'float'
        ? {
            transform: [
              {
                translateY: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -7],
                }),
              },
              {
                rotate: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-1.5deg', '1.5deg'],
                }),
              },
            ],
          }
        : kind === 'pulse'
        ? {
            transform: [
              {
                scale: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.045],
                }),
              },
            ],
          }
        : kind === 'shake'
        ? {
            transform: [
              {
                translateX: value.interpolate({
                  inputRange: [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1],
                  outputRange: [0, -8, 7, -5, 4, -2, 0],
                }),
              },
            ],
          }
        : kind === 'pop'
        ? {
            transform: [
              {
                scale: value.interpolate({
                  inputRange: [0, 0.45, 1],
                  outputRange: [0.9, 1.08, 1],
                }),
              },
            ],
          }
        : {
            opacity: value,
            transform: [
              {
                translateY: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
              {
                scale: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.97, 1],
                }),
              },
            ],
          },
    [enabled, kind, value],
  );
  return (
    <Animated.View {...props} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function MotionPressable({
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: PressableProps) {
  const enabled = useMotionEnabled();
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const animate = (toValue: number) => {
    if (!enabled || disabled) {
      return;
    }
    Animated.spring(scale, {
      toValue,
      speed: 32,
      bounciness: 7,
      useNativeDriver: true,
      isInteraction: false,
    }).start();
  };
  useEffect(() => {
    if (!enabled || disabled) {
      scale.stopAnimation();
      scale.setValue(1);
      setPressed(false);
    }
    return () => scale.stopAnimation();
  }, [enabled, disabled, scale]);
  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={event => {
        setPressed(true);
        animate(0.96);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        setPressed(false);
        animate(1);
        onPressOut?.(event);
      }}
      style={[
        typeof style === 'function' ? style({ pressed }) : style,
        { transform: [{ scale }] },
      ]}
    />
  );
}
export function CountUp({
  value,
  style,
  prefix = '',
  suffix = '',
  duration = 650,
}: {
  value: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const enabled = useMotionEnabled();
  const number = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);
  const first = useRef(true);
  useEffect(() => {
    if (!enabled) {
      number.setValue(value);
      setDisplay(value);
      return;
    }
    if (first.current) {
      number.setValue(0);
      first.current = false;
    }
    const listener = number.addListener(({ value: current }) =>
      setDisplay(Math.round(current)),
    );
    const animation = Animated.timing(number, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
      isInteraction: false,
    });
    animation.start();
    return () => {
      animation.stop();
      number.removeListener(listener);
    };
  }, [value, enabled, number, duration]);
  return (
    <Text accessibilityLabel={`${prefix}${value}${suffix}`} style={style}>
      {prefix}
      {(enabled ? display : value).toLocaleString()}
      {suffix}
    </Text>
  );
}
export function ProgressFill({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  const enabled = useMotionEnabled();
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const toValue = Math.max(0, Math.min(1, value));
    if (!enabled) {
      width.setValue(toValue);
      return;
    }
    width.setValue(0);
    const animation = Animated.timing(width, {
      toValue,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [value, enabled, width]);
  return (
    <Animated.View
      style={{
        height: '100%',
        borderRadius: 8,
        backgroundColor: color,
        width: width.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', '100%'],
        }),
      }}
    />
  );
}
export const EggBurst = React.memo(function EggBurst({
  trigger,
  active = true,
}: {
  trigger: string | number;
  active?: boolean;
}) {
  const enabled = useMotionEnabled() && active;
  const value = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!enabled) {
      value.setValue(1);
      return;
    }
    value.setValue(0);
    const animation = Animated.timing(value, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [trigger, enabled, value]);
  if (!enabled) {
    return null;
  }
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <Animated.Text
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              fontSize: i % 3 === 0 ? 17 : 13,
              color: '#ffd447',
              opacity: value.interpolate({
                inputRange: [0, 0.12, 0.7, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateX: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, Math.cos(angle) * 100],
                  }),
                },
                {
                  translateY: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, Math.sin(angle) * 70 - 25],
                  }),
                },
                {
                  scale: value.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.5, 1.1, 0.6],
                  }),
                },
                {
                  rotate: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', i % 2 ? '70deg' : '-70deg'],
                  }),
                },
              ],
            }}
          >
            {i % 3 === 0 ? '🥚' : '✦'}
          </Animated.Text>
        );
      })}
    </View>
  );
});

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  BackHandler,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
  Vibration,
  ScrollView,
} from 'react-native';
import {
  Motion,
  MotionPressable as Pressable,
  EggBurst,
  useMotionEnabled,
} from '../components/motion';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { boosts, chickens, highways, vehicles, BoostId } from '../data/catalog';
import { Button, colors, ui } from '../components/ui';
import { useProgress } from '../state/ProgressProvider';
import { activate, createGame, move, summary, tick } from '../game/engine';
import { VISIBLE_ROWS, rowTop, visibleRows, roadTiles } from '../game/viewport';
import { Sound, SoundHandle } from '../services/Sound';
export function GameScreen({
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Game'>) {
  const { state, dispatch } = useProgress();
  const { width, compact, gutter, insets } = useResponsiveLayout();
  const [game] = useState(() => createGame(width));
  const [frame, setFrame] = useState(0);
  const [boardHeight, setBoardHeight] = useState(480);
  const [paused, setPaused] = useState(false);
  const motionEnabled = useMotionEnabled();
  const [feedback, setFeedback] = useState<{
    text: string;
    burst: boolean;
    id: number;
  } | null>(null);
  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = setTimeout(() => setFeedback(null), 1100);
    return () => clearTimeout(timer);
  }, [feedback]);
  const pausedRef = useRef(false);
  const finished = useRef(false);
  const sound = useRef<SoundHandle>(null);
  const settings = useRef(state);
  settings.current = state;
  const exit = useRef(() => {});
  const checkpoint = useRef(() => {});
  const cell = boardHeight / VISIBLE_ROWS;
  const chickenY = rowTop(game.row, game.camera, cell);
  const highway = highways.find(h => h.id === state.highway)!;
  const finish = () => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    const run = summary(game);
    dispatch({ type: 'run', run });
    navigation.replace('Result', { run });
  };
  exit.current = finish;
  checkpoint.current = () => dispatch({ type: 'run', run: summary(game) });
  useEffect(() => {
    let raf = 0;
    let previous = 0;
    let crashAt = 0;
    const loop = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, 0.04) : 0;
      previous = now;
      if (!pausedRef.current && !finished.current) {
        const wasCrash = game.crashed;
        const shield = game.shield;
        const rows = game.furthest;
        const reward = game.eggies;
        tick(game, dt, width);
        if (game.furthest > rows) {
          sound.current?.play('step');
          setFeedback({
            text: `+${game.eggies - reward} EGGIES`,
            burst: false,
            id: game.furthest,
          });
          checkpoint.current();
        }
        if (shield && !game.shield) {
          setFeedback({
            text: 'SHIELD SAVED YOU!',
            burst: true,
            id: game.time,
          });
          sound.current?.play('boost');
          if (settings.current.vibration) {
            Vibration.vibrate(70);
          }
        }
        if (!wasCrash && game.crashed) {
          crashAt = now;
          sound.current?.play('crash');
          if (settings.current.vibration) {
            Vibration.vibrate([0, 100, 80, 150]);
          }
        }
        if (game.crashed && now - crashAt > 850) {
          exit.current();
        }
        setFrame(f => f + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const sub = AppState.addEventListener('change', s => {
      if (s !== 'active') {
        pausedRef.current = true;
        setPaused(true);
      }
    });
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      pausedRef.current = true;
      setPaused(true);
      return true;
    });
    return () => {
      cancelAnimationFrame(raf);
      sub.remove();
      back.remove();
    };
  }, [game, navigation, width]);
  const cross = (direction: 1 | -1) => {
    if (!pausedRef.current) {
      move(game, direction, width);
    }
  };
  const crossRef = useRef(cross);
  crossRef.current = cross;
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > Math.max(30, Math.abs(g.dy))) {
            return;
          }
          crossRef.current(g.dy > 25 ? -1 : 1);
        },
      }),
    [],
  );
  const activateBoost = (id: BoostId) => {
    if (!paused && state.boosts[id] > 0 && activate(game, id)) {
      setFeedback({
        text:
          boosts.find(boost => boost.id === id)!.name.toUpperCase() + ' ON!',
        burst: true,
        id: game.time,
      });
      dispatch({ type: 'consume', id });
      checkpoint.current();
      sound.current?.play('boost');
    }
  };
  return (
    <SafeAreaView style={ui.page}>
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: gutter,
            paddingVertical: compact ? 6 : 12,
            gap: 6,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pause game"
          onPress={() => {
            pausedRef.current = true;
            setPaused(true);
          }}
          style={styles.close}
        >
          <Text style={styles.closeText}>Ⅱ</Text>
        </Pressable>
        <Motion
          kind="pop"
          trigger={game.furthest}
          active={!paused}
          style={styles.stat}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.25}
            style={styles.number}
          >
            {game.furthest}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.25}
            style={ui.caption}
          >
            ROWS
          </Text>
        </Motion>
        <Motion
          kind="pop"
          trigger={game.eggies}
          active={!paused}
          style={styles.stat}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.25}
            style={styles.number}
          >
            {game.eggies}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.25}
            style={ui.caption}
          >
            EGGIES
          </Text>
        </Motion>
        <View style={styles.stat}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.25}
            style={styles.number}
          >
            {game.multiplier.toFixed(2)}×
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.25}
            style={ui.caption}
          >
            MULTIPLIER
          </Text>
        </View>
      </View>
      <View
        style={styles.board}
        onLayout={e => setBoardHeight(e.nativeEvent.layout.height)}
        {...pan.panHandlers}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {roadTiles(game.camera, cell).map(tile => (
            <Image
              key={tile.id}
              source={highway.image}
              resizeMode="stretch"
              style={{
                position: 'absolute',
                left: 0,
                top: tile.top,
                width,
                height: boardHeight,
              }}
            />
          ))}
          {visibleRows(game.camera).map(row => {
            const lane = game.lanes.find(l => l.row === row);
            return (
              <View
                pointerEvents="none"
                key={row}
                style={[
                  styles.lane,
                  { top: rowTop(row, game.camera, cell), height: cell },
                ]}
              >
                {row === 0 ? (
                  <Text style={styles.start}>START · TAP TO CROSS</Text>
                ) : (
                  lane?.cars.map((car, j) => (
                    <Image
                      key={j}
                      source={
                        vehicles[car.type].images[car.direction === 1 ? 1 : 0]
                      }
                      resizeMode="contain"
                      style={{
                        position: 'absolute',
                        left: car.x,
                        width: vehicles[car.type].width,
                        height: cell * 0.85,
                        top: cell * 0.075,
                      }}
                    />
                  ))
                )}
              </View>
            );
          })}
          <View
            pointerEvents="none"
            style={[
              styles.bird,
              {
                left: width / 2 - 27,
                top:
                  chickenY +
                  cell * 0.05 -
                  (motionEnabled
                    ? Math.sin((game.hop / 0.18) * Math.PI) * 12
                    : 0),
                width: 54,
                height: cell * 0.9,
                transform: [
                  { rotate: game.crashed ? '85deg' : '0deg' },
                  {
                    scaleX: motionEnabled
                      ? 1 + Math.sin((game.hop / 0.18) * Math.PI) * 0.12
                      : 1,
                  },
                  {
                    scaleY: motionEnabled
                      ? 1 - Math.sin((game.hop / 0.18) * Math.PI) * 0.1
                      : 1,
                  },
                ],
                opacity:
                  motionEnabled &&
                  game.time < game.invincibleUntil &&
                  frame % 12 < 6
                    ? 0.45
                    : 1,
              },
            ]}
          >
            {game.shield && (
              <Motion
                kind="pulse"
                active={!paused}
                style={[StyleSheet.absoluteFill, styles.shield]}
              />
            )}
            <Image
              source={chickens.find(c => c.id === state.chicken)!.image}
              resizeMode="contain"
              style={styles.birdImage}
            />
            {game.rush && (
              <Motion kind="pulse" active={!paused} style={styles.rush}>
                <Text style={{ color: colors.yellow, fontSize: 12 }}>
                  ✦ 🥚 ✦
                </Text>
              </Motion>
            )}
          </View>
          {game.crashed && (
            <Motion kind="shake" style={styles.crashPosition}>
              <Text style={styles.crash}>CRASH!</Text>
            </Motion>
          )}
          {feedback && !game.crashed && (
            <Motion
              pointerEvents="none"
              trigger={feedback.id}
              style={styles.feedback}
              active={!paused}
            >
              <Text style={styles.feedbackText}>{feedback.text}</Text>
              <EggBurst
                trigger={feedback.id}
                active={feedback.burst && !paused}
              />
            </Motion>
          )}
          {game.slowUntil > game.time && (
            <Motion style={styles.effect}>
              <Text style={styles.effectText}>
                TRAFFIC SLOW · {Math.ceil(game.slowUntil - game.time)}s
              </Text>
            </Motion>
          )}
        </View>
      </View>
      <View
        style={[
          styles.boostBar,
          { paddingHorizontal: gutter, gap: compact ? 6 : 8 },
        ]}
      >
        {boosts.map(b => {
          const active =
            b.id === 'shield'
              ? game.shield
              : b.id === 'rush'
              ? game.rush
              : game.slowUntil > game.time;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Activate ${b.name}`}
              disabled={active || state.boosts[b.id] === 0 || game.crashed}
              key={b.id}
              onPress={() => activateBoost(b.id)}
              style={[
                styles.boost,
                {
                  borderColor: active ? b.color : colors.border,
                  opacity: state.boosts[b.id] === 0 && !active ? 0.45 : 1,
                },
              ]}
            >
              <Image source={b.image} style={styles.boostImage} />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                maxFontSizeMultiplier={1.3}
                style={styles.boostText}
              >
                {active ? 'ACTIVE' : `×${state.boosts[b.id]}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View
        style={[
          styles.controls,
          { paddingHorizontal: gutter, gap: compact ? 8 : 14 },
        ]}
      >
        <Button
          title="↓ RETURN"
          maxFontSizeMultiplier={1.3}
          secondary
          style={styles.grow}
          disabled={game.row <= Math.max(0, game.furthest - 3) || game.crashed}
          onPress={() => cross(-1)}
        />
        <Button
          title="↑ CROSS"
          maxFontSizeMultiplier={1.3}
          style={styles.cross}
          disabled={game.crashed}
          onPress={() => cross(1)}
        />
      </View>
      <Text
        maxFontSizeMultiplier={1.2}
        style={[styles.hint, compact && { paddingVertical: 4 }]}
      >
        Tap / swipe up to cross · Swipe down to return
      </Text>
      <Sound ref={sound} enabled={state.sound} />
      {paused && (
        <View
          style={[
            styles.pause,
            {
              paddingHorizontal: gutter,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <ScrollView
            style={{ width: '100%', maxWidth: 380, flexGrow: 0 }}
            contentContainerStyle={{ paddingVertical: 8 }}
            bounces={false}
          >
            <Motion
              style={[styles.pauseCard, compact && { padding: 16, gap: 14 }]}
            >
              <Text style={styles.pauseTitle}>TAKE A BREATHER</Text>
              <Text style={ui.subtitle}>
                Traffic is paused. Your next move can wait.
              </Text>
              <Button
                title="RESUME"
                onPress={() => {
                  pausedRef.current = false;
                  setPaused(false);
                }}
              />
              <Button title="END RUN" secondary onPress={finish} />
            </Motion>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#454552',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222230',
  },
  closeText: { fontSize: 22, color: 'white' },
  number: {
    color: colors.gold,
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'center',
  },
  board: { flex: 1, overflow: 'hidden', minHeight: 0 },
  stat: { flex: 1, minWidth: 0, alignItems: 'center' },
  lane: { position: 'absolute', left: 0, right: 0 },
  start: {
    color: '#fff8',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 5,
  },
  bird: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  birdImage: { width: '100%', height: '100%' },
  shield: {
    borderWidth: 2,
    borderColor: '#78d9ff',
    backgroundColor: '#36adff40',
    borderRadius: 50,
    shadowColor: '#4dbbff',
    shadowRadius: 12,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  rush: { position: 'absolute', bottom: 0, color: colors.yellow, fontSize: 12 },
  feedback: {
    position: 'absolute',
    top: '22%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#131322df',
    borderRadius: 18,
  },
  feedbackText: { color: colors.yellow, fontSize: 15, fontWeight: '900' },
  crashPosition: { position: 'absolute', top: '38%', alignSelf: 'center' },
  crash: {
    color: '#ff4d4d',
    fontSize: 48,
    fontWeight: '900',
    textShadowColor: 'white',
    textShadowRadius: 3,
    textShadowOffset: { width: 2, height: 2 },
  },
  effect: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    backgroundColor: '#402061cc',
    padding: 8,
    borderRadius: 16,
  },
  effectText: { color: '#daa8ff', fontWeight: '900', fontSize: 12 },
  boostBar: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 8,
  },
  boost: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: '#1b1b31',
  },
  boostImage: { width: 25, height: 25 },
  boostText: { color: 'white', fontSize: 10, fontWeight: '900', flexShrink: 1 },
  controls: { flexDirection: 'row', gap: 14, paddingHorizontal: 22 },
  grow: { flex: 1 },
  cross: { flex: 1.5 },
  hint: { fontSize: 10, color: colors.muted, textAlign: 'center', padding: 8 },
  pause: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#050613dd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pauseCard: {
    width: '100%',
    maxWidth: 380,
    gap: 20,
    padding: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
  },
  pauseTitle: {
    fontSize: 24,
    color: colors.gold,
    fontWeight: '900',
    textAlign: 'center',
  },
});

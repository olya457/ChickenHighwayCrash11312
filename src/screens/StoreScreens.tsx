import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  Motion,
  MotionPressable as Pressable,
  EggBurst,
  ProgressFill,
} from '../components/motion';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Balance, Button, Card, Page, colors, ui } from '../components/ui';
import {
  boosts,
  challenges,
  chickens,
  highways,
  ChickenId,
  HighwayId,
} from '../data/catalog';
import { useProgress } from '../state/ProgressProvider';
export function BoostsScreen() {
  const { compact, narrow } = useResponsiveLayout();
  const { state, dispatch } = useProgress();
  const [notice, setNotice] = useState('');
  const [purchasedBoost, setPurchasedBoost] = useState('');
  const totalBoosts = Object.values(state.boosts).join('-');
  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = setTimeout(() => setNotice(''), 1800);
    return () => clearTimeout(timer);
  }, [notice, totalBoosts]);
  return (
    <Page title="BOOSTS" subtitle="Power up your run with Eggies">
      <Balance value={state.eggies} />
      {!!notice && (
        <Motion trigger={Object.values(state.boosts).join('-')} kind="pop">
          <Text accessibilityLiveRegion="polite" style={ui.green}>
            {notice}
          </Text>
        </Motion>
      )}
      {boosts.map((b, index) => (
        <Card key={b.id} delay={index * 75}>
          <View style={[ui.row, narrow && { flexWrap: 'wrap', gap: 8 }]}>
            <Motion kind="pop" trigger={state.boosts[b.id]}>
              <Image
                source={b.image}
                style={[styles.boost, compact && { width: 50, height: 50 }]}
              />
              <EggBurst
                trigger={state.boosts[b.id]}
                active={!!notice && purchasedBoost === b.id}
              />
            </Motion>
            <View style={styles.grow}>
              <Text style={ui.heading}>{b.name}</Text>
              <Text style={ui.body}>{b.description}</Text>
            </View>
            <Text style={[ui.pill, { color: b.color }]}>
              ×{state.boosts[b.id]}
            </Text>
          </View>
          <View style={ui.row}>
            <Text style={styles.price}>🥚 {b.price}</Text>
            <Button
              title="BUY"
              color={b.color}
              disabled={state.eggies < b.price}
              onPress={() => {
                dispatch({ type: 'buyBoost', id: b.id });
                setNotice(b.name + ' added!');
                setPurchasedBoost(b.id);
              }}
            />
          </View>
          {state.eggies < b.price && (
            <Text style={styles.insufficient}>NOT ENOUGH EGGIES</Text>
          )}
        </Card>
      ))}
      <Text style={ui.subtitle}>
        Activate your boosts during a run using the buttons below the road. Egg
        Rush applies to your entire run.
      </Text>
    </Page>
  );
}
export function ChallengesScreen() {
  const { narrow } = useResponsiveLayout();
  const { state } = useProgress();
  return (
    <Page
      title="🏆 CHALLENGES"
      subtitle="Complete challenges to earn Eggies & unlock skins"
    >
      {challenges.map((c, index) => {
        const progress = state.challengeProgress[c.id];
        const done = state.completed.includes(c.id);
        return (
          <Card key={c.id} delay={index * 60}>
            <View
              style={[
                ui.row,
                narrow && { flexDirection: 'column', alignItems: 'stretch' },
              ]}
            >
              <View style={[styles.grow, narrow && { flex: 0 }]}>
                <Text style={ui.heading}>{c.name}</Text>
                <Text style={ui.body}>{c.description}</Text>
              </View>
              <Motion
                kind="pop"
                trigger={done}
                style={[styles.reward, narrow && { alignSelf: 'flex-start' }]}
              >
                <Text style={styles.price}>🥚</Text>
                <Text style={styles.rewardText}>{c.reward} Eggies</Text>
              </Motion>
            </View>
            {c.unlock && <Text style={styles.rewardText}>+ {c.unlock}</Text>}
            <View style={ui.row}>
              <View style={[ui.track, styles.grow]}>
                <ProgressFill
                  value={progress / c.target}
                  color={done ? colors.green : colors.gold}
                />
              </View>
              <Text style={ui.caption}>
                {progress} / {c.target}
              </Text>
            </View>
            <View style={ui.pill}>
              <Text style={done ? ui.green : styles.status}>
                {done
                  ? '✓ COMPLETED · REWARD RECEIVED'
                  : `${c.target - progress} more to go`}
              </Text>
            </View>
          </Card>
        );
      })}
      <Card>
        <Text style={ui.heading}>♛ Boss</Text>
        <Text style={ui.body}>
          Complete all five challenges to unlock Chicken Boss and Mountain
          Highway.
        </Text>
        <Text style={state.completed.length === 5 ? ui.green : styles.status}>
          {state.completed.length === 5
            ? '✓ BOTH SKINS UNLOCKED'
            : `${state.completed.length} / 5 challenges`}
        </Text>
      </Card>
    </Page>
  );
}
export function CustomizeScreen() {
  const { narrow, contentWidth, previewHeight } = useResponsiveLayout();
  const columns = narrow ? 2 : 3;
  const tileWidth = Math.floor((contentWidth - (columns - 1) * 10) / columns);
  const { state, dispatch } = useProgress();
  const [tab, setTab] = useState<'chicken' | 'highway'>('chicken');
  const [equippedEffect, setEquippedEffect] = useState(0);
  useEffect(() => {
    if (!equippedEffect) {
      return;
    }
    const timer = setTimeout(() => setEquippedEffect(0), 1200);
    return () => clearTimeout(timer);
  }, [equippedEffect]);
  const [chicken, setChicken] = useState<ChickenId>(state.chicken);
  const [highway, setHighway] = useState<HighwayId>(state.highway);
  const selected =
    tab === 'chicken'
      ? chickens.find(c => c.id === chicken)!
      : highways.find(h => h.id === highway)!;
  const owned =
    tab === 'chicken'
      ? state.chickens.includes(chicken)
      : state.highways.includes(highway);
  const equipped =
    tab === 'chicken' ? state.chicken === chicken : state.highway === highway;
  return (
    <Page title="CUSTOMIZE">
      <View style={styles.tabs}>
        {(['chicken', 'highway'] as const).map(t => (
          <Button
            key={t}
            title={t.toUpperCase()}
            secondary={t !== tab}
            style={styles.grow}
            onPress={() => setTab(t)}
          />
        ))}
      </View>
      <Balance value={state.eggies} />
      <Card>
        <Motion trigger={tab + selected.id}>
          <Image
            source={selected.image}
            resizeMode={tab === 'chicken' ? 'contain' : 'cover'}
            style={[
              tab === 'chicken' ? styles.chickenPreview : styles.roadPreview,
              { height: previewHeight },
            ]}
          />
          <EggBurst trigger={equippedEffect} active={equippedEffect > 0} />
        </Motion>
        <Text style={[ui.heading, styles.center]}>{selected.name}</Text>
        <Text style={[ui.body, styles.center]}>{selected.description}</Text>
        <Button
          title={
            equipped
              ? '✓ EQUIPPED'
              : owned
              ? 'EQUIP'
              : selected.price !== undefined
              ? `🥚 ${selected.price} — BUY & EQUIP`
              : selected.unlock!
          }
          color={equipped ? colors.green : undefined}
          disabled={
            equipped ||
            (!owned &&
              (selected.price === undefined || state.eggies < selected.price))
          }
          onPress={() => {
            tab === 'chicken'
              ? dispatch({ type: 'chicken', id: chicken })
              : dispatch({ type: 'highway', id: highway });
            setEquippedEffect(value => value + 1);
          }}
        />
      </Card>
      {tab === 'chicken' ? (
        <View style={styles.grid}>
          {chickens.map(c => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={c.name}
              key={c.id}
              onPress={() => setChicken(c.id)}
              style={[
                styles.tile,
                { width: tileWidth },
                c.id === chicken && styles.selected,
              ]}
            >
              <Image
                source={c.image}
                style={styles.thumb}
                resizeMode="contain"
              />
              <Text style={styles.tileName}>
                {c.name.replace(' Chicken', '')}
              </Text>
              <Text style={styles.small}>
                {state.chickens.includes(c.id)
                  ? state.chicken === c.id
                    ? '✓ EQUIPPED'
                    : 'OWNED'
                  : c.price
                  ? `🥚 ${c.price}`
                  : 'CHALLENGE'}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        highways.map(h => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={h.name}
            key={h.id}
            style={[
              styles.roadItem,
              narrow && { padding: 10, gap: 8, flexWrap: 'wrap' },
              h.id === highway && styles.selected,
            ]}
            onPress={() => setHighway(h.id)}
          >
            <Image source={h.image} style={styles.roadThumb} />
            <View style={styles.grow}>
              <Text style={ui.white}>{h.name}</Text>
              <Text style={ui.body}>{h.description}</Text>
            </View>
            <Text style={styles.rewardText}>
              {state.highway === h.id
                ? 'ON'
                : state.highways.includes(h.id)
                ? 'OWNED'
                : h.price || '★'}
            </Text>
          </Pressable>
        ))
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  boost: { width: 68, height: 68 },
  price: { fontSize: 22, fontWeight: '900', color: colors.yellow },
  insufficient: {
    color: '#fa5745',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 10,
  },
  reward: {
    backgroundColor: '#35301d',
    borderColor: '#78601d',
    borderWidth: 1,
    borderRadius: 16,
    padding: 9,
    alignItems: 'center',
  },
  rewardText: { fontSize: 10, color: colors.yellow, fontWeight: '900' },
  status: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  chickenPreview: { width: '100%', height: 210 },
  roadPreview: { width: '100%', height: 180, borderRadius: 16 },
  center: { textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    padding: 9,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  selected: { borderColor: colors.gold, backgroundColor: '#2c241f' },
  thumb: { width: '100%', height: 103 },
  tileName: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  small: { fontSize: 8, color: colors.gold, marginTop: 6, fontWeight: '800' },
  roadItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.card,
    padding: 13,
  },
  roadThumb: { width: 52, height: 48, borderRadius: 10 },
});

import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { art } from '../data/catalog';
import { Motion, CountUp, EggBurst } from '../components/motion';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Button, Card, Page, colors, ui } from '../components/ui';
export function ResultScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Result'>) {
  const { run } = route.params;
  const { compact, narrow } = useResponsiveLayout();
  return (
    <ImageBackground source={art.background} blurRadius={12} style={ui.page}>
      <View style={styles.overlay}>
        <Page title="RUN OVER" safeBottom>
          <View style={[styles.space, compact && { height: 8 }]} />
          <Card>
            {[
              ['ROWS COMPLETED', run.rows],
              ['BEST MULTIPLIER', run.multiplier.toFixed(2) + '×'],
              ['BASE REWARD', '+' + run.baseReward],
              ['TOTAL EGGIES', '+' + run.eggies],
            ].map(([label, value], i) => (
              <Motion
                delay={200 + i * 130}
                key={label}
                style={[
                  ui.row,
                  styles.stat,
                  compact && { paddingVertical: 8 },
                  { flexWrap: 'wrap' },
                  i === 3 && styles.total,
                ]}
              >
                <Text style={[ui.caption, i === 3 && styles.gold]}>
                  {label}
                </Text>
                {i === 1 ? (
                  <Text style={ui.heading}>{value}</Text>
                ) : (
                  <CountUp
                    value={
                      i === 0 ? run.rows : i === 2 ? run.baseReward : run.eggies
                    }
                    prefix={i > 1 ? '+' : ''}
                    duration={1000}
                    style={[ui.heading, (i === 0 || i === 3) && styles.gold]}
                  />
                )}
              </Motion>
            ))}
            <EggBurst trigger={run.id} active={run.eggies > 0} />
          </Card>
          <Text style={ui.subtitle}>
            Challenge rewards are added automatically to your balance.
          </Text>
          <View
            style={[
              ui.row,
              narrow && { flexDirection: 'column', alignItems: 'stretch' },
            ]}
          >
            <Button
              title="HOME"
              secondary
              style={narrow ? undefined : styles.grow}
              onPress={() => navigation.popToTop()}
            />
            <Button
              title="PLAY AGAIN"
              style={narrow ? undefined : styles.grow}
              onPress={() => navigation.replace('Game')}
            />
          </View>
        </Page>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#050810db' },
  space: { height: 70 },
  stat: { paddingVertical: 14 },
  total: { borderTopWidth: 1, borderTopColor: colors.border },
  gold: { color: colors.yellow },
  grow: { flex: 1 },
});

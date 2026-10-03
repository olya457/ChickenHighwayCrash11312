import React from 'react';
import { AccessibilityInfo, Animated, AppState, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import {
  Motion,
  MotionProvider,
  useMotionEnabled,
} from '../src/components/motion';

jest.mock('@react-navigation/native', () => ({
  NavigationContext: require('react').createContext(undefined),
}));

function Probe() {
  const enabled = useMotionEnabled();
  return <Text>{enabled ? 'enabled' : 'disabled'}</Text>;
}

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

test('reduced motion renders content without starting a decorative loop', async () => {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(true);
  const loop = jest.spyOn(Animated, 'loop');
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <MotionProvider>
        <Motion kind="float">
          <Probe />
        </Motion>
      </MotionProvider>,
    );
  });
  expect(tree!.root.findByType(Text).props.children).toBe('disabled');
  expect(loop).not.toHaveBeenCalled();
  await act(async () => tree!.unmount());
});

test('backgrounding stops looping animation and foregrounding restarts it', async () => {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(false);
  const appListener = jest.spyOn(AppState, 'addEventListener');
  const start = jest.fn();
  const stop = jest.fn();
  jest
    .spyOn(Animated, 'loop')
    .mockReturnValue({ start, stop, reset: jest.fn() });
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <MotionProvider>
        <Motion kind="float">
          <Probe />
        </Motion>
      </MotionProvider>,
    );
  });
  const onState = appListener.mock.calls[0][1];
  await act(async () => onState('active'));
  expect(tree!.root.findByType(Text).props.children).toBe('enabled');
  expect(start).toHaveBeenCalled();
  await act(async () => onState('background'));
  expect(tree!.root.findByType(Text).props.children).toBe('disabled');
  expect(stop).toHaveBeenCalled();
  const calls = start.mock.calls.length;
  await act(async () => onState('active'));
  expect(start.mock.calls.length).toBeGreaterThan(calls);
  await act(async () => tree!.unmount());
});

test('changing reduced-motion preference immediately stops animations', async () => {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(false);
  const listener = jest.spyOn(AccessibilityInfo, 'addEventListener');
  const appListener = jest.spyOn(AppState, 'addEventListener');
  const stop = jest.fn();
  jest
    .spyOn(Animated, 'loop')
    .mockReturnValue({ start: jest.fn(), stop, reset: jest.fn() });
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <MotionProvider>
        <Motion kind="pulse">
          <Probe />
        </Motion>
      </MotionProvider>,
    );
  });
  await act(async () => appListener.mock.calls[0][1]('active'));
  const calls = listener.mock.calls as unknown as Array<
    [string, (enabled: boolean) => void]
  >;
  const onPreference = calls.find(
    ([event]) => event === 'reduceMotionChanged',
  )![1];
  await act(async () => onPreference(true));
  expect(tree!.root.findByType(Text).props.children).toBe('disabled');
  expect(stop).toHaveBeenCalled();
  await act(async () => tree!.unmount());
});

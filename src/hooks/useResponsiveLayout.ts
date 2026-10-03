import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const usableWidth = width - insets.left - insets.right;
  const usableHeight = height - insets.top - insets.bottom;
  const compact = usableWidth <= 360 || usableHeight < 700;
  const narrow = usableWidth / Math.max(1, fontScale) < 350;
  const gutter = compact ? 12 : 18;
  return {
    width: usableWidth,
    height: usableHeight,
    compact,
    narrow,
    gutter,
    gap: compact ? 10 : 16,
    contentWidth: Math.min(600, usableWidth) - gutter * 2,
    previewHeight: Math.max(130, Math.min(210, usableHeight * 0.28)),
    insets,
  };
}

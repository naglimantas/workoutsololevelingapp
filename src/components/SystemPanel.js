import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function SystemPanel({ children, style, penalty = false, glow = false, noPad = false }) {
  const borderColor = penalty
    ? colors.penalty
    : glow
    ? colors.electricBlue
    : colors.border;

  const glowShadow = penalty
    ? { shadowColor: colors.penalty, shadowOpacity: 0.6 }
    : glow
    ? { shadowColor: colors.electricBlue, shadowOpacity: 0.5 }
    : {};

  return (
    <View
      style={[
        styles.panel,
        { borderColor },
        glow || penalty ? { ...glowShadow, elevation: 8, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } } : {},
        noPad ? styles.noPad : {},
        style,
      ]}
    >
      {/* Corner accents */}
      <View style={[styles.corner, styles.tl, { borderColor }]} />
      <View style={[styles.corner, styles.tr, { borderColor }]} />
      <View style={[styles.corner, styles.bl, { borderColor }]} />
      <View style={[styles.corner, styles.br, { borderColor }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderRadius: 2,
    padding: 16,
    position: 'relative',
    shadowColor: colors.electricBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  noPad: {
    padding: 0,
  },
  corner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: colors.electricBlue,
  },
  tl: {
    top: -1,
    left: -1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tr: {
    top: -1,
    right: -1,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bl: {
    bottom: -1,
    left: -1,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  br: {
    bottom: -1,
    right: -1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

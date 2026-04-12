import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const fontFamilies = {
  regular: 'Rajdhani_400Regular',
  medium: 'Rajdhani_500Medium',
  semiBold: 'Rajdhani_600SemiBold',
  bold: 'Rajdhani_700Bold',
};

export const typography = StyleSheet.create({
  // Display
  display: {
    fontFamily: fontFamilies.bold,
    fontSize: 48,
    color: colors.textPrimary,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  h2: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  h3: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  small: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  system: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    color: colors.neonBlue,
    letterSpacing: 1,
  },
  systemAlert: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    color: colors.penalty,
    letterSpacing: 1,
  },
  xp: {
    fontFamily: fontFamilies.bold,
    fontSize: 22,
    color: colors.gold,
    letterSpacing: 1,
  },
  rank: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});

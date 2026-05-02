import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../theme/colors';

export default function QuestCard({ quest, onToggle, onLongPress, onProgressUpdate, readonly = false }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    if (readonly) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onToggle && onToggle(quest);
  }

  function handleLongPress() {
    if (readonly) return;
    onLongPress && onLongPress(quest);
  }

  const isPenalty = quest.isPenalty;
  const isCompleted = quest.completed;

  const borderColor = isPenalty
    ? colors.penalty
    : isCompleted
    ? colors.success
    : colors.border;

  const bgColor = isPenalty
    ? colors.penaltyDark
    : isCompleted
    ? '#001a0d'
    : colors.surfaceElevated;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        activeOpacity={readonly ? 1 : 0.85}
        style={[
          styles.card,
          { borderColor, backgroundColor: bgColor },
          isPenalty && styles.penaltyGlow,
          isCompleted && styles.completedGlow,
        ]}
      >
        {/* Status indicator */}
        <View style={[styles.statusDot, { backgroundColor: isCompleted ? colors.success : borderColor }]} />

        <View style={styles.content}>
          {isPenalty && (
            <Text style={styles.penaltyTag}>⚠ PENALTY</Text>
          )}
          <View style={styles.titleRow}>
            <Text style={styles.icon}>{quest.icon || '⚔️'}</Text>
            <Text
              style={[
                styles.name,
                isCompleted && styles.completedText,
                isPenalty && { color: colors.penalty },
              ]}
            >
              {quest.name}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.target}>
              {quest.target} {quest.unit}
            </Text>
            <Text style={[styles.xp, { color: colors.gold }]}>+{quest.xp} XP</Text>
          </View>

          {isPenalty && !isCompleted && (
            <Text style={styles.penaltyMessage}>
              "The System does not forgive weakness."
            </Text>
          )}
        </View>

        {/* Completion checkmark */}
        <View style={[styles.check, { borderColor, backgroundColor: isCompleted ? borderColor : 'transparent' }]}>
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 2,
    marginBottom: 10,
    position: 'relative',
  },
  penaltyGlow: {
    shadowColor: colors.penalty,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.5,
    elevation: 6,
  },
  completedGlow: {
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  statusDot: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    alignSelf: 'stretch',
    minHeight: 40,
  },
  content: {
    flex: 1,
  },
  penaltyTag: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 9,
    color: colors.penalty,
    letterSpacing: 2,
    marginBottom: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.5,
    flex: 1,
  },
  completedText: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  target: {
    fontFamily: 'Rajdhani_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },
  xp: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  penaltyMessage: {
    fontFamily: 'Rajdhani_400Regular',
    fontSize: 11,
    color: colors.penalty + 'aa',
    fontStyle: 'italic',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkmark: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 13,
    color: colors.background,
  },
});

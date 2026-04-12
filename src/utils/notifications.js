import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNotificationSettings } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyQuestReminder(hour = 8, minute = 0) {
  await Notifications.cancelScheduledNotificationAsync('daily_quest_reminder').catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: 'daily_quest_reminder',
    content: {
      title: 'SYSTEM NOTIFICATION',
      body: 'Your daily quests await, Hunter. Arise and face your duties.',
      data: { type: 'daily_quest' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function scheduleMidnightCheck() {
  await Notifications.cancelScheduledNotificationAsync('midnight_check').catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: 'midnight_check',
    content: {
      title: '⚠ PENALTY SYSTEM ACTIVATED',
      body: 'You have failed your duties as a Hunter. A penalty has been assigned.',
      data: { type: 'penalty' },
    },
    trigger: {
      hour: 23,
      minute: 55,
      repeats: true,
    },
  });
}

export async function scheduleWeeklyBossNotification() {
  await Notifications.cancelScheduledNotificationAsync('weekly_boss').catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: 'weekly_boss',
    content: {
      title: '⚔ NEW BOSS HAS APPEARED',
      body: 'A powerful enemy stirs in the shadows. Do you dare challenge it, Hunter?',
      data: { type: 'boss_battle' },
    },
    trigger: {
      weekday: 2, // Monday
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}

export async function sendRankUpNotification(newRank) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏆 RANK UP — ' + newRank + ' CLASS',
      body: 'You have been acknowledged by the System. A new rank has been bestowed upon you.',
      data: { type: 'rank_up', rank: newRank },
    },
    trigger: null,
  });
}

export async function sendQuestCompleteNotification(questName) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✓ QUEST COMPLETE',
      body: `${questName} — The System records your effort.`,
      data: { type: 'quest_complete' },
    },
    trigger: null,
  });
}

export async function initNotifications() {
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  const settings = await getNotificationSettings();
  if (settings.enabled) {
    await scheduleDailyQuestReminder(settings.morningHour, settings.morningMinute);
    await scheduleMidnightCheck();
    await scheduleWeeklyBossNotification();
  }
  return true;
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

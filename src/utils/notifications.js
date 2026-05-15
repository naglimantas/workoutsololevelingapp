import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let restNotificationId = null;

export async function initNotifications() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleRestEndNotification(secondsUntil) {
  try {
    await cancelRestEndNotification();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚔ REST COMPLETE',
        body: 'Time to get back to work, Hunter.',
        sound: true,
      },
      trigger: { seconds: Math.max(1, secondsUntil), repeats: false },
    });
    restNotificationId = id;
  } catch {
    // Notifications not granted or unavailable
  }
}

export async function cancelRestEndNotification() {
  if (restNotificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(restNotificationId);
    } catch {}
    restNotificationId = null;
  }
}

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
  restNotificationId = null;
}

export async function sendRankUpNotification(newRank) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚔ RANK UP',
        body: `You have ascended to ${newRank} Class. The System acknowledges your power.`,
        sound: true,
      },
      trigger: null,
    });
  } catch {}
}

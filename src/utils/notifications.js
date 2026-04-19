// Push notifications disabled — not supported in standalone builds without extra config
export async function requestNotificationPermissions() { return false; }
export async function scheduleDailyQuestReminder() {}
export async function scheduleMidnightCheck() {}
export async function scheduleWeeklyBossNotification() {}
export async function sendRankUpNotification() {}
export async function sendQuestCompleteNotification() {}
export async function initNotifications() { return false; }
export async function cancelAllNotifications() {}

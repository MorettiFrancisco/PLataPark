import * as Notifications from 'expo-notifications';

export const schedulePushNotification = (date: Date) => {
  const notificationId = Notifications.scheduleNotificationAsync({
    content: {
      title: "Recordatorio de estacionamiento",
      body: "¡Tu tiempo de estacionamiento está por terminar!",
    },
    trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: (date.getTime() - Date.now()) / 1000, 
    },
  });
  return notificationId;
};

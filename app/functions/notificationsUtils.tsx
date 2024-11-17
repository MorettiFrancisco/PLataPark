import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Función para programar una notificación
export const schedulePushNotification = async (date: Date) => {
  try {
    // Cálculo del tiempo hasta la alarma
    const timeUntilAlarm = (date.getTime() - Date.now()) / 1000;

    // Si el tiempo hasta la alarma es negativo, significa que ya ha pasado el tiempo
    if (timeUntilAlarm <= 0) {
      Alert.alert('Error', 'La hora seleccionada ya ha pasado.');
      return;
    }

    // Programar la notificación
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de estacionamiento',
        body: '¡Tu tiempo de estacionamiento está por terminar!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: timeUntilAlarm,
      },
    });

    console.log('Notificación programada con ID:', identifier);
    return identifier;
  } catch (error) {
    console.error('Error al programar la notificación:', error);
  }
};

// Función para cancelar todas las notificaciones programadas
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas las notificaciones han sido canceladas.');
  } catch (error) {
    console.error('Error al cancelar las notificaciones:', error);
  }
};

// Función para cancelar una notificación específica por ID
export const cancelNotificationById = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notificación ${notificationId} cancelada.`);
  } catch (error) {
    console.error(`Error al cancelar la notificación ${notificationId}:`, error);
  }
};

// Función para obtener el token de notificación (si lo necesitas)
export const getPushNotificationToken = async () => {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Token de notificación push:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error al obtener el token de notificación:', error);
  }
};

// Función para manejar el recibo de notificaciones (en primer plano)
export const handleNotificationReceived = (notification: Notifications.Notification) => {
  console.log('Notificación recibida:', notification);
  // Puedes personalizar aquí cómo quieres manejar la notificación recibida
};

// Función para manejar la acción de una notificación (cuando el usuario interactúa)
export const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
  console.log('Respuesta de notificación:', response);
  // Aquí podrías navegar a una pantalla específica o realizar alguna acción
};

// Se podría suscribir a los eventos de notificación dentro de un hook useEffect (en el componente principal)
export const subscribeToNotificationEvents = () => {
  Notifications.addNotificationReceivedListener(handleNotificationReceived);
  Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
};

export const handleTimeChange = (
  event: any,
  selectedDate: Date | undefined,
  zonaInfo: { horarioFin: string },
  setShowPicker: (value: boolean) => void,
  setSelectedTime: (value: Date | undefined) => void,
  configureAlarm: (selectedTime: Date) => void
) => {
  const [hora, minuto] = zonaInfo.horarioFin.split(":").map(Number);
  const maxTime = new Date();
  maxTime.setHours(hora, minuto, 0, 0);

  setShowPicker(false);

  if (selectedDate && selectedDate <= maxTime) {
    setSelectedTime(selectedDate);
    configureAlarm(selectedDate);  
  } else {
    Alert.alert("Hora inválida", "La hora seleccionada no es válida.");
  }
};

export const configureAlarm = async (
  selectedTime: Date,
  setNotificationId: (id: string) => void,
  setIsAlarmSet: (value: boolean) => void
) => {
  const timeUntilAlarm = selectedTime.getTime() - Date.now();
  
  if (timeUntilAlarm < 0) {
    Alert.alert("Hora inválida", "La hora seleccionada ya pasó. Por favor, seleccione una hora futura.");
    return;
  }

  const notificationId = await schedulePushNotification(selectedTime);
  console.log("Notificación programada con ID: ", notificationId);

  if (notificationId) {
    setNotificationId(notificationId); // Guardamos el ID de la notificación para futuras cancelaciones
  }
  setIsAlarmSet(true);
};

export const showTimePicker = (setShowPicker: (value: boolean) => void) => {
  setShowPicker(true);
};
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Función para programar una notificación
export const schedulePushNotification = async (date: Date) => {
  try {
    const timeUntilAlarm = (date.getTime() - Date.now()) / 1000;

    if (timeUntilAlarm <= 0) {
      Alert.alert('Error', 'La hora seleccionada ya ha pasado.');
      return null;
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

// Función para manejar el cambio de hora y la validación
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

// Función para configurar la alarma y evitar duplicados
export const configureAlarm = async (
  selectedTime: Date,
  setNotificationId: (id: string) => void,
  setIsAlarmSet: (value: boolean) => void,
  isAlarmSet: boolean, // Comprobamos si ya está configurada la alarma
  notificationId: string // Se pasa el ID de la notificación si existe
) => {
  if (isAlarmSet) {
    Alert.alert("Alarma ya configurada", "La alarma ya está configurada.");
    return;
  }

  // Verifica si ya existe una notificación con el mismo ID antes de crear una nueva
  if (notificationId) {
    console.log(`Ya existe una notificación con el ID: ${notificationId}`);
    return;
  }

  const timeUntilAlarm = selectedTime.getTime() - Date.now();
  
  if (timeUntilAlarm < 0) {
    Alert.alert("Hora inválida", "La hora seleccionada ya pasó. Por favor, seleccione una hora futura.");
    return;
  }

  const newNotificationId = await schedulePushNotification(selectedTime);
  console.log("Notificación programada con ID: ", newNotificationId);

  if (newNotificationId) {
    setNotificationId(newNotificationId); // Guardamos el ID de la notificación para futuras cancelaciones
    setIsAlarmSet(true); // Marcamos la alarma como configurada
  }
};

// Función para mostrar el picker de hora
export const showTimePicker = (setShowPicker: (value: boolean) => void) => {
  setShowPicker(true);
};
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, Linking } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../components/routes/types';
import { isInZone } from './functions/parkingUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParkMarker = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [zonaInfo, setZonaInfo] = useState<{ mensaje: string; horarioFin: string } | null>(null);
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchLocationAndCheckZone = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
    
        const zona = isInZone(latitude, longitude);
        setZonaInfo(zona);
    
        if (zona) {
          if (zona.mensaje === "No se puede estacionar en esta zona.") {
            Alert.alert("Advertencia", zona.mensaje);
          } else if (zona.mensaje === "Debe pagar para estacionar en esta zona." && !isAlarmSet) {
            Alert.alert("Zona paga", "Puede configurar una alarma para no exceder su horario.");
          } else {
            Alert.alert("Zona libre", "La ubicación es libre para estacionar.");
          }
        } else {
          // Si no se encuentra zona, debería ser libre
          Alert.alert("Zona libre", "La ubicación es libre para estacionar.");
        }
      } catch (error) {
        Alert.alert("Error", "No se pudo obtener la ubicación.");
      }
    };

    fetchLocationAndCheckZone();

    // Revisa si hay alarma guardada en AsyncStorage
    const checkSavedAlarm = async () => {
      try {
        const savedTime = await AsyncStorage.getItem('alarmTime');
        if (savedTime) {
          const alarmTime = new Date(savedTime);
          setSelectedTime(alarmTime);
          const currentTime = new Date();
          if (alarmTime > currentTime) {
            // Si la alarma es futura, pregunta si la quiere modificar
            Alert.alert(
              "Alarma configurada",
              `Ya tienes una alarma configurada para las ${alarmTime.getHours()}:${alarmTime.getMinutes()}. ¿Quieres modificarla?`,
              [
                { text: 'Modificar', onPress: () => setShowPicker(true) },
                { text: 'Aceptar', onPress: () => checkIfTimeReached(alarmTime) },
              ]
            );
          } else {
            // Si la alarma ya ha pasado, redirige al usuario a la app de pagos
            checkIfTimeReached(alarmTime);
          }
        }
      } catch (error) {
        console.log('Error al obtener la alarma:', error);
      }
    };

    checkSavedAlarm();

    // Limpiar la notificación cuando el componente se desmonte
    return () => {
      if (notificationId) {
        Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    };
  }, [notificationId, isAlarmSet]); // Asegúrate de que el useEffect dependa de isAlarmSet

  // Función para verificar si se alcanzó el horario de finalización de la zona
  const checkIfTimeReached = (alarmTime: Date) => {
    const currentTime = new Date();
    if (alarmTime <= currentTime) {
      // Si la hora de la alarma ya pasó, abre la aplicación de pagos
      Linking.openURL('tu-esquema-de-uri://pago-estacionamiento')
        .catch((err) => console.error('Error al abrir la aplicación de pagos:', err));
    }
  };

  const handleTimeChange = (event: any, selectedDate: Date | undefined) => {
    if (!zonaInfo) return;
    const [hora, minuto] = zonaInfo.horarioFin.split(":").map(Number);
    const maxTime = new Date();
    maxTime.setHours(hora, minuto, 0, 0);
    setShowPicker(false);
    if (selectedDate) {
      setSelectedTime(selectedDate);
      configureAlarm(selectedDate); // Configurar la alarma automáticamente
    }
  };

  const configureAlarm = async (selectedTime: Date) => {
    const timeUntilAlarm = selectedTime.getTime() - Date.now();

    if (timeUntilAlarm < 0) {
      Alert.alert("Hora inválida", "La hora seleccionada ya pasó. Por favor, seleccione una hora futura.");
      return;
    }

    await AsyncStorage.setItem('alarmTime', selectedTime.toISOString());

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alarma de estacionamiento",
        body: `Tu tiempo en esta zona expira a las ${selectedTime.getHours()}:${selectedTime.getMinutes()}.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: timeUntilAlarm / 1000,
        repeats: false,
      },
    });

    setNotificationId(id);
    setIsAlarmSet(true); // Marca que la alarma está configurada
    Alert.alert("Alarma configurada", `La alarma ha sido configurada para las ${selectedTime.getHours()}:${selectedTime.getMinutes()}.`);
  };

  const handleSaveLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      Alert.alert("Ubicación guardada", "La ubicación de tu coche ha sido guardada.");
      navigation.navigate('index', { carLatitude: latitude, carLongitude: longitude });
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la ubicación.");
    }
  };

  return (
    <View style={styles.container}>
      {zonaInfo?.mensaje === "No se puede estacionar en esta zona." && (
        <Text style={styles.warningText}>No se puede estacionar en esta zona.</Text>
      )}
      {zonaInfo?.mensaje === "Debe pagar para estacionar en esta zona." && !isAlarmSet && (
        <>
          <Button title="Configurar alarma" onPress={() => setShowPicker(true)} />
          {showPicker && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              is24Hour={true}
              onChange={handleTimeChange}
            />
          )}
        </>
      )}
      {isAlarmSet && (
        <TouchableOpacity style={styles.roundButton} onPress={handleSaveLocation}>
          <Text style={styles.buttonText}>Guardar ubicación de mi coche</Text>
        </TouchableOpacity>
      )}
      {(zonaInfo?.mensaje === "Es un horario libre para estacionar." || zonaInfo === null) && (
        <TouchableOpacity style={styles.roundButton} onPress={handleSaveLocation}>
          <Text style={styles.buttonText}>Guardar ubicación de mi coche</Text>
        </TouchableOpacity>
)}

      {(zonaInfo?.mensaje === "Es un horario libre para estacionar." || zonaInfo === null) && (
        <TouchableOpacity style={styles.roundButton} onPress={handleSaveLocation}>
          <Text style={styles.buttonText}>Guardar ubicación de mi coche</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButton: {
    backgroundColor: '#CEECF5',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    elevation: 5,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  warningText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ParkMarker;

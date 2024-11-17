import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../components/routes/types';
import { isInZone } from './functions/parkingUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { schedulePushNotification } from './functions/notificationsUtils';

const ParkMarker = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [zonaInfo, setZonaInfo] = useState<{ mensaje: string; horarioFin: string } | null>(null);
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [notificationId, setNotificationId] = useState<string | null>(null);

  const fetchLocationAndCheckZone = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const zona = isInZone(latitude, longitude);
      
      console.log("Zona detectada: ", zona);
      setZonaInfo(zona);

      if (zona) {
        if (zona.mensaje === "No se puede estacionar en esta zona.") {
          Alert.alert("Advertencia", zona.mensaje);
        } else if (zona.mensaje === "Debe pagar para estacionar en esta zona." && !isAlarmSet) {
          Alert.alert("Zona paga", "Puede configurar una alarma para no exceder su horario.");
        } else if (zona.mensaje === "Es un horario libre para estacionar.") {
          Alert.alert("Zona libre", "La ubicación es libre para estacionar.");
        }
      } else {
        Alert.alert("Zona libre", "La ubicación es libre para estacionar.");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la ubicación.");
      console.log("Error al obtener la ubicación: ", error);
    }
  };

  useEffect(() => {
    fetchLocationAndCheckZone();
  }, []);

  const handleTimeChange = (event: any, selectedDate: Date | undefined) => {
    if (!zonaInfo) return;

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

  const configureAlarm = async (selectedTime: Date) => {
    const timeUntilAlarm = selectedTime.getTime() - Date.now();
  
    if (timeUntilAlarm < 0) {
      Alert.alert("Hora inválida", "La hora seleccionada ya pasó. Por favor, seleccione una hora futura.");
      return;
    }
  

    const notificationId = await schedulePushNotification(selectedTime);
    console.log("Notificación programada con ID: ", notificationId);
  
    if (notificationId) {
      setNotificationId(notificationId); 
    }
    setIsAlarmSet(true);
  };

  const handleSaveLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
  
   
      const alarmData = isAlarmSet ? { notificationId } : null;
  
      navigation.navigate('index', {
        carLatitude: latitude,
        carLongitude: longitude,
        alarmData,
        fromParkMarker: true,
      });
  
      Alert.alert("Ubicación guardada", "La ubicación de tu coche ha sido guardada.");
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
      {(zonaInfo?.mensaje === "Es un horario libre para estacionar." || isAlarmSet || zonaInfo === null) && (
        <TouchableOpacity style={styles.roundButton} onPress={handleSaveLocation} disabled={!isAlarmSet}>
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
    marginVertical: 10, 
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

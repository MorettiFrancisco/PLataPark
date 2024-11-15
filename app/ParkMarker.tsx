import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../components/routes/types';
import { isInZone } from './functions/parkingUtils';

const ParkMarker = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [zonaInfo, setZonaInfo] = useState<{ mensaje: string; horarioFin: string } | null>(null);
  const [isAlarmSet, setIsAlarmSet] = useState(false); // Estado para saber si la alarma fue configurada

  useEffect(() => {
    const fetchLocationAndCheckZone = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const zona = isInZone(latitude, longitude);
        setZonaInfo(zona);

        // Si la zona está definida, actualizamos el estado
        if (zona) {
          if (zona.mensaje === "No se puede estacionar en esta zona.") {
            setZonaInfo({ ...zona, mensaje: zona.mensaje });
          } else if (zona.mensaje === "Debe pagar para estacionar en esta zona.") {
            setZonaInfo({ ...zona, mensaje: zona.mensaje });
          } else {
            setZonaInfo({ ...zona, mensaje: "La ubicación es libre para estacionar." });
          }
        } else {
          setZonaInfo({ mensaje: "La ubicación es libre para estacionar.", horarioFin: "" });
        }
      } catch (error) {
        setZonaInfo({ mensaje: "Error al obtener la ubicación.", horarioFin: "" });
      }
    };

    fetchLocationAndCheckZone();
  }, []);

  // Función para configurar la alarma
  const configureAlarm = () => {
    if (zonaInfo) {
      Alert.alert("Alarma configurada", `La alarma ha sido configurada hasta las ${zonaInfo.horarioFin}.`);
      setIsAlarmSet(true); // Actualizamos el estado para saber que la alarma está configurada
    }
  };

  // Función para guardar la ubicación
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
      {zonaInfo?.mensaje && (
        <Text style={styles.statusText}>{zonaInfo.mensaje}</Text>
      )}

      {/* Si está en zona paga y la alarma no ha sido configurada */}
      {zonaInfo?.mensaje === "Debe pagar para estacionar en esta zona." && !isAlarmSet && (
        <>
          <Button title="Configurar alarma" onPress={configureAlarm} />
        </>
      )}

      {/* Si la alarma ya está configurada, permitimos guardar la ubicación */}
      {isAlarmSet && (
        <TouchableOpacity style={styles.roundButton} onPress={handleSaveLocation}>
          <Text style={styles.buttonText}>Guardar ubicación de mi coche</Text>
        </TouchableOpacity>
      )}

      {/* Si la zona es libre o la zona no requiere pago, mostramos el botón directamente */}
      {(zonaInfo?.mensaje === "Es un horario libre para estacionar." || zonaInfo === null || zonaInfo?.mensaje === "La ubicación es libre para estacionar.") && (
        <TouchableOpacity style={styles.roundButton} onPress={handleSaveLocation}>
          <Text style={styles.buttonText}>Guardar ubicación de mi coche</Text>
        </TouchableOpacity>
      )}

      {/* Si la alarma está configurada, mostrar la hora hasta cuando está configurada */}
      {isAlarmSet && (
        <Text style={styles.alarmText}>Alarma configurada hasta: {zonaInfo?.horarioFin}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  roundButton: {
    backgroundColor: '#CEECF5',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    elevation: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statusText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  alarmText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
  },
});

export default ParkMarker;

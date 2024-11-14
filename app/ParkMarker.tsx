import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../components/routes/types'; 
import { isInZone } from './functions/parkingUtils'; 

const ParkMarker = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSaveLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Verificar si la ubicación está en una zona válida (paga o prohibida)
      const zonaInfo = isInZone(latitude, longitude);

      let message = 'La ubicación de tu coche ha sido guardada, la zona es libre de estacionamiento.';
      if (zonaInfo) {
        // Si la zona es paga o prohibida, agregar la información al mensaje
        message = `${zonaInfo.mensaje}`;
      }

      Alert.alert('Ubicación guardada', message);
      // Navegar a la pantalla de 'index' y pasar las coordenadas
      navigation.navigate('index', { carLatitude: latitude, carLongitude: longitude });
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.roundButton} onPress={handleSaveLocation}>
        <Text style={styles.buttonText}>Guardar ubicación de mi coche</Text>
      </TouchableOpacity>
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
});

export default ParkMarker;

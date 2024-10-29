import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

const ParkMarker = () => {
  const router = useRouter();

  const handleSaveLocation = async () => {
    // Obtener la ubicación actual
    const location = await Location.getCurrentPositionAsync({});
    
    // Guardar la ubicación y volver al mapa
    Alert.alert('Ubicación guardada', 'La ubicación de tu coche ha sido guardada');
    router.push({
      pathname: '/',
      params: { carLatitude: location.coords.latitude, carLongitude: location.coords.longitude }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.roundButton} onPress={handleSaveLocation}>
        <Text style={styles.buttonText}>Guardar ubicación de mi Auto</Text>
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
    backgroundColor: '#CEECF5', // Color de fondo
    borderRadius: 30, // Hace que los bordes sean redondeados
    paddingVertical: 15,
    paddingHorizontal: 30,
    elevation: 5, // Sombra en Android
  },
  buttonText: {
    color: 'black', // Color del texto
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ParkMarker;

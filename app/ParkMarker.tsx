import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../components/routes/types'; 

const ParkMarker = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSaveLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      Alert.alert('Ubicación guardada', 'La ubicación de tu coche ha sido guardada');
      navigation.navigate('index', { 
        carLatitude: location.coords.latitude, 
        carLongitude: location.coords.longitude 
      });
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

import React, { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native'; 

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [carLocation, setCarLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const navigation = useNavigation(); 

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
      } else {
        Alert.alert('Permiso denegado', 'Necesitas conceder permisos de localización para usar esta funcionalidad.');
        setPermissionGranted(false);
      }
    })();
  }, []);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    if (permissionGranted) {
      (async () => {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);

        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      })();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [permissionGranted]);

  if (!location) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >

        {carLocation && (
          <Marker
            coordinate={{
              latitude: carLocation.latitude,
              longitude: carLocation.longitude,
            }}
            title="Mi coche"
          />
        )}

        {/* Zona Verde (Lunes a Viernes de 7 a 20 hs, Sábados de 9 a 20 hs) */}
        <Polygon
          coordinates={[
            { latitude: -34.9205, longitude: -57.9533 }, // Coordenadas aproximadas
            { latitude: -34.9215, longitude: -57.9533 },
            { latitude: -34.9215, longitude: -57.9523 },
            { latitude: -34.9205, longitude: -57.9523 },
          ]}
          strokeColor="#00FF00" // Verde
          fillColor="rgba(0, 255, 0, 0.3)"
          strokeWidth={2}
        />

        {/* Zona Azul (Lunes a Sábado de 9 a 20 hs) */}
        <Polygon
          coordinates={[
            { latitude: -34.9208, longitude: -57.9528 },
            { latitude: -34.9218, longitude: -57.9528 },
            { latitude: -34.9218, longitude: -57.9518 },
            { latitude: -34.9208, longitude: -57.9518 },
          ]}
          strokeColor="#0000FF" // Azul
          fillColor="rgba(0, 0, 255, 0.3)"
          strokeWidth={2}
        />

        {/* Zona Magenta (Lunes a Viernes de 7 a 14 hs) */}
        <Polygon
          coordinates={[
            { latitude: -34.9210, longitude: -57.9530 },
            { latitude: -34.9220, longitude: -57.9530 },
            { latitude: -34.9220, longitude: -57.9520 },
            { latitude: -34.9210, longitude: -57.9520 },
          ]}
          strokeColor="#FF00FF" // Magenta
          fillColor="rgba(255, 0, 255, 0.3)"
          strokeWidth={2}
        />

        {/* Zona Amarilla (Lunes a Viernes de 7 a 20 hs) */}
        <Polygon
          coordinates={[
            { latitude: -34.9207, longitude: -57.9532 },
            { latitude: -34.9217, longitude: -57.9532 },
            { latitude: -34.9217, longitude: -57.9522 },
            { latitude: -34.9207, longitude: -57.9522 },
          ]}
          strokeColor="#FFFF00" // Amarillo
          fillColor="rgba(255, 255, 0, 0.3)"
          strokeWidth={2}
        />

        {/* Zona donde está prohibido estacionar */}
        <Polygon
          coordinates={[
            { latitude: -34.9211, longitude: -57.9531 },
            { latitude: -34.9221, longitude: -57.9531 },
            { latitude: -34.9221, longitude: -57.9521 },
            { latitude: -34.9211, longitude: -57.9521 },
          ]}
          strokeColor="#000000" // Negro
          fillColor="rgba(0, 0, 0, 0.3)"
          strokeWidth={2}
        />

      </MapView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('ParkMarker' as never)} 
      >
        <Image
          source={require('../assets/images/LocationMarker.png')} 
          style={styles.buttonImage}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#CEECF5',
    borderRadius: 40,
    padding: 15,
    elevation: 5,
  },
  buttonImage: {
    width: 40,
    height: 40,
  },
});

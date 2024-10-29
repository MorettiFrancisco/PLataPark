import React, { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native'; 
import zonas from '../constants/ParkingZones/zonas';

interface Zona {
  coordenadas: { latitude: number; longitude: number }[];
  color: string;
}



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

        {zonas.map((zona: Zona, index: number) => (
          <Polygon
            key={index}
            coordinates={zona.coordenadas}
            strokeColor={zona.color}
            fillColor={zona.color}
            strokeWidth={2}
          />
        ))}
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

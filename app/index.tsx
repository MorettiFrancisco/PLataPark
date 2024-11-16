import React, { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Image, Alert, Text } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import zonas from '../constants/ParkingZones/zonas';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { isInZone } from './functions/parkingUtils';
import LuncherSEM from './LuncherSEM';

interface Zona {
  color: string;
  horario: string;
  dias: string[];
  horarioInicio: string;
  horarioFin: string;
  coordenadas: { latitude: number; longitude: number }[];
} 

type RouteParams = {
  carLatitude?: number;
  carLongitude?: number;
};

// Agrupamos las zonas por horario
const zonasPorHorario: { [horario: string]: Zona[] } = zonas.reduce((acc, zona) => {
  acc[zona.horario] = acc[zona.horario] ? [...acc[zona.horario], zona] : [zona];
  return acc;
}, {} as { [horario: string]: Zona[] });

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [carLocation, setCarLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [visibilidadHorarios, setVisibilidadHorarios] = useState<{ [horario: string]: boolean }>({});
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();

  const toggleHorarioVisibility = (horario: string) => {
    setVisibilidadHorarios((prevState) => ({
      ...prevState,
      [horario]: !prevState[horario],
    }));
  };

  const renderMenu = () => (
    <View style={styles.menu}>
      {Object.keys(zonasPorHorario).map((horario) => (
        <TouchableOpacity key={horario} onPress={() => toggleHorarioVisibility(horario)} style={styles.menuItem}>
          <Icon
            name={visibilidadHorarios[horario] ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={20}
            color="#000"
            style={styles.checkbox}
          />
          <Text style={styles.menuText}>{horario}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  useFocusEffect(
    React.useCallback(() => {
      const { carLatitude, carLongitude } = route.params || {};
      if (typeof carLatitude === 'number' && typeof carLongitude === 'number') {
        setCarLocation({ latitude: carLatitude, longitude: carLongitude });
      }
    }, [route.params])
  );

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
        try {
          let location = await Location.getCurrentPositionAsync({});
          setLocation(location);

          locationSubscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 1 },
            (newLocation) => {
              setLocation(newLocation);
            }
          );
        } catch (error) {
          console.error('Error obteniendo ubicación:', error);
          Alert.alert('Error', 'No se pudo obtener la ubicación.');
        }
      })();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [permissionGranted]);


  if (!location) {
    return null; // O puedes mostrar un indicador de carga aquí
  }

  return (
    <View style={styles.container}>
    <LuncherSEM/>
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
        region={
          carLocation
            ? {
                latitude: carLocation.latitude,
                longitude: carLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
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
        {/* Renderiza los polígonos por horario, si están visibles */}
        {Object.entries(zonasPorHorario).map(([horario, zonas]) =>
          visibilidadHorarios[horario] &&
          zonas.map((zona, index) => (
            <Polygon
              key={`${horario}-${index}`}
              coordinates={zona.coordenadas}
              strokeColor={zona.color}
              fillColor={zona.color}
              strokeWidth={2}
            />
          ))
        )}
      </MapView>

      <TouchableOpacity style={styles.menuToggleButton} onPress={() => setMenuVisible(!menuVisible)}>
        <Text style={styles.menuToggleButtonText}>{menuVisible ? 'Cerrar Menú' : 'Menú de zonas'}</Text>
      </TouchableOpacity>

      {menuVisible && renderMenu()}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('ParkMarker' as never)}
      >
        <Image source={require('../assets/images/LocationMarker.png')} style={styles.buttonImage} />
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
    bottom: 80,
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
  menu: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  checkbox: {
    marginRight: 10,
    fontSize: 20,
  },
  menuText: {
    fontSize: 16,
  },
  menuToggleButton: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: '#CEECF5',
    borderRadius: 20,
    padding: 10,
    elevation: 5,
  },
  menuToggleButtonText: {
    fontSize: 16,
  },
});

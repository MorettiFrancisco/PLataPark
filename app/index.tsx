import React, { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Image, Alert, Text } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import zonas from '../constants/ParkingZones/zonas';
import * as Notifications from 'expo-notifications';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';

// Define RootStackParamList for navigation
type RootStackParamList = {
  ParkMarker: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'ParkMarker'>;

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
  alarmData?: any; // Add alarmData property
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
  const [alarmActive, setAlarmActive] = useState<boolean>(false);  // Estado para la alarma
  const navigation = useNavigation<NavigationProp>();
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
      console.log('Screen focused!'); 
      console.log('Route params:', route.params);  
      const { carLatitude, carLongitude } = route.params || {};
      if (typeof carLatitude === 'number' && typeof carLongitude === 'number') {
        setCarLocation({ latitude: carLatitude, longitude: carLongitude });
      }
      console.log('Alarma activa:', alarmActive);
      if (route.params?.alarmData) {
        setAlarmActive(true);  
      }
      // Mostrar alerta si la alarma está activa al volver
      if (alarmActive) {
        console.log('Alarma activa: Cancelando notificaciones');
        cancelNotification();  // Llama directamente a la función para cancelar las notificaciones
        setAlarmActive(false); // Eliminar la alarma
      }
    }, [route.params, alarmActive]));

const cancelNotification = async () => {
  // Mostrar alerta de confirmación
  Alert.alert(
    "Cancelar notificaciones",
    "¿Estás seguro de que deseas cancelar todas las notificaciones?",
    [
      {
        text: "Sí",
        onPress: async () => {
          // Si el usuario acepta, cancelamos todas las notificaciones
          const notifications = await Notifications.getAllScheduledNotificationsAsync();
          console.log('Notificaciones activas:', notifications);  // Verificar qué notificaciones están activas
          
          // Cancelar todas las notificaciones activas
          await Notifications.cancelAllScheduledNotificationsAsync();
          console.log('Notificaciones canceladas');
        },
      },
      {
        text: "No",
        onPress: () => {
          // Si el usuario no acepta, navegar a ParkMarker
          navigation.navigate('ParkMarker');
        },
      },
    ]
  );
};

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
    const askNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "No tienes permisos para recibir notificaciones.");
      } else {
        console.log("Permisos de notificación otorgados.");
      }
    };
  
    askNotificationPermissions();
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
    top: 80,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
  },
  menuToggleButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#CEECF5',
    padding: 10,
    borderRadius: 5,
  },
  menuToggleButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

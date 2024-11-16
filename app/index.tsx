import React, { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Image, Alert, Text } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import zonas from '../constants/ParkingZones/zonas';
import * as Notifications from 'expo-notifications';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  alarmData?: any; 
  fromParkMarker?: boolean;
};

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
  const [alarmActive, setAlarmActive] = useState<boolean>(false);  
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const toggleHorarioVisibility = (horario: string) => {
    setVisibilidadHorarios((prevState) => ({
      ...prevState,
      [horario]: !prevState[horario],
    }));
  };
  
  const handleExtendTime = () => {
    setShowPicker(true); // Mostrar el selector de fecha y hora
  };

  const handleTimeChange = async (event: any, date?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      const notificaciones = await Notifications.getAllScheduledNotificationsAsync();
      if (notificaciones.length > 0) {
        const notificacionActual = notificaciones[0];
        await Notifications.cancelScheduledNotificationAsync(notificacionActual.identifier);

        const nuevaNotificacionId = await Notifications.scheduleNotificationAsync({
          content: {
            title: notificacionActual.content.title,
            body: notificacionActual.content.body,
            data: notificacionActual.content.data,
          },
          trigger: date.getTime() / 1000,
        });
        console.log("Notificación extendida. Nuevo ID:", nuevaNotificacionId);
      } else {
        console.log("No hay notificaciones programadas para extender.");
      }
    }
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
      const { carLatitude, carLongitude, fromParkMarker } = route.params || {};
      if (typeof carLatitude === 'number' && typeof carLongitude === 'number') {
        setCarLocation({ latitude: carLatitude, longitude: carLongitude });
      }
      if (route.params?.alarmData) {
        setAlarmActive(true);  
      }
      if (alarmActive && !fromParkMarker) {
        cancelNotification();
      }
    }, [route.params, alarmActive])
  );
  
  const cancelNotification = async () => {
    Alert.alert(
      "Bienvenido de nuevo",
      "¿Quiere ser redirigido para cancelar el debito de su estacionamiento?",
      [
        {
          text: "Sí, redirigir",
          onPress: async () => {
            await Notifications.cancelAllScheduledNotificationsAsync();
            setAlarmActive(false);
          },
        },
        {
          text: "No, extender tiempo",
          onPress: handleExtendTime,
        }
      ]
    );
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionGranted(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitas conceder permisos de localización para usar esta funcionalidad.');
      }
    })();
  }, []);

  useEffect(() => {
    const askNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "No tienes permisos para recibir notificaciones.");
      }
    };
    askNotificationPermissions();
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
      if (locationSubscription) locationSubscription.remove();
    };
  }, [permissionGranted]);

  if (!location) return null;

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

      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('ParkMarker' as never)}>
        <Image source={require('../assets/images/LocationMarker.png')} style={styles.buttonImage} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  floatingButton: {
    position: 'absolute', bottom: 80, right: 20,
    backgroundColor: '#CEECF5', borderRadius: 40, padding: 15, elevation: 5,
  },
  buttonImage: { width: 40, height: 40 },
  menu: {
    position: 'absolute', top: 120, right: 20,
    backgroundColor: '#fff', padding: 10, borderRadius: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 2, elevation: 5,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  menuToggleButton: {
    position: 'absolute', top: 70, right: 20,
    backgroundColor: '#1E90FF', padding: 10, borderRadius: 5,
  },
  menuToggleButtonText: { color: '#fff', fontSize: 16 },
  checkbox: { marginRight: 10 },
  menuText: { fontSize: 16 },
});

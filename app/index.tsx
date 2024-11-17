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
import { isInZone } from './functions/parkingUtils';
import messaging from '@react-native-firebase/messaging';
import { StatusBar } from 'expo-status-bar';

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

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
    
    return enabled;  
  };
  
  useEffect(() => {
    
    const checkPermissionAndGetToken = async () => {
      const isPermissionGranted = await requestUserPermission();
      
      if (isPermissionGranted) {
        messaging()
          .getToken()
          .then((token) => {
            console.log('Token del dispositivo:', token);
          });
      } else {
        console.log('No se pudo obtener el token del dispositivo.');
      }
  
      messaging()
        .getInitialNotification()
        .then(async (remoteMessage) => {
          if (remoteMessage) {
            console.log('Notificación inicial:', remoteMessage.notification);
          }
        });
  
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notificación abierta en la app:', remoteMessage.notification);
      });
  
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Notificación recibida en segundo plano:', remoteMessage.notification);
      });
  
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      });
  
      return unsubscribe;  
    };
  
  
    checkPermissionAndGetToken();
  
  }, []); 
  
  const toggleHorarioVisibility = (horario: string) => {
    setVisibilidadHorarios((prevState) => ({
      ...prevState,
      [horario]: !prevState[horario],
    }));
  };

  const handleExtendTime = () => {
    if (!location) {
      Alert.alert("Ubicación no disponible", "No se pudo obtener la ubicación actual.");
      return;
    }
    const zonaActual = isInZone(location.coords.latitude, location.coords.longitude);
    if (!zonaActual) {
      Alert.alert("Fuera de zona", "No estás en una zona definida para configurar una alarma.");
      return;
    }

    setShowPicker(true);
  };

  const handleTimeChange = async (event: any, date?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && date) {
      if (!location) {
        Alert.alert("Ubicación no disponible", "No se pudo obtener la ubicación actual.");
        return;
      }
      const zonaActual = isInZone(location.coords.latitude, location.coords.longitude);
      if (!zonaActual) {
        Alert.alert("Fuera de zona", "No estás en una zona definida para configurar una alarma.");
        return;
      }
  
      const [hora, minuto] = zonaActual.horarioFin.split(":").map(Number);
      const maxTime = new Date();
      maxTime.setHours(hora, minuto, 0, 0);
  
      if (date <= maxTime) {
        setSelectedDate(date);
        await actualizarAlarma(date); // Cambiado a date para guardar la alarma personalizada
      } else {
        Alert.alert("Hora inválida", "La hora seleccionada supera el horario permitido de la zona.");
      }
    }
  };

  const actualizarAlarma = async (fechaSeleccionada: Date) => {
    const timeUntilAlarm = fechaSeleccionada.getTime() - Date.now();
  
    if (timeUntilAlarm < 0) {
      Alert.alert("Hora inválida", "La hora seleccionada ya pasó. Por favor, seleccione una hora futura.");
      return;
    }
  
    console.log("Notificación configurada a través de Firebase HTTP v1.");
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
    if (!alarmActive) return;
  
    Alert.alert(
      "Bienvenido de nuevo",
      "¿Quiere ser redirigido para cancelar el débito de su estacionamiento?",
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
        },
      ]
    );
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionGranted(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitas conceder permisos de localización para usar esta funcionalidad.');
      } else {
        const locationData = await Location.getCurrentPositionAsync({});
        setLocation(locationData);
        console.log(locationData); // Verifica que se está obteniendo la ubicación
      }
    })();
  }, []);

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
          visibilidadHorarios[horario]
            ? zonas.map((zona, index) => (
                <Polygon
                  key={index}
                  coordinates={zona.coordenadas}
                  fillColor={zona.color}
                  strokeColor="#FF0000"
                  strokeWidth={2}
                />
              ))
            : null
        )}
      </MapView>
      <TouchableOpacity style={styles.parkMarkerButton} onPress={() => navigation.navigate('ParkMarker')}>
        <Image
          source={require('../assets/images/LocationMarker.png')}
          style={styles.parkMarkerIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.zoneMenuButton} onPress={() => setMenuVisible(!menuVisible)}>
        <Text style={styles.zoneMenuButtonText}>{menuVisible ? 'Cerrar menú' : 'Menú de zonas'}</Text>
      </TouchableOpacity>
      {menuVisible && renderMenu()}
      <StatusBar style="auto" />
      {showPicker && (
        <DateTimePicker
          mode="time"
          display="default"
          value={selectedDate || new Date()}
          onChange={handleTimeChange}
        />
      )}
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
  parkMarkerButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#CEECF5',
    borderRadius: 30,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  parkMarkerIcon: {
    width: 40,
    height: 40,
  },
  zoneMenuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#CEECF5',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
  },
  zoneMenuButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menu: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
  },
});
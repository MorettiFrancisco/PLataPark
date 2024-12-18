import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Image, Alert, Text, Button } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import zonas from '../constants/ParkingZones/zonas';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { isInZone } from './functions/parkingUtils';
import { schedulePushNotification, cancelAllNotifications } from './functions/notificationsUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { openSEMApp } from './functions/LuncherSEM';

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
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [visibilidadHorarios, setVisibilidadHorarios] = useState<{ [horario: string]: boolean }>({});
  const [showDatePicker, setShowDatePicker] = useState(false); // Mostrar el DateTimePicker
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined); // Hora seleccionada
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const subscription = useRef<{ remove: () => void } | null>(null);
  const notificationHandled = useRef(false);
  
  // Usar useRef para guardar si ya se abrió SEM
  const semAppOpened = useRef(false);

  const handleLaunchSEM = () => {
    // Aquí llamamos a la función openSEMApp cuando se presiona el botón
    openSEMApp();
  };

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso de localización', 'Necesitamos permiso para acceder a tu localización');
      }
    };

    getPermission();
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      const location = await Location.getCurrentPositionAsync();
      setLocation(location);
    };

    getLocation();
  }, []);

  const toggleHorarioVisibility = (horario: string) => {
    setVisibilidadHorarios((prevState) => ({
      ...prevState,
      [horario]: !prevState[horario],
    }));
  };

  useEffect(() => {
    // Aseguramos que la suscripción se haga una vez
    if (subscription.current === null) {
      subscription.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          if (!notificationHandled.current) {
            notificationHandled.current = true;
            cancelAllNotifications();
            Alert.alert(
              'La alarma que usted fijó ha sido activada.',
              '¿Qué te gustaría hacer?',
              [
                {
                  text: 'Terminar Estacionamiento',
                  onPress: () => {
                    openSEMApp();
                  },
                },
                {
                  text: 'Posponer alarma',
                  onPress: () => {
                    setShowDatePicker(true);
                  },
                },
              ]
            );
          }
        }
      );
    }

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      if (subscription.current) {
        subscription.current.remove();
        subscription.current = null;
      }
    };
  }, []);

  const handleTimeChange = async (event: any, selectedDate: Date | undefined) => {
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const zona = isInZone(latitude, longitude);
    if (zona) {
      const [hora, minuto] = zona.horarioFin.split(":").map(Number);
      const maxTime = new Date();
      maxTime.setHours(hora, minuto, 0, 0);
      setShowDatePicker(false);
      if (selectedDate && selectedDate <= maxTime) {
        setSelectedTime(selectedDate);
        cancelAllNotifications(); // Cancelar notificaciones antes de programar nuevas
        schedulePushNotification(selectedDate); // Programar la nueva notificación
      }
    } else {
      Alert.alert("Zona libre", "La ubicación es libre para estacionar.");
    }
  };

  

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  useFocusEffect(
    React.useCallback(() => {
      const { carLatitude, carLongitude, fromParkMarker, alarmData} = route.params || {};
      if (typeof carLatitude === 'number' && typeof carLongitude === 'number') {
        setCarLocation({ latitude: carLatitude, longitude: carLongitude });
        if (!semAppOpened.current && alarmData) {
          openSEMApp();
          semAppOpened.current = true; // Marcar que ya se ha abierto SEM
        }
      }
    }, [route.params])
  );

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
            image={require('../assets/images/LocationMarker.png')}
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

      {showDatePicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
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
  parkMarkerButton: { position: 'absolute', bottom: 100, right: 20, padding: 10 },
  parkMarkerIcon: { width: 40, height: 40 },
  zoneMenuButton: {
    position: 'absolute',
    top: 50,
    right: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
  zoneMenuButtonText: { color: '#fff' },
  menu: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkbox: { marginRight: 10 },
  menuText: { fontSize: 16 },
});

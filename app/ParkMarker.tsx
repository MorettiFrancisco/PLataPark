import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert ,Platform} from 'react-native';
import { useState,useRef,useEffect } from 'react';
import * as Location from 'expo-location';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../components/routes/types'; 
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';



const ParkMarker = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));
  
    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });
  
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });
  
    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  
  
  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }
  
  
  const scheduleNot=async()=>{
    const f:Date =new Date();
    const n:Date=new Date();
    f.setHours(20,0,0,0);
    let dif=0;
    f.getTime()>n.getTime()?dif=f.getTime()-n.getTime():""
    try {
      console.log("notificando")//calcular cuanto queda para las 20Hs
      
      await Notifications.scheduleNotificationAsync({
          content:{
            title:'Medicion de Estacionamiento',
            body:'La medicion de estacionamiento ha concluido',
          },
          trigger:{seconds:dif*1000}
      },);
    } catch (error) {
      console.log(error);
    }
  }
  const handleSaveLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      Alert.alert('Ubicación guardada', 'La ubicación de tu coche ha sido guardada');
      navigation.navigate('index', { 
        carLatitude: location.coords.latitude, 
        carLongitude: location.coords.longitude 
      });
      
      if(new Date().getHours()<=20){
        await scheduleNot()
      }
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

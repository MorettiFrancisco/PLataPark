import { Platform, Alert } from 'react-native';
import * as Linking from 'expo-linking';

// Esta es la función para abrir la app SEM o redirigir a la tienda si no está instalada
export const openSEMApp = async () => {
  // Nombre del paquete de la app SEM
  const packageName = 'ar.edu.unlp.semmobile.laplata';
  
  try {
    if (Platform.OS === 'android') {
      // Intentar abrir la aplicación en Android utilizando el esquema de URL
      const url = `package:${packageName}`;  // Usa "package:" en lugar de "intent://"
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Linking.openURL(url);
      } else {
        // Si no se puede abrir, redirige a la Google Play Store
        Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`);
      }
    } else if (Platform.OS === 'ios') {
      // Intentar abrir la aplicación en iOS utilizando un esquema (puede ser un esquema personalizado)
      const url = `${packageName}://`;  // Esquema personalizado para abrir la app en iOS
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Linking.openURL(url);
      } else {
        // Si no se puede abrir, redirige a la App Store
        Linking.openURL(`https://apps.apple.com/app/idYOUR_APP_ID`);
      }
    }
  } catch (error) {
    console.error('Error al intentar abrir la app:', error);
    Alert.alert('Error', 'Hubo un problema al intentar abrir la aplicación.');
  }
};

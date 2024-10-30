import React, { useState, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Alert, Button, Linking, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { openSettings } from 'expo-linking';


export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleOpenLink=async (url:string,alternativo:string)=>{
    try{
      const response=await Linking.openURL(url);
    }catch(e){
      console.info("error abriendo link", url);
      const response=await Linking.openURL(alternativo);
      throw e;
    }
  }

  if (!location) {
    return (
    <View>
      <Button title='SEM' onPress={()=>handleOpenLink('semlaplata://','https://play.google.com/store/apps/details?id=ar.edu.unlp.semmobile.laplata&hl=es_AR')} />
      <Button title='Activa la ubicacion' onPress={()=>openSettings()} />

    </View>
    ); 
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
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}/>
      <Button title='SEM' onPress={()=>handleOpenLink('semlaplata','https://play.google.com/store/apps/details?id=ar.edu.unlp.semmobile.laplata')} />
      
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
});

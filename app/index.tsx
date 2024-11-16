import React, { useState, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Alert, Button, Linking, Platform, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { openSettings } from 'expo-linking';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const packageName="ar.edu.unlp.semmobile.laplata"
  const android=`market://details?id=${packageName}`
  const ios='https://apps.apple.com/ar/app/sem-mobile/id1387705895'
  useEffect(() => {
    (async () => {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleOpenLink= async()=>{
    try{
      if (Platform.OS==='android') {
        
        await Linking.openURL(android);
      }else if (Platform.OS=== 'ios') {
        await Linking.openURL(ios)
      }
      
    }catch(e){
      
      
      throw e;
    }
  }

  if (!location) {
    return (
    <View>
      <Button title='SEM' onPress={()=>handleOpenLink()} />
      <Button title='Activa la ubicacion' onPress={()=>openSettings()} />

    </View>
    ); 
  }

  return (
    <View style={styles.container}>
      <Button title='SEM' onPress={()=>handleOpenLink()} />
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

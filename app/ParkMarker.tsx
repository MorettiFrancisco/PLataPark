import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import * as Location from "expo-location";
import { Marker } from 'react-native-maps';

interface ButtonProps {
  onPress: () => void;
  title?: string;
}

export default function Button(props: ButtonProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  useEffect(() => {
    (async () => {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  if (!location) {
    return null;
  }

  const { onPress, title = 'Where is my car?' } = props;
  
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Marker
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
        image={require('../assets/images/LocationMarker.png')} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#FFF',
    borderColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});

import { StyleSheet, View, TouchableOpacity, Image, Alert, Text } from 'react-native';
import {startActivityAsync} from 'expo-intent-launcher';
export default function LuncherSEM() {
    const SEM='com.whatsapp.HomeActivity'
    
    const intent=async ()=>{
        Alert.alert('Sem','Abriendo el sem')
         startActivityAsync(SEM);
    }


    return (<>
            <TouchableOpacity style={{}} onPress={ intent}>
                <Text>
                    SEM
                </Text>
            </TouchableOpacity>
    
    </>)
    
}
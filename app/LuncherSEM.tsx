import { StyleSheet, View, TouchableOpacity, Image, Alert, Text } from 'react-native';
import {startActivityAsync} from 'expo-intent-launcher';
import * as IntentLauncher from 'expo-intent-launcher';
export default function LuncherSEM() {
    const SEM='ar.edu.unlp.semmobile.laplata'
    const i = {
        //action: 'android.intent.action.MAIN',
        category: 'android.intent.category.LAUNCHER',
        packageName: SEM
      };
    const intent=async ()=>{
        Alert.alert('Sem','Abriendo el sem')
        startActivityAsync('android.intent.action.VIEW',i);
    }


    return (<>
            <TouchableOpacity style={{}} onPress={intent}>
                <Text>
                    SEM
                </Text>
            </TouchableOpacity>
    
    </>)
    
}
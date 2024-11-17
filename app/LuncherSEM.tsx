import { StyleSheet, View, TouchableOpacity, Image, Alert, Text, Platform } from 'react-native';
import {startActivityAsync} from 'expo-intent-launcher';
import * as IntentLauncher from 'expo-intent-launcher';
import { openURL } from 'expo-linking';
export default function LuncherSEM() {
    const SEM='ar.edu.unlp.semmobile.laplata'
    const i = {
        //action: 'android.intent.action.MAIN',
        category: 'android.intent.category.LAUNCHER',
        packageName: SEM
      };
    const intent=async ()=>{
        try {
            if (Platform.OS==='android') {
                openURL("https://play.google.com/store/apps/details?id=ar.edu.unlp.semmobile.laplata&hl=es_AR&gl=US")
            }else if (Platform.OS==='ios'){
                openURL("https://apps.apple.com/ar/app/sem-mobile/id1387705895")
            }
        } catch (error) {
            
        }
    }


    return (<>
            <TouchableOpacity style={{backgroundColor:'#CEECF5',height:40}} onPress={intent}>
                <Text style={{position:'absolute',
                padding:20,
                paddingLeft:175
                }}>
                    SEM
                </Text>
            </TouchableOpacity>
    
    </>)
    
}
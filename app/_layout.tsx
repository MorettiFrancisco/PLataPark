import React from "react";
import { Stack } from "expo-router";
import { Button, Image } from "react-native";


const Layout = () => (
    <Stack>
        <Stack.Screen name="index" 
        options={{
                title: 'Plata Park ',
                headerStyle: {
                    backgroundColor: '#CEECF5',
                },
                headerTitleStyle:{
                    fontWeight: 'bold',
                },
                headerLeft: () => (
                    <Image
                        source={require('../assets/images/HeaderIcon.png')} 
                        style={{ width: 40, height: 40, marginLeft: 10, marginRight: 20 }}
                    />
                ),
            }}/>      
    </Stack>
);

export default Layout;
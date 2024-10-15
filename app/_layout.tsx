import React from "react";
import { Stack } from "expo-router";

const Layout = () => (
    <Stack>
        <Stack.Screen name="HomeScreen/index" options={{ title: 'Plata Park' }} />
    </Stack>
);

export default Layout;
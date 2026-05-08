import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen.js';
import HomeScreen from './screens/HomeScreen.js';
import CitiesScreen from './screens/CitiesScreen.js';
import DistrictsScreen from './screens/DistrictsScreen.js';
import ParksScreen from './screens/ParksScreen.js';
import ParkDetailScreen from './screens/ParkDetailScreen.js';
import MapParksScreen from './screens/MapParksScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
import ReservationScreen from './screens/ReservationScreen.js';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MapParks"
            component={MapParksScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Cities"
            component={CitiesScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Districts"
            component={DistrictsScreen}
            options={{
              title: 'İlçe Seç',
              headerTitleAlign: 'center',
            }}
          />

          <Stack.Screen
            name="Parks"
            component={ParksScreen}
            options={{
              title: 'Parkları Keşfet',
              headerTitleAlign: 'center',
            }}
          />

          <Stack.Screen
            name="ParkDetail"
            component={ParkDetailScreen}
            options={{
              title: 'Park Detayı',
              headerTitleAlign: 'center',
            }}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />


          <Stack.Screen
            name="ReservationScreen"
            component={ReservationScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
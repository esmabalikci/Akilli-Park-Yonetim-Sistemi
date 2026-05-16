import 'react-native-gesture-handler';
import React from 'react';
import LostFoundScreen from './screens/LostFoundScreen.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsScreen from './screens/EventsScreen.js';
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
import NotificationsScreen from './screens/NotificationsScreen.js';
import { UserProvider } from './context/UserContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import FavoritesScreen from './screens/FavoritesScreen.js';

import PersonalInfoScreen from './screens/PersonalInfoScreen.js';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen.js';
import HelpCenterScreen from './screens/HelpCenterScreen.js';
import PrivacySecurityScreen from './screens/PrivacySecurityScreen.js';
import SettingsScreen from './screens/SettingsScreen.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
      <UserProvider>
      <FavoritesProvider>
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
  name="LostFound"
  component={LostFoundScreen}
  options={{ headerShown: false }}
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
  name="Events"
  component={EventsScreen}
  options={{ headerShown: false }}
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

          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      </FavoritesProvider>
      </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
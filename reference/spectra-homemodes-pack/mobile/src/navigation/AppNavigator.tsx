import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './routes';
import {
  SelectStaffScreen,
  HomeScreen,
  StartVisitScreen,
  VisitDashboardScreen,
  MixSessionScreen,
  FinalizeSaleScreen,
  ReceiptSuccessScreen,
  CheckoutVisitScreen,
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SelectStaff"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="SelectStaff" component={SelectStaffScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="StartVisit" component={StartVisitScreen} />
        <Stack.Screen name="VisitDashboard" component={VisitDashboardScreen} />
        <Stack.Screen name="MixSession" component={MixSessionScreen} />
        <Stack.Screen name="FinalizeSale" component={FinalizeSaleScreen} />
        <Stack.Screen name="ReceiptSuccess" component={ReceiptSuccessScreen} />
        <Stack.Screen name="CheckoutVisit" component={CheckoutVisitScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

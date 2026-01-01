import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Library, Search, PenTool } from 'lucide-react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { LanguageDetailScreen } from '../screens/LanguageDetailScreen';
import { DictionaryScreen } from '../screens/DictionaryScreen';
import { ContributionScreen } from '../screens/ContributionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          backgroundColor: '#FFFFFF',
          paddingTop: 8,
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Inter_400Regular',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }
      }}
    >
      <Tab.Screen 
        name="Archive" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Library size={size - 2} color={color} />,
          tabBarLabel: 'Archives'
        }}
      />
      <Tab.Screen 
        name="Dictionary" 
        component={DictionaryScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Search size={size - 2} color={color} />,
          tabBarLabel: 'Lexique'
        }}
      />
      <Tab.Screen 
        name="Contribute" 
        component={ContributionScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <PenTool size={size - 2} color={color} />,
          tabBarLabel: 'Contribuer'
        }}
      />
    </Tab.Navigator>
  );
}

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="LanguageDetail" component={LanguageDetailScreen} />
    </Stack.Navigator>
  );
};

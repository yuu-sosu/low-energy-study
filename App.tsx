import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text } from 'react-native';
import { AdsConsentProvider } from './src/ads/AdsConsentProvider';
import { COLORS } from './src/constants';
import { HomeStackParamList, RootTabParamList } from './src/navigation/types';
import { BreakScreen } from './src/screens/BreakScreen';
import { FocusTimerScreen } from './src/screens/FocusTimerScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RecordScreen } from './src/screens/RecordScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StatsScreen, TodaySummaryScreen } from './src/screens/StatsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="FocusTimer" component={FocusTimerScreen} />
      <Stack.Screen name="Record" component={RecordScreen} />
      <Stack.Screen name="Break" component={BreakScreen} />
      <Stack.Screen name="TodaySummary" component={TodaySummaryScreen} />
    </Stack.Navigator>
  );
}

function getTabBarStyle(route: RouteProp<RootTabParamList, 'HomeStack'>) {
  const focusedRoute = getFocusedRouteNameFromRoute(route) ?? 'Home';
  return {
    backgroundColor: COLORS.white,
    display: focusedRoute === 'Home' ? 'flex' : 'none',
  } as const;
}

export default function App() {
  return (
    <AdsConsentProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: { backgroundColor: COLORS.white },
          }}
        >
          <Tab.Screen
            name="HomeStack"
            component={HomeStack}
            options={({ route }) => ({
              tabBarLabel: 'ホーム',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>始</Text>,
              tabBarStyle: getTabBarStyle(route),
            })}
          />
          <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{ tabBarLabel: '積み上げ', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>積</Text> }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ tabBarLabel: '設定', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>設</Text> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AdsConsentProvider>
  );
}

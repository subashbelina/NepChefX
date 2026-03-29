import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/ui/haptic-tab';
import { TabBarBackground } from '@/ui/tab-bar-background';
import { TabBarIcon } from '@/ui/tab-bar-icon';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  /** Keep icons/labels above the home indicator without a huge empty gap under the dock. */
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 10 : 12);
  const barHeight = (Platform.select({ ios: 58, android: 60, default: 58 }) ?? 58) + safeBottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          marginHorizontal: 14,
          marginBottom: 8,
          marginTop: 4,
          height: barHeight,
          paddingTop: 6,
          paddingBottom: safeBottom,
        },
        tabBarBackground: TabBarBackground,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="silverware-fork-knife" focused={focused} color={color} accent="primary" />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="plus-circle" focused={focused} color={color} accent="secondary" prominent />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} focused={focused} color={color} accent="tertiary" />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'robot' : 'robot-outline'} focused={focused} color={color} accent="secondary" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: -2,
    marginBottom: 2,
  },
  tabItem: {
    paddingTop: 2,
  },
});

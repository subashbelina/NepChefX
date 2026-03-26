import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

import { HapticTab } from "@/ui/haptic-tab";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              overflow: "hidden",
            }}
          />
        ),
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              color={color}
              size={size ?? 26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add Recipe",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              color={color}
              size={size ?? 26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="heart"
              color={color}
              size={size ?? 26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot" color={color} size={size ?? 26} />
          ),
        }}
      />
    </Tabs>
  );
}

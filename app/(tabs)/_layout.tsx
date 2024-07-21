import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

const Layout = () => {
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarLabelStyle: {
          fontFamily: "mon-sb",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Карта",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          tabBarLabel: "Запись",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="recording-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          tabBarLabel: "Контакты",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          tabBarLabel: "Записи",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="archive" size={size} color={color} />
          ),
        }}
      />
      
    </Tabs>
  );
};

export default Layout;

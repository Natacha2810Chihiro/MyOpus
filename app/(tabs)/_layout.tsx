import { useFonts, YanoneKaffeesatz_500Medium } from "@expo-google-fonts/yanone-kaffeesatz";
import { Tabs } from "expo-router";
import { Image, Platform, Text, View } from "react-native";

const icons = {
  index: require("../../assets/images/icones/Accueil.png"),
  ajouter: require("../../assets/images/icones/BiblioPerso.png"),
  club: require("../../assets/images/icones/BookClub.png"),
  defis: require("../../assets/images/icones/SearchAdd.png"),
  profil: require("../../assets/images/icones/Profil.png"),
};

function TabIcon({ source, focused }: { source: any; focused: boolean }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: focused ? "#dcd8f5" : "transparent",
        marginBottom: focused ? -20 : 0, // ← descend quand actif
      }}
    >
      <Image
        source={source}
        style={{
          width: 28,
          height: 28,
          tintColor: focused ? "#000" : "#000",
        }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function TabLayout() {
  const [fontsLoaded] = useFonts({ YanoneKaffeesatz_500Medium });

  if (!fontsLoaded) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#5647bf",
        tabBarInactiveTintColor: "#000",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          elevation: 20,
          shadowColor: "#5647bf",
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -2 },
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 10,
          borderRadius: 20,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarLabelStyle: {
          fontSize: 15,
          fontFamily: "YanoneKaffeesatz_500Medium",
          fontWeight: "500",
          letterSpacing: 0.2,
          marginTop: 5,
        },
        tabBarIconStyle: {
          marginBottom: 5,
        },
        headerStyle: { backgroundColor: "#ffffff" },
        headerTitleStyle: { fontWeight: "700", color: "#000" },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: ({ focused }) => focused ? null : (
            <Text style={{ fontSize: 15, fontFamily: "YanoneKaffeesatz_500Medium", color: "#000" }}>
              Home
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.index} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajouter"
        options={{
          title: "Biblio",
          tabBarLabel: ({ focused }) => focused ? null : (
            <Text style={{ fontSize: 15, fontFamily: "YanoneKaffeesatz_500Medium", color: "#000" }}>
              Home
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.ajouter} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="club"
        options={{
          title: "Books Club",
          tabBarLabel: ({ focused }) => focused ? null : (
            <Text style={{ fontSize: 15, fontFamily: "YanoneKaffeesatz_500Medium", color: "#000" }}>
              Books Club
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.club} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="defis"
        options={{
          title: "Search",
          tabBarLabel: ({ focused }) => focused ? null : (
            <Text style={{ fontSize: 15, fontFamily: "YanoneKaffeesatz_500Medium", color: "#000" }}>
              Home
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.defis} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarLabel: ({ focused }) => focused ? null : (
            <Text style={{ fontSize: 15, fontFamily: "YanoneKaffeesatz_500Medium", color: "#000" }}>
              Home
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profil} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
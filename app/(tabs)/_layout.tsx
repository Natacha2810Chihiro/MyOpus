// Navbar

import {
  useFonts,
  YanoneKaffeesatz_500Medium,
} from "@expo-google-fonts/yanone-kaffeesatz";

import { Tabs } from "expo-router";

import {
  Image,
  Platform,
  Text,
  View,
} from "react-native";

const icons = {
  index: require("../../assets/images/icones/Accueil.png"),
  biblio: require("../../assets/images/icones/BiblioPerso.png"),
  club: require("../../assets/images/icones/BookClub.png"),
  ajouter: require("../../assets/images/icones/SearchAdd.png"),
  profil: require("../../assets/images/icones/Profil.png"),
};

function TabIcon({
  source,
  focused,
}: {
  source: any;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: focused
          ? "#dcd8f5"
          : "transparent",

        marginBottom: focused ? -20 : 0,
      }}
    >
      <Image
        source={source}
        style={{
          width: 28,
          height: 28,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    YanoneKaffeesatz_500Medium,
  });

  if (!fontsLoaded) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

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
          shadowOffset: {
            width: 0,
            height: -2,
          },

          height:
            Platform.OS === "ios"
              ? 90
              : 70,

          paddingBottom:
            Platform.OS === "ios"
              ? 24
              : 8,

          paddingTop: 10,
          borderRadius: 20,
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarLabelStyle: {
          fontSize: 15,
          fontFamily:
            "YanoneKaffeesatz_500Medium",

          marginTop: 5,
        },

        tabBarIconStyle: {
          marginBottom: 5,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",

          tabBarLabel: ({ focused }) =>
            focused ? null : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily:
                    "YanoneKaffeesatz_500Medium",
                  color: "#000",
                }}
              >
                Home
              </Text>
            ),

          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.index}
              focused={focused}
            />
          ),
        }}
      />

      {/* BIBLIO */}
      <Tabs.Screen
        name="biblio"
        options={{
          title: "Biblio",

          tabBarLabel: ({ focused }) =>
            focused ? null : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily:
                    "YanoneKaffeesatz_500Medium",
                  color: "#000",
                }}
              >
                Biblio
              </Text>
            ),

          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.biblio}
              focused={focused}
            />
          ),
        }}
      />

      {/* BOOK CLUB */}
      <Tabs.Screen
        name="club"
        options={{
          title: "Books Club",

          tabBarLabel: ({ focused }) =>
            focused ? null : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily:
                    "YanoneKaffeesatz_500Medium",
                  color: "#000",
                }}
              >
                Books Club
              </Text>
            ),

          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.club}
              focused={focused}
            />
          ),
        }}
      />

      {/* SEARCH */}
      <Tabs.Screen
        name="ajouter"
        options={{
          title: "Search",

          tabBarLabel: ({ focused }) =>
            focused ? null : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily:
                    "YanoneKaffeesatz_500Medium",
                  color: "#000",
                }}
              >
                Search
              </Text>
            ),

          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.ajouter}
              focused={focused}
            />
          ),
        }}
      />

      {/* PROFIL */}
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",

          tabBarLabel: ({ focused }) =>
            focused ? null : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily:
                    "YanoneKaffeesatz_500Medium",
                  color: "#000",
                }}
              >
                Profil
              </Text>
            ),

          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.profil}
              focused={focused}
            />
          ),
        }}
      />

      {/* PAGE CACHEE */}
      <Tabs.Screen
        name="defis"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
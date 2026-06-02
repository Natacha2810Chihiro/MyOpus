import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  YanoneKaffeesatz_300Light,
  YanoneKaffeesatz_700Bold,
  useFonts,
} from "@expo-google-fonts/yanone-kaffeesatz";
import Header from "../../components/Header";

import {
  Kavoon_400Regular,
} from "@expo-google-fonts/kavoon";



const clubs = [
  {
    id: 1,
    nom: "Brownies Book Club",
    image: require("../../assets/clubs/club1.jpeg"),
  },
  {
    id: 2,
    nom: "Alteration clubs",
    image: require("../../assets/clubs/club2.jpeg"),
  },
  {
    id: 3,
    nom: "Nymphea club",
    image: require("../../assets/clubs/club3.jpeg"),
  },
  {
    id: 4,
    nom: "Brownies Book Club",
    image: require("../../assets/clubs/club4.jpeg"),
  },
  {
    id: 5,
    nom: "Alteration clubs",
    image: require("../../assets/clubs/club2.jpeg"),
  },
  {
    id: 6,
    nom: "Nymphea club",
    image: require("../../assets/clubs/club3.jpeg"),
  },
];

export default function BookClubScreen() {
  const [fontsLoaded] = useFonts({
    YanoneKaffeesatz_300Light,
    YanoneKaffeesatz_700Bold,
    Kavoon_400Regular,
  });
  
  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Header
        title="Books clubs"
        niveau=""
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TROUVE TON BONHEUR */}
        <Text style={styles.sectionTitle}>
          Trouve ton bonheur
        </Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: "#F6DE82" },
            ]}
          >
            <Text style={styles.cardTitle}>
              Rejoindre{"\n"}un club
            </Text>

            <Text style={styles.cardText}>
              Recherche et trouve ton club de lecture
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: "#CDEDEC" },
            ]}
          >
            <Text style={styles.cardTitle}>
              Créer un{"\n"}Book club
            </Text>

            <Text style={styles.cardText}>
              Créer ton propre Book club et invite tous tes amis.
            </Text>
          </TouchableOpacity>
        </View>

        {/* MES CLUBS */}
        <Text style={styles.sectionTitle}>
          Mes Books Clubs
        </Text>

        <View style={styles.grid}>
          {clubs.map((club) => (
            <TouchableOpacity
              key={club.id}
              style={styles.clubItem}
            >
              <Image
                source={club.image}
                style={styles.clubImage}
              />

              <Text
                style={styles.clubName}
                numberOfLines={2}
              >
                {club.nom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  sectionTitle: {
    marginTop: 20,
    marginLeft: 18,
    marginBottom: 16,
  
    fontSize: 20,
    color: "#838383",
  
    fontFamily: "YanoneKaffeesatz_700Bold",
  },

  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 28,
  },

  card: {
    width: "47%",
    minHeight: 150,
    borderRadius: 24,
    padding: 16,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  cardTitle: {
  textAlign: "center",

  fontSize: 25,
  color: "#000",

  fontFamily: "Kavoon_400Regular",
},

cardText: {
  textAlign: "center",
  marginTop: 12,

  fontSize: 11,
  color: "#555",

  fontFamily: "YanoneKaffeesatz_300Light",
},

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
  },

  clubItem: {
    width: "33.33%",
    alignItems: "center",
    marginBottom: 24,
  },

  clubImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
  },

  clubName: {
    width: 90,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
});
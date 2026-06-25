import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  YanoneKaffeesatz_300Light,
  YanoneKaffeesatz_700Bold,
  useFonts,
} from "@expo-google-fonts/yanone-kaffeesatz";

import { Kavoon_400Regular } from "@expo-google-fonts/kavoon";

export default function Profil() {
  const router = useRouter(); // ✅ ICI, dans le composant

  const [fontsLoaded] = useFonts({
    YanoneKaffeesatz_300Light,
    YanoneKaffeesatz_700Bold,
    Kavoon_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          {/* VAGUE */}
          <View style={styles.wave} />

          {/* PERSONNAGE */}
          <Image
            source={require("../../assets/images/Design_logo/Logo_vectoriser_fille.png")}
            style={styles.character}
          />

          {/* AVATAR */}
          <Image
            source={require("../../assets/images/Design_logo/avatar_default.jpeg")}
            style={styles.avatar}
          />

          {/* NOM */}
          <Text style={styles.name}>Hello Sophie</Text>

          {/* NIVEAU */}
          <View style={styles.levelRow}>
            <View style={styles.levelDot} />
            <Text style={styles.levelText}>Néophyte</Text>
          </View>

          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#BCE7E2" }]}>
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Livres lus</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#E8C6E2" }]}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#F5DC82" }]}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>A lire</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#CBC3F4" }]}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Avis écrits</Text>
            </View>
          </View>
        </View>

        {/* BLOC BAS */}
        <View style={styles.bottomContainer}>
          {/* ACTIVITES */}
          <Text style={styles.sectionTitle}>Mes activités</Text>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <Ionicons name="trophy-outline" size={34} color="#000" />
              <View>
                <Text style={styles.menuTitle}>Mes défis lecture</Text>
                <Text style={styles.menuSubtitle}>2 badges gagnés</Text>
              </View>
            </View>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={40}
              color="#000"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <Ionicons name="pie-chart-outline" size={34} color="#000" />
              <View>
                <Text style={styles.menuTitle}>Mes statistiques</Text>
                <Text style={styles.menuSubtitle}>8 avis publiés</Text>
              </View>
            </View>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={40}
              color="#000"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <Ionicons name="create-outline" size={34} color="#000" />
              <View>
                <Text style={styles.menuTitle}>Mes avis</Text>
                <Text style={styles.menuSubtitle}>8 avis publiés</Text>
              </View>
            </View>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={40}
              color="#000"
            />
          </TouchableOpacity>

          {/* PREFERENCES */}
          <Text style={styles.sectionTitle}>Mes préférences</Text>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <Ionicons name="moon-outline" size={34} color="#000" />
              <View>
                <Text style={styles.menuTitle}>Mode sombre</Text>
              </View>
            </View>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={40}
              color="#000"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard}>
            <View style={styles.menuLeft}>
              <Ionicons name="settings-outline" size={34} color="#000" />
              <View>
                <Text style={styles.menuTitle}>Paramètres</Text>
                <Text style={styles.menuSubtitle}>
                  Confidentialités, notifications
                </Text>
              </View>
            </View>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={40}
              color="#000"
            />
          </TouchableOpacity>

          {/* PRO */}
          <TouchableOpacity
            style={styles.proCard}
            onPress={() => router.push("/abonnement")} // ✅ onPress propre
          >
            <View>
              <Text style={styles.proTitle}>Passer à MyOpus Pro</Text>
              <Text style={styles.proSubtitle}>
                Clubs illimités, stats avancées...
              </Text>
            </View>

            <View style={styles.proButton}>
              <Text style={styles.proButtonText}>Voir</Text>
            </View>
          </TouchableOpacity>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutCard}>
            <Ionicons name="log-out-outline" size={42} color="#000" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },

  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
    overflow: "hidden",
  },

  wave: {
    position: "absolute",
    top: -30,
    left: -40,
    right: -40,
    height: 140,
    borderRadius: 999,
    borderWidth: 18,
    borderColor: "#C9C2F4",
  },

  character: {
    position: "absolute",
    left: 10,
    top: 50,
    width: 120,
    height: 120,
    resizeMode: "contain",
  },

  avatar: {
    width: 125,
    height: 125,
    borderRadius: 62,
    marginTop: 40,
    marginBottom: 16,
  },

  name: {
    fontSize: 42,
    color: "#000",
    fontFamily: "YanoneKaffeesatz_700Bold",
  },

  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  levelDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
    marginRight: 10,
  },

  levelText: {
    fontSize: 22,
    color: "#4F4F4F",
    fontFamily: "YanoneKaffeesatz_300Light",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 34,
  },

  statCard: {
    width: "23%",
    height: 70,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  statNumber: {
    fontSize: 24,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
  },

  statLabel: {
    fontSize: 12,
    color: "#000",
    marginTop: 2,
    fontFamily: "YanoneKaffeesatz_300Light",
  },

  bottomContainer: {
    backgroundColor: "#D8D5E8",
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    paddingTop: 42,
    paddingHorizontal: 24,
    minHeight: 900,
  },

  sectionTitle: {
    fontSize: 22,
    color: "#838383",
    marginBottom: 18,
    fontFamily: "YanoneKaffeesatz_700Bold",
  },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  menuTitle: {
    fontSize: 20,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
  },

  menuSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
    fontFamily: "YanoneKaffeesatz_300Light",
  },

  proCard: {
    marginTop: 20,
    backgroundColor: "#F5DC82",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  proTitle: {
    fontSize: 22,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
  },

  proSubtitle: {
    fontSize: 14,
    color: "#5E5E5E",
    marginTop: 4,
    fontFamily: "YanoneKaffeesatz_300Light",
  },

  proButton: {
    backgroundColor: "#F8E8AA",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  proButtonText: {
    fontSize: 18,
    color: "#000",
    fontFamily: "YanoneKaffeesatz_700Bold",
  },

  logoutCard: {
    marginTop: 24,
    backgroundColor: "#BCE7E2",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  logoutText: {
    fontSize: 24,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
  },
});

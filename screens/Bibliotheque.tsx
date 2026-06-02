import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import Header from "../components/Header";

export default function Bibliotheque() {
  const livres = [
    {
      id: "1",
      cover:
        "https://covers.openlibrary.org/b/id/12883569-L.jpg",
    },
    {
      id: "2",
      cover:
        "https://covers.openlibrary.org/b/id/12612815-L.jpg",
    },
  ];

  const renderSection = (
    titre: string,
    couleur: string
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{titre}</Text>

      <View style={[styles.sectionBox, { backgroundColor: couleur }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {livres.map((livre) => (
            <Image
              key={livre.id}
              source={{ uri: livre.cover }}
              style={styles.book}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Ma bibliothèque"
        niveau="Néophyte"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.yellow]}>
            <Text style={styles.tabText}>En cours</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, styles.purple]}>
            <Text style={styles.tabText}>PAL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, styles.blue]}>
            <Text style={styles.tabText}>Envies</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, styles.pink]}>
            <Text style={styles.tabText}>Terminé</Text>
          </TouchableOpacity>
        </View>

        {renderSection("En cours", "#F7DF8B")}
        {renderSection("La Pile À Lire", "#DAD0FF")}
        {renderSection("Mes envies", "#D6F0EF")}
        {renderSection("Les terminés", "#F0D4EA")}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 25,
    paddingHorizontal: 10,
  },

  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  yellow: {
    backgroundColor: "#F7DF8B",
  },

  purple: {
    backgroundColor: "#DAD0FF",
  },

  blue: {
    backgroundColor: "#D6F0EF",
  },

  pink: {
    backgroundColor: "#F0D4EA",
  },

  tabText: {
    fontWeight: "700",
    color: "#0f0939",
  },

  section: {
    marginBottom: 25,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#666",
    marginBottom: 10,
  },

  sectionBox: {
    borderRadius: 25,
    padding: 12,
    minHeight: 160,
  },

  book: {
    width: 95,
    height: 140,
    borderRadius: 12,
    marginRight: 12,
  },
});
import React from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


import Header from "../../components/Header";

import {
  useFonts,
  YanoneKaffeesatz_300Light,
  YanoneKaffeesatz_700Bold,
} from "@expo-google-fonts/yanone-kaffeesatz";

import {
  Kavoon_400Regular,
} from "@expo-google-fonts/kavoon";

export default function SearchScreen() {
  const [fontsLoaded] = useFonts({
    YanoneKaffeesatz_300Light,
    YanoneKaffeesatz_700Bold,
    Kavoon_400Regular,
  });

  if (!fontsLoaded) return null;

  const livres = [
    {
      id: 1,
      image:
        "https://m.media-amazon.com/images/I/81m1s4wIPML.jpg",
    },
    {
      id: 2,
      image:
        "https://m.media-amazon.com/images/I/81fzmE3aVhL.jpg",
    },
    {
      id: 3,
      image:
        "https://m.media-amazon.com/images/I/91zbi9M+mKL.jpg",
    },
    {
      id: 4,
      image:
        "https://m.media-amazon.com/images/I/81g0AATkO9L.jpg",
    },
  ];

  const genres = [
    {
      id: 1,
      titre: "Tous",
      image: require("../../assets/images/Design_genre/Design_tous.png"),
      textColor: "#FFFFFF",
    },
    {
      id: 2,
      titre: "Fantasy",
      image: require("../../assets/images/Design_genre/Design_fantasy.png"),
    },
    {
      id: 3,
      titre: "Aventure",
      image: require("../../assets/images/Design_genre/Design_aventure.png"),
    },
    {
      id: 4,
      titre: "Romance",
      image: require("../../assets/images/Design_genre/Design_romance.png"),
    },
    {
      id: 5,
      titre: "Thriller",
      image: require("../../assets/images/Design_genre/Design_thriller.png"),
      textColor: "#FFFFFF",
    },
    {
      id: 6,
      titre: "Fiction",
      image: require("../../assets/images/Design_genre/Design_fiction.png"),
    },
    {
      id: 7,
      titre: "Fantastique",
      image: require("../../assets/images/Design_genre/Design_fantastique.png"),
      textColor: "#FFFFFF",
    },
    {
      id: 8,
      titre: "Manga",
      image: require("../../assets/images/Design_genre/Design_manga.png"),
    },
    {
      id: 9,
      titre: "BD",
      image: require("../../assets/images/Design_genre/Design_BD.png"),
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Recherche ton livre"
        niveau="Néophyte"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
          <Image
            source={require("../../assets/images/icones/SearchAdd.png")}
            style={styles.searchIcon}
            resizeMode="contain"
          />

            <TextInput
              placeholder="Titre, Auteur..."
              placeholderTextColor="#9B9B9B"
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Image
              source={require("../../assets/images/icones/ScannCode.png")}
              style={styles.scanIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* LIVRES */}
        <Text style={styles.sectionTitle}>
          Les livres du moments
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.booksRow}
        >
          {livres.map((livre) => (
            <Image
              key={livre.id}
              source={{ uri: livre.image }}
              style={styles.book}
            />
          ))}
        </ScrollView>

        {/* GENRES */}
        <Text style={styles.sectionTitle}>
          Explorer par genre
        </Text>

        <View style={styles.genresGrid}>
          {genres.map((genre) => (
            <TouchableOpacity
            key={genre.id}
            style={styles.genreCard}
          >
            <Image
              source={genre.image}
              style={styles.genreBackground}
              resizeMode="cover"
            />
          
          <Text
            style={[
              styles.genreTitle,
              { color: genre.textColor || "#000" },
            ]}
          >
            {genre.titre}
          </Text>
          </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
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
    paddingBottom: 30,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 18,
    gap: 14,
  },

  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: "#ECECEC",
    borderRadius: 25,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,
  },

  input: {
    flex: 1,
    marginLeft: 12,

    fontSize: 18,
    color: "#000",

    fontFamily: "YanoneKaffeesatz_300Light",
  },

  filterButton: {
    width: 52,
    height: 52,

    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    marginTop: 34,
    marginLeft: 18,
    marginBottom: 16,

    fontSize: 20,
    color: "#838383",

    fontFamily: "YanoneKaffeesatz_700Bold",
  },

  booksRow: {
    paddingLeft: 18,
    paddingRight: 10,
  },

  book: {
    width: 115,
    height: 175,
    borderRadius: 14,
    marginRight: 14,
  },

  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
    paddingHorizontal: 10,
  },

  genreCard: {
    width: "33%", 
    aspectRatio: 1, 
    borderRadius: 16, 
    justifyContent: "flex-end", 
    padding: 5, 
    overflow: "hidden"
  },

  genreTitle: {
    fontSize: 15,
    color: "#000",
  
    fontFamily: "Kavoon_400Regular",
  },

  scanIcon: {
    width: 34,
    height: 34,
  },

  searchIcon: {
    width: 24,
    height: 24,
  },
  genreBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
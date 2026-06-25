import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "../../components/Header";

import { Kavoon_400Regular } from "@expo-google-fonts/kavoon";
import {
  useFonts,
  YanoneKaffeesatz_300Light,
  YanoneKaffeesatz_700Bold,
} from "@expo-google-fonts/yanone-kaffeesatz";

export default function SearchScreen() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [fontsLoaded] = useFonts({
    YanoneKaffeesatz_300Light,
    YanoneKaffeesatz_700Bold,
    Kavoon_400Regular,
  });

  if (!fontsLoaded) return null;

  // RECHERCHE GOOGLE BOOKS
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&key=${process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY}`,
      );
      const data = await response.json();
      console.log("Résultat API:", JSON.stringify(data).slice(0, 500)); // 👈 ici
      setResults(data.items || []);
    } catch (error) {
      console.error("Erreur recherche:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const livres = [
    { id: 1, image: "https://m.media-amazon.com/images/I/81m1s4wIPML.jpg" },
    { id: 2, image: "https://m.media-amazon.com/images/I/81fzmE3aVhL.jpg" },
    { id: 3, image: "https://m.media-amazon.com/images/I/91zbi9M+mKL.jpg" },
    { id: 4, image: "https://m.media-amazon.com/images/I/81g0AATkO9L.jpg" },
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
      <Header title="Recherche ton livre" niveau="Néophyte" />

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
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch} // ✅ Entrée déclenche la recherche
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery("");
                  setResults([]);
                  setHasSearched(false);
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: "#9B9B9B",
                    paddingHorizontal: 8,
                  }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Image
              source={require("../../assets/images/icones/ScannCode.png")}
              style={styles.scanIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* LOADING */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#5647bf"
            style={{ marginTop: 40 }}
          />
        )}

        {/* RESULTATS DE RECHERCHE */}
        {!loading && hasSearched && (
          <>
            <Text style={styles.sectionTitle}>
              {results.length > 0
                ? `${results.length} résultats pour "${query}"`
                : `Aucun résultat pour "${query}"`}
            </Text>

            {results.map((item: any) => {
              const info = item.volumeInfo;
              const cover = info.imageLinks?.thumbnail?.replace(
                "http://",
                "https://",
              );

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultCard}
                  onPress={() =>
                    router.push(`/livre-detail?id=${item.id}` as any)
                  }
                >
                  {cover ? (
                    <Image source={{ uri: cover }} style={styles.resultCover} />
                  ) : (
                    <View style={styles.noCover}>
                      <Text style={{ color: "#999", fontSize: 12 }}>
                        Pas de couverture
                      </Text>
                    </View>
                  )}

                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {info.title}
                    </Text>
                    <Text style={styles.resultAuthor} numberOfLines={1}>
                      {info.authors?.join(", ") || "Auteur inconnu"}
                    </Text>
                    <Text style={styles.resultYear}>
                      {info.publishedDate?.slice(0, 4) || ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* AFFICHAGE PAR DEFAUT (si pas de recherche) */}
        {!hasSearched && (
          <>
            <Text style={styles.sectionTitle}>Les livres du moment</Text>
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

            <Text style={styles.sectionTitle}>Explorer par genre</Text>
            <View style={styles.genresGrid}>
              {genres.map((genre) => (
                <TouchableOpacity key={genre.id} style={styles.genreCard}>
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
          </>
        )}

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
    paddingHorizontal: 10,
  },
  genreCard: {
    width: "33%",
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: "flex-end",
    padding: 5,
    overflow: "hidden",
  },
  genreTitle: {
    fontSize: 15,
    fontFamily: "Kavoon_400Regular",
  },
  genreBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  scanIcon: {
    width: 34,
    height: 34,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },

  // RESULTATS
  resultCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 12,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  resultCover: {
    width: 70,
    height: 100,
    borderRadius: 8,
  },
  noCover: {
    width: 70,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
  },
  resultInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  resultTitle: {
    fontSize: 18,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
  },
  resultAuthor: {
    fontSize: 15,
    color: "#666",
    fontFamily: "YanoneKaffeesatz_300Light",
  },
  resultYear: {
    fontSize: 14,
    color: "#9B9B9B",
    fontFamily: "YanoneKaffeesatz_300Light",
  },
});

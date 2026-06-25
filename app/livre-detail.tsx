import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Kavoon_400Regular } from "@expo-google-fonts/kavoon";
import {
    useFonts,
    YanoneKaffeesatz_300Light,
    YanoneKaffeesatz_700Bold,
} from "@expo-google-fonts/yanone-kaffeesatz";

export default function LivreDetail() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams();
  const id = decodeURIComponent(rawId as string); // ✅ fix IDs avec tiret

  const [livre, setLivre] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    YanoneKaffeesatz_300Light,
    YanoneKaffeesatz_700Bold,
    Kavoon_400Regular,
  });

  useEffect(() => {
    const fetchLivre = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY}`,
        );
        const data = await response.json();
        setLivre(data);
      } catch (error) {
        console.error("Erreur chargement livre:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLivre();
  }, [id]);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5647bf" />
      </View>
    );
  }

  if (!livre) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Livre introuvable</Text>
      </View>
    );
  }

  const info = livre.volumeInfo;
  const cover =
    info.imageLinks?.extraLarge ||
    info.imageLinks?.large ||
    info.imageLinks?.thumbnail;
  const coverUrl = cover?.replace("http://", "https://");

  const description =
    info.description
      ?.replace(/<[^>]+>/g, "")
      ?.replace(/&amp;/g, "&")
      ?.replace(/&quot;/g, '"')
      ?.replace(/&#39;/g, "'") || "Aucune description disponible.";

  return (
    <View style={styles.container}>
      {/* BOUTON RETOUR */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-circle-outline" size={42} color="#5647bf" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* COUVERTURE */}
        <View style={styles.coverContainer}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.cover} />
          ) : (
            <View style={styles.noCover}>
              <Text style={{ color: "#999" }}>Pas de couverture</Text>
            </View>
          )}
        </View>

        {/* INFOS */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{info.title}</Text>

          {info.subtitle && (
            <Text style={styles.subtitle}>{info.subtitle}</Text>
          )}

          <Text style={styles.author}>
            {info.authors?.join(", ") || "Auteur inconnu"}
          </Text>

          {/* TAGS */}
          <View style={styles.tagsRow}>
            {info.publishedDate && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {info.publishedDate.slice(0, 4)}
                </Text>
              </View>
            )}
            {info.pageCount && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{info.pageCount} pages</Text>
              </View>
            )}
            {info.categories?.[0] && (
              <View style={[styles.tag, { backgroundColor: "#CBC3F4" }]}>
                <Text style={styles.tagText}>{info.categories[0]}</Text>
              </View>
            )}
          </View>

          {/* NOTE */}
          {info.averageRating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#F5DC82" />
              <Text style={styles.ratingText}>
                {info.averageRating} / 5 ({info.ratingsCount} avis)
              </Text>
            </View>
          )}

          {/* DESCRIPTION */}
          <Text style={styles.descriptionTitle}>Résumé</Text>
          <Text style={styles.description}>{description}</Text>

          {/* BOUTONS */}
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Ajouter à ma bibliothèque</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.wishlistButton}>
            <Ionicons name="bookmark-outline" size={24} color="#5647bf" />
            <Text style={styles.wishlistButtonText}>Ajouter à ma liste</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
  },
  backButton: {
    position: "absolute",
    top: 54,
    left: 18,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  coverContainer: {
    alignItems: "center",
    backgroundColor: "#D8D5E8",
    paddingTop: 100,
    paddingBottom: 40,
  },
  cover: {
    width: 160,
    height: 240,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  noCover: {
    width: 160,
    height: 240,
    borderRadius: 12,
    backgroundColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    fontFamily: "YanoneKaffeesatz_300Light",
    marginBottom: 8,
  },
  author: {
    fontSize: 20,
    color: "#5647bf",
    fontFamily: "YanoneKaffeesatz_700Bold",
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#BCE7E2",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "YanoneKaffeesatz_300Light",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "YanoneKaffeesatz_300Light",
  },
  descriptionTitle: {
    fontSize: 20,
    color: "#000",
    fontFamily: "YanoneKaffeesatz_700Bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#444",
    fontFamily: "YanoneKaffeesatz_300Light",
    lineHeight: 24,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: "#5647bf",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14,
  },
  addButtonText: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Kavoon_400Regular",
  },
  wishlistButton: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "#5647bf",
  },
  wishlistButtonText: {
    fontSize: 18,
    color: "#5647bf",
    fontFamily: "Kavoon_400Regular",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
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
import { auth, db } from "../firebaseConfig";

import { Kavoon_400Regular } from "@expo-google-fonts/kavoon";
import {
    useFonts,
    YanoneKaffeesatz_300Light,
    YanoneKaffeesatz_700Bold,
} from "@expo-google-fonts/yanone-kaffeesatz";

const AVIS_FICTIFS = [
  {
    id: "1",
    nom: "Sophie M.",
    date: "12 avril 2025",
    note: 5,
    texte:
      "Un livre absolument captivant, impossible de le poser ! L'écriture est fluide et les personnages sont attachants.",
  },
  {
    id: "2",
    nom: "Le Brownies Book Club",
    date: "12 avril 2025",
    note: 5,
    texte:
      "Une lecture parfaite pour notre club ! On a adoré débattre des thèmes abordés. Highly recommended.",
  },
  {
    id: "3",
    nom: "Léa R.",
    date: "3 mars 2025",
    note: 4,
    texte:
      "Très bonne lecture, quelques longueurs au milieu mais la fin rattrape tout. Je lirai la suite !",
  },
];

const STATUS_BUTTONS = [
  { id: "en_cours", label: "En cours", color: "#CBC3F4" },
  { id: "pal", label: "PAL", color: "#BCE7E2" },
  { id: "envies", label: "Envies", color: "#F5DC82" },
  { id: "termine", label: "Terminé", color: "#E8C6E2" },
];

function Stars({ note }: { note: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={
            i <= Math.floor(note)
              ? "star"
              : i - note < 1
                ? "star-half"
                : "star-outline"
          }
          size={18}
          color="#F5C518"
        />
      ))}
    </View>
  );
}

export default function LivreDetail() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams();
  const id = decodeURIComponent(rawId as string);

  const [livre, setLivre] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [toast, setToast] = useState("");

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

  useEffect(() => {
    const fetchStatut = async () => {
      const user = auth.currentUser;
      if (!user || !livre) return;
      const info = livre.volumeInfo;

      const q = query(
        collection(db, "livres"),
        where("userId", "==", user.uid),
        where("titre", "==", info.title),
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setActiveStatus(data.statut);
      }
    };
    fetchStatut();
  }, [livre]);

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
        <Text style={{ fontFamily: "YanoneKaffeesatz_300Light", fontSize: 18 }}>
          Livre introuvable
        </Text>
      </View>
    );
  }

  const info = livre.volumeInfo;
  const cover =
    info.imageLinks?.extraLarge ||
    info.imageLinks?.large ||
    info.imageLinks?.medium ||
    info.imageLinks?.thumbnail;
  const coverUrl = cover?.replace("http://", "https://");

  const description =
    info.description
      ?.replace(/<[^>]+>/g, "")
      ?.replace(/&amp;/g, "&")
      ?.replace(/&quot;/g, '"')
      ?.replace(/&#39;/g, "'") || "Aucune description disponible.";

  const note = info.averageRating || 4.5;
  const nbAvis = info.ratingsCount || 0;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const handleStatut = async (statut: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (activeStatus === statut) {
        setActiveStatus(null);
        const q = query(
          collection(db, "livres"),
          where("userId", "==", user.uid),
          where("titre", "==", info.title),
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(async (document) => {
          await deleteDoc(doc(db, "livres", document.id));
        });
        showToast("📕 Livre retiré de ta bibliothèque");
        return;
      }

      setActiveStatus(statut);

      const q = query(
        collection(db, "livres"),
        where("userId", "==", user.uid),
        where("titre", "==", info.title),
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        snapshot.forEach(async (document) => {
          await updateDoc(doc(db, "livres", document.id), { statut });
        });
        showToast(`📚 Déplacé vers "${statut}"`);
      } else {
        await addDoc(collection(db, "livres"), {
          userId: user.uid,
          titre: info.title,
          auteur: info.authors?.join(", ") || "Auteur inconnu",
          couverture: coverUrl || "",
          statut,
          progression: 0,
          googleBooksId: id,
          createdAt: serverTimestamp(),
        });
        showToast(`📚 Ajouté à "${statut}" !`);
      }
    } catch (error) {
      console.error("Erreur Firestore:", error);
      showToast("❌ Une erreur est survenue");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER COUVERTURE */}
        <View style={styles.headerBg}>
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsFav(!isFav)}
            >
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={24}
                color={isFav ? "#E8C6E2" : "#000"}
              />
            </TouchableOpacity>
          </View>

          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.cover} />
          ) : (
            <View style={styles.noCover}>
              <Ionicons name="book-outline" size={48} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* TITRE + AUTEUR */}
          <Text style={styles.title}>{info.title}</Text>
          {info.subtitle && (
            <Text style={styles.subtitle}>{info.subtitle}</Text>
          )}
          <Text style={styles.author}>
            {info.authors?.join(", ") || "Auteur inconnu"}
          </Text>

          {/* NOTE */}
          <View style={styles.ratingRow}>
            <Stars note={note} />
            <Text style={styles.ratingValue}>{note.toFixed(1)}</Text>
            {nbAvis > 0 && (
              <Text style={styles.ratingCount}>({nbAvis} avis)</Text>
            )}
          </View>

          {/* TAGS */}
          <View style={styles.tagsRow}>
            {info.categories?.[0] && (
              <View style={[styles.tag, { backgroundColor: "#E8C6E2" }]}>
                <Text style={styles.tagText}>
                  {info.categories[0].split("/")[0].trim()}
                </Text>
              </View>
            )}
            {info.pageCount && (
              <View style={[styles.tag, { backgroundColor: "#BCE7E2" }]}>
                <Text style={styles.tagText}>{info.pageCount} pages</Text>
              </View>
            )}
            {info.publishedDate && (
              <View style={[styles.tag, { backgroundColor: "#F5DC82" }]}>
                <Text style={styles.tagText}>
                  {info.publishedDate.slice(0, 4)}
                </Text>
              </View>
            )}
          </View>

          {/* STATUT */}
          <View style={styles.statusRow}>
            {STATUS_BUTTONS.map((btn) => (
              <TouchableOpacity
                key={btn.id}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor: btn.color,
                    borderWidth: activeStatus === btn.label ? 2 : 0,
                    borderColor: "#5647bf",
                  },
                ]}
                onPress={() => handleStatut(btn.label)}
              >
                <Text style={[styles.statusText, { color: "#000" }]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SYNOPSIS */}
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.description}>{description}</Text>

          {/* AVIS */}
          <Text style={styles.sectionTitle}>Avis des lecteurs</Text>
          {AVIS_FICTIFS.map((avis) => (
            <View key={avis.id} style={styles.avisCard}>
              <View style={styles.avisHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {avis.nom.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.avisHeaderInfo}>
                  <Text style={styles.avisNom}>{avis.nom}</Text>
                  <Text style={styles.avisDate}>{avis.date}</Text>
                </View>
              </View>
              <Stars note={avis.note} />
              <Text style={styles.avisTexte}>{avis.texte}</Text>
              <TouchableOpacity>
                <Text style={styles.lireSuite}>Lire la suite</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* TOAST */}
      {toast !== "" && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
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
  headerBg: {
    backgroundColor: "#D8D5E8",
    alignItems: "center",
    paddingBottom: 30,
    paddingTop: 60,
  },
  topActions: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cover: {
    width: 160,
    height: 240,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    marginTop: 10,
  },
  noCover: {
    width: 160,
    height: 240,
    borderRadius: 14,
    backgroundColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  content: {
    backgroundColor: "#F2F2F2",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  title: {
    fontSize: 30,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "YanoneKaffeesatz_300Light",
    marginBottom: 6,
  },
  author: {
    fontSize: 18,
    color: "#5647bf",
    fontFamily: "YanoneKaffeesatz_700Bold",
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  ratingValue: {
    fontSize: 18,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
  },
  ratingCount: {
    fontSize: 15,
    color: "#888",
    fontFamily: "YanoneKaffeesatz_300Light",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "YanoneKaffeesatz_300Light",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  statusBtn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 15,
    fontFamily: "YanoneKaffeesatz_700Bold",
  },
  sectionTitle: {
    fontSize: 22,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#444",
    fontFamily: "YanoneKaffeesatz_300Light",
    lineHeight: 24,
    marginBottom: 30,
  },
  avisCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  avisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#CBC3F4",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    color: "#5647bf",
    fontFamily: "Kavoon_400Regular",
  },
  avisHeaderInfo: {
    flex: 1,
  },
  avisNom: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Kavoon_400Regular",
  },
  avisDate: {
    fontSize: 13,
    color: "#888",
    fontFamily: "YanoneKaffeesatz_300Light",
  },
  avisTexte: {
    fontSize: 14,
    color: "#444",
    fontFamily: "YanoneKaffeesatz_300Light",
    lineHeight: 22,
  },
  lireSuite: {
    fontSize: 14,
    color: "#5647bf",
    fontFamily: "YanoneKaffeesatz_700Bold",
  },
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#5647bf",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "YanoneKaffeesatz_700Bold",
  },
});

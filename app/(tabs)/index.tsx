import { useFonts, YanoneKaffeesatz_700Bold } from "@expo-google-fonts/yanone-kaffeesatz";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";
import { useTheme } from "../../context/ThemeContext";
import { auth, db } from "../../firebaseConfig";

const GOOGLE_BOOKS_API_KEY = "VOTRE_CLE_ICI";

const GENRES = [
  { label: "Tous", couleur: "#5647bf", image: require("../../assets/images/Design_genre/Design_tous.png") },
  { label: "Fantasy", couleur: "#b8b0e8", image: require("../../assets/images/Design_genre/Design_fantasy.png") },
  { label: "Aventure", couleur: "#f0c93a", image: require("../../assets/images/Design_genre/Design_aventure.png") },
  { label: "Romance", couleur: "#f5c5d0", image: require("../../assets/images/Design_genre/Design_romance.png") },
  { label: "Thriller", couleur: "#1a2340", image: require("../../assets/images/Design_genre/Design_thriller.png") },
  { label: "Fiction", couleur: "#b2ede8", image: require("../../assets/images/Design_genre/Design_fiction.png") },
];

const SUIVIES = [
  { nom: "Moana", avatar: "https://i.pravatar.cc/100?img=1" },
  { nom: "Perrine", avatar: "https://i.pravatar.cc/100?img=2" },
  { nom: "Fanny", avatar: "https://i.pravatar.cc/100?img=3" },
  { nom: "Alex", avatar: "https://i.pravatar.cc/100?img=4" },
  { nom: "Laeticia", avatar: "https://i.pravatar.cc/100?img=5" },
  { nom: "Elise", avatar: "https://i.pravatar.cc/100?img=6" },
];

export default function Accueil() {
  const [fontsLoaded] = useFonts({ YanoneKaffeesatz_700Bold });
  const router = useRouter();
  const { couleurs } = useTheme();
  const [livreEnCours, setLivreEnCours] = useState<any>(null);
  const [livresDuMoment, setLivresDuMoment] = useState<any[]>([]);
  const [loadingLivres, setLoadingLivres] = useState(true);

  const userEmail = auth.currentUser?.email ?? "";
  const prenom = userEmail.split("@")[0];
  const prenomCapitalize = prenom.charAt(0).toUpperCase() + prenom.slice(1);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const q = query(
      collection(db, "livres"),
      where("userId", "==", userId),
      where("statut", "==", "En cours"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLivreEnCours(docs[0] || null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchLivres = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=bestseller+roman&orderBy=relevance&maxResults=10&key=${GOOGLE_BOOKS_API_KEY}`
        );
        const data = await res.json();
        setLivresDuMoment(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLivres(false);
      }
    };
    fetchLivres();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: couleurs.fond }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Header title={`Bonjour ${prenomCapitalize}`} niveau="Néophyte" />

        {/* Lecture en cours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Lecture en cours</Text>
          {livreEnCours ? (
            <TouchableOpacity
              style={[styles.lectureCard, { backgroundColor: couleurs.carte }]}
              onPress={() => router.push(`/livre/${livreEnCours.id}`)}
              activeOpacity={0.9}
            >
              {livreEnCours.couverture ? (
                <Image source={{ uri: livreEnCours.couverture }} style={styles.lectureCouverture} resizeMode="cover" />
              ) : (
                <View style={[styles.lectureCouverture, { backgroundColor: couleurs.fondSecondaire, justifyContent: "center", alignItems: "center" }]}>
                  <Text style={{ fontSize: 32 }}>📖</Text>
                </View>
              )}
              <View style={styles.lectureInfo}>
                <Text style={[styles.lectureTitre, { color: couleurs.texte }]} numberOfLines={2}>
                  {livreEnCours.titre}
                </Text>
                <Text style={[styles.lectureAuteur, { color: couleurs.texteGris }]}>
                  {livreEnCours.auteur}
                </Text>
                <Text style={[styles.lectureProgLabel, { color: couleurs.texteGris }]}>Progression</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${livreEnCours.progression || 0}%` }]} />
                </View>
                <Text style={styles.progressTxt}>
                  {livreEnCours.progression}%{"  "}
                  {livreEnCours.pageActuelle && livreEnCours.totalPages
                    ? `page ${livreEnCours.pageActuelle} / ${livreEnCours.totalPages}`
                    : ""}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.lectureVide, { backgroundColor: couleurs.carte }]}>
              <Text style={{ fontSize: 32 }}>📚</Text>
              <Text style={{ color: couleurs.texteGris, marginTop: 8 }}>Aucune lecture en cours</Text>
            </View>
          )}
        </View>

        {/* Livres du moment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Les livres du moment</Text>
          {loadingLivres ? (
            <ActivityIndicator color="#5647bf" style={{ marginTop: 12 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollH}>
              {livresDuMoment.map((item) => {
                const cover = item.volumeInfo?.imageLinks?.thumbnail;
                return (
                  <TouchableOpacity key={item.id} style={styles.momentCard} activeOpacity={0.9}>
                    {cover ? (
                      <Image source={{ uri: cover }} style={styles.momentCouverture} resizeMode="cover" />
                    ) : (
                      <View style={[styles.momentCouverture, { backgroundColor: couleurs.fondSecondaire, justifyContent: "center", alignItems: "center" }]}>
                        <Text style={{ fontSize: 28 }}>📖</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Explorer par genre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Explorer par genre</Text>
          <View style={styles.genreGrille}>
            {GENRES.map((genre) => (
              <TouchableOpacity
                key={genre.label}
                style={[styles.genreCard, { backgroundColor: genre.couleur }]}
                activeOpacity={0.85}
              >
                <Image
                  source={genre.image}
                  style={styles.genreImage}
                  resizeMode="stretch"
                />
                <Text style={styles.genreLabel}>{genre.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mes suivies */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitre}>Mes suivies</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollH}>
            {SUIVIES.map((s) => (
              <View key={s.nom} style={styles.suivieItem}>
                <Image source={{ uri: s.avatar }} style={styles.suivieAvatar} />
                <Text style={[styles.suivieNom, { color: couleurs.texte }]}>{s.nom}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitre: {
    fontSize: 20,
    fontFamily: "YanoneKaffeesatz_700Bold",
    color: "#838383",
    marginBottom: 14,
  },
  lectureCard: { flexDirection: "row", borderRadius: 20, padding: 14, gap: 14, shadowColor: "#5647bf", shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  lectureCouverture: { width: 90, height: 130, borderRadius: 12 },
  lectureInfo: { flex: 1, justifyContent: "center" },
  lectureTitre: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  lectureAuteur: { fontSize: 13, marginBottom: 12 },
  lectureProgLabel: { fontSize: 12, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: "#e8e4f8", borderRadius: 4, marginBottom: 6 },
  progressFill: { height: 6, backgroundColor: "#5647bf", borderRadius: 4 },
  progressTxt: { fontSize: 13, fontWeight: "700", color: "#5647bf" },
  lectureVide: { borderRadius: 20, padding: 24, alignItems: "center" },
  scrollH: { marginLeft: -4 },
  momentCard: { marginRight: 12 },
  momentCouverture: { width: 100, height: 150, borderRadius: 12 },
  genreGrille: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  genreCard: { width: "30%", aspectRatio: 1, borderRadius: 16, justifyContent: "flex-end", padding: 10, overflow: "hidden" },
  genreImage: { position: "absolute", top: 0, left: 0, width: "130%", height: "130%", opacity: 1 },
  genreLabel: { color: "#fff", fontWeight: "800", fontSize: 15 },
  suivieItem: { alignItems: "center", marginRight: 16 },
  suivieAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 6 },
  suivieNom: { fontSize: 12, fontWeight: "500" },
});
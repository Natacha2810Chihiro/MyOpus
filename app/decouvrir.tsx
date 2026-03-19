import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebaseConfig";

const GENRES = [
  { id: "fantasy", label: "Fantastique", emoji: "🧙", couleur: "#7c5cbf", fond: "#ede9ff", query: "fantasy fiction" },
  { id: "scifi", label: "Science-fiction", emoji: "🚀", couleur: "#0f6b65", fond: "#c7f0ec", query: "science fiction" },
  { id: "romance", label: "Romance", emoji: "💕", couleur: "#64034b", fond: "#fbd9f2", query: "romance novel" },
  { id: "thriller", label: "Thriller", emoji: "🔪", couleur: "#1a1a2e", fond: "#e8e8f0", query: "thriller suspense" },
  { id: "policier", label: "Policier", emoji: "🕵️", couleur: "#2c3e50", fond: "#dde8f0", query: "detective mystery" },
  { id: "classique", label: "Classiques", emoji: "📜", couleur: "#7a5a00", fond: "#ffe594", query: "classic literature" },
  { id: "devperso", label: "Développement perso", emoji: "🌱", couleur: "#2d6a4f", fond: "#d8f3dc", query: "personal development self help" },
  { id: "manga", label: "Manga", emoji: "⛩️", couleur: "#c0392b", fond: "#fde8e8", query: "manga japanese comics" },
  { id: "histoire", label: "Histoire", emoji: "🏛️", couleur: "#6d4c41", fond: "#f5e6d3", query: "history historical" },
  { id: "biographie", label: "Biographie", emoji: "👤", couleur: "#37474f", fond: "#e0e8ed", query: "biography memoir" },
  { id: "jeunesse", label: "Jeunesse", emoji: "🌈", couleur: "#e65100", fond: "#fff3e0", query: "children young adult" },
  { id: "philo", label: "Philosophie", emoji: "🤔", couleur: "#4a148c", fond: "#ede7f6", query: "philosophy" },
];

export default function Decouvrir({ onClose }: { onClose: () => void }) {
  const [genreActif, setGenreActif] = useState<any>(null);
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [livreSelectionne, setLivreSelectionne] = useState<any>(null);

  const chercherLivres = async (genre: any) => {
    setGenreActif(genre);
    setLoading(true);
    setLivres([]);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genre.query)}&maxResults=20&orderBy=newest&langRestrict=fr`
      );
      const data = await res.json();
      const items = (data.items || [])
        .map((item: any) => ({
          id: item.id,
          titre: item.volumeInfo?.title ?? "Titre inconnu",
          auteur: item.volumeInfo?.authors?.[0] ?? "Auteur inconnu",
          description: item.volumeInfo?.description ?? "",
          couverture: item.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
          pages: item.volumeInfo?.pageCount ?? null,
          annee: item.volumeInfo?.publishedDate?.substring(0, 4) ?? null,
        }))
        .filter((item: any) => item.couverture !== null);
      setLivres(items);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les livres");
    }
    setLoading(false);
  };

  const ajouterABibliotheque = async (livre: any) => {
    try {
      await addDoc(collection(db, "livres"), {
        titre: livre.titre,
        auteur: livre.auteur,
        couverture: livre.couverture,
        statut: "À lire",
        progression: 0,
        userId: auth.currentUser?.uid,
        createdAt: new Date(),
      });
      Alert.alert("✨ Ajouté !", `"${livre.titre}" est dans ta bibliothèque`);
      setLivreSelectionne(null);
    } catch {
      Alert.alert("Erreur", "Impossible d'ajouter le livre");
    }
  };

  // Vue liste des livres par genre
  if (genreActif) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setGenreActif(null); setLivres([]); }} style={styles.retour}>
            <Ionicons name="arrow-back" size={24} color="#0f0939" />
          </TouchableOpacity>
          <View style={[styles.genreHeaderBadge, { backgroundColor: genreActif.fond }]}>
            <Text style={styles.genreHeaderEmoji}>{genreActif.emoji}</Text>
            <Text style={[styles.genreHeaderLabel, { color: genreActif.couleur }]}>{genreActif.label}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.fermer}>
            <Ionicons name="close" size={24} color="#0f0939" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.vide}>
            <ActivityIndicator size="large" color="#5647bf" />
            <Text style={styles.videSous}>Chargement des livres...</Text>
          </View>
        ) : livres.length === 0 ? (
          <View style={styles.vide}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
            <Text style={styles.videSous}>Aucun livre trouvé pour ce genre</Text>
          </View>
        ) : (
          <FlatList
            data={livres}
            keyExtractor={(item: any) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grille}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ gap: 14 }}
            renderItem={({ item }: any) => (
              <TouchableOpacity style={styles.livreCarte} onPress={() => setLivreSelectionne(item)} activeOpacity={0.9}>
                <Image source={{ uri: item.couverture }} style={styles.livreCouverture} resizeMode="cover" />
                <View style={styles.livreCarteBody}>
                  <Text style={styles.livreTitre} numberOfLines={2}>{item.titre}</Text>
                  <Text style={styles.livreAuteur} numberOfLines={1}>{item.auteur}</Text>
                  {item.annee && <Text style={styles.livreAnnee}>{item.annee}</Text>}
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Modal fiche livre */}
        <Modal visible={!!livreSelectionne} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => setLivreSelectionne(null)} style={styles.modalFermer}>
                <Ionicons name="close" size={24} color="#0f0939" />
              </TouchableOpacity>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: livreSelectionne?.couverture }} style={styles.modalCouverture} resizeMode="cover" />
                <View style={styles.modalBody}>
                  <Text style={styles.modalTitre}>{livreSelectionne?.titre}</Text>
                  <Text style={styles.modalAuteur}>{livreSelectionne?.auteur}</Text>
                  <View style={styles.modalInfoRow}>
                    {livreSelectionne?.pages && (
                      <View style={[styles.modalBadge, { backgroundColor: genreActif?.fond }]}>
                        <Text style={[styles.modalBadgeTxt, { color: genreActif?.couleur }]}>📄 {livreSelectionne.pages} pages</Text>
                      </View>
                    )}
                    {livreSelectionne?.annee && (
                      <View style={[styles.modalBadge, { backgroundColor: genreActif?.fond }]}>
                        <Text style={[styles.modalBadgeTxt, { color: genreActif?.couleur }]}>📅 {livreSelectionne.annee}</Text>
                      </View>
                    )}
                    <View style={[styles.modalBadge, { backgroundColor: genreActif?.fond }]}>
                      <Text style={[styles.modalBadgeTxt, { color: genreActif?.couleur }]}>{genreActif?.emoji} {genreActif?.label}</Text>
                    </View>
                  </View>
                  {livreSelectionne?.description ? (
                    <>
                      <Text style={styles.modalDescTitre}>Résumé</Text>
                      <Text style={styles.modalDesc} numberOfLines={6}>{livreSelectionne.description}</Text>
                    </>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.modalBouton, { backgroundColor: genreActif?.couleur }]}
                    onPress={() => ajouterABibliotheque(livreSelectionne)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="white" />
                    <Text style={styles.modalBoutonTxt}>Ajouter à ma bibliothèque</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Vue grille des genres
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.retour}>
          <Ionicons name="arrow-back" size={24} color="#0f0939" />
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Découvrir</Text>
      </View>

      <Text style={styles.sousTitreGenres}>Choisis un genre pour explorer</Text>

      <FlatList
        data={GENRES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.genresGrille}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: 14 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.genreCarte, { backgroundColor: item.fond }]}
            onPress={() => chercherLivres(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.genreCarteEmoji}>{item.emoji}</Text>
            <Text style={[styles.genreCarteLabel, { color: item.couleur }]}>{item.label}</Text>
            <View style={[styles.genreCarteFleche, { backgroundColor: item.couleur }]}>
              <Ionicons name="arrow-forward" size={14} color="white" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: { flexDirection: "row", alignItems: "center", padding: 24, paddingBottom: 16, gap: 12 },
  retour: { backgroundColor: "#f7f6ff", borderRadius: 12, padding: 8 },
  fermer: { backgroundColor: "#f7f6ff", borderRadius: 12, padding: 8 },
  headerTitre: { flex: 1, fontSize: 24, fontWeight: "800", color: "#0f0939" },
  sousTitreGenres: { fontSize: 14, color: "#8b85c1", paddingHorizontal: 24, marginBottom: 16 },
  genresGrille: { padding: 24, paddingTop: 0, gap: 14 },
  genreCarte: { flex: 1, borderRadius: 24, padding: 20, minHeight: 120, justifyContent: "space-between" },
  genreCarteEmoji: { fontSize: 36, marginBottom: 8 },
  genreCarteLabel: { fontSize: 14, fontWeight: "800", flex: 1 },
  genreCarteFleche: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", alignSelf: "flex-end", marginTop: 8 },
  genreHeaderBadge: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  genreHeaderEmoji: { fontSize: 20 },
  genreHeaderLabel: { fontSize: 15, fontWeight: "800" },
  vide: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  videSous: { fontSize: 14, color: "#8b85c1", textAlign: "center", marginTop: 12 },
  grille: { padding: 20, gap: 14 },
  livreCarte: { flex: 1, backgroundColor: "white", borderRadius: 20, overflow: "hidden", shadowColor: "#5647bf", shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  livreCouverture: { width: "100%", height: 160 },
  livreCarteBody: { padding: 12 },
  livreTitre: { fontSize: 13, fontWeight: "700", color: "#0f0939", marginBottom: 4 },
  livreAuteur: { fontSize: 11, color: "#8b85c1" },
  livreAnnee: { fontSize: 11, color: "#b8b0e8", marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "90%", overflow: "hidden" },
  modalFermer: { position: "absolute", top: 16, right: 16, zIndex: 10, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 12, padding: 8 },
  modalCouverture: { width: "100%", height: 280 },
  modalBody: { padding: 24 },
  modalTitre: { fontSize: 24, fontWeight: "800", color: "#0f0939", marginBottom: 6 },
  modalAuteur: { fontSize: 15, color: "#8b85c1", marginBottom: 16 },
  modalInfoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  modalBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  modalBadgeTxt: { fontSize: 12, fontWeight: "700" },
  modalDescTitre: { fontSize: 14, fontWeight: "700", color: "#0f0939", marginBottom: 8 },
  modalDesc: { fontSize: 14, color: "#5a5a7a", lineHeight: 22, marginBottom: 24 },
  modalBouton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 18, padding: 18, marginBottom: 8 },
  modalBoutonTxt: { color: "white", fontWeight: "800", fontSize: 16 },
});
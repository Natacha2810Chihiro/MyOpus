import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator, Alert, Dimensions, FlatList, Image, Modal,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { auth, db } from "../../firebaseConfig";

const { height } = Dimensions.get("window");

const STATUTS = [
  { label: "À lire", emoji: "📌" },
  { label: "En cours", emoji: "📖" },
  { label: "Terminé", emoji: "✅" },
];

interface LivreResultat {
  id: string;
  titre: string;
  auteur: string;
  couverture: string | null;
  description: string;
  pages: number | null;
  annee: string | null;
  genres: string[];
}

export default function Ajouter() {
  const { couleurs } = useTheme();
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<LivreResultat[]>([]);
  const [loading, setLoading] = useState(false);
  const [livreSelectionne, setLivreSelectionne] = useState<LivreResultat | null>(null);
  const [statut, setStatut] = useState("À lire");
  const [ajoutEnCours, setAjoutEnCours] = useState(false);

  const rechercherLivres = async () => {
    if (!recherche.trim()) return;
    setLoading(true);
    setResultats([]);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(recherche)}&maxResults=15`
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
          genres: item.volumeInfo?.categories?.slice(0, 3) ?? [],
        }))
        .filter((item: any) => item.couverture !== null);
      setResultats(items);
      if (items.length === 0) Alert.alert("Aucun résultat", "Essaie avec un autre titre ou auteur");
    } catch {
      Alert.alert("Erreur", "Impossible de rechercher les livres");
    }
    setLoading(false);
  };

  const ajouterABibliotheque = async () => {
    if (!livreSelectionne) return;
    setAjoutEnCours(true);
    try {
      await addDoc(collection(db, "livres"), {
        titre: livreSelectionne.titre,
        auteur: livreSelectionne.auteur,
        couverture: livreSelectionne.couverture,
        statut,
        progression: 0,
        userId: auth.currentUser?.uid,
        createdAt: new Date(),
      });
      Alert.alert("✨ Ajouté !", `"${livreSelectionne.titre}" rejoint ta bibliothèque`);
      setLivreSelectionne(null);
      setRecherche("");
      setResultats([]);
      setStatut("À lire");
    } catch {
      Alert.alert("Erreur", "Impossible d'ajouter le livre");
    }
    setAjoutEnCours(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: couleurs.fond }]}>

      <View style={[styles.blob1, { backgroundColor: "#cbc5f5" }]} />
      <View style={[styles.blob2, { backgroundColor: "#ffe594" }]} />

      <View style={styles.header}>
        <Text style={[styles.headerTitre, { color: couleurs.texte }]}>Ajouter un livre</Text>
        <Text style={[styles.headerSous, { color: couleurs.texteGris }]}>Recherche parmi des millions de titres</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchRow, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
          <Ionicons name="search-outline" size={20} color={couleurs.texteGris} />
          <TextInput
            style={[styles.searchInput, { color: couleurs.texte }]}
            placeholder="Titre, auteur, ISBN..."
            placeholderTextColor={couleurs.texteGris}
            value={recherche}
            onChangeText={setRecherche}
            onSubmitEditing={rechercherLivres}
            returnKeyType="search"
          />
          {recherche.length > 0 && (
            <TouchableOpacity onPress={() => { setRecherche(""); setResultats([]); }}>
              <Ionicons name="close-circle" size={20} color={couleurs.texteGris} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.boutonRecherche, { opacity: loading ? 0.7 : 1 }]}
          onPress={rechercherLivres}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#0f0939" />
          ) : (
            <Text style={styles.boutonRechercheTexte}>Rechercher</Text>
          )}
        </TouchableOpacity>
      </View>

      {resultats.length === 0 && !loading && (
        <View style={styles.vide}>
          <View style={[styles.videIconBox, { backgroundColor: couleurs.fondSecondaire }]}>
            <Text style={styles.videEmoji}>📚</Text>
          </View>
          <Text style={[styles.videTitre, { color: couleurs.texte }]}>Trouve ton prochain livre</Text>
          <Text style={[styles.videSous, { color: couleurs.texteGris }]}>
            Tape un titre, un auteur ou un ISBN pour découvrir et ajouter des livres
          </Text>
        </View>
      )}

      <FlatList
        data={resultats}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.liste}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.resultatCarte, { backgroundColor: couleurs.carte }]}
            onPress={() => setLivreSelectionne(item)}
            activeOpacity={0.88}
          >
            <Image source={{ uri: item.couverture! }} style={styles.resultatCouverture} resizeMode="cover" />
            <View style={styles.resultatInfos}>
              <Text style={[styles.resultatTitre, { color: couleurs.texte }]} numberOfLines={2}>{item.titre}</Text>
              <Text style={[styles.resultatAuteur, { color: couleurs.texteGris }]} numberOfLines={1}>par {item.auteur}</Text>
              <View style={styles.resultatMeta}>
                {item.annee && (
                  <View style={[styles.metaPill, { backgroundColor: couleurs.fondSecondaire }]}>
                    <Text style={[styles.metaTxt, { color: couleurs.texteSous }]}>📅 {item.annee}</Text>
                  </View>
                )}
                {item.pages && (
                  <View style={[styles.metaPill, { backgroundColor: couleurs.fondSecondaire }]}>
                    <Text style={[styles.metaTxt, { color: couleurs.texteSous }]}>📄 {item.pages}p</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.resultatAdd}>
              <Ionicons name="add" size={20} color="#0f0939" />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal */}
      <Modal visible={!!livreSelectionne} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: couleurs.fondSecondaire }]}>

            <TouchableOpacity
              onPress={() => setLivreSelectionne(null)}
              style={[styles.modalFermer, { backgroundColor: couleurs.carte }]}
            >
              <Ionicons name="close" size={22} color={couleurs.texte} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

              {/* Section lilas avec couverture */}
              <View style={styles.couvertureSection}>
              <View style={styles.couvertureWrapper}>
                {livreSelectionne?.couverture && (
                  <Image
                    source={{ uri: livreSelectionne.couverture }}
                    style={styles.couvertureImg}
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>

              {/* Contenu blanc arrondi qui recouvre le bas de la section lilas */}
              <View style={[styles.modalBody, { backgroundColor: couleurs.fondSecondaire }]}>

                {livreSelectionne?.genres && livreSelectionne.genres.length > 0 && (
                  <Text style={[styles.genresTexte, { color: couleurs.texteGris }]}>
                    {livreSelectionne.genres.join(" · ")}
                  </Text>
                )}

                <Text style={[styles.modalTitre, { color: couleurs.texte }]}>{livreSelectionne?.titre}</Text>
                <Text style={[styles.modalAuteur, { color: couleurs.texteGris }]}>par {livreSelectionne?.auteur}</Text>

                <View style={styles.statsRow}>
                  {livreSelectionne?.pages && (
                    <View style={[styles.statBox, { backgroundColor: couleurs.carte }]}>
                      <Ionicons name="reader-outline" size={18} color="#5647bf" />
                      <Text style={[styles.statNombre, { color: couleurs.texte }]}>{livreSelectionne.pages}</Text>
                      <Text style={[styles.statLabel, { color: couleurs.texteGris }]}>pages</Text>
                    </View>
                  )}
                  {livreSelectionne?.annee && (
                    <View style={[styles.statBox, { backgroundColor: couleurs.carte }]}>
                      <Ionicons name="calendar-outline" size={18} color="#5647bf" />
                      <Text style={[styles.statNombre, { color: couleurs.texte }]}>{livreSelectionne.annee}</Text>
                      <Text style={[styles.statLabel, { color: couleurs.texteGris }]}>parution</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.statutLabel, { color: couleurs.texteGris }]}>Ajouter comme</Text>
                <View style={styles.statutsRow}>
                  {STATUTS.map((s) => (
                    <TouchableOpacity
                      key={s.label}
                      style={[
                        styles.statutBtn,
                        { backgroundColor: couleurs.carte, borderColor: couleurs.bordure },
                        statut === s.label && { backgroundColor: "#0f0939", borderColor: "#0f0939" }
                      ]}
                      onPress={() => setStatut(s.label)}
                    >
                      <Text style={styles.statutEmoji}>{s.emoji}</Text>
                      <Text style={[
                        styles.statutBtnTexte,
                        { color: couleurs.texteGris },
                        statut === s.label && { color: "#ffe594" }
                      ]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={[styles.separateur, { backgroundColor: couleurs.bordure }]} />

                <Text style={[styles.descTitre, { color: couleurs.texte }]}>Description</Text>
                <Text style={[styles.desc, { color: couleurs.texteGris }]}>
                  {livreSelectionne?.description || "Aucune description disponible."}
                </Text>

                <TouchableOpacity
                  style={[styles.boutonAjouter, { opacity: ajoutEnCours ? 0.7 : 1 }]}
                  onPress={ajouterABibliotheque}
                  disabled={ajoutEnCours}
                >
                  {ajoutEnCours ? (
                    <ActivityIndicator size="small" color="#0f0939" />
                  ) : (
                    <>
                      <Ionicons name="add-circle-outline" size={20} color="#0f0939" />
                      <Text style={styles.boutonAjouterTexte}>Ajouter à ma bibliothèque</Text>
                    </>
                  )}
                </TouchableOpacity>

              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob1: { position: "absolute", top: -80, right: -60, width: 220, height: 220, borderRadius: 110, opacity: 0.18 },
  blob2: { position: "absolute", top: 60, right: 20, width: 100, height: 100, borderRadius: 50, opacity: 0.12 },

  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 },
  headerTitre: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5, marginBottom: 6 },
  headerSous: { fontSize: 15 },

  searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
  searchRow: { flexDirection: "row", alignItems: "center", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, gap: 10, marginBottom: 12, borderWidth: 1.5 },
  searchInput: { flex: 1, fontSize: 15 },
  boutonRecherche: { backgroundColor: "#ffe594", borderRadius: 16, padding: 16, alignItems: "center" },
  boutonRechercheTexte: { color: "#0f0939", fontWeight: "800", fontSize: 15 },

  vide: { alignItems: "center", paddingTop: 40, paddingHorizontal: 40 },
  videIconBox: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  videEmoji: { fontSize: 44 },
  videTitre: { fontSize: 20, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  videSous: { fontSize: 14, textAlign: "center", lineHeight: 22 },

  liste: { paddingHorizontal: 24, gap: 14, paddingBottom: 100 },
  resultatCarte: { flexDirection: "row", alignItems: "center", borderRadius: 20, padding: 12, gap: 14, shadowColor: "#5647bf", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  resultatCouverture: { width: 58, height: 82, borderRadius: 10 },
  resultatInfos: { flex: 1 },
  resultatTitre: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  resultatAuteur: { fontSize: 12, marginBottom: 8 },
  resultatMeta: { flexDirection: "row", gap: 6 },
  metaPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  metaTxt: { fontSize: 11, fontWeight: "600" },
  resultatAdd: { backgroundColor: "#ffe594", borderRadius: 18, width: 34, height: 34, justifyContent: "center", alignItems: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: height * 0.92, overflow: "hidden" },
  modalFermer: { position: "absolute", top: 16, right: 16, zIndex: 20, borderRadius: 20, padding: 8 },

  // Couverture — section lilas avec image centrée COMPLÈTE
  couvertureSection: {
    backgroundColor: "#cbc5f5",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 60,
    height: 180,
  },
  couvertureWrapper: {
    position: "absolute",
    bottom: -120,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  couvertureImg: {
    width: 150,
    height: 220,
    borderRadius: 14,
  },
  modalBody: {
    backgroundColor: "#f7f6ff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 130,
    paddingBottom: 40,
  },
  
  genresTexte: { textAlign: "center", fontSize: 13, fontWeight: "600", marginBottom: 10, letterSpacing: 0.3 },
  modalTitre: { fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 6, letterSpacing: -0.3 },
  modalAuteur: { fontSize: 14, textAlign: "center", marginBottom: 24 },

  statsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 24 },
  statBox: { borderRadius: 16, padding: 14, alignItems: "center", minWidth: 90, gap: 4 },
  statNombre: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "500" },

  statutLabel: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  statutsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statutBtn: { flex: 1, borderRadius: 16, padding: 12, alignItems: "center", borderWidth: 1.5 },
  statutEmoji: { fontSize: 18, marginBottom: 4 },
  statutBtnTexte: { fontSize: 11, fontWeight: "700" },

  separateur: { height: 1, marginBottom: 24 },
  descTitre: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  desc: { fontSize: 14, lineHeight: 24, marginBottom: 28 },

  boutonAjouter: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#ffe594", borderRadius: 18, padding: 18 },
  boutonAjouterTexte: { color: "#0f0939", fontWeight: "800", fontSize: 16 },
});
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { auth, db } from "../../firebaseConfig";
import Decouvrir from "../decouvrir";

const FILTRES = ["Tous", "En cours", "À lire", "Terminé"];

export default function Bibliotheque() {
  const router = useRouter();
  const { couleurs, sombre } = useTheme();
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("Tous");
  const [recherche, setRecherche] = useState("");
  const [showDecouvrir, setShowDecouvrir] = useState(false);

  const userEmail = auth.currentUser?.email ?? "";
  const prenom = userEmail.split("@")[0];

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "livres"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLivres(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const livresFiltres = livres.filter((l: any) => {
    const matchFiltre = filtre === "Tous" || l.statut === filtre;
    const matchRecherche = l.titre.toLowerCase().includes(recherche.toLowerCase()) || l.auteur.toLowerCase().includes(recherche.toLowerCase());
    return matchFiltre && matchRecherche;
  });

  const total = livres.length;
  const enCours = livres.filter((l: any) => l.statut === "En cours").length;
  const termines = livres.filter((l: any) => l.statut === "Terminé").length;

  if (loading) return (
    <View style={[styles.center, { backgroundColor: couleurs.fond }]}>
      <ActivityIndicator size="large" color="#5647bf" />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: couleurs.fond }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: couleurs.fond }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.bonjour, { color: couleurs.texte }]}>Bonjour, {prenom} 👋</Text>
              <Text style={[styles.sousTitre, { color: couleurs.texteSous }]}>Ma bibliothèque</Text>
            </View>
            <View style={[styles.niveauBadge, { backgroundColor: couleurs.fondSecondaire }]}>
              <Text style={[styles.niveauNombre, { color: couleurs.texte }]}>5</Text>
              <Text style={[styles.niveauTexte, { color: couleurs.texteSous }]}>Niveau</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: couleurs.fondSecondaire }]}>
              <Text style={[styles.statNombre, { color: couleurs.texte }]}>{total}</Text>
              <Text style={[styles.statLabel, { color: couleurs.texteSous }]}>Total</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: couleurs.fondSecondaire }]}>
              <Text style={[styles.statNombre, { color: couleurs.texte }]}>{enCours}</Text>
              <Text style={[styles.statLabel, { color: couleurs.texteSous }]}>En cours</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: couleurs.fondSecondaire }]}>
              <Text style={[styles.statNombre, { color: couleurs.texte }]}>{termines}</Text>
              <Text style={[styles.statLabel, { color: couleurs.texteSous }]}>Terminés</Text>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={[styles.body, { backgroundColor: couleurs.fondTertiaire }]}>

          {/* Bouton Découvrir */}
          <TouchableOpacity style={[styles.decouvrirBtn, { backgroundColor: couleurs.carte }]} onPress={() => setShowDecouvrir(true)}>
            <Text style={styles.decouvrirEmoji}>🔭</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.decouvrirTitre, { color: couleurs.texte }]}>Découvrir de nouveaux livres</Text>
              <Text style={[styles.decouvrirSous, { color: couleurs.texteGris }]}>Fantastique, Romance, Thriller...</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={couleurs.texteSous} />
          </TouchableOpacity>

          {/* Recherche */}
          <View style={[styles.searchBar, { backgroundColor: couleurs.carte }]}>
            <Ionicons name="search-outline" size={18} color={couleurs.texteGris} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: couleurs.texte }]}
              placeholder="Rechercher un livre..."
              placeholderTextColor={couleurs.texteGris}
              value={recherche}
              onChangeText={setRecherche}
            />
          </View>

          {/* Filtres */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresScroll}>
            {FILTRES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filtreBtn, { backgroundColor: couleurs.carte }, filtre === f && { backgroundColor: couleurs.accent }]}
                onPress={() => setFiltre(f)}
              >
                <Text style={[styles.filtreTxt, { color: couleurs.texteGris }, filtre === f && { color: couleurs.accentTexte }]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Grille */}
          {livresFiltres.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={[styles.emptyTxt, { color: couleurs.texteGris }]}>Aucun livre ici</Text>
            </View>
          ) : (
            <View style={styles.grille}>
              {livresFiltres.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.carte, { backgroundColor: couleurs.carte }]}
                  onPress={() => router.push(`/livre/${item.id}`)}
                  activeOpacity={0.92}
                >
                  {item.couverture ? (
                    <Image source={{ uri: item.couverture }} style={styles.couverture} resizeMode="cover" />
                  ) : (
                    <View style={[styles.couverture, { backgroundColor: couleurs.fondSecondaire, justifyContent: "center", alignItems: "center" }]}>
                      <Text style={styles.couvertureEmoji}>📖</Text>
                    </View>
                  )}
                  <View style={styles.carteBody}>
                    <Text style={[styles.carteTitre, { color: couleurs.texte }]} numberOfLines={1}>{item.titre}</Text>
                    <Text style={[styles.carteAuteur, { color: couleurs.texteGris }]} numberOfLines={1}>{item.auteur}</Text>
                    <View style={styles.carteStatut}>
                      {item.statut === "Terminé" ? (
                        <>
                          <Ionicons name="checkmark-circle" size={16} color="#47c8bc" />
                          <Text style={[styles.carteStatutTxt, { color: "#47c8bc" }]}> Terminé</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="book-outline" size={16} color="#f1bc14" />
                          <Text style={[styles.carteStatutTxt, { color: "#f1bc14" }]}> {item.statut}</Text>
                          {item.statut === "En cours" && (
                            <Text style={styles.carteProgression}> {item.progression}%</Text>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Découvrir */}
      <Modal visible={showDecouvrir} animationType="slide">
        <Decouvrir onClose={() => setShowDecouvrir(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 24, paddingTop: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  bonjour: { fontSize: 26, fontWeight: "800" },
  sousTitre: { fontSize: 14, marginTop: 2 },
  niveauBadge: { borderRadius: 16, padding: 12, alignItems: "center", minWidth: 64 },
  niveauNombre: { fontSize: 22, fontWeight: "800" },
  niveauTexte: { fontSize: 11, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, borderRadius: 16, padding: 14, alignItems: "center" },
  statNombre: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 12, marginTop: 2, fontWeight: "500" },
  body: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, marginTop: 16 },
  decouvrirBtn: { flexDirection: "row", alignItems: "center", borderRadius: 20, padding: 16, marginBottom: 16, gap: 12, shadowColor: "#5647bf", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  decouvrirEmoji: { fontSize: 28 },
  decouvrirTitre: { fontSize: 14, fontWeight: "700" },
  decouvrirSous: { fontSize: 12, marginTop: 2 },
  searchBar: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, shadowColor: "#5647bf", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 15 },
  filtresScroll: { marginBottom: 20 },
  filtreBtn: { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, marginRight: 10 },
  filtreTxt: { fontSize: 13, fontWeight: "600" },
  grille: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  carte: { borderRadius: 20, overflow: "hidden", width: "47%", shadowColor: "#5647bf", shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  couverture: { width: "100%", height: 160 },
  couvertureEmoji: { fontSize: 40 },
  carteBody: { padding: 12 },
  carteTitre: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  carteAuteur: { fontSize: 12, marginBottom: 8 },
  carteStatut: { flexDirection: "row", alignItems: "center" },
  carteStatutTxt: { fontSize: 12, fontWeight: "600" },
  carteProgression: { fontSize: 12, fontWeight: "700", color: "#f1bc14" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTxt: { fontSize: 16, fontWeight: "600" },
});
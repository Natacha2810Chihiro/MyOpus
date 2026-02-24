import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

const FILTRES = ["Tous", "En cours", "À lire", "Terminé"];

export default function Bibliotheque() {
  const router = useRouter();
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("Tous");
  const [recherche, setRecherche] = useState("");

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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#5647bf" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.bonjour}>Bonjour, {prenom} 👋</Text>
              <Text style={styles.sousTitre}>Ma bibliothèque</Text>
            </View>
            <View style={styles.niveauBadge}>
              <Text style={styles.niveauNombre}>5</Text>
              <Text style={styles.niveauTexte}>Niveau</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNombre}>{total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNombre}>{enCours}</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNombre}>{termines}</Text>
              <Text style={styles.statLabel}>Terminés</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#8b85c1" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un livre..."
              placeholderTextColor="#b8b0e8"
              value={recherche}
              onChangeText={setRecherche}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresScroll}>
            {FILTRES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filtreBtn, filtre === f && styles.filtreBtnActif]}
                onPress={() => setFiltre(f)}
              >
                <Text style={[styles.filtreTxt, filtre === f && styles.filtreTxtActif]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {livresFiltres.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTxt}>Aucun livre ici</Text>
            </View>
          ) : (
            <View style={styles.grille}>
              {livresFiltres.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.carte}
                  onPress={() => router.push(`/livre/${item.id}`)}
                  activeOpacity={0.92}
                >
                  {item.couverture ? (
                    <Image source={{ uri: item.couverture }} style={styles.couverture} resizeMode="cover" />
                  ) : (
                    <View style={[styles.couverture, styles.couverturePlaceholder]}>
                      <Text style={styles.couvertureEmoji}>📖</Text>
                    </View>
                  )}
                  <View style={styles.carteBody}>
                    <Text style={styles.carteTitre} numberOfLines={1}>{item.titre}</Text>
                    <Text style={styles.carteAuteur} numberOfLines={1}>{item.auteur}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  center: { flex: 1, backgroundColor: "#ffffff", justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#ffffff", padding: 24, paddingTop: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  bonjour: { fontSize: 26, fontWeight: "800", color: "#0f0939" },
  sousTitre: { fontSize: 14, color: "#5647bf", marginTop: 2 },
  niveauBadge: { backgroundColor: "#ede9ff", borderRadius: 16, padding: 12, alignItems: "center", minWidth: 64 },
  niveauNombre: { fontSize: 22, fontWeight: "800", color: "#0f0939" },
  niveauTexte: { fontSize: 11, color: "#5647bf", fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, backgroundColor: "#f7f6ff", borderRadius: 16, padding: 14, alignItems: "center" },
  statNombre: { fontSize: 22, fontWeight: "800", color: "#0f0939" },
  statLabel: { fontSize: 12, color: "#5647bf", marginTop: 2, fontWeight: "500" },
  body: { backgroundColor: "#cbc5f5", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, marginTop: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, shadowColor: "#5647bf", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 15, color: "#0f0939" },
  filtresScroll: { marginBottom: 20 },
  filtreBtn: { backgroundColor: "white", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, marginRight: 10 },
  filtreBtnActif: { backgroundColor: "#ffe594" },
  filtreTxt: { fontSize: 13, fontWeight: "600", color: "#8b85c1" },
  filtreTxtActif: { color: "#0f0939" },
  grille: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  carte: { backgroundColor: "white", borderRadius: 20, overflow: "hidden", width: "47%", shadowColor: "#5647bf", shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  couverture: { width: "100%", height: 160 },
  couverturePlaceholder: { backgroundColor: "#ede9ff", justifyContent: "center", alignItems: "center" },
  couvertureEmoji: { fontSize: 40 },
  carteBody: { padding: 12 },
  carteTitre: { fontSize: 14, fontWeight: "700", color: "#0f0939", marginBottom: 3 },
  carteAuteur: { fontSize: 12, color: "#8b85c1", marginBottom: 8 },
  carteStatut: { flexDirection: "row", alignItems: "center" },
  carteStatutTxt: { fontSize: 12, fontWeight: "600" },
  carteProgression: { fontSize: 12, fontWeight: "700", color: "#f1bc14" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTxt: { fontSize: 16, color: "#8b85c1", fontWeight: "600" },
});
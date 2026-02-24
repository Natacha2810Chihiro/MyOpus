import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

const DEFIS = [
  { id: "1", titre: "Défi Février", description: "3 livres à terminer", emoji: "📚", objectif: 3, type: "livres", fin: new Date("2026-02-28") },
  { id: "2", titre: "Marathon Pages", description: "Lis 1000 pages ce mois-ci", emoji: "📄", objectif: 1000, type: "pages", fin: new Date("2026-02-28") },
];

const BADGES = [
  { id: "1", titre: "Premier Livre", description: "Termine ton premier livre", emoji: "📖", condition: (t: number) => t >= 1, date: "28/01/2026" },
  { id: "2", titre: "Lecteur Nocturne", description: "Lis après minuit", emoji: "🌙", condition: () => true, date: "05/02/2026" },
  { id: "3", titre: "Marathon", description: "Lis 5 livres en un mois", emoji: "🏃", condition: (t: number) => t >= 5, date: null },
  { id: "4", titre: "Bibliophile", description: "Atteins 50 livres lus", emoji: "📚", condition: (t: number) => t >= 50, date: null },
];

const joursRestants = (fin: Date) => {
  const diff = fin.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default function Defis() {
  const [livres, setLivres] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const q = query(collection(db, "livres"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLivres(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const termines = livres.filter((l: any) => l.statut === "Terminé").length;
  const points = termines * 200;
  const niveau = Math.floor(points / 600) + 1;
  const pointsNiveau = points % 600;
  const progressionNiveau = pointsNiveau / 600;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitre}>Défis & Badges</Text>
          <Text style={styles.headerSous}>Continue comme ça ! 🎉</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Ionicons name="trophy" size={28} color="#0f0939" />
          <Text style={styles.pointsNombre}>{points}</Text>
          <Text style={styles.pointsLabel}>Points</Text>
        </View>
      </View>

      {/* Barre de niveau */}
      <View style={styles.niveauCard}>
        <View style={styles.niveauRow}>
          <Text style={styles.niveauTexte}>Niveau {niveau}</Text>
          <Text style={styles.niveauTexte}>Niveau {niveau + 1}</Text>
        </View>
        <View style={styles.barreGrise}>
          <View style={[styles.barreProgression, { width: `${progressionNiveau * 100}%` }]} />
        </View>
        <Text style={styles.niveauRestant}>{600 - pointsNiveau} points restants</Text>
      </View>

      {/* Défis actifs */}
      <View style={styles.body}>
        <Text style={styles.sectionTitre}>🎯 Défis actifs</Text>
        {DEFIS.map((defi) => {
          const actuel = defi.type === "livres" ? termines : termines * 80;
          const progression = Math.min(1, actuel / defi.objectif);
          const pct = Math.round(progression * 100);
          return (
            <View key={defi.id} style={styles.defiCarte}>
              <View style={styles.defiTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.defiTitre}>{defi.titre}</Text>
                  <Text style={styles.defiDesc}>{defi.description}</Text>
                </View>
                <Text style={styles.defiEmoji}>{defi.emoji}</Text>
              </View>
              <View style={styles.defiProgressRow}>
                <Text style={styles.defiActuel}>{Math.min(actuel, defi.objectif)} / {defi.objectif}</Text>
                <Text style={styles.defiPct}>{pct}%</Text>
              </View>
              <View style={styles.barreGriseDefi}>
                <View style={[styles.barreDefi, { width: `${pct}%` }]} />
              </View>
              <View style={styles.defiFooter}>
                <Ionicons name="calendar-outline" size={14} color="#8b85c1" />
                <Text style={styles.defiJours}> {joursRestants(defi.fin)} jours restants</Text>
              </View>
            </View>
          );
        })}

        {/* Badges */}
        <Text style={styles.sectionTitre}>🏆 Mes badges</Text>
        <View style={styles.badgesGrille}>
          {BADGES.map((badge) => {
            const debloque = badge.condition(termines);
            return (
              <View key={badge.id} style={[styles.badgeCarte, debloque ? styles.badgeDebloque : styles.badgeVerrouille]}>
                <Text style={styles.badgeEmoji}>{debloque ? badge.emoji : "🔒"}</Text>
                <Text style={[styles.badgeTitre, !debloque && styles.badgeTitreGris]}>{badge.titre}</Text>
                <Text style={[styles.badgeDesc, !debloque && styles.badgeDescGris]}>{badge.description}</Text>
                {debloque && badge.date && (
                  <Text style={styles.badgeDate}>{badge.date}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 24, paddingBottom: 16, backgroundColor: "#ffffff" },
  headerTitre: { fontSize: 26, fontWeight: "800", color: "#0f0939" },
  headerSous: { fontSize: 14, color: "#5647bf", marginTop: 4 },
  pointsBadge: { backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 20, padding: 14, alignItems: "center", minWidth: 80, shadowColor: "#5647bf", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  pointsNombre: { fontSize: 22, fontWeight: "800", color: "#0f0939", marginTop: 4 },
  pointsLabel: { fontSize: 11, color: "#5647bf", fontWeight: "600" },
  niveauCard: { backgroundColor: "#fff8e1", borderRadius: 20, margin: 24, marginTop: 0, padding: 20 },
  niveauRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  niveauTexte: { fontSize: 14, fontWeight: "600", color: "#0f0939" },
  barreGrise: { height: 10, backgroundColor: "#e8e0ff", borderRadius: 8, marginBottom: 10 },
  barreProgression: { height: 10, borderRadius: 8, backgroundColor: "#ffe594" },
  niveauRestant: { fontSize: 13, color: "#8b85c1", textAlign: "center" },
  body: { backgroundColor: "#cbc5f5", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  sectionTitre: { fontSize: 18, fontWeight: "800", color: "#0f0939", marginBottom: 16, marginTop: 8 },
  defiCarte: { backgroundColor: "white", borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: "#5647bf", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  defiTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  defiTitre: { fontSize: 17, fontWeight: "800", color: "#0f0939", marginBottom: 4 },
  defiDesc: { fontSize: 13, color: "#8b85c1" },
  defiEmoji: { fontSize: 32 },
  defiProgressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  defiActuel: { fontSize: 14, fontWeight: "600", color: "#0f0939" },
  defiPct: { fontSize: 14, fontWeight: "700", color: "#f1bc14" },
  barreGriseDefi: { height: 8, backgroundColor: "#cbc5f5", borderRadius: 8, marginBottom: 12 },
  barreDefi: { height: 8, borderRadius: 8, backgroundColor: "#f1bc14" },
  defiFooter: { flexDirection: "row", alignItems: "center" },
  defiJours: { fontSize: 13, color: "#8b85c1" },
  badgesGrille: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 32 },
  badgeCarte: { width: "47%", borderRadius: 20, padding: 18, alignItems: "center" },
  badgeDebloque: { backgroundColor: "#ffe594" },
  badgeVerrouille: { backgroundColor: "#ede9ff" },
  badgeEmoji: { fontSize: 36, marginBottom: 10 },
  badgeTitre: { fontSize: 14, fontWeight: "800", color: "#0f0939", textAlign: "center", marginBottom: 4 },
  badgeTitreGris: { color: "#8b85c1" },
  badgeDesc: { fontSize: 12, color: "#5647bf", textAlign: "center", lineHeight: 18 },
  badgeDescGris: { color: "#b8b0e8" },
  badgeDate: { fontSize: 11, color: "#7a5a00", marginTop: 8, fontWeight: "600" },
});
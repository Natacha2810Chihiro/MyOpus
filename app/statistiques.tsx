import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { auth, db } from "../firebaseConfig";

const screenWidth = Dimensions.get("window").width - 48;

export default function Statistiques() {
  const router = useRouter();
  const [livres, setLivres] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const q = query(collection(db, "livres"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLivres(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  const termines = livres.filter((l: any) => l.statut === "Terminé");
  const enCours = livres.filter((l: any) => l.statut === "En cours");
  const aLire = livres.filter((l: any) => l.statut === "À lire");

  // Pages lues estimées (200 pages par livre terminé en moyenne)
  const pagesLues = termines.length * 200;

  // Auteur le plus lu
  const auteurCount: Record<string, number> = {};
  termines.forEach((l: any) => {
    if (l.auteur) auteurCount[l.auteur] = (auteurCount[l.auteur] || 0) + 1;
  });
  const auteurTop = Object.entries(auteurCount).sort((a, b) => b[1] - a[1])[0];

  // Livres par mois (6 derniers mois)
  const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const maintenant = new Date();
  const derniersMois = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - 5 + i, 1);
    return { label: mois[d.getMonth()], mois: d.getMonth(), annee: d.getFullYear(), count: 0 };
  });

  termines.forEach((l: any) => {
    if (l.createdAt?.seconds) {
      const date = new Date(l.createdAt.seconds * 1000);
      const entry = derniersMois.find(m => m.mois === date.getMonth() && m.annee === date.getFullYear());
      if (entry) entry.count++;
    }
  });

  const barData = {
    labels: derniersMois.map(m => m.label),
    datasets: [{ data: derniersMois.map(m => Math.max(m.count, 0)) }],
  };

  const pieData = [
    { name: "Terminés", population: termines.length || 0, color: "#47c8bc", legendFontColor: "#0f0939", legendFontSize: 12 },
    { name: "En cours", population: enCours.length || 0, color: "#ffe594", legendFontColor: "#0f0939", legendFontSize: 12 },
    { name: "À lire", population: aLire.length || 0, color: "#cbc5f5", legendFontColor: "#0f0939", legendFontSize: 12 },
  ];

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(86, 71, 191, ${opacity})`,
    labelColor: () => "#8b85c1",
    barPercentage: 0.6,
    decimalPlaces: 0,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.retour}>
          <Ionicons name="arrow-back" size={24} color="#0f0939" />
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Mes statistiques</Text>
      </View>

      {/* Cartes stats rapides */}
      <View style={styles.body}>
        <View style={styles.statsGrille}>
          <View style={[styles.statBox, { backgroundColor: "#c7f0ec" }]}>
            <Text style={styles.statNombre}>{livres.length}</Text>
            <Text style={styles.statLabel}>Livres total</Text>
            <Ionicons name="library-outline" size={20} color="#0f6b65" style={styles.statIcon} />
          </View>
          <View style={[styles.statBox, { backgroundColor: "#ffe594" }]}>
            <Text style={styles.statNombre}>{termines.length}</Text>
            <Text style={styles.statLabel}>Terminés</Text>
            <Ionicons name="checkmark-circle-outline" size={20} color="#7a5a00" style={styles.statIcon} />
          </View>
          <View style={[styles.statBox, { backgroundColor: "#fbd9f2" }]}>
            <Text style={styles.statNombre}>{pagesLues}</Text>
            <Text style={styles.statLabel}>Pages lues ~</Text>
            <Ionicons name="reader-outline" size={20} color="#64034b" style={styles.statIcon} />
          </View>
          <View style={[styles.statBox, { backgroundColor: "#cbc5f5" }]}>
            <Text style={styles.statNombre}>{termines.length * 200}</Text>
            <Text style={styles.statLabel}>Mots lus ~</Text>
            <Ionicons name="text-outline" size={20} color="#5647bf" style={styles.statIcon} />
          </View>
        </View>

        {/* Auteur top */}
        {auteurTop && (
          <View style={styles.auteurCard}>
            <Text style={styles.auteurEmoji}>✍️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.auteurLabel}>Auteur favori</Text>
              <Text style={styles.auteurNom}>{auteurTop[0]}</Text>
              <Text style={styles.auteurCount}>{auteurTop[1]} livre(s) lu(s)</Text>
            </View>
          </View>
        )}

        {/* Graphique barres */}
        <Text style={styles.sectionTitre}>📅 Livres lus par mois</Text>
        <View style={styles.graphCard}>
          <BarChart
            data={barData}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
            showValuesOnTopOfBars
            withInnerLines={false}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        {/* Graphique camembert */}
        <Text style={styles.sectionTitre}>📊 Répartition</Text>
        <View style={styles.graphCard}>
          <PieChart
            data={pieData}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
          />
        </View>

        {/* Objectif mensuel */}
        <Text style={styles.sectionTitre}>🎯 Objectif du mois</Text>
        <View style={styles.objectifCard}>
          <View style={styles.objectifRow}>
            <Text style={styles.objectifTxt}>
              {derniersMois[5]?.count ?? 0} / 4 livres
            </Text>
            <Text style={styles.objectifPct}>
              {Math.round(((derniersMois[5]?.count ?? 0) / 4) * 100)}%
            </Text>
          </View>
          <View style={styles.barreGrise}>
            <View style={[styles.barreViolet, { width: `${Math.min(((derniersMois[5]?.count ?? 0) / 4) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.objectifSous}>Lis 4 livres ce mois-ci 📚</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: { flexDirection: "row", alignItems: "center", padding: 24, paddingBottom: 16, gap: 16 },
  retour: { backgroundColor: "#f7f6ff", borderRadius: 12, padding: 8 },
  headerTitre: { fontSize: 24, fontWeight: "800", color: "#0f0939" },
  body: { backgroundColor: "#f7f6ff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  statsGrille: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  statBox: { width: "47%", borderRadius: 20, padding: 16, position: "relative", overflow: "hidden" },
  statNombre: { fontSize: 28, fontWeight: "800", color: "#0f0939" },
  statLabel: { fontSize: 12, color: "#0f0939", opacity: 0.7, marginTop: 2, fontWeight: "500" },
  statIcon: { position: "absolute", bottom: 12, right: 12, opacity: 0.4 },
  auteurCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 20, padding: 20, marginBottom: 24, gap: 16, shadowColor: "#5647bf", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  auteurEmoji: { fontSize: 36 },
  auteurLabel: { fontSize: 12, color: "#8b85c1", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  auteurNom: { fontSize: 18, fontWeight: "800", color: "#0f0939", marginTop: 2 },
  auteurCount: { fontSize: 13, color: "#5647bf", marginTop: 2 },
  sectionTitre: { fontSize: 16, fontWeight: "700", color: "#0f0939", marginBottom: 14 },
  graphCard: { backgroundColor: "white", borderRadius: 20, padding: 16, marginBottom: 24, shadowColor: "#5647bf", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  objectifCard: { backgroundColor: "white", borderRadius: 20, padding: 20, marginBottom: 32, shadowColor: "#5647bf", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  objectifRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  objectifTxt: { fontSize: 16, fontWeight: "700", color: "#0f0939" },
  objectifPct: { fontSize: 16, fontWeight: "700", color: "#f1bc14" },
  barreGrise: { height: 10, backgroundColor: "#ede9ff", borderRadius: 8, marginBottom: 10 },
  barreViolet: { height: 10, backgroundColor: "#47c8bc", borderRadius: 8 },
  objectifSous: { fontSize: 13, color: "#8b85c1" },
});
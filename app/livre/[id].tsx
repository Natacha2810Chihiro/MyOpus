import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../firebaseConfig";

const STATUTS = ["À lire", "En cours", "Terminé"];

export default function FicheLivre() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [livre, setLivre] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progression, setProgression] = useState(0);

  useEffect(() => {
    const fetchLivre = async () => {
      const docRef = doc(db, "livres", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setLivre(data);
        setProgression((data as any).progression ?? 0);
      }
      setLoading(false);
    };
    fetchLivre();
  }, [id]);

  const updateStatut = async (statut: string) => {
    await updateDoc(doc(db, "livres", id as string), {
      statut,
      progression: statut === "Terminé" ? 100 : statut === "À lire" ? 0 : progression,
    });
    setLivre({ ...livre, statut });
    if (statut === "Terminé") setProgression(100);
    if (statut === "À lire") setProgression(0);
  };

  const updateProgression = async (val: number) => {
    setProgression(val);
    await updateDoc(doc(db, "livres", id as string), { progression: val });
  };

  const supprimerLivre = async () => {
    Alert.alert("Supprimer", `Supprimer "${livre.titre}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "livres", id as string));
          router.back();
        },
      },
    ]);
  };

  if (loading || !livre) return (
    <View style={styles.center}>
      <Text style={styles.chargement}>Chargement...</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Couverture */}
      <View style={styles.couvertureContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.retour}>
          <Ionicons name="arrow-back" size={24} color="#0f0939" />
        </TouchableOpacity>
        {livre.couverture ? (
          <Image source={{ uri: livre.couverture }} style={styles.couverture} resizeMode="cover" />
        ) : (
          <View style={[styles.couverture, styles.couverturePlaceholder]}>
            <Text style={styles.couvertureEmoji}>📖</Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={styles.body}>
        <Text style={styles.titre}>{livre.titre}</Text>
        <Text style={styles.auteur}>{livre.auteur}</Text>

        {/* Statut */}
        <Text style={styles.sectionTitre}>Statut</Text>
        <View style={styles.statutsRow}>
          {STATUTS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statutBtn, livre.statut === s && styles.statutBtnActif]}
              onPress={() => updateStatut(s)}
            >
              <Text style={[styles.statutTxt, livre.statut === s && styles.statutTxtActif]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progression */}
        {livre.statut === "En cours" && (
          <>
            <Text style={styles.sectionTitre}>Progression — {progression}%</Text>
            <View style={styles.barreGrise}>
              <View style={[styles.barreViolet, { width: `${progression}%` }]} />
            </View>
            <View style={styles.progressionBtns}>
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.pctBtn, progression === val && styles.pctBtnActif]}
                  onPress={() => updateProgression(val)}
                >
                  <Text style={[styles.pctTxt, progression === val && styles.pctTxtActif]}>{val}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Supprimer */}
        <TouchableOpacity style={styles.boutonSupprimer} onPress={supprimerLivre}>
          <Ionicons name="trash-outline" size={18} color="#64034b" />
          <Text style={styles.boutonSupprimerTexte}>Supprimer ce livre</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  chargement: { color: "#8b85c1", fontSize: 16 },
  couvertureContainer: { position: "relative" },
  retour: { position: "absolute", top: 16, left: 16, zIndex: 10, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 12, padding: 8 },
  couverture: { width: "100%", height: 320 },
  couverturePlaceholder: { backgroundColor: "#ede9ff", justifyContent: "center", alignItems: "center" },
  couvertureEmoji: { fontSize: 64 },
  body: { backgroundColor: "#ffffff", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, padding: 24 },
  titre: { fontSize: 26, fontWeight: "800", color: "#0f0939", marginBottom: 6 },
  auteur: { fontSize: 16, color: "#8b85c1", marginBottom: 28 },
  sectionTitre: { fontSize: 13, fontWeight: "700", color: "#5647bf", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  statutsRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  statutBtn: { flex: 1, backgroundColor: "#f7f6ff", borderRadius: 14, padding: 12, alignItems: "center" },
  statutBtnActif: { backgroundColor: "#0f0939" },
  statutTxt: { fontSize: 12, fontWeight: "600", color: "#8b85c1" },
  statutTxtActif: { color: "#ffe594" },
  barreGrise: { height: 10, backgroundColor: "#ede9ff", borderRadius: 8, marginBottom: 16 },
  barreViolet: { height: 10, backgroundColor: "#47c8bc", borderRadius: 8 },
  progressionBtns: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  pctBtn: { backgroundColor: "#f7f6ff", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  pctBtnActif: { backgroundColor: "#cbc5f5" },
  pctTxt: { fontSize: 12, fontWeight: "600", color: "#8b85c1" },
  pctTxtActif: { color: "#0f0939", fontWeight: "800" },
  boutonSupprimer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#fbd9f2", borderRadius: 16, padding: 16, marginTop: 16 },
  boutonSupprimerTexte: { color: "#64034b", fontWeight: "700", fontSize: 15 },
});
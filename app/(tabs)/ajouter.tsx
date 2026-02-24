import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

const STATUTS = ["À lire", "En cours", "Terminé"];

const getCouverture = async (titre: string, auteur: string): Promise<string | null> => {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(titre + " " + auteur)}&maxResults=1`);
    const data = await res.json();
    const image = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    return image ? image.replace("http://", "https://") : null;
  } catch { return null; }
};

export default function Ajouter() {
  const [titre, setTitre] = useState("");
  const [auteur, setAuteur] = useState("");
  const [statut, setStatut] = useState("À lire");
  const [loading, setLoading] = useState(false);

  const handleAjouter = async () => {
    if (!titre || !auteur) {
      Alert.alert("Oups !", "Remplis le titre et l'auteur 📖");
      return;
    }
    setLoading(true);
    try {
      const couverture = await getCouverture(titre, auteur);
      await addDoc(collection(db, "livres"), {
        titre,
        auteur,
        statut,
        progression: 0,
        couverture: couverture ?? null,
        userId: auth.currentUser?.uid,
        createdAt: new Date(),
      });
      Alert.alert("✨ Ajouté !", `"${titre}" rejoint ta bibliothèque`);
      setTitre("");
      setAuteur("");
      setStatut("À lire");
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter le livre.");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Nouveau livre</Text>
      <Text style={styles.sousTitre}>Ajoute un livre à ta collection</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Titre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex : Le Petit Prince"
          placeholderTextColor="#b8b0e8"
          value={titre}
          onChangeText={setTitre}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Auteur</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex : Antoine de Saint-Exupéry"
          placeholderTextColor="#b8b0e8"
          value={auteur}
          onChangeText={setAuteur}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Statut</Text>
        <View style={styles.statutsRow}>
          {STATUTS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statutBtn, statut === s && styles.statutBtnActif]}
              onPress={() => setStatut(s)}
            >
              <Text style={[styles.statutBtnTexte, statut === s && styles.statutBtnTexteActif]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bouton, loading && styles.boutonDisabled]}
        onPress={handleAjouter}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.boutonTexte}>
          {loading ? "Recherche de la couverture..." : "Ajouter à ma bibliothèque"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 24, paddingTop: 16 },
  header: { fontSize: 28, fontWeight: "800", color: "#0f0939", marginBottom: 6, letterSpacing: -0.5 },
  sousTitre: { fontSize: 14, color: "#5647bf", marginBottom: 32 },
  section: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "700", color: "#0f0939", marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" },
  input: { backgroundColor: "#f7f6ff", borderRadius: 16, padding: 16, fontSize: 15, color: "#0f0939" },
  statutsRow: { flexDirection: "row", gap: 10 },
  statutBtn: { flex: 1, backgroundColor: "#f7f6ff", borderRadius: 14, padding: 12, alignItems: "center" },
  statutBtnActif: { backgroundColor: "#0f0939" },
  statutBtnTexte: { fontSize: 12, fontWeight: "600", color: "#8b85c1" },
  statutBtnTexteActif: { color: "#ffe594" },
  bouton: { backgroundColor: "#ffe594", borderRadius: 18, padding: 18, alignItems: "center", marginTop: 8, shadowColor: "#f1bc14", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  boutonDisabled: { opacity: 0.6 },
  boutonTexte: { color: "#0f0939", fontWeight: "800", fontSize: 16 },
});
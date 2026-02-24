import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function Profil() {
  const [livres, setLivres] = useState([]);
  const user = auth.currentUser;
  const prenom = user?.email?.split("@")[0] ?? "Lecteur";
  const initiale = prenom[0].toUpperCase();

  useEffect(() => {
    const userId = user?.uid;
    if (!userId) return;
    const q = query(collection(db, "livres"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLivres(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const total = livres.length;
  const enCours = livres.filter((l: any) => l.statut === "En cours").length;
  const termines = livres.filter((l: any) => l.statut === "Terminé").length;
  const aLire = livres.filter((l: any) => l.statut === "À lire").length;

  const handleDeconnexion = async () => {
    Alert.alert("Déconnexion", "Tu veux vraiment partir ? 👋", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: async () => await signOut(auth) },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexte}>{initiale}</Text>
          </View>
          <View style={styles.niveauBadge}>
            <Text style={styles.niveauTexte}>Niv. 5</Text>
          </View>
        </View>
        <Text style={styles.prenom}>{prenom}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.body}>
        <Text style={styles.sectionTitre}>Mes stats de lecture</Text>
        <View style={styles.statsGrille}>
          <View style={[styles.statBox, { backgroundColor: "#fbd9f2" }]}>
            <Text style={styles.statNombre}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
            <Ionicons name="library-outline" size={20} color="#64034b" style={styles.statIcon} />
          </View>
          <View style={[styles.statBox, { backgroundColor: "#c7f0ec" }]}>
            <Text style={styles.statNombre}>{enCours}</Text>
            <Text style={styles.statLabel}>En cours</Text>
            <Ionicons name="book-outline" size={20} color="#0f6b65" style={styles.statIcon} />
          </View>
          <View style={[styles.statBox, { backgroundColor: "#ffe594" }]}>
            <Text style={styles.statNombre}>{termines}</Text>
            <Text style={styles.statLabel}>Terminés</Text>
            <Ionicons name="checkmark-circle-outline" size={20} color="#7a5a00" style={styles.statIcon} />
          </View>
          <View style={[styles.statBox, { backgroundColor: "#cbc5f5" }]}>
            <Text style={styles.statNombre}>{aLire}</Text>
            <Text style={styles.statLabel}>À lire</Text>
            <Ionicons name="bookmark-outline" size={20} color="#5647bf" style={styles.statIcon} />
          </View>
        </View>

        {/* Menu */}
        <Text style={styles.sectionTitre}>Mon compte</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Ionicons name="trophy-outline" size={20} color="#5647bf" />
            </View>
            <Text style={styles.menuTexte}>Mes défis</Text>
            <Ionicons name="chevron-forward" size={18} color="#b8b0e8" />
          </TouchableOpacity>

          <View style={styles.separateur} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Ionicons name="stats-chart-outline" size={20} color="#5647bf" />
            </View>
            <Text style={styles.menuTexte}>Mes statistiques</Text>
            <Ionicons name="chevron-forward" size={18} color="#b8b0e8" />
          </TouchableOpacity>

          <View style={styles.separateur} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Ionicons name="settings-outline" size={20} color="#5647bf" />
            </View>
            <Text style={styles.menuTexte}>Paramètres</Text>
            <Ionicons name="chevron-forward" size={18} color="#b8b0e8" />
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.boutonDeco} onPress={handleDeconnexion}>
          <Ionicons name="log-out-outline" size={20} color="#64034b" />
          <Text style={styles.boutonDecoTexte}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: { backgroundColor: "#ffffff", alignItems: "center", paddingTop: 32, paddingBottom: 32, paddingHorizontal: 24 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#0f0939", justifyContent: "center", alignItems: "center" },
  avatarTexte: { fontSize: 36, fontWeight: "800", color: "#ffe594" },
  niveauBadge: { position: "absolute", bottom: -4, right: -4, backgroundColor: "#ffe594", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  niveauTexte: { fontSize: 11, fontWeight: "800", color: "#0f0939" },
  prenom: { fontSize: 24, fontWeight: "800", color: "#0f0939", marginBottom: 4, textTransform: "capitalize" },
  email: { fontSize: 13, color: "#8b85c1" },
  body: { backgroundColor: "#f7f6ff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, flex: 1 },
  sectionTitre: { fontSize: 16, fontWeight: "700", color: "#0f0939", marginBottom: 14, marginTop: 8 },
  statsGrille: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  statBox: { width: "47%", borderRadius: 20, padding: 16, position: "relative", overflow: "hidden" },
  statNombre: { fontSize: 28, fontWeight: "800", color: "#0f0939" },
  statLabel: { fontSize: 13, color: "#0f0939", fontWeight: "500", opacity: 0.7, marginTop: 2 },
  statIcon: { position: "absolute", bottom: 12, right: 12, opacity: 0.5 },
  menuContainer: { backgroundColor: "white", borderRadius: 20, marginBottom: 24, shadowColor: "#5647bf", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16 },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#f0eeff", justifyContent: "center", alignItems: "center", marginRight: 14 },
  menuTexte: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0f0939" },
  separateur: { height: 1, backgroundColor: "#f0eeff", marginHorizontal: 16 },
  boutonDeco: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#fbd9f2", borderRadius: 16, padding: 16 },
  boutonDecoTexte: { color: "#64034b", fontWeight: "700", fontSize: 15 },
});
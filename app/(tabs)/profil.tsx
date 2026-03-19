import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { auth, db } from "../../firebaseConfig";

export default function Profil() {
  const [livres, setLivres] = useState([]);
  const user = auth.currentUser;
  const prenom = user?.email?.split("@")[0] ?? "Lecteur";
  const initiale = prenom[0].toUpperCase();
  const router = useRouter();
  const { sombre, toggleTheme, couleurs } = useTheme();

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
    <ScrollView style={[styles.container, { backgroundColor: couleurs.fond }]} showsVerticalScrollIndicator={false}>

    <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/modifier-profil")}>
      <View style={[styles.menuIconBox, { backgroundColor: couleurs.fondSecondaire }]}>
        <Ionicons name="pencil-outline" size={20} color="#5647bf" />
      </View>
      <Text style={[styles.menuTexte, { color: couleurs.texte }]}>Modifier mon profil</Text>
      <Ionicons name="chevron-forward" size={18} color={couleurs.texteGris} />
    </TouchableOpacity>

    <View style={[styles.separateur, { backgroundColor: couleurs.bordure }]} />

      <View style={[styles.header, { backgroundColor: couleurs.fond }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: sombre ? "#cbc5f5" : "#0f0939" }]}>
            <Text style={[styles.avatarTexte, { color: sombre ? "#0f0939" : "#ffe594" }]}>{initiale}</Text>
          </View>
          <View style={[styles.niveauBadge, { backgroundColor: couleurs.accent }]}>
            <Text style={[styles.niveauTexte, { color: couleurs.accentTexte }]}>Niv. 5</Text>
          </View>
        </View>
        <Text style={[styles.prenom, { color: couleurs.texte }]}>{prenom}</Text>
        <Text style={[styles.email, { color: couleurs.texteGris }]}>{user?.email}</Text>
      </View>

      <View style={[styles.body, { backgroundColor: couleurs.fondSecondaire }]}>
        <Text style={[styles.sectionTitre, { color: couleurs.texte }]}>Mes stats de lecture</Text>
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

        <Text style={[styles.sectionTitre, { color: couleurs.texte }]}>Mon compte</Text>
        <View style={[styles.menuContainer, { backgroundColor: couleurs.carte }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/defis")}>
            <View style={[styles.menuIconBox, { backgroundColor: couleurs.fondSecondaire }]}>
              <Ionicons name="trophy-outline" size={20} color="#5647bf" />
            </View>
            <Text style={[styles.menuTexte, { color: couleurs.texte }]}>Mes défis</Text>
            <Ionicons name="chevron-forward" size={18} color={couleurs.texteGris} />
          </TouchableOpacity>

          <View style={[styles.separateur, { backgroundColor: couleurs.bordure }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/statistiques")}>
            <View style={[styles.menuIconBox, { backgroundColor: couleurs.fondSecondaire }]}>
              <Ionicons name="stats-chart-outline" size={20} color="#5647bf" />
            </View>
            <Text style={[styles.menuTexte, { color: couleurs.texte }]}>Mes statistiques</Text>
            <Ionicons name="chevron-forward" size={18} color={couleurs.texteGris} />
          </TouchableOpacity>

          <View style={[styles.separateur, { backgroundColor: couleurs.bordure }]} />

          {/* Toggle mode sombre */}
          <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
            <View style={[styles.menuIconBox, { backgroundColor: couleurs.fondSecondaire }]}>
              <Ionicons name={sombre ? "sunny-outline" : "moon-outline"} size={20} color="#5647bf" />
            </View>
            <Text style={[styles.menuTexte, { color: couleurs.texte }]}>{sombre ? "Mode clair" : "Mode sombre"}</Text>
            <View style={[styles.toggleContainer, { backgroundColor: sombre ? "#5647bf" : "#ede9ff" }]}>
              <View style={[styles.toggleBall, { transform: [{ translateX: sombre ? 20 : 0 }] }]} />
            </View>
          </TouchableOpacity>

          <View style={[styles.separateur, { backgroundColor: couleurs.bordure }]} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: couleurs.fondSecondaire }]}>
              <Ionicons name="settings-outline" size={20} color="#5647bf" />
            </View>
            <Text style={[styles.menuTexte, { color: couleurs.texte }]}>Paramètres</Text>
            <Ionicons name="chevron-forward" size={18} color={couleurs.texteGris} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.boutonDeco} onPress={handleDeconnexion}>
          <Ionicons name="log-out-outline" size={20} color="#64034b" />
          <Text style={styles.boutonDecoTexte}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingTop: 32, paddingBottom: 32, paddingHorizontal: 24 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, justifyContent: "center", alignItems: "center" },
  avatarTexte: { fontSize: 36, fontWeight: "800" },
  niveauBadge: { position: "absolute", bottom: -4, right: -4, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  niveauTexte: { fontSize: 11, fontWeight: "800" },
  prenom: { fontSize: 24, fontWeight: "800", marginBottom: 4, textTransform: "capitalize" },
  email: { fontSize: 13 },
  body: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, flex: 1 },
  sectionTitre: { fontSize: 16, fontWeight: "700", marginBottom: 14, marginTop: 8 },
  statsGrille: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  statBox: { width: "47%", borderRadius: 20, padding: 16, position: "relative", overflow: "hidden" },
  statNombre: { fontSize: 28, fontWeight: "800", color: "#0f0939" },
  statLabel: { fontSize: 13, color: "#0f0939", fontWeight: "500", opacity: 0.7, marginTop: 2 },
  statIcon: { position: "absolute", bottom: 12, right: 12, opacity: 0.5 },
  menuContainer: { borderRadius: 20, marginBottom: 24, shadowColor: "#5647bf", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16 },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 14 },
  menuTexte: { flex: 1, fontSize: 15, fontWeight: "600" },
  separateur: { height: 1, marginHorizontal: 16 },
  boutonDeco: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#fbd9f2", borderRadius: 16, padding: 16 },
  boutonDecoTexte: { color: "#64034b", fontWeight: "700", fontSize: 15 },
  toggleContainer: { width: 44, height: 24, borderRadius: 12, justifyContent: "center", padding: 2 },
  toggleBall: { width: 20, height: 20, borderRadius: 10, backgroundColor: "white" },
});
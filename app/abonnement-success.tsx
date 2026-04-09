import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function AbonnementSuccess() {
  const router = useRouter();
  const { couleurs } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: couleurs.fond }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#5647bf" />
        </View>
        <Text style={[styles.titre, { color: couleurs.texte }]}>
          Bienvenue dans Premium ! 🎉
        </Text>
        <Text style={[styles.sousTitre, { color: couleurs.texteGris }]}>
          Ton abonnement est actif. Profite de toutes les fonctionnalités premium de My Opus !
        </Text>
        <TouchableOpacity
          style={styles.bouton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.boutonTexte}>Commencer à lire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  content: { alignItems: "center", gap: 20 },
  iconContainer: { marginBottom: 8 },
  titre: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  sousTitre: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  bouton: { backgroundColor: "#5647bf", borderRadius: 16, padding: 16, paddingHorizontal: 32, marginTop: 8 },
  boutonTexte: { color: "white", fontWeight: "700", fontSize: 16 },
});
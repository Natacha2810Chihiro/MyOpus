import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AbonnementCancel() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="close-circle-outline" size={80} color="#E8C6E2" />
      <Text style={styles.title}>Paiement annulé</Text>
      <Text style={styles.subtitle}>Tu peux réessayer quand tu veux.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/abonnement")}
      >
        <Text style={styles.buttonText}>Réessayer</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(tabs)/profil")}>
        <Text style={styles.link}>Retour au profil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: "Kavoon_400Regular",
    color: "#000",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    fontFamily: "YanoneKaffeesatz_300Light",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#5647bf",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Kavoon_400Regular",
  },
  link: {
    fontSize: 16,
    color: "#5647bf",
    fontFamily: "YanoneKaffeesatz_300Light",
    textDecorationLine: "underline",
  },
});

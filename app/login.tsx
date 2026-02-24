import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [isInscription, setIsInscription] = useState(false);

  const handleAuth = async () => {
    if (!email || !motDePasse) {
      Alert.alert("Erreur", "Remplis tous les champs !");
      return;
    }
    try {
      if (isInscription) {
        await createUserWithEmailAndPassword(auth, email, motDePasse);
        Alert.alert("Bienvenue !", "Ton compte a été créé 🎉");
      } else {
        await signInWithEmailAndPassword(auth, email, motDePasse);
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>📚 MyOpus</Text>
      <Text style={styles.sousTitre}>{isInscription ? "Créer un compte" : "Se connecter"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={motDePasse}
        onChangeText={setMotDePasse}
        secureTextEntry
      />

      <TouchableOpacity style={styles.bouton} onPress={handleAuth}>
        <Text style={styles.boutonTexte}>{isInscription ? "S'inscrire" : "Se connecter"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsInscription(!isInscription)}>
        <Text style={styles.lien}>
          {isInscription ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 24, justifyContent: "center" },
  titre: { fontSize: 36, fontWeight: "bold", color: "#6C63FF", textAlign: "center", marginBottom: 8 },
  sousTitre: { fontSize: 18, color: "#888", textAlign: "center", marginBottom: 32 },
  input: { backgroundColor: "white", borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, borderColor: "#e0e0e0", marginBottom: 12 },
  bouton: { backgroundColor: "#6C63FF", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  boutonTexte: { color: "white", fontWeight: "bold", fontSize: 16 },
  lien: { color: "#6C63FF", textAlign: "center", marginTop: 16, fontSize: 14 },
});
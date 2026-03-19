import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert, Animated,
  KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from "react-native";
import { auth, db } from "../firebaseConfig";

export default function Login() {
  const [isInscription, setIsInscription] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const splashOpacity = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAuth = async () => {
    if (!email || !motDePasse) {
      Alert.alert("Oups !", "Remplis tous les champs 📖");
      return;
    }
    if (isInscription && !username.trim()) {
      Alert.alert("Oups !", "Choisis un nom d'utilisateur 👤");
      return;
    }
    try {
      if (isInscription) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, motDePasse);
        const user = userCredential.user;

        // Créer le profil utilisateur dans Firestore
        await setDoc(doc(db, "users", user.uid), {
          username: username.trim(),
          email: email.toLowerCase().trim(),
          created_at: new Date(),
          avatar: null,
          bio: "",
          livresLus: 0,
          amis: [],
        });

      } else {
        await signInWithEmailAndPassword(auth, email, motDePasse);
      }
    } catch (error: any) {
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "Cet email est déjà utilisé",
        "auth/invalid-email": "Email invalide",
        "auth/weak-password": "Mot de passe trop faible (6 caractères minimum)",
        "auth/user-not-found": "Aucun compte avec cet email",
        "auth/wrong-password": "Mot de passe incorrect",
      };
      Alert.alert("Erreur", messages[error.code] ?? error.message);
    }
  };

  if (showSplash) {
    return (
      <Animated.View style={[styles.splash, { opacity: splashOpacity }]}>
        <View style={styles.vagueHautGauche} />
        <View style={styles.vagueHautGauche2} />
        <View style={styles.vagueBasDroite} />
        <View style={styles.vagueBasDroite2} />
        <View style={styles.splashLogo}>
          <Text style={styles.splashLogoTexte}>MyOpus</Text>
          <Text style={styles.splashLogoSous}>ta bibliothèque</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.vagueBasDroite} />
        <View style={styles.vagueBasDroite2} />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoTexte}>MyOpus</Text>
          <Text style={styles.logoSous}>ta bibliothèque</Text>
        </View>

        {/* Titre */}
        <Text style={styles.bienvenue}>
          {isInscription ? "Rejoins l'aventure ✨" : "Bon retour parmi nous 👋"}
        </Text>
        <Text style={styles.sousTitre}>{isInscription ? "Inscription" : "Connexion"}</Text>

        {/* Champs */}
        <View style={styles.champsContainer}>

          {/* Username — uniquement à l'inscription */}
          {isInscription && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor="#b8b0e8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#b8b0e8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#b8b0e8"
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.inputIcon}>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton principal */}
        <TouchableOpacity style={styles.bouton} onPress={handleAuth} activeOpacity={0.85}>
          <Text style={styles.boutonTexte}>{isInscription ? "S'inscrire" : "Se connecter"}</Text>
        </TouchableOpacity>

        {/* Séparateur */}
        <View style={styles.separateurRow}>
          <View style={styles.separateurLigne} />
          <Text style={styles.separateurTexte}>ou</Text>
          <View style={styles.separateurLigne} />
        </View>

        {/* Switcher */}
        <TouchableOpacity onPress={() => { setIsInscription(!isInscription); setUsername(""); }}>
          <Text style={styles.switchTexte}>
            {isInscription ? "Déjà un compte ? " : "Pas encore de compte ? "}
            <Text style={styles.switchLien}>
              {isInscription ? "Se connecter" : "S'inscrire"}
            </Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: "#faf9f6", justifyContent: "center", alignItems: "center" },
  splashLogo: { alignItems: "center" },
  splashLogoTexte: { fontSize: 42, fontWeight: "800", color: "#0f0939", letterSpacing: -1 },
  splashLogoSous: { fontSize: 16, color: "#5647bf", marginTop: 4, fontWeight: "500" },
  vagueHautGauche: { position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: "#cbc5f5", opacity: 0.6, transform: [{ rotate: "20deg" }] },
  vagueHautGauche2: { position: "absolute", top: -30, left: -80, width: 220, height: 180, borderRadius: 100, backgroundColor: "#ffe594", opacity: 0.4, transform: [{ rotate: "30deg" }] },
  vagueBasDroite: { position: "absolute", bottom: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "#cbc5f5", opacity: 0.5, transform: [{ rotate: "-20deg" }] },
  vagueBasDroite2: { position: "absolute", bottom: -40, right: -80, width: 240, height: 190, borderRadius: 110, backgroundColor: "#ffe594", opacity: 0.35, transform: [{ rotate: "-30deg" }] },
  container: { flex: 1, backgroundColor: "#faf9f6" },
  scroll: { flexGrow: 1, padding: 28, paddingTop: 60, position: "relative" },
  logoContainer: { alignItems: "center", marginBottom: 36 },
  logoTexte: { fontSize: 36, fontWeight: "800", color: "#0f0939", letterSpacing: -1 },
  logoSous: { fontSize: 14, color: "#5647bf", marginTop: 4, fontWeight: "500" },
  bienvenue: { fontSize: 20, fontWeight: "700", color: "#5647bf", marginBottom: 4 },
  sousTitre: { fontSize: 32, fontWeight: "800", color: "#0f0939", marginBottom: 32, letterSpacing: -0.5 },
  champsContainer: { gap: 14, marginBottom: 24 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1.5, borderColor: "#ede9ff", shadowColor: "#5647bf", shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#0f0939", paddingVertical: 14 },
  bouton: { backgroundColor: "#5647bf", borderRadius: 18, padding: 18, alignItems: "center", marginBottom: 24, shadowColor: "#5647bf", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  boutonTexte: { color: "white", fontWeight: "800", fontSize: 16 },
  separateurRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 12 },
  separateurLigne: { flex: 1, height: 1, backgroundColor: "#ede9ff" },
  separateurTexte: { fontSize: 13, color: "#b8b0e8", fontWeight: "500" },
  switchTexte: { textAlign: "center", fontSize: 14, color: "#8b85c1" },
  switchLien: { color: "#5647bf", fontWeight: "700" },
});
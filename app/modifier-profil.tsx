import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert, Image, KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet, Text, TextInput,
    TouchableOpacity, View
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../firebaseConfig";

export default function ModifierProfil() {
  const router = useRouter();
  const { couleurs } = useTheme();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email ?? "");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [showMDP, setShowMDP] = useState(false);
  const [showNewMDP, setShowNewMDP] = useState(false);

  useEffect(() => {
    const fetchProfil = async () => {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username ?? "");
          setBio(data.bio ?? "");
          setAvatar(data.avatar ?? null);
        }
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };
    fetchProfil();
  }, []);

  const choisirPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "Autorise l'accès à ta galerie dans les réglages");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64);
    }
  };

  const sauvegarder = async () => {
    if (!user) return;
    if (!username.trim()) {
      Alert.alert("Oups !", "Le nom d'utilisateur ne peut pas être vide");
      return;
    }
    setSaving(true);
    try {
      // Mettre à jour Firestore
      await updateDoc(doc(db, "users", user.uid), {
        username: username.trim(),
        bio: bio.trim(),
        avatar: avatar,
        updated_at: new Date(),
      });

      // Mettre à jour l'email si changé
      if (email !== user.email) {
        if (!motDePasseActuel) {
          Alert.alert("Mot de passe requis", "Entre ton mot de passe actuel pour changer l'email");
          setSaving(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email!, motDePasseActuel);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
      }

      // Mettre à jour le mot de passe si renseigné
      if (nouveauMotDePasse) {
        if (!motDePasseActuel) {
          Alert.alert("Mot de passe requis", "Entre ton mot de passe actuel pour le changer");
          setSaving(false);
          return;
        }
        if (nouveauMotDePasse.length < 6) {
          Alert.alert("Mot de passe trop court", "6 caractères minimum");
          setSaving(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email!, motDePasseActuel);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, nouveauMotDePasse);
      }

      Alert.alert("✅ Sauvegardé !", "Ton profil a été mis à jour", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const messages: Record<string, string> = {
        "auth/wrong-password": "Mot de passe actuel incorrect",
        "auth/email-already-in-use": "Cet email est déjà utilisé",
        "auth/requires-recent-login": "Reconnecte-toi pour effectuer ce changement",
      };
      Alert.alert("Erreur", messages[error.code] ?? error.message);
    }
    setSaving(false);
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: couleurs.fond }]}>
      <ActivityIndicator size="large" color="#5647bf" />
    </View>
  );

  const initiale = username ? username[0].toUpperCase() : "?";

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: couleurs.fond }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: couleurs.fond }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.retour, { backgroundColor: couleurs.fondSecondaire }]}>
            <Ionicons name="arrow-back" size={24} color={couleurs.texte} />
          </TouchableOpacity>
          <Text style={[styles.headerTitre, { color: couleurs.texte }]}>Modifier le profil</Text>
          <TouchableOpacity
            style={[styles.boutonSauvegarder, { backgroundColor: "#5647bf", opacity: saving ? 0.6 : 1 }]}
            onPress={sauvegarder}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.boutonSauvegarderTxt}>Sauvegarder</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.body, { backgroundColor: couleurs.fondSecondaire }]}>

          {/* Photo de profil */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={choisirPhoto} style={styles.avatarWrapper}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: "#0f0939" }]}>
                  <Text style={styles.avatarInitiale}>{initiale}</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.avatarHint, { color: couleurs.texteGris }]}>Appuie pour changer la photo</Text>
          </View>

          {/* Infos générales */}
          <Text style={[styles.sectionTitre, { color: couleurs.texte }]}>Informations générales</Text>
          <View style={styles.champsContainer}>
            <View style={styles.champLabel}>
              <Text style={[styles.label, { color: couleurs.texteGris }]}>Nom d'utilisateur</Text>
              <View style={[styles.inputContainer, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
                <Ionicons name="person-outline" size={18} color={couleurs.texteGris} style={styles.inputIcone} />
                <TextInput
                  style={[styles.input, { color: couleurs.texte }]}
                  placeholder="Ton nom d'utilisateur"
                  placeholderTextColor={couleurs.texteGris}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.champLabel}>
              <Text style={[styles.label, { color: couleurs.texteGris }]}>Bio</Text>
              <View style={[styles.inputContainer, styles.inputMultiline, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
                <TextInput
                  style={[styles.input, { color: couleurs.texte }]}
                  placeholder="Parle-nous de toi... 📖"
                  placeholderTextColor={couleurs.texteGris}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>

          {/* Sécurité */}
          <Text style={[styles.sectionTitre, { color: couleurs.texte }]}>Sécurité</Text>
          <View style={styles.champsContainer}>
            <View style={styles.champLabel}>
              <Text style={[styles.label, { color: couleurs.texteGris }]}>Email</Text>
              <View style={[styles.inputContainer, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
                <Ionicons name="mail-outline" size={18} color={couleurs.texteGris} style={styles.inputIcone} />
                <TextInput
                  style={[styles.input, { color: couleurs.texte }]}
                  placeholder="Ton email"
                  placeholderTextColor={couleurs.texteGris}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.champLabel}>
              <Text style={[styles.label, { color: couleurs.texteGris }]}>Nouveau mot de passe</Text>
              <View style={[styles.inputContainer, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
                <Ionicons name="lock-closed-outline" size={18} color={couleurs.texteGris} style={styles.inputIcone} />
                <TextInput
                  style={[styles.input, { color: couleurs.texte }]}
                  placeholder="Laisser vide pour ne pas changer"
                  placeholderTextColor={couleurs.texteGris}
                  value={nouveauMotDePasse}
                  onChangeText={setNouveauMotDePasse}
                  secureTextEntry={!showNewMDP}
                />
                <TouchableOpacity onPress={() => setShowNewMDP(!showNewMDP)}>
                  <Ionicons name={showNewMDP ? "eye-off-outline" : "eye-outline"} size={18} color={couleurs.texteGris} />
                </TouchableOpacity>
              </View>
            </View>

            {(email !== user?.email || nouveauMotDePasse) && (
              <View style={styles.champLabel}>
                <Text style={[styles.label, { color: "#c0392b" }]}>Mot de passe actuel (requis)</Text>
                <View style={[styles.inputContainer, { backgroundColor: couleurs.carte, borderColor: "#fde8e8" }]}>
                  <Ionicons name="key-outline" size={18} color="#c0392b" style={styles.inputIcone} />
                  <TextInput
                    style={[styles.input, { color: couleurs.texte }]}
                    placeholder="Confirme ton mot de passe actuel"
                    placeholderTextColor={couleurs.texteGris}
                    value={motDePasseActuel}
                    onChangeText={setMotDePasseActuel}
                    secureTextEntry={!showMDP}
                  />
                  <TouchableOpacity onPress={() => setShowMDP(!showMDP)}>
                    <Ionicons name={showMDP ? "eye-off-outline" : "eye-outline"} size={18} color={couleurs.texteGris} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Bouton sauvegarder bas */}
          <TouchableOpacity
            style={[styles.boutonBas, { opacity: saving ? 0.6 : 1 }]}
            onPress={sauvegarder}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#0f0939" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#0f0939" />
                <Text style={styles.boutonBasTxt}>Sauvegarder les modifications</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", padding: 24, paddingBottom: 16, gap: 12 },
  retour: { borderRadius: 12, padding: 8 },
  headerTitre: { flex: 1, fontSize: 20, fontWeight: "800" },
  boutonSauvegarder: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  boutonSauvegarderTxt: { color: "white", fontWeight: "700", fontSize: 14 },
  body: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarWrapper: { position: "relative", marginBottom: 10 },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" },
  avatarInitiale: { fontSize: 40, fontWeight: "800", color: "#ffe594" },
  avatarEditBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#5647bf", borderRadius: 16, padding: 6, borderWidth: 2, borderColor: "white" },
  avatarHint: { fontSize: 13 },
  sectionTitre: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14, marginTop: 8 },
  champsContainer: { gap: 16, marginBottom: 28 },
  champLabel: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", marginLeft: 4 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1.5 },
  inputMultiline: { alignItems: "flex-start", paddingVertical: 12 },
  inputIcone: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  boutonBas: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#ffe594", borderRadius: 18, padding: 18, marginBottom: 32 },
  boutonBasTxt: { color: "#0f0939", fontWeight: "800", fontSize: 16 },
});
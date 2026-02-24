import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function Club() {
  const [clubs, setClubs] = useState([]);
  const [clubActif, setClubActif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vue, setVue] = useState<"liste" | "detail" | "creer" | "rejoindre">("liste");
  const [nomClub, setNomClub] = useState("");
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState([]);
  const [avis, setAvis] = useState("");

  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email;

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, "clubs"), where("membres", "array-contains", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setClubs(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  const creerClub = async () => {
    if (!nomClub.trim()) return;
    await addDoc(collection(db, "clubs"), {
      nom: nomClub,
      createur: userId,
      membres: [userId],
      membresEmails: [userEmail],
      livreEnCours: null,
      createdAt: new Date(),
    });
    setNomClub("");
    setVue("liste");
  };

  const rechercherClub = async () => {
    if (!recherche.trim()) return;
    const q = query(collection(db, "clubs"), where("nom", "==", recherche.trim()));
    const snapshot = await getDocs(q);
    setResultats(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const rejoindreClub = async (clubId: string) => {
    const clubRef = doc(db, "clubs", clubId);
    const clubData = resultats.find((c: any) => c.id === clubId) as any;
    await updateDoc(clubRef, {
      membres: [...clubData.membres, userId],
      membresEmails: [...(clubData.membresEmails || []), userEmail],
    });
    setVue("liste");
    setRecherche("");
    setResultats([]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#5647bf" /></View>;

  // Vue liste des clubs
  if (vue === "liste") {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageHeader}>Mes clubs</Text>

        {/* Clubs rejoints */}
        {clubs.length > 0 && (
          <>
            {(clubs as any[]).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.clubCarte}
                onPress={() => { setClubActif(c); setVue("detail"); }}
              >
                <View style={styles.clubCarteIcon}>
                  <Text style={{ fontSize: 24 }}>👥</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clubCarteNom}>{c.nom}</Text>
                  <Text style={styles.clubCarteMembres}>{c.membres?.length} membre(s)</Text>
                  {c.livreEnCours && (
                    <Text style={styles.clubCarteLivre}>📖 {c.livreEnCours.titre}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#b8b0e8" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Carte rejoindre/créer */}
        <View style={styles.invitationCarte}>
          <Text style={styles.invitationEmoji}>📖</Text>
          <Text style={styles.invitationTitre}>Crée ou rejoins un club</Text>
          <Text style={styles.invitationSous}>Partage tes lectures, découvre de nouveaux livres et échange avec d'autres passionnés</Text>
          <TouchableOpacity style={styles.boutonJaune} onPress={() => setVue("rejoindre")}>
            <Text style={styles.boutonJauneTexte}>Rejoindre un club</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boutonBlanc} onPress={() => setVue("creer")}>
            <Text style={styles.boutonBlancTexte}>Créer mon club</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Vue détail d'un club
  if (vue === "detail" && clubActif) {
    const c = clubActif as any;
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setVue("liste")} style={styles.retour}>
          <Ionicons name="arrow-back" size={24} color="#0f0939" />
          <Text style={styles.retourTexte}>Mes clubs</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.clubIconBox}>
            <Text style={{ fontSize: 36 }}>👥</Text>
          </View>
          <Text style={styles.clubNom}>{c.nom}</Text>
          <Text style={styles.clubMembres}>{c.membres?.length} membre(s)</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitre}>📖 Livre en cours</Text>
          {c.livreEnCours ? (
            <View style={styles.livreCard}>
              <Text style={styles.livreTitre}>{c.livreEnCours.titre}</Text>
              <Text style={styles.sousSectionTitre}>Ta note</Text>
              <View style={styles.etoilesRow}>
                {[1, 2, 3, 4, 5].map((etoile) => (
                  <TouchableOpacity
                    key={etoile}
                    onPress={async () => {
                      await updateDoc(doc(db, "clubs", c.id), { [`notes.${userId}`]: etoile });
                    }}
                  >
                    <Text style={styles.etoile}>
                      {etoile <= (c.notes?.[userId!] ?? 0) ? "⭐" : "☆"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sousSectionTitre}>Ton avis</Text>
              <TextInput
                style={styles.input}
                placeholder="Partage ton ressenti..."
                placeholderTextColor="#b8b0e8"
                value={avis}
                onChangeText={setAvis}
                multiline
              />
              <TouchableOpacity
                style={styles.boutonJaune}
                onPress={async () => {
                  if (!avis.trim()) return;
                  await updateDoc(doc(db, "clubs", c.id), {
                    [`avis.${userId}`]: { email: userEmail, texte: avis },
                  });
                  setAvis("");
                }}
              >
                <Text style={styles.boutonJauneTexte}>Publier mon avis</Text>
              </TouchableOpacity>

              {Object.values(c.avis || {}).length > 0 && (
                <>
                  <Text style={styles.sousSectionTitre}>Avis des membres</Text>
                  {Object.values(c.avis || {}).map((a: any, i) => (
                    <View key={i} style={styles.avisCarte}>
                      <View style={styles.avisAvatar}>
                        <Text style={styles.avisAvatarTexte}>{a.email[0].toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.avisEmail}>{a.email}</Text>
                        <Text style={styles.avisTexte}>{a.texte}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          ) : (
            <View style={styles.livreCard}>
              <Text style={styles.pasDelivre}>Aucun livre en cours 📭</Text>
              <TextInput
                style={styles.input}
                placeholder="Propose un titre..."
                placeholderTextColor="#b8b0e8"
                value={nomClub}
                onChangeText={setNomClub}
              />
              <TouchableOpacity
                style={styles.boutonJaune}
                onPress={async () => {
                  if (!nomClub.trim()) return;
                  await updateDoc(doc(db, "clubs", c.id), { livreEnCours: { titre: nomClub } });
                  setNomClub("");
                }}
              >
                <Text style={styles.boutonJauneTexte}>Proposer ce livre</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitre}>👥 Membres</Text>
          <View style={styles.membresContainer}>
            {(c.membresEmails || []).map((email: string, i: number) => (
              <View key={i} style={styles.membreCarte}>
                <View style={styles.membreAvatar}>
                  <Text style={styles.membreAvatarTexte}>{email[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.membreEmail}>{email}</Text>
                {email === userEmail && (
                  <View style={styles.toiBadge}>
                    <Text style={styles.toiTexte}>Toi</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  // Créer un club
  if (vue === "creer") {
    return (
      <View style={styles.formContainer}>
        <TouchableOpacity onPress={() => setVue("liste")} style={styles.retour}>
          <Ionicons name="arrow-back" size={24} color="#0f0939" />
          <Text style={styles.retourTexte}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.formTitre}>Créer un club</Text>
        <Text style={styles.formSous}>Choisis un nom pour ton club de lecture</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom du club"
          placeholderTextColor="#b8b0e8"
          value={nomClub}
          onChangeText={setNomClub}
        />
        <TouchableOpacity style={styles.boutonJaune} onPress={creerClub}>
          <Text style={styles.boutonJauneTexte}>Créer le club</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Rejoindre un club
  return (
    <View style={styles.formContainer}>
      <TouchableOpacity onPress={() => setVue("liste")} style={styles.retour}>
        <Ionicons name="arrow-back" size={24} color="#0f0939" />
        <Text style={styles.retourTexte}>Retour</Text>
      </TouchableOpacity>
      <Text style={styles.formTitre}>Rejoindre un club</Text>
      <Text style={styles.formSous}>Recherche un club par son nom exact</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom du club..."
        placeholderTextColor="#b8b0e8"
        value={recherche}
        onChangeText={setRecherche}
      />
      <TouchableOpacity style={styles.boutonJaune} onPress={rechercherClub}>
        <Text style={styles.boutonJauneTexte}>Rechercher</Text>
      </TouchableOpacity>
      {(resultats as any[]).map((item) => (
        <View key={item.id} style={styles.resultatCarte}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultatNom}>{item.nom}</Text>
            <Text style={styles.resultatMembres}>{item.membres?.length} membre(s)</Text>
          </View>
          <TouchableOpacity style={styles.boutonPetit} onPress={() => rejoindreClub(item.id)}>
            <Text style={styles.boutonJauneTexte}>Rejoindre</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  center: { flex: 1, backgroundColor: "#ffffff", justifyContent: "center", alignItems: "center" },
  pageHeader: { fontSize: 28, fontWeight: "800", color: "#0f0939", padding: 24, paddingBottom: 16 },
  retour: { flexDirection: "row", alignItems: "center", gap: 8, padding: 24, paddingBottom: 8 },
  retourTexte: { fontSize: 16, fontWeight: "600", color: "#0f0939" },
  clubCarte: { flexDirection: "row", alignItems: "center", backgroundColor: "#f7f6ff", borderRadius: 20, padding: 16, marginHorizontal: 24, marginBottom: 12 },
  clubCarteIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#cbc5f5", justifyContent: "center", alignItems: "center", marginRight: 14 },
  clubCarteNom: { fontSize: 16, fontWeight: "700", color: "#0f0939" },
  clubCarteMembres: { fontSize: 12, color: "#8b85c1", marginTop: 2 },
  clubCarteLivre: { fontSize: 12, color: "#5647bf", marginTop: 4, fontWeight: "500" },
  invitationCarte: { margin: 24, marginTop: 12, backgroundColor: "#cbc5f5", borderRadius: 28, padding: 28, alignItems: "center" },
  invitationEmoji: { fontSize: 52, marginBottom: 16 },
  invitationTitre: { fontSize: 22, fontWeight: "800", color: "#0f0939", textAlign: "center", marginBottom: 10 },
  invitationSous: { fontSize: 14, color: "#5647bf", textAlign: "center", lineHeight: 22, marginBottom: 28 },
  boutonJaune: { backgroundColor: "#ffe594", borderRadius: 16, padding: 16, alignItems: "center", width: "100%", marginBottom: 12 },
  boutonJauneTexte: { color: "#0f0939", fontWeight: "800", fontSize: 15 },
  boutonBlanc: { backgroundColor: "white", borderRadius: 16, padding: 16, alignItems: "center", width: "100%" },
  boutonBlancTexte: { color: "#0f0939", fontWeight: "700", fontSize: 15 },
  header: { alignItems: "center", paddingVertical: 24 },
  clubIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#0f0939", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  clubNom: { fontSize: 24, fontWeight: "800", color: "#0f0939", marginBottom: 4 },
  clubMembres: { fontSize: 13, color: "#8b85c1" },
  body: { backgroundColor: "#f7f6ff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  sectionTitre: { fontSize: 16, fontWeight: "700", color: "#0f0939", marginBottom: 14, marginTop: 8 },
  sousSectionTitre: { fontSize: 13, fontWeight: "700", color: "#5647bf", marginBottom: 10, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5 },
  livreCard: { backgroundColor: "white", borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: "#5647bf", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  livreTitre: { fontSize: 18, fontWeight: "800", color: "#0f0939" },
  pasDelivre: { fontSize: 15, color: "#8b85c1", marginBottom: 16 },
  etoilesRow: { flexDirection: "row", gap: 4 },
  etoile: { fontSize: 28 },
  input: { backgroundColor: "#f7f6ff", borderRadius: 14, padding: 14, fontSize: 15, color: "#0f0939", marginBottom: 12, marginTop: 8 },
  avisCarte: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#f7f6ff", borderRadius: 12, padding: 12, marginBottom: 8 },
  avisAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#cbc5f5", justifyContent: "center", alignItems: "center" },
  avisAvatarTexte: { fontWeight: "700", color: "#5647bf" },
  avisEmail: { fontSize: 12, color: "#5647bf", fontWeight: "600", marginBottom: 2 },
  avisTexte: { fontSize: 14, color: "#0f0939" },
  membresContainer: { gap: 10, marginBottom: 32 },
  membreCarte: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 16, padding: 14 },
  membreAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#0f0939", justifyContent: "center", alignItems: "center", marginRight: 14 },
  membreAvatarTexte: { color: "#ffe594", fontWeight: "800", fontSize: 16 },
  membreEmail: { flex: 1, fontSize: 14, color: "#0f0939", fontWeight: "500" },
  toiBadge: { backgroundColor: "#cbc5f5", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  toiTexte: { fontSize: 11, color: "#5647bf", fontWeight: "700" },
  formContainer: { flex: 1, backgroundColor: "#ffffff", paddingTop: 16 },
  formTitre: { fontSize: 26, fontWeight: "800", color: "#0f0939", marginBottom: 8, paddingHorizontal: 24 },
  formSous: { fontSize: 14, color: "#8b85c1", marginBottom: 28, paddingHorizontal: 24 },
  resultatCarte: { flexDirection: "row", alignItems: "center", backgroundColor: "#f7f6ff", borderRadius: 16, padding: 16, marginHorizontal: 24, marginTop: 12 },
  resultatNom: { fontSize: 15, fontWeight: "700", color: "#0f0939" },
  resultatMembres: { fontSize: 12, color: "#8b85c1", marginTop: 2 },
  boutonPetit: { backgroundColor: "#ffe594", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
});
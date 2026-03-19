import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

const FILTRES = ["Tous", "À lire", "En cours", "Terminé"];



export default function Club() {
  const [clubs, setClubs] = useState([]);
  const [clubActif, setClubActif] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vue, setVue] = useState<"liste" | "detail" | "creer" | "rejoindre">("liste");
  const [nomClub, setNomClub] = useState("");
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState([]);
  const [filtre, setFiltre] = useState("Tous");
  const [avis, setAvis] = useState("");

  // Bibliothèque club
  const [showAjouterLivre, setShowAjouterLivre] = useState(false);
  const [rechercheLivre, setRechercheLivre] = useState("");
  const [resultatsLivres, setResultatsLivres] = useState([]);
  const [loadingLivres, setLoadingLivres] = useState(false);

  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email;

  const [profilsMembres, setProfilsMembres] = useState<Record<string, any>>({}); 

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, "clubs"), where("membres", "array-contains", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setClubs(data);
      if (clubActif) {
        const updated = data.find((c: any) => c.id === clubActif.id);
        if (updated) setClubActif(updated);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    if (!clubActif) return;
    const chargerProfils = async () => {
      const profils: Record<string, any> = {};
      for (const memberId of clubActif.membres || []) {
        try {
          const { getDoc, doc: firestoreDoc } = await import("firebase/firestore");
          const snap = await getDoc(firestoreDoc(db, "users", memberId));
          if (snap.exists()) profils[memberId] = snap.data();
        } catch {}
      }
      setProfilsMembres(profils);
    };
    chargerProfils();
  }, [clubActif?.id]);
  

  const creerClub = async () => {
    if (!nomClub.trim()) return;
    await addDoc(collection(db, "clubs"), {
      nom: nomClub,
      createur: userId,
      membres: [userId],
      membresEmails: [userEmail],
      bibliotheque: [],
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

  const rechercherLivresGoogle = async () => {
    if (!rechercheLivre.trim()) return;
    setLoadingLivres(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(rechercheLivre)}&maxResults=10`
      );
      const data = await res.json();
      const items = (data.items || [])
        .map((item: any) => ({
          id: item.id,
          titre: item.volumeInfo?.title ?? "Titre inconnu",
          auteur: item.volumeInfo?.authors?.[0] ?? "Auteur inconnu",
          couverture: item.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
        }))
        .filter((item: any) => item.couverture !== null);
      setResultatsLivres(items);
    } catch {
      Alert.alert("Erreur", "Impossible de rechercher les livres");
    }
    setLoadingLivres(false);
  };

  const ajouterLivreAuClub = async (livre: any) => {
    if (!clubActif) return;
    const bibliotheque = clubActif.bibliotheque || [];
    if (bibliotheque.find((l: any) => l.id === livre.id)) {
      Alert.alert("Déjà ajouté", "Ce livre est déjà dans la bibliothèque du club");
      return;
    }
    await updateDoc(doc(db, "clubs", clubActif.id), {
      bibliotheque: [...bibliotheque, {
        id: livre.id,
        titre: livre.titre,
        auteur: livre.auteur,
        couverture: livre.couverture,
        ajoutePar: userEmail,
        ajouteParId: userId,
        statut: "À lire",
        lusPar: [],
        createdAt: new Date().toISOString(),
      }],
    });
    Alert.alert("✨ Ajouté !", `"${livre.titre}" est dans la bibliothèque du club`);
    setShowAjouterLivre(false);
    setRechercheLivre("");
    setResultatsLivres([]);
  };

  const changerStatutLivre = async (livreId: string, nouveauStatut: string) => {
    if (!clubActif) return;
    const bibliotheque = [...(clubActif.bibliotheque || [])];
    const livre = bibliotheque.find((l: any) => l.id === livreId);
    if (!livre) return;
    livre.statut = nouveauStatut;
    if (nouveauStatut === "Terminé" && !livre.lusPar.includes(userId)) {
      livre.lusPar = [...livre.lusPar, userId];
    }
    await updateDoc(doc(db, "clubs", clubActif.id), { bibliotheque });
  };

  const toggleLu = async (livreId: string) => {
    if (!clubActif) return;
    const bibliotheque = [...(clubActif.bibliotheque || [])];
    const livre = bibliotheque.find((l: any) => l.id === livreId);
    if (!livre) return;
    const dejaLu = livre.lusPar?.includes(userId);
    livre.lusPar = dejaLu
      ? livre.lusPar.filter((id: string) => id !== userId)
      : [...(livre.lusPar || []), userId];
    await updateDoc(doc(db, "clubs", clubActif.id), { bibliotheque });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#5647bf" /></View>;

  // Vue liste
  if (vue === "liste") {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageHeader}>Mes clubs</Text>
        {(clubs as any[]).map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.clubCarte}
            onPress={() => { setClubActif(c); setVue("detail"); setFiltre("Tous"); }}
          >
            <View style={styles.clubCarteIcon}>
              <Text style={{ fontSize: 24 }}>👥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clubCarteNom}>{c.nom}</Text>
              <Text style={styles.clubCarteMembres}>{c.membres?.length} membre(s)</Text>
              <Text style={styles.clubCarteLivre}>📚 {(c.bibliotheque || []).length} livre(s)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#b8b0e8" />
          </TouchableOpacity>
        ))}

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

  // Vue détail
  if (vue === "detail" && clubActif) {
    const c = clubActif as any;
    const bibliotheque = c.bibliotheque || [];
    const livresFiltres = filtre === "Tous"
      ? bibliotheque
      : bibliotheque.filter((l: any) => l.statut === filtre);

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

          {/* Membres */}
        <Text style={styles.sectionTitre}>👥 Membres</Text>
        <View style={styles.membresRow}>
          {(c.membres || []).map((membreId: string, i: number) => {
            const email = c.membresEmails?.[i] ?? "";
            const profil = profilsMembres[membreId];
            const initiale = (profil?.username || email)[0]?.toUpperCase() ?? "?";
            return (
              <View key={membreId} style={styles.membreAvatarWrapper}>
                {profil?.avatar ? (
                  <Image source={{ uri: profil.avatar }} style={styles.membreAvatarImg} />
                ) : (
                  <View style={styles.membreAvatar}>
                    <Text style={styles.membreAvatarTexte}>{initiale}</Text>
                  </View>
                )}
                {membreId === userId && <View style={styles.membreToidot} />}
              </View>
            );
          })}
        </View>

          {/* Bibliothèque */}
          <View style={styles.biblioHeader}>
            <Text style={styles.sectionTitre}>📚 Bibliothèque du club</Text>
            <TouchableOpacity style={styles.biblioAjouterBtn} onPress={() => setShowAjouterLivre(true)}>
              <Ionicons name="add" size={18} color="#0f0939" />
              <Text style={styles.biblioAjouterTxt}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {/* Filtres */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresScroll}>
            {FILTRES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filtreBtn, filtre === f && styles.filtreBtnActif]}
                onPress={() => setFiltre(f)}
              >
                <Text style={[styles.filtreTxt, filtre === f && styles.filtreTxtActif]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Livres */}
          {livresFiltres.length === 0 ? (
            <View style={styles.biblioVide}>
              <Text style={styles.biblioVideEmoji}>📭</Text>
              <Text style={styles.biblioVideTxt}>
                {filtre === "Tous" ? "Aucun livre dans la bibliothèque" : `Aucun livre "${filtre}"`}
              </Text>
              {filtre === "Tous" && (
                <Text style={styles.biblioVideSous}>Ajoute les livres que vous lisez ensemble !</Text>
              )}
            </View>
          ) : (
            <View style={styles.biblioGrille}>
              {livresFiltres.map((livre: any) => {
                const lusPar = livre.lusPar || [];
                const dejaLu = lusPar.includes(userId);
                const nbLus = lusPar.length;
                const nbMembres = c.membres?.length ?? 1;
                const statut = livre.statut || "À lire";

                const statutCouleur: Record<string, string> = {
                  "À lire": "#cbc5f5",
                  "En cours": "#ffe594",
                  "Terminé": "#c7f0ec",
                };
                const statutTexte: Record<string, string> = {
                  "À lire": "#5647bf",
                  "En cours": "#7a5a00",
                  "Terminé": "#0f6b65",
                };

                return (
                  <View key={livre.id} style={styles.biblioCarte}>
                    {livre.couverture ? (
                      <Image source={{ uri: livre.couverture }} style={styles.biblioCouverture} resizeMode="cover" />
                    ) : (
                      <View style={[styles.biblioCouverture, styles.biblioCouverturePlaceholder]}>
                        <Text style={{ fontSize: 28 }}>📖</Text>
                      </View>
                    )}
                    <View style={styles.biblioCarteBody}>
                      <View style={styles.biblioCarteTop}>
                        <Text style={styles.biblioTitre} numberOfLines={2}>{livre.titre}</Text>
                        <View style={[styles.statutBadge, { backgroundColor: statutCouleur[statut] }]}>
                          <Text style={[styles.statutBadgeTxt, { color: statutTexte[statut] }]}>{statut}</Text>
                        </View>
                      </View>
                      <Text style={styles.biblioAuteur} numberOfLines={1}>{livre.auteur}</Text>
                      <Text style={styles.biblioAjoutePar}>par {livre.ajoutePar?.split("@")[0]}</Text>

                      {/* Barre progression */}
                      <View style={styles.biblioProgressRow}>
                        <View style={styles.biblioProgressBar}>
                          <View style={[styles.biblioProgressFill, { width: `${(nbLus / nbMembres) * 100}%` }]} />
                        </View>
                        <Text style={styles.biblioProgressTxt}>{nbLus}/{nbMembres} lu(s)</Text>
                      </View>

                      {/* Changer statut */}
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                        {["À lire", "En cours", "Terminé"].map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={[styles.statutBtn, statut === s && { backgroundColor: "#0f0939" }]}
                            onPress={() => changerStatutLivre(livre.id, s)}
                          >
                            <Text style={[styles.statutBtnTxt, statut === s && { color: "#ffe594" }]}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      {/* Bouton lu */}
                      <TouchableOpacity
                        style={[styles.biblioLuBtn, dejaLu && styles.biblioLuBtnActif]}
                        onPress={() => toggleLu(livre.id)}
                      >
                        <Ionicons name={dejaLu ? "checkmark-circle" : "checkmark-circle-outline"} size={14} color={dejaLu ? "#0f0939" : "#8b85c1"} />
                        <Text style={[styles.biblioLuTxt, dejaLu && styles.biblioLuTxtActif]}>
                          {dejaLu ? "Lu ✓" : "Marquer comme lu"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

        </View>

        {/* Modal ajouter livre */}
        <Modal visible={showAjouterLivre} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitre}>Ajouter un livre</Text>
                <TouchableOpacity onPress={() => { setShowAjouterLivre(false); setRechercheLivre(""); setResultatsLivres([]); }}>
                  <Ionicons name="close" size={24} color="#0f0939" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalSearchRow}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Titre ou auteur..."
                  placeholderTextColor="#b8b0e8"
                  value={rechercheLivre}
                  onChangeText={setRechercheLivre}
                  onSubmitEditing={rechercherLivresGoogle}
                  returnKeyType="search"
                />
                <TouchableOpacity style={styles.modalSearchBtn} onPress={rechercherLivresGoogle}>
                  {loadingLivres ? <ActivityIndicator size="small" color="#0f0939" /> : <Ionicons name="search" size={20} color="#0f0939" />}
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {(resultatsLivres as any[]).map((livre) => (
                  <TouchableOpacity key={livre.id} style={styles.modalLivreCarte} onPress={() => ajouterLivreAuClub(livre)}>
                    {livre.couverture ? (
                      <Image source={{ uri: livre.couverture }} style={styles.modalLivreCouverture} resizeMode="cover" />
                    ) : (
                      <View style={[styles.modalLivreCouverture, { backgroundColor: "#f7f6ff", justifyContent: "center", alignItems: "center" }]}>
                        <Text>📖</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalLivreTitre} numberOfLines={2}>{livre.titre}</Text>
                      <Text style={styles.modalLivreAuteur}>{livre.auteur}</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color="#5647bf" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

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
        <TextInput style={styles.input} placeholder="Nom du club" placeholderTextColor="#b8b0e8" value={nomClub} onChangeText={setNomClub} />
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
      <TextInput style={styles.input} placeholder="Nom du club..." placeholderTextColor="#b8b0e8" value={recherche} onChangeText={setRecherche} />
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
  input: { backgroundColor: "#f7f6ff", borderRadius: 14, padding: 14, fontSize: 15, color: "#0f0939", marginBottom: 12, marginTop: 8 },
  membresRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
membreAvatarWrapper: { position: "relative" },
membreAvatarImg: { width: 48, height: 48, borderRadius: 24 },
membreAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#0f0939", justifyContent: "center", alignItems: "center" },
membreAvatarTexte: { color: "#ffe594", fontWeight: "800", fontSize: 18 },
membreToidot: { position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: "#47c8bc", borderWidth: 2, borderColor: "white" },
  toiBadge: { backgroundColor: "#cbc5f5", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  toiTexte: { fontSize: 11, color: "#5647bf", fontWeight: "700" },
  formContainer: { flex: 1, backgroundColor: "#ffffff", paddingTop: 16 },
  formTitre: { fontSize: 26, fontWeight: "800", color: "#0f0939", marginBottom: 8, paddingHorizontal: 24 },
  formSous: { fontSize: 14, color: "#8b85c1", marginBottom: 28, paddingHorizontal: 24 },
  resultatCarte: { flexDirection: "row", alignItems: "center", backgroundColor: "#f7f6ff", borderRadius: 16, padding: 16, marginHorizontal: 24, marginTop: 12 },
  resultatNom: { fontSize: 15, fontWeight: "700", color: "#0f0939" },
  resultatMembres: { fontSize: 12, color: "#8b85c1", marginTop: 2 },
  boutonPetit: { backgroundColor: "#ffe594", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },

  // Bibliothèque
  biblioHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  biblioAjouterBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ffe594", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  biblioAjouterTxt: { fontSize: 13, fontWeight: "700", color: "#0f0939" },
  filtresScroll: { marginBottom: 16 },
  filtreBtn: { backgroundColor: "white", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  filtreBtnActif: { backgroundColor: "#ffe594" },
  filtreTxt: { fontSize: 13, fontWeight: "600", color: "#8b85c1" },
  filtreTxtActif: { color: "#0f0939" },
  biblioVide: { alignItems: "center", backgroundColor: "white", borderRadius: 20, padding: 32, marginBottom: 32 },
  biblioVideEmoji: { fontSize: 40, marginBottom: 12 },
  biblioVideTxt: { fontSize: 15, fontWeight: "700", color: "#0f0939", marginBottom: 6 },
  biblioVideSous: { fontSize: 13, color: "#8b85c1", textAlign: "center" },
  biblioGrille: { gap: 14, marginBottom: 32 },
  biblioCarte: { flexDirection: "row", backgroundColor: "white", borderRadius: 20, overflow: "hidden", shadowColor: "#5647bf", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  biblioCouverture: { width: 90, height: 140 },
  biblioCouverturePlaceholder: { backgroundColor: "#ede9ff", justifyContent: "center", alignItems: "center" },
  biblioCarteBody: { flex: 1, padding: 14 },
  biblioCarteTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  biblioTitre: { flex: 1, fontSize: 14, fontWeight: "800", color: "#0f0939", marginRight: 8 },
  statutBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statutBadgeTxt: { fontSize: 10, fontWeight: "700" },
  biblioAuteur: { fontSize: 12, color: "#8b85c1", marginBottom: 2 },
  biblioAjoutePar: { fontSize: 11, color: "#b8b0e8", marginBottom: 10 },
  biblioProgressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  biblioProgressBar: { flex: 1, height: 5, backgroundColor: "#ede9ff", borderRadius: 4 },
  biblioProgressFill: { height: 5, backgroundColor: "#47c8bc", borderRadius: 4 },
  biblioProgressTxt: { fontSize: 10, fontWeight: "700", color: "#5647bf" },
  statutBtn: { backgroundColor: "#f7f6ff", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6 },
  statutBtnTxt: { fontSize: 11, fontWeight: "600", color: "#8b85c1" },
  biblioLuBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f7f6ff", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, alignSelf: "flex-start" },
  biblioLuBtnActif: { backgroundColor: "#ffe594" },
  biblioLuTxt: { fontSize: 11, fontWeight: "600", color: "#8b85c1" },
  biblioLuTxtActif: { color: "#0f0939" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "80%", padding: 24 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitre: { fontSize: 20, fontWeight: "800", color: "#0f0939" },
  modalSearchRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  modalInput: { flex: 1, backgroundColor: "#f7f6ff", borderRadius: 14, padding: 14, fontSize: 15, color: "#0f0939" },
  modalSearchBtn: { backgroundColor: "#ffe594", borderRadius: 14, padding: 14, justifyContent: "center", alignItems: "center" },
  modalLivreCarte: { flexDirection: "row", alignItems: "center", gap: 14, padding: 12, borderRadius: 16, backgroundColor: "#f7f6ff", marginBottom: 10 },
  modalLivreCouverture: { width: 48, height: 68, borderRadius: 8 },
  modalLivreTitre: { fontSize: 14, fontWeight: "700", color: "#0f0939", marginBottom: 4 },
  modalLivreAuteur: { fontSize: 12, color: "#8b85c1" },
});


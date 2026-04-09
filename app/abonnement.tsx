import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { auth, functions } from "../firebaseConfig";

const PLANS = [
  {
    id: "solo",
    nom: "Lecteur Solo",
    prix: "8,99€",
    priceId: "price_1TKCIxRelymrR49dOqMdKfaf",
    couleurIcon: "#ede9ff",
    couleurIconTexte: "#5647bf",
    iconName: "person-outline",
    couleurPrix: "#5647bf",
    couleurBouton: "#ede9ff",
    couleurBoutonTexte: "#3c3489",
    couleurCheck: "#5647bf",
    features: [
      "2 bibliothèques (1 publique + 1 privée)",
      "Jusqu'à 3 clubs de lecture",
      "Statistiques avancées et détaillées",
      "Recommandations personnalisées",
      "Historique complet de tes lectures",
    ],
  },
  {
    id: "club",
    nom: "Books Club",
    prix: "19,99€",
    priceId: "price_1TKCL6RelymrR49dxvDjcyZn",
    couleurIcon: "#fbd9f2",
    couleurIconTexte: "#64034b",
    iconName: "people-outline",
    couleurPrix: "#64034b",
    couleurBouton: "#5647bf",
    couleurBoutonTexte: "white",
    couleurCheck: "#64034b",
    populaire: true,
    features: [
      "Tout le plan Lecteur Solo inclus",
      "Clubs de lecture jusqu'à 50 membres",
      "Nombre de clubs illimité",
      "Tableau de bord organisateur de club",
      "Exports et rapports de lecture",
      "Support prioritaire",
    ],
  },
];

export default function Abonnement() {
  const router = useRouter();
  const { couleurs } = useTheme();
  const [chargement, setChargement] = useState<string | null>(null);
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.includes("abonnement/success")) {
        router.replace("/abonnement-success");
      } else if (event.url.includes("abonnement/cancel")) {
        router.replace("/abonnement-cancel");
      }
    };
  
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleAbonnement = async (priceId: string, planId: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erreur", "Tu dois être connecté pour t'abonner.");
      return;
    }

    setChargement(planId);
    try {
      console.log("1. Appel de la fonction...");
      const creerAbonnement = httpsCallable(functions, "creerAbonnement", { timeout: 10000 });
      console.log("2. Fonction créée, envoi des données...", priceId, user.email);
      const result: any = await creerAbonnement({
        priceId,
        email: user.email,
      });
      console.log("3. Résultat reçu :", JSON.stringify(result));
      if (result.data?.url) {
        await Linking.openURL(result.data.url);
      }
    } catch (error: any) {
      console.log("ERREUR CODE :", error.code);
      console.log("ERREUR MESSAGE :", error.message);
      Alert.alert("Erreur", error.message);
    } finally {
      setChargement(null);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: couleurs.fond }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.retour} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#ffe594" />
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Passe en Premium</Text>
        <Text style={styles.headerSous}>Choisis l'offre qui correspond à ta façon de lire</Text>
      </View>

      <View style={[styles.body, { backgroundColor: couleurs.fond }]}>

        <View style={[styles.planGratuit, { backgroundColor: couleurs.fondSecondaire, borderColor: couleurs.bordure }]}>
          <View style={styles.planGratuitGauche}>
            <Text style={[styles.planGratuitTitre, { color: couleurs.texte }]}>Gratuit</Text>
            <Text style={[styles.planGratuitDesc, { color: couleurs.texteGris }]}>Ton offre actuelle</Text>
          </View>
          <View style={styles.planGratuitFeatures}>
            <Text style={[styles.featureGratuite, { color: couleurs.texteGris }]}>• 1 bibliothèque publique</Text>
            <Text style={[styles.featureGratuite, { color: couleurs.texteGris }]}>• 1 club de lecture</Text>
            <Text style={[styles.featureGratuite, { color: couleurs.texteGris }]}>• Stats basiques</Text>
          </View>
        </View>

        {PLANS.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCarte,
              { backgroundColor: couleurs.carte, borderColor: plan.populaire ? "#5647bf" : "#cbc5f5" },
              plan.populaire && styles.planCarteAccent,
            ]}
          >
            {plan.populaire && (
              <View style={styles.badgePopulaire}>
                <Text style={styles.badgePopulaireTexte}>Le plus choisi</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <View style={[styles.planIconBox, { backgroundColor: plan.couleurIcon }]}>
                <Ionicons name={plan.iconName as any} size={22} color={plan.couleurIconTexte} />
              </View>
              <View style={styles.planTitreBlock}>
                <Text style={[styles.planNom, { color: couleurs.texte }]}>{plan.nom}</Text>
                <View style={styles.prixRow}>
                  <Text style={[styles.prixMontant, { color: plan.couleurPrix }]}>{plan.prix}</Text>
                  <Text style={[styles.prixPeriode, { color: couleurs.texteGris }]}> / mois</Text>
                </View>
              </View>
            </View>

            <View style={[styles.separateur, { backgroundColor: couleurs.bordure }]} />

            <View style={styles.featuresListe}>
              {plan.features.map((f, i) => (
                <View key={i} style={styles.featureItem}>
                  <View style={[styles.checkBox, { backgroundColor: plan.couleurCheck }]}>
                    <Ionicons name="checkmark" size={11} color="white" />
                  </View>
                  <Text style={[styles.featureTexte, { color: couleurs.texte }]}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.boutonPlan, { backgroundColor: plan.couleurBouton }]}
              onPress={() => handleAbonnement(plan.priceId, plan.id)}
              disabled={chargement === plan.id}
            >
              {chargement === plan.id ? (
                <ActivityIndicator color={plan.couleurBoutonTexte} />
              ) : (
                <Text style={[styles.boutonPlanTexte, { color: plan.couleurBoutonTexte }]}>
                  Choisir ce plan
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <View style={[styles.noteContainer, { backgroundColor: couleurs.fondSecondaire }]}>
          <Ionicons name="shield-checkmark-outline" size={16} color={couleurs.texteGris} />
          <Text style={[styles.noteTexte, { color: couleurs.texteGris }]}>
            Paiement sécurisé via Stripe. Résiliable à tout moment. Sans engagement.
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: "#0f0939", paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24 },
  retour: { marginBottom: 16 },
  headerTitre: { fontSize: 26, fontWeight: "800", color: "#ffe594", marginBottom: 6 },
  headerSous: { fontSize: 14, color: "#cbc5f5", lineHeight: 20 },
  body: { padding: 20, gap: 16, display: "flex", flexDirection: "column" },
  planGratuit: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 14, gap: 12 },
  planGratuitGauche: { minWidth: 80 },
  planGratuitTitre: { fontSize: 14, fontWeight: "700" },
  planGratuitDesc: { fontSize: 11, marginTop: 2 },
  planGratuitFeatures: { flex: 1, gap: 3 },
  featureGratuite: { fontSize: 12 },
  planCarte: { borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: "#cbc5f5", gap: 14 },
  planCarteAccent: { borderColor: "#5647bf", borderWidth: 2, marginTop: 8 },
  badgePopulaire: { position: "absolute", top: -13, alignSelf: "center", backgroundColor: "#5647bf", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  badgePopulaireTexte: { color: "white", fontSize: 11, fontWeight: "800" },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  planIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  planTitreBlock: { flex: 1 },
  planNom: { fontSize: 17, fontWeight: "800", marginBottom: 2 },
  prixRow: { flexDirection: "row", alignItems: "baseline" },
  prixMontant: { fontSize: 24, fontWeight: "800" },
  prixPeriode: { fontSize: 13 },
  separateur: { height: 1 },
  featuresListe: { gap: 10 },
  featureItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkBox: { width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center", marginTop: 1, flexShrink: 0 },
  featureTexte: { flex: 1, fontSize: 14, lineHeight: 20 },
  boutonPlan: { borderRadius: 14, padding: 14, alignItems: "center" },
  boutonPlanTexte: { fontWeight: "700", fontSize: 15 },
  noteContainer: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 16 },
  noteTexte: { flex: 1, fontSize: 12, lineHeight: 18 },
});
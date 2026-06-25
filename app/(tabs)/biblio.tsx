import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useFonts,
  YanoneKaffeesatz_700Bold,
} from "@expo-google-fonts/yanone-kaffeesatz";

import Header from "../../components/Header";

import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export default function Biblio() {
  const router = useRouter();
  const [livres, setLivres] = useState<any[]>([]);

  const [fontsLoaded] = useFonts({
    YanoneKaffeesatz_700Bold,
  });

  const chargerBibliotheque = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, "livres"),
        where("userId", "==", user.uid),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLivres(data);
    } catch (error) {
      console.log("Erreur biblio:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      chargerBibliotheque();
    }, []),
  );

  if (!fontsLoaded) return null;

  const enCours = livres.filter((livre) => livre.statut === "En cours");
  const pal = livres.filter((livre) => livre.statut === "PAL");
  const envies = livres.filter((livre) => livre.statut === "Envies");
  const termines = livres.filter((livre) => livre.statut === "Terminé");

  const renderSection = (titre: string, couleur: string, data: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{titre}</Text>

      <View style={[styles.sectionBox, { backgroundColor: couleur }]}>
        {data.length === 0 ? (
          <Text style={styles.emptyText}>Aucun livre</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data.map((livre) => (
              <TouchableOpacity
                key={livre.id}
                onPress={() =>
                  router.push(
                    `/livre-detail?id=${encodeURIComponent(livre.googleBooksId)}` as any,
                  )
                }
              >
                <Image source={{ uri: livre.couverture }} style={styles.book} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Ma bibliothèque" niveau="Néophyte" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.yellow]}>
            <Text style={styles.tabText}>En cours</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, styles.purple]}>
            <Text style={styles.tabText}>PAL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, styles.blue]}>
            <Text style={styles.tabText}>Envies</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, styles.pink]}>
            <Text style={styles.tabText}>Terminé</Text>
          </TouchableOpacity>
        </View>

        {renderSection(`En cours (${enCours.length})`, "#F7DF8B", enCours)}
        {renderSection(`PAL (${pal.length})`, "#DAD0FF", pal)}
        {renderSection(`Envies (${envies.length})`, "#D6F0EF", envies)}
        {renderSection(`Terminés (${termines.length})`, "#F0D4EA", termines)}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  yellow: {
    backgroundColor: "#F7DF8B",
  },
  purple: {
    backgroundColor: "#DAD0FF",
  },
  blue: {
    backgroundColor: "#D6F0EF",
  },
  pink: {
    backgroundColor: "#F0D4EA",
  },
  tabText: {
    fontFamily: "YanoneKaffeesatz_700Bold",
    fontSize: 20,
    color: "#0f0939",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "YanoneKaffeesatz_700Bold",
    fontSize: 20,
    color: "#838383",
    marginBottom: 10,
  },
  sectionBox: {
    minHeight: 170,
    borderRadius: 25,
    padding: 15,
    justifyContent: "center",
  },
  book: {
    width: 95,
    height: 145,
    borderRadius: 12,
    marginRight: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#838383",
    fontSize: 14,
  },
});

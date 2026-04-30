import { useFonts, YanoneKaffeesatz_400Regular, YanoneKaffeesatz_500Medium } from "@expo-google-fonts/yanone-kaffeesatz";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

const ruban = require("../assets/images/Design_logo/desgin-libre.png");
const fille = require("../assets/images/Design_logo/Logo_vectoriser_fille.png");
const defaultAvatar = require("../assets/images/Design_logo/avatar_default.jpeg");

type HeaderProps = {
  title: string;
  niveau?: string;
  avatar?: any;
};

export default function Header({ title, niveau = "Néophyte", avatar }: HeaderProps) {
  const [fontsLoaded] = useFonts({
    YanoneKaffeesatz_500Medium,
    YanoneKaffeesatz_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Ruban violet derrière TOUT */}
      <Image source={ruban} style={styles.ruban} resizeMode="stretch" />

      {/* Contenu par dessus */}
      <View style={styles.contenu}>
        {/* Gauche */}
        <View style={styles.left}>
          <Image source={fille} style={styles.fille} resizeMode="contain" />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.niveau}>Niveau : {niveau}</Text>
        </View>

        {/* Avatar à droite */}
        <Image
          source={avatar || defaultAvatar}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    minHeight: 150,
    shadowColor: "#000",
    shadowOpacity: 0.1,  
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    overflow: "visible",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contenu: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 30 : 40,
    paddingBottom: 24,
  },
  ruban: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    opacity: 0.9,
    transform: [{ rotate: "-10deg" }],
  },
  left: {
    flex: 1,
  },
  fille: {
    width: 60,
    height: 60,
    marginBottom: 0,
  },
  title: {
    fontFamily: "YanoneKaffeesatz_500Medium",
    fontSize: 32,
    color: "#0f0939",
    marginBottom: 2,
  },
  niveau: {
    fontFamily: "YanoneKaffeesatz_400Regular",
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  avatar: {
    width: 58,
    height: 56,
    borderRadius: 29,
    marginLeft: 20,
    marginBottom: 8,
  },
});
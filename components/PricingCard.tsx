import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  price: string;
  description: string;
  badge?: string;
  color: string;
  buttonText: string;
  onPress: () => void;
};

export default function PricingCard({
  title,
  price,
  description,
  badge,
  color,
  buttonText,
  onPress,
}: Props) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.price}>{price}</Text>

      <Text style={styles.description}>{description}</Text>

      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    padding: 24,
    marginBottom: 22,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 15,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6D4AFF",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },

  price: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: "800",
    color: "#000",
  },

  description: {
    marginTop: 8,
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
  },

  button: {
    marginTop: 22,
    backgroundColor: "#6D4AFF",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

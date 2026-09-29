import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

export default function ItemDetailsScreen({
  route,
  navigation,
}) {
  const { item } = route.params;

  const imageUrl = item.image
    ? `https://campus-lost-found-api-hud7.onrender.com/uploads/${item.image}`
    : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />
      )}

      <Text style={styles.title}>
        {item.itemName}
      </Text>

      <Text style={styles.label}>Category</Text>
      <Text style={styles.value}>
        {item.category}
      </Text>

      <Text style={styles.label}>Description</Text>
      <Text style={styles.value}>
        {item.description}
      </Text>

      <Text style={styles.label}>
        Location Found
      </Text>

      <Text style={styles.value}>
        {item.locationFound}
      </Text>

      <Text style={styles.label}>Status</Text>

      <Text style={styles.value}>
        {item.status}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("EditItem", { item })
        }
      >
        <Text style={styles.buttonText}>
          Edit Item
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.claimButton}
        onPress={() =>
          navigation.navigate("Claims", { item })
        }
      >
        <Text style={styles.buttonText}>
          Claim This Item
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 12,
  },

  value: {
    fontSize: 17,
    marginTop: 4,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },

  claimButton: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
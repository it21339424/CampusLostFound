import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export default function ItemDetailsScreen({
  route,
  navigation,
}) {
  const { item } = route.params;

  const imageUrl = item.image
    ? `https://campus-lost-found-api-hud7.onrender.com/uploads/${item.image}`
    : null;

  const deleteItem = async () => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");

              await API.delete(`/items/${item._id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              Alert.alert(
                "Success",
                "Item deleted successfully",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      navigation.navigate("Home");
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete item"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>
            No Image Available
          </Text>
        </View>
      )}

      <Text style={styles.title}>
        {item.itemName}
      </Text>

      <Text style={styles.label}>
        Category
      </Text>

      <Text style={styles.value}>
        {item.category}
      </Text>

      <Text style={styles.label}>
        Description
      </Text>

      <Text style={styles.value}>
        {item.description}
      </Text>

      <Text style={styles.label}>
        Location Found
      </Text>

      <Text style={styles.value}>
        {item.locationFound}
      </Text>

      <Text style={styles.label}>
        Date Found
      </Text>

      <Text style={styles.value}>
        {item.dateFound
          ? new Date(item.dateFound).toLocaleDateString()
          : "Not available"}
      </Text>

      <Text style={styles.label}>
        Status
      </Text>

      <Text
        style={[
          styles.status,
          item.status === "Available"
            ? styles.available
            : styles.claimed,
        ]}
      >
        {item.status}
      </Text>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate("EditItem", {
            item,
          })
        }
      >
        <Text style={styles.buttonText}>
          Edit Item
        </Text>
      </TouchableOpacity>

      {item.status === "Available" && (
        <TouchableOpacity
          style={styles.claimButton}
          onPress={() =>
            navigation.navigate("Claims", {
              item,
            })
          }
        >
          <Text style={styles.buttonText}>
            Claim This Item
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={deleteItem}
      >
        <Text style={styles.buttonText}>
          Delete Item
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f7fa",
    flexGrow: 1,
  },

  image: {
    width: "100%",
    height: 280,
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: "#ddd",
  },

  noImage: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    color: "#64748b",
    fontSize: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
  },

  label: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 14,
    marginBottom: 3,
  },

  value: {
    fontSize: 18,
    color: "#111827",
    lineHeight: 26,
  },

  status: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 15,
  },

  available: {
    color: "#16a34a",
  },

  claimed: {
    color: "#dc2626",
  },

  editButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },

  claimButton: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 30,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
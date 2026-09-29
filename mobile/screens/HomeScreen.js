import React, {
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      setLoading(true);

      const response = await API.get("/items");

      setItems(response.data);

    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to load items"
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    navigation.replace("Login");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("AddItem")
          }
        >
          <Text style={styles.buttonText}>
            + Add Item
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.claimButton}
          onPress={() =>
            navigation.navigate("Claims")
          }
        >
          <Text style={styles.buttonText}>
            Claims
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.buttonText}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No lost items available</Text>
          </View>
        }
        renderItem={({ item }) => {
          const imageUrl = item.image
            ? `https://campus-lost-found-api-hud7.onrender.com/uploads/${item.image}`
            : null;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate(
                  "ItemDetails",
                  { item }
                )
              }
            >
              {imageUrl && (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.image}
                />
              )}

              <View style={styles.cardBody}>
                <Text style={styles.itemName}>
                  {item.itemName}
                </Text>

                <Text>
                  {item.category}
                </Text>

                <Text>
                  📍 {item.locationFound}
                </Text>

                <Text
                  style={
                    item.status === "Available"
                      ? styles.available
                      : styles.claimed
                  }
                >
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f7fa",
  },

  topRow: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 7,
  },

  addButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
  },

  claimButton: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
  },

  logoutButton: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },

  image: {
    width: "100%",
    height: 180,
  },

  cardBody: {
    padding: 15,
  },

  itemName: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 5,
  },

  available: {
    marginTop: 8,
    fontWeight: "bold",
    color: "green",
  },

  claimed: {
    marginTop: 8,
    fontWeight: "bold",
    color: "red",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export default function EditItemScreen({
  route,
  navigation,
}) {
  const { item } = route.params;

  const [itemName, setItemName] =
    useState(item.itemName);

  const [category, setCategory] =
    useState(item.category);

  const [description, setDescription] =
    useState(item.description);

  const [locationFound, setLocationFound] =
    useState(item.locationFound);

  const updateItem = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();

      formData.append("itemName", itemName);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("locationFound", locationFound);

      await API.put(
        `/items/${item._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert(
        "Success",
        "Item updated successfully"
      );

      navigation.navigate("Home");

    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to update item"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Item</Text>

      <TextInput
        style={styles.input}
        value={itemName}
        onChangeText={setItemName}
      />

      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        value={locationFound}
        onChangeText={setLocationFound}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={updateItem}
      >
        <Text style={styles.buttonText}>
          Update Item
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
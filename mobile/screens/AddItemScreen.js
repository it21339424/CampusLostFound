import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export default function AddItemScreen({ navigation }) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [dateFound, setDateFound] = useState("");
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const addItem = async () => {
    if (
      !itemName ||
      !category ||
      !description ||
      !locationFound ||
      !dateFound
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();

      formData.append("itemName", itemName);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("locationFound", locationFound);
      formData.append("dateFound", dateFound);

      if (image) {
        formData.append("image", {
          uri: image.uri,
          name: "item-image.jpg",
          type: "image/jpeg",
        });
      }

      await API.post("/items", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Success", "Item added successfully");

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Found Item</Text>

      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
      />

      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Location Found"
        value={locationFound}
        onChangeText={setLocationFound}
      />

      <TextInput
        style={styles.input}
        placeholder="Date Found (YYYY-MM-DD)"
        value={dateFound}
        onChangeText={setDateFound}
      />

      <TouchableOpacity
        style={styles.imageButton}
        onPress={pickImage}
      >
        <Text style={styles.buttonText}>Choose Image</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image.uri }}
          style={styles.image}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={addItem}
      >
        <Text style={styles.buttonText}>
          Add Item
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

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
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
    marginTop: 15,
  },

  imageButton: {
    backgroundColor: "#475569",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  image: {
    width: "100%",
    height: 200,
    marginTop: 15,
    borderRadius: 10,
  },
});
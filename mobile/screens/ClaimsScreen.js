import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

export default function ClaimsScreen({ route }) {
  const item = route.params?.item;

  const [claimReason, setClaimReason] =
    useState("");

  const [claims, setClaims] =
    useState([]);

  const loadClaims = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await API.get("/claims", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClaims(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const createClaim = async () => {
    if (!item) {
      Alert.alert(
        "Error",
        "Please select an item first"
      );
      return;
    }

    if (!claimReason) {
      Alert.alert(
        "Error",
        "Please enter a claim reason"
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      await API.post(
        "/claims",
        {
          itemId: item._id,
          claimReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Success",
        "Claim submitted successfully"
      );

      setClaimReason("");

      loadClaims();

    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to create claim"
      );
    }
  };

  return (
    <View style={styles.container}>
      {item && (
        <>
          <Text style={styles.heading}>
            Claim {item.itemName}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Why does this item belong to you?"
            value={claimReason}
            onChangeText={setClaimReason}
            multiline
          />

          <TouchableOpacity
            style={styles.button}
            onPress={createClaim}
          >
            <Text style={styles.buttonText}>
              Submit Claim
            </Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.heading}>
        Claims
      </Text>

      <FlatList
        data={claims}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No claims available
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemName}>
              {item.itemId?.itemName}
            </Text>

            <Text>
              Reason: {item.claimReason}
            </Text>

            <Text>
              Status: {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },

  itemName: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },
});
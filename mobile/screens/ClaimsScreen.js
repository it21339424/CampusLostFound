import React, {
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "../services/api";

export default function ClaimsScreen({ route }) {
  const selectedItem = route.params?.item;

  const [claims, setClaims] = useState([]);
  const [claimReason, setClaimReason] = useState("");

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [editingClaimId, setEditingClaimId] =
    useState(null);

  const [editReason, setEditReason] =
    useState("");

  // --------------------------------
  // GET CURRENT USER
  // --------------------------------
  const getCurrentUser = async () => {
    try {
      const userData =
        await AsyncStorage.getItem("user");

      if (userData) {
        setCurrentUser(
          JSON.parse(userData)
        );
      }
    } catch (error) {
      console.log(
        "User loading error:",
        error
      );
    }
  };

  // --------------------------------
  // LOAD ALL CLAIMS
  // --------------------------------
  const loadClaims = async () => {
    try {
      setLoading(true);

      const token =
        await AsyncStorage.getItem("token");

      const response = await API.get(
        "/claims",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClaims(response.data);

    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to load claims"
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getCurrentUser();
      loadClaims();
    }, [])
  );

  // --------------------------------
  // CREATE CLAIM
  // --------------------------------
  const createClaim = async () => {
    if (!selectedItem) {
      Alert.alert(
        "Error",
        "Please select an item first"
      );
      return;
    }

    if (!claimReason.trim()) {
      Alert.alert(
        "Error",
        "Please enter a claim reason"
      );
      return;
    }

    try {
      setSubmitting(true);

      const token =
        await AsyncStorage.getItem("token");

      await API.post(
        "/claims",
        {
          itemId: selectedItem._id,
          claimReason:
            claimReason.trim(),
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
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------
  // START EDIT CLAIM
  // --------------------------------
  const startEditing = (claim) => {
    setEditingClaimId(claim._id);

    setEditReason(
      claim.claimReason
    );
  };

  // --------------------------------
  // CANCEL EDIT
  // --------------------------------
  const cancelEditing = () => {
    setEditingClaimId(null);
    setEditReason("");
  };

  // --------------------------------
  // UPDATE CLAIM
  // --------------------------------
  const updateClaim = async (claimId) => {
    if (!editReason.trim()) {
      Alert.alert(
        "Error",
        "Claim reason cannot be empty"
      );
      return;
    }

    try {
      const token =
        await AsyncStorage.getItem("token");

      await API.put(
        `/claims/${claimId}`,
        {
          claimReason:
            editReason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Success",
        "Claim updated successfully"
      );

      setEditingClaimId(null);
      setEditReason("");

      loadClaims();

    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to update claim"
      );
    }
  };

  // --------------------------------
  // DELETE CLAIM
  // --------------------------------
  const deleteClaim = (claimId) => {
    Alert.alert(
      "Delete Claim",
      "Are you sure you want to delete this claim?",
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
              const token =
                await AsyncStorage.getItem(
                  "token"
                );

              await API.delete(
                `/claims/${claimId}`,
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );

              Alert.alert(
                "Success",
                "Claim deleted successfully"
              );

              loadClaims();

            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data
                  ?.message ||
                  "Failed to delete claim"
              );
            }
          },
        },
      ]
    );
  };

  // --------------------------------
  // APPROVE OR REJECT CLAIM
  // --------------------------------
  const updateClaimStatus = async (
    claimId,
    status
  ) => {
    try {
      const token =
        await AsyncStorage.getItem("token");

      await API.patch(
        `/claims/${claimId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Success",
        `Claim ${status.toLowerCase()} successfully`
      );

      loadClaims();

    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          `Failed to ${status.toLowerCase()} claim`
      );
    }
  };

  // --------------------------------
  // CONFIRM APPROVE
  // --------------------------------
  const approveClaim = (claimId) => {
    Alert.alert(
      "Approve Claim",
      "Are you sure you want to approve this claim?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Approve",
          onPress: () =>
            updateClaimStatus(
              claimId,
              "Approved"
            ),
        },
      ]
    );
  };

  // --------------------------------
  // CONFIRM REJECT
  // --------------------------------
  const rejectClaim = (claimId) => {
    Alert.alert(
      "Reject Claim",
      "Are you sure you want to reject this claim?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",

          onPress: () =>
            updateClaimStatus(
              claimId,
              "Rejected"
            ),
        },
      ]
    );
  };

  // --------------------------------
  // CLAIM CARD
  // --------------------------------
  const renderClaim = ({ item }) => {
    const claimUserId =
      item.userId?._id ||
      item.userId;

    const itemOwnerId =
      item.itemId?.createdBy?._id ||
      item.itemId?.createdBy;

    const isMyClaim =
      currentUser?.id === claimUserId;

    const isItemOwner =
      currentUser?.id === itemOwnerId;

    const isPending =
      item.status === "Pending";

    const isEditing =
      editingClaimId === item._id;

    return (
      <View style={styles.card}>
        <Text style={styles.itemName}>
          {item.itemId?.itemName ||
            "Unknown Item"}
        </Text>

        <Text style={styles.smallLabel}>
          Claimed By
        </Text>

        <Text style={styles.normalText}>
          {item.userId?.name ||
            "Unknown User"}
        </Text>

        <Text style={styles.smallLabel}>
          Reason
        </Text>

        {isEditing ? (
          <>
            <TextInput
              style={styles.editInput}
              value={editReason}
              onChangeText={setEditReason}
              multiline
            />

            <View
              style={styles.buttonRow}
            >
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() =>
                  updateClaim(item._id)
                }
              >
                <Text
                  style={
                    styles.smallButtonText
                  }
                >
                  Save
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={cancelEditing}
              >
                <Text
                  style={
                    styles.smallButtonText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.reason}>
            {item.claimReason}
          </Text>
        )}

        <View style={styles.statusRow}>
          <Text style={styles.smallLabel}>
            Status:
          </Text>

          <Text
            style={[
              styles.status,

              item.status ===
              "Pending"
                ? styles.pending
                : item.status ===
                  "Approved"
                ? styles.approved
                : styles.rejected,
            ]}
          >
            {item.status}
          </Text>
        </View>

        {/* CLAIM OWNER CONTROLS */}

        {isMyClaim &&
          isPending &&
          !isEditing && (
            <View
              style={styles.buttonRow}
            >
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  startEditing(item)
                }
              >
                <Text
                  style={
                    styles.smallButtonText
                  }
                >
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.deleteButton
                }
                onPress={() =>
                  deleteClaim(item._id)
                }
              >
                <Text
                  style={
                    styles.smallButtonText
                  }
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* ITEM OWNER CONTROLS */}

        {isItemOwner &&
          isPending && (
            <View
              style={styles.buttonRow}
            >
              <TouchableOpacity
                style={
                  styles.approveButton
                }
                onPress={() =>
                  approveClaim(item._id)
                }
              >
                <Text
                  style={
                    styles.smallButtonText
                  }
                >
                  Approve
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.rejectButton
                }
                onPress={() =>
                  rejectClaim(item._id)
                }
              >
                <Text
                  style={
                    styles.smallButtonText
                  }
                >
                  Reject
                </Text>
              </TouchableOpacity>
            </View>
          )}
      </View>
    );
  };

  // --------------------------------
  // LOADING SCREEN
  // --------------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading claims...
        </Text>
      </View>
    );
  }

  // --------------------------------
  // MAIN UI
  // --------------------------------
  return (
    <View style={styles.container}>

      {/* CREATE CLAIM SECTION */}

      {selectedItem &&
        selectedItem.status ===
          "Available" && (
          <View
            style={
              styles.createSection
            }
          >
            <Text
              style={styles.title}
            >
              Claim Item
            </Text>

            <Text
              style={
                styles.selectedItemText
              }
            >
              {selectedItem.itemName}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Explain why this item belongs to you..."
              value={claimReason}
              onChangeText={
                setClaimReason
              }
              multiline
            />

            <TouchableOpacity
              style={
                styles.submitButton
              }
              onPress={createClaim}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator
                  color="#fff"
                />
              ) : (
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Submit Claim
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

      {/* HEADER */}

      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Claims
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadClaims}
        >
          <Text
            style={
              styles.refreshText
            }
          >
            Refresh
          </Text>
        </TouchableOpacity>
      </View>

      {/* CLAIM LIST */}

      <FlatList
        data={claims}
        keyExtractor={(item) =>
          item._id
        }
        renderItem={renderClaim}
        contentContainerStyle={
          claims.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text
              style={
                styles.emptyTitle
              }
            >
              No Claims
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              No claim requests are
              available.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f7fa",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748b",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },

  createSection: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  selectedItemText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
    marginTop: 8,
    marginBottom: 12,
  },

  input: {
    minHeight: 90,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  refreshButton: {
    backgroundColor: "#475569",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  refreshText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  listContainer: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  itemName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },

  smallLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 7,
  },

  normalText: {
    fontSize: 16,
    color: "#111827",
    marginTop: 2,
  },

  reason: {
    fontSize: 16,
    color: "#111827",
    marginTop: 3,
    lineHeight: 22,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },

  status: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 7,
  },

  pending: {
    color: "#d97706",
  },

  approved: {
    color: "#16a34a",
  },

  rejected: {
    color: "#dc2626",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  approveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#64748b",
    padding: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  smallButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  editInput: {
    minHeight: 75,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    textAlignVertical: "top",
  },

  emptyContainer: {
    flexGrow: 1,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
  },

  emptyText: {
    color: "#64748b",
    marginTop: 6,
  },
});
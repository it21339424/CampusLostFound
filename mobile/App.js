import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AddItemScreen from "./screens/AddItemScreen";
import ItemDetailsScreen from "./screens/ItemDetailsScreen";
import EditItemScreen from "./screens/EditItemScreen";
import ClaimsScreen from "./screens/ClaimsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Create Account" }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Campus Lost & Found",
            headerBackVisible: false,
          }}
        />

        <Stack.Screen
          name="AddItem"
          component={AddItemScreen}
          options={{ title: "Add Found Item" }}
        />

        <Stack.Screen
          name="ItemDetails"
          component={ItemDetailsScreen}
          options={{ title: "Item Details" }}
        />

        <Stack.Screen
          name="EditItem"
          component={EditItemScreen}
          options={{ title: "Edit Item" }}
        />

        <Stack.Screen
          name="Claims"
          component={ClaimsScreen}
          options={{ title: "Claims" }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
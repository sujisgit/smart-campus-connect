import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { API_URL } from "../config";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const signupUser = async () => {
    try {
      await axios.post(`${API_URL}/signup`, {
        name,
        email,
        password,
        department,
        year,
      });

      Alert.alert("Signup Successful", "You can now login.");
      router.replace("/login");
    } catch (error: any) {
      const message = error.response?.data?.error || "Signup Failed";
      Alert.alert("Signup Failed", message);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <Text style={{ fontSize: 24 }}>Sign Up</Text>

      <TextInput
        placeholder="Name"
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email"
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Department"
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={department}
        onChangeText={setDepartment}
      />

      <TextInput
        placeholder="Year"
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
      />

      <Button title="Sign Up" onPress={signupUser} />

      <Text
        style={{ marginTop: 15, color: "blue", textAlign: "center" }}
        onPress={() => router.push("/login")}
      >
        Already have an account? Login
      </Text>
    </View>
  );
}

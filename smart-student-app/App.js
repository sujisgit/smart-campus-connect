import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import axios from "axios";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    try {
      const response = await axios.post(
        "http://YOUR_IP_ADDRESS:5000/login",
        {
          email,
          password,
        }
      );

      console.log("TOKEN:", response.data.token);
      alert("Login successful!");
    } catch (error) {
      console.log(error.response?.data);
      alert("Login failed");
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <Text>Email</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10 }}
        value={email}
        onChangeText={setEmail}
      />

      <Text>Password</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10 }}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={loginUser} />
    </View>
  );
}
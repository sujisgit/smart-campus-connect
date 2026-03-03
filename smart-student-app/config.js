import { Platform } from "react-native";

const DEV_IP = "172.18.138.12"; // ← your IPv4 address

export const API_URL =
  Platform.OS === "web"
    ? "https://smart-campus-connect-kwzr.onrender.com"
    : `http://${DEV_IP}:5000`;
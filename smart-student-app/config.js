import { Platform } from "react-native";

const DEV_IP = "172.18.138.12"; // ← your IPv4 address

const PROD_URL = "https://smart-campus-connect-kwzr.onrender.com";

const DEV_URL = `http://${DEV_IP}:5000`;
 
export const API_URL = 
  process.env.NODE_ENV === "development" 
    ? DEV_URL : PROD_URL;
 
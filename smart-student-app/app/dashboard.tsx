import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "@/config";



export default function Dashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const router = useRouter();

  const getToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  const fetchStudents = async () => {    
    const token = await getToken();
    const response = await axios.get(`${API_URL}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStudents(response.data);
  };

  const addStudent = async () => {
    const token = await getToken();
    await axios.post(
      `${API_URL}/signup`,
      {
        name,
        email: `${name}${Date.now()}@mail.com`,
        password: "123456",
        department,
        year: Number(year),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    resetForm();
    fetchStudents();
  };

  const updateStudent = async (id: number) => {
    const token = await getToken();

    await axios.put(
      `${API_URL}/students/${id}`,
      { name, department, year: Number(year) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    resetForm();
    fetchStudents();
  };

  const deleteStudent = async (id: number) => {
    const token = await getToken();
    await axios.delete(`${API_URL}/students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchStudents();
  };

  const resetForm = () => {
    setName("");
    setDepartment("");
    setYear("");
    setEditingId(null);
  };

  const logout = async () => {
  await AsyncStorage.removeItem("token");
  router.replace("/login");
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <ScrollView style={styles.container}>
      
    <View style={styles.headerRow}>
     <Text style={styles.header}>Smart Campus</Text>
     <TouchableOpacity style={styles.logoutButton} onPress={logout}>
      <Text style={styles.buttonText}>Logout</Text>
     </TouchableOpacity>
    </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {editingId ? "Edit Student" : "Add Student"}
        </Text>

        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Department"
          style={styles.input}
          value={department}
          onChangeText={setDepartment}
        />

        <TextInput
          placeholder="Year"
          style={styles.input}
          keyboardType="numeric"
          value={year}
          onChangeText={setYear}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            editingId ? updateStudent(editingId) : addStudent()
          }
        >
          <Text style={styles.buttonText}>
            {editingId ? "UPDATE STUDENT" : "ADD STUDENT"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Students</Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentInfo}>
              {item.department} • Year {item.year}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditingId(item.id);
                  setName(item.name);
                  setDepartment(item.department);
                  setYear(item.year.toString());
                }}
              >
                <Text style={styles.buttonText}>EDIT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteStudent(item.id)}
              >
                <Text style={styles.buttonText}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // ✅ VERY IMPORTANT
    backgroundColor: "#f8fafc",
    padding: 20,
  },

  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  logoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#34495e",
  },

  input: {
    backgroundColor: "#f1f3f6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  primaryButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  editButton: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },

  deleteButton: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  studentCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,

    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,

    // Android Shadow
    elevation: 8,
  },

  studentName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },

  studentInfo: {
    color: "#555",
    marginBottom: 10,
  },

  buttonRow: {
    flexDirection: "row",
  },
});
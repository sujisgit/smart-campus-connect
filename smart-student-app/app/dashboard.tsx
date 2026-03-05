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
import { API_URL } from "../config";
declare module '@react-native-picker/picker';
import { Picker } from "@react-native-picker/picker";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;



export default function Dashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("All");
  const [sortYearAsc, setSortYearAsc] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  // ✅ Add this line if it's missing
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  const getToken = async () => await AsyncStorage.getItem("token");

  const fetchStudents = async () => {
    const token = await getToken();
    try {
      const response = await axios.get(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Add attendance if missing
      const updated = response.data.map((s: any) => ({
        ...s,
        attendance: s.attendance ?? "Absent",
      }));
      setStudents(updated);
    } catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    console.log("Fetch Students Axios Error:", err.response?.data || err.message);
  } else if (err instanceof Error) {
    console.log("Fetch Students Error:", err.message);
  } else {
    console.log("Unknown error:", err);
  }
  alert("Failed to fetch students.");
}
  };

  const addStudent = async () => {
    if (!name || !department || !year) {
      alert("Please fill all fields");
      return;
    }

    const email = `${name.replace(/\s+/g, "")}${Date.now()}@mail.com`;
    const token = await getToken();

    try {
      const response = await axios.post(
        `${API_URL}/signup`,
        { name, email, password: "123456", department, year: Number(year) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      resetForm();
      fetchStudents();
    } catch (err: any) {
      console.log("Axios Error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Something went wrong");
    }
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

  try {
    console.log("Deleting student:", id);

    await axios.delete(`${API_URL}/students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Student deleted successfully");
    fetchStudents();

  } catch (err: any) {
    console.log("Delete Error:", err.response?.data || err.message);
    alert("Failed to delete student");
  }
};
  const toggleAttendance = (id: number) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, attendance: s.attendance === "Present" ? "Absent" : "Present" }
          : s
      )
    );
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

  // Filter and sort students
  const filteredStudents = students
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((s) => filterDept === "All" || s.department === filterDept)
    .sort((a, b) =>
      sortYearAsc ? a.year - b.year : b.year - a.year
    );

  const totalStudents = students.length;
  const presentCount = students.filter((s) => s.attendance === "Present").length;
  const absentCount = totalStudents - presentCount;

  // Get unique departments
  const departments = ["All", ...Array.from(new Set(students.map((s) => s.department)))];

 useEffect(() => {
  fetchStudents();

  // Temporary test notifications
  setNotifications([
    { id: 1, message: "Math class starts at 9 AM" },
    { id: 2, message: "Library closes at 6 PM" },
  ]);
}, []);

const getAttendancePrediction = (attendance: number) => {
  if (attendance < 40) {
    return "High risk of semester shortage";
  } 
  else if (attendance < 75) {
    return "Medium risk – improve attendance";
  } 
  else {
    return "Safe attendance";
  }
};
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>🎓 Smart Campus Dashboard</Text>
<Text style={{color:"#94a3b8"}}>Manage students and attendance</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
{/* Notifications Card */}
<View style={styles.card}>
  <Text style={[styles.sectionTitle, { color: darkMode ? "#f8fafc" : "#0f172a" }]}>
    Notifications
  </Text>

  {notifications.length > 0 ? (
    <FlatList
      data={notifications} // array of {id, message}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Text style={{ color: darkMode ? "#f8fafc" : "#0f172a", marginBottom: 6 }}>
          • {item.message}
        </Text>
      )}
    />
  ) : (
    <Text style={{ color: "#cbd5e1" }}>No notifications</Text>
  )}
</View>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{totalStudents}</Text>
          <Text style={styles.statsLabel}>Total</Text>
        </View>
        <View style={[styles.statsCard, { backgroundColor: "#10b981" }]}>
          <Text style={styles.statsNumber}>{presentCount}</Text>
          <Text style={styles.statsLabel}>Present</Text>
        </View>
        <View style={[styles.statsCard, { backgroundColor: "#ef4444" }]}>
          <Text style={styles.statsNumber}>{absentCount}</Text>
          <Text style={styles.statsLabel}>Absent</Text>
        </View>
      </View>

      {/* Attendance Analytics */}
<View style={styles.card}>
  <Text style={styles.sectionTitle}>Attendance Analytics</Text>

  <BarChart
    data={{
      labels: ["Present", "Absent"],
      datasets: [
        {
          data: [presentCount, absentCount],
        },
      ],
    }}
    width={screenWidth - 40}
    height={240}
    chartConfig={{
      backgroundColor: "#1e293b",
      backgroundGradientFrom: "#1e293b",
      backgroundGradientTo: "#1e293b",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
      labelColor: () => "#ffffff",
    }}
    style={{
      borderRadius: 16,
    }}
  />
</View>

      {/* Filters & Search */}
      <TextInput
        placeholder="Search by name..."
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Department:</Text>
        <Picker
          selectedValue={filterDept}
           style={styles.picker}
            onValueChange={(val: string) => setFilterDept(val)}
>
        {departments.map((dept) => (
        <Picker.Item key={dept} label={dept} value={dept} />
        ))}
       </Picker>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortYearAsc(!sortYearAsc)}
        >
          <Text style={styles.sortButtonText}>
            Year {sortYearAsc ? "↑" : "↓"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Student */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{editingId ? "Edit Student" : "Add Student"}</Text>

        <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
        <TextInput placeholder="Department" style={styles.input} value={department} onChangeText={setDepartment} />
        <TextInput placeholder="Year" style={styles.input} keyboardType="numeric" value={year} onChangeText={setYear} />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => (editingId ? updateStudent(editingId) : addStudent())}
        >
          <Text style={styles.buttonText}>{editingId ? "UPDATE" : "ADD"}</Text>
        </TouchableOpacity>
      </View>
<View style={styles.card}>
  <Text style={styles.sectionTitle}>⚠ At Risk Students</Text>

  {students
    .filter(() => Math.random() * 100 < 40)
    .slice(0,3)
    .map((s) => (
      <Text key={s.id} style={{ color: "#ef4444", marginBottom: 5 }}>
        {s.name} – Low attendance risk
      </Text>
    ))}
</View>
    {/* Student List */}
<FlatList
  data={filteredStudents}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => {

    const attendancePercent = Math.floor(Math.random() * 100);
    const prediction = getAttendancePrediction(attendancePercent);

    return (
      <View style={styles.studentCard}>

  <View style={{flexDirection:"row", alignItems:"center", marginBottom:8}}>

    <View
      style={{
        width:40,
        height:40,
        borderRadius:20,
        backgroundColor:"#2563eb",
        justifyContent:"center",
        alignItems:"center",
        marginRight:10
      }}
    >
      <Text style={{color:"#fff", fontSize:18}}>👤</Text>
    </View>

    <View>
      <Text style={styles.studentName}>{item.name}</Text>
      <Text style={styles.studentInfo}>
        {item.department} • Year {item.year}
      </Text>
    </View>

  </View>

        <Text
          style={[
            styles.attendanceBadge,
            {
              backgroundColor:
                item.attendance === "Present" ? "#10b981" : "#ef4444",
            },
          ]}
        >
          {item.attendance}
        </Text>

        {/* Attendance Percentage */}
        <Text style={{ color: "#facc15", marginTop: 5 }}>
          Attendance: {attendancePercent}%
        </Text>
        <View
  style={{
    height: 8,
    backgroundColor: "#334155",
    borderRadius: 6,
    marginVertical: 6,
  }}
>
  <View
    style={{
      width: `${attendancePercent}%`,
      height: 8,
      borderRadius: 6,
      backgroundColor:
        attendancePercent < 40
          ? "#ef4444"
          : attendancePercent < 75
          ? "#facc15"
          : "#10b981",
    }}
  />
</View>

        {/* Prediction */}
        <Text
       style={{
        color:
          attendancePercent < 40
            ? "#ef4444"
            : attendancePercent < 75
            ? "#facc15"
            : "#10b981",
        marginBottom: 10,
        fontWeight: "600"
       }}
       >
          Prediction: {prediction}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.attendanceButton}
            onPress={() => toggleAttendance(item.id)}
          >
            <Text style={styles.buttonText}>
              {item.attendance === "Present"
                ? "Mark Absent"
                : "Mark Present"}
            </Text>
          </TouchableOpacity>

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
    );
  }}
/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  header: { fontSize: 28, fontWeight: "800", color: "#f8fafc" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logoutButton: { backgroundColor: "#ef4444", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  buttonText: { color: "#fff", fontWeight: "600", textAlign: "center" },

  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: "center",
    backgroundColor: "#1e3a8a",
  },
  statsNumber: { fontSize: 22, fontWeight: "800", color: "#fff" },
  statsLabel: { fontSize: 14, color: "#fff" },

  searchInput: { backgroundColor: "#1e293b", padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 16, color: "#f8fafc" },

  filterRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  filterLabel: { color: "#f8fafc", marginRight: 8 },
  picker: { height: 40, width: 150, color: "#f8fafc", backgroundColor: "#1e293b", borderRadius: 8 },
  sortButton: { marginLeft: 12, backgroundColor: "#2563eb", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  sortButtonText: { color: "#fff", fontWeight: "600" },

  card: { backgroundColor: "#1e293b", padding: 20, borderRadius: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#f8fafc" },
  input: { backgroundColor: "#0f172a", color: "#f8fafc", padding: 12, borderRadius: 12, marginBottom: 12 },
  primaryButton: { backgroundColor: "#2563eb", padding: 16, borderRadius: 16, alignItems: "center" },

  studentCard: { backgroundColor: "#1e293b", padding: 20, borderRadius: 20, marginBottom: 16 },
  studentName: { fontSize: 18, fontWeight: "700", color: "#f8fafc" },
  studentInfo: { fontSize: 14, color: "#cbd5e1", marginBottom: 8 },
  attendanceBadge: { color: "#fff", fontWeight: "700", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, alignSelf: "flex-start", marginBottom: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  editButton: { backgroundColor: "#10b981", padding: 10, borderRadius: 10, flex: 1, marginLeft: 5 },
  deleteButton: { backgroundColor: "#ef4444", padding: 10, borderRadius: 10, flex: 1, marginLeft: 5 },
  attendanceButton: { backgroundColor: "#f59e0b", padding: 10, borderRadius: 10, flex: 1, marginRight: 5 },
});
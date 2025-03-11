import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // Ensure correct import

export const markAttendance = async (studentId, studentName, section, status, subjectHandled) => {
  try {
    console.log("🔄 Attempting to mark attendance...");
    console.log("📚 Subject:", subjectHandled);
    console.log("👤 Student:", studentName, studentId);
    console.log("📅 Status:", status);

    // ✅ Save attendance record in Firestore
    await addDoc(collection(db, "attendance"), {
      studentID: studentId,
      name: studentName,
      section: section,
      status: status, // "Present", "Absent", or "Late"
      subject: subjectHandled,
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      timestamp: serverTimestamp(), // Firestore-generated timestamp
    });

    console.log("✅ Attendance marked successfully!");
    alert(`Marked ${studentName} as ${status} for ${subjectHandled}`);
  } catch (error) {
    console.error("❌ Error marking attendance:", error);
    alert("Error marking attendance. Check console for details.");
  }
};

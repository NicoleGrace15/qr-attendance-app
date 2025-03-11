import { useState, useEffect } from "react";
import { db } from "../firebase"; // Adjust path if needed
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext"; // Ensure AuthContext provides the current user

const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); // Ensure this gets the logged-in student

  useEffect(() => {
    if (!currentUser) return;

    const attendanceRef = collection(db, "attendance");
    const q = query(attendanceRef, where("studentID", "==", currentUser.uid));

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        records[data.subject] = data.status; // Organizing data by subject
      });

      setAttendanceRecords(records);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser]);

  return { attendanceRecords, loading };
};

export default useAttendance;

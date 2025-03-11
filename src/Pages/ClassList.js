import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import "../Styles/classlist.css";
import { collection, onSnapshot } from "firebase/firestore";

const ClassList = () => {
  const [boys, setBoys] = useState([]);
  const [girls, setGirls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceTimes, setAttendanceTimes] = useState({});

  // Helper function to get today's date string (YYYY-MM-DD format)
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format to "YYYY-MM-DD"
  };

  // Memoize the isToday function to avoid unnecessary rerenders
  const isToday = useCallback((timestamp) => {
    const todayDate = getTodayDate();
    const logDate = new Date(timestamp.seconds * 1000).toISOString().split("T")[0];
    return todayDate === logDate;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        let students = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              role: data.role || "",
              gender: data.gender || "",
              studentID: data.studentID || "", // Ensure we have studentID for matching
            };
          })
          .filter((user) => user.role === "Student" && user.gender);

        const boysList = students
          .filter((s) => s.gender?.toLowerCase() === "male")
          .sort((a, b) => a.lastName.localeCompare(b.lastName));

        const girlsList = students
          .filter((s) => s.gender?.toLowerCase() === "female")
          .sort((a, b) => a.lastName.localeCompare(b.lastName));

        setBoys(boysList);
        setGirls(girlsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching class list:", error);
        setError("Failed to fetch class list. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "record"),
      (snapshot) => {
        const attendanceData = {}; // New object to store login/logout times

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const studentID = data.studentID;

          if (!attendanceData[studentID]) {
            attendanceData[studentID] = { logInTime: "-", logOutTime: "-" };
          }

          // Function to format Firestore timestamp
          const formatTime = (timestamp) => {
            if (!timestamp) return "-";
            const date = new Date(timestamp.seconds * 1000);
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
          };

          // Use checkInTime for login and checkOutTime for logout
          if (data.checkInTime && isToday(data.checkInTime)) {
            attendanceData[studentID].logInTime = formatTime(data.checkInTime);
          }
          if (data.checkOutTime && isToday(data.checkOutTime)) {
            attendanceData[studentID].logOutTime = formatTime(data.checkOutTime);
          }
        });

        setAttendanceTimes(attendanceData);
      },
      (error) => {
        console.error("Error fetching attendance data:", error);
      }
    );

    return () => unsubscribe();
  }, [isToday]); // Add isToday as a dependency

  return (
    <div className="container-class-box">
      <h2 className="title">📋 Class List</h2>
      {loading ? (
        <p className="no-data">Loading class list...</p>
      ) : error ? (
        <p className="no-data">{error}</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="section-title">👦 Boys</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Log In</th>
                    <th>Log Out</th>
                  </tr>
                </thead>
                <tbody>
                  {boys.length > 0 ? (
                    boys.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>
                          {student.lastName}, {student.firstName}
                        </td>
                        <td>{attendanceTimes[student.studentID]?.logInTime || "-"}</td>
                        <td>{attendanceTimes[student.studentID]?.logOutTime || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No boys found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="section-title">👧 Girls</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Log In</th>
                    <th>Log Out</th>
                  </tr>
                </thead>
                <tbody>
                  {girls.length > 0 ? (
                    girls.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>
                          {student.lastName}, {student.firstName}
                        </td>
                        <td>{attendanceTimes[student.studentID]?.logInTime || "-"}</td>
                        <td>{attendanceTimes[student.studentID]?.logOutTime || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No girls found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassList;

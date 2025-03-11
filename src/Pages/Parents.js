import React, { useState } from "react";
import { db } from "../firebase"; // Ensure this imports your Firebase configuration
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../Styles/parent.css";

const ParentDashboard = () => {
  const [studentID, setStudentID] = useState("");
  const [studentName, setStudentName] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();
  const [loginLogoutRecords, setLoginLogoutRecords] = useState([]);


    // Utility function to determine the current day type
const getTodayScheduleType = () => {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  if (today === 1 || today === 3 || today === 5) return "MWF"; // Monday, Wednesday, Friday
  if (today === 2 || today === 4) return "T/TH"; // Tuesday, Thursday
  return "NONE"; // Weekends or unhandled cases
};


  // Fetch Student Data & Attendance
  const fetchStudentData = async () => {
    setError("");
    setStudentName("");
    setAttendanceRecords({});
    setSchedule([]);

    if (!studentID.trim()) {
      setError("Please enter a Student ID.");
      return;
    }

    try {
      // Fetch student details from 'users' collection
      const userQuery = query(collection(db, "users"), where("studentID", "==", studentID));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setError("Student not found");
        return;
      }

      const userData = userSnapshot.docs[0].data();
      setStudentName(`${userData.firstName} ${userData.middleName} ${userData.lastName}`);

      // Fetch real-time attendance records
      const attendanceQuery = query(collection(db, "attendance"), where("studentID", "==", studentID));
      onSnapshot(attendanceQuery, (snapshot) => {
        let records = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.subject) {
            records[data.subject] = data.status;
          }
        });
        setAttendanceRecords(records);
      });

      // Fetch schedule data
      onSnapshot(collection(db, "schedule"), (snapshot) => {
        if (!snapshot.empty) {
          const scheduleData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSchedule(scheduleData);
        }
      });

    } catch (err) {
      setError("Error fetching data");
      console.error("Error fetching student or attendance data:", err);
    }
    // Fetch Log In & Log Out Records (From 'record' collection)
const today = new Date().toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
const recordQuery = query(collection(db, "record"), where("studentID", "==", studentID));
const recordSnapshot = await getDocs(recordQuery);

const logRecords = recordSnapshot.docs
  .map((doc) => doc.data())
  .filter((record) => record.date === today);

if (logRecords.length === 0) {
  setLoginLogoutRecords([{ message: "Student hasn't logged in yet. Please contact the adviser for further details." }]);
} else {
  setLoginLogoutRecords(logRecords);
}

  };
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="main-parent-cont">
      <h1>Welcome, Parent!</h1>
<div className="table-parent">
      {/* Student ID Input */}
      <table border="1">
        <thead>
          <tr>
            <th>Student ID</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input className="input-parent-style"
                type="text"
                value={studentID}
                onChange={(e) => setStudentID(e.target.value)}
                placeholder="Enter Student ID"
              />
              <button className="button-parent-style" onClick={fetchStudentData}>Submit</button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Student Info */}
      {studentName && (
        <>
          <h3>Student: {studentName}</h3>

          {/* Log In & Log Out Records */}
<h3>Log In & Log Out Records</h3>
<table border="1">
  <thead>
    <tr>
      <th>Date</th>
      <th>Log In Time</th>
      <th>Log Out Time</th>
    </tr>
  </thead>
  <tbody>
    {loginLogoutRecords.length > 0 && loginLogoutRecords[0].message ? (
      <tr>
        <td colSpan="3" style={{ textAlign: "center" }}>
          {loginLogoutRecords[0].message}
        </td>
      </tr>
    ) : (
      loginLogoutRecords.map((record, index) => (
        <tr key={index}>
          <td>{record.date}</td>
          <td>{record.checkInTimeString || "N/A"}</td>
          <td>{record.checkOutTimeString || "N/A"}</td>
        </tr>
      ))
    )}
  </tbody>
</table>


          {/* Schedule and Attendance */}
          <h3>Schedule</h3>

          {/* MWF Schedule */}
          {/* MWF Schedule */}
<h4>Monday-Wednesday-Friday (MWF)</h4>
<table border="1">
  <thead>
    <tr>
      <th>Subject</th>
      <th>Time</th>
      <th>Teacher</th>
      <th>Attendance</th>
    </tr>
  </thead>
  <tbody>
    {getTodayScheduleType() === "MWF" ? (
      schedule.filter(item => item.scheduleType === "MWF").map((item) => (
        <tr key={item.id}>
          <td>{item.subject}</td>
          <td>{item.time}</td>
          <td>{item.teacher}</td>
          <td>
            {attendanceRecords[item.subject] ? (
              <>
                {attendanceRecords[item.subject]} <br />
                {attendanceRecords[item.subject] === "Absent" ? " (Unexcused)" : ""}
              </>
            ) : "-"}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="4" style={{ textAlign: "center" }}>No MWF classes scheduled today.</td>
      </tr>
    )}
  </tbody>
</table>

{/* TTH Schedule */}
<h4>Tuesday-Thursday (TTH)</h4>
<table border="1">
  <thead>
    <tr>
      <th>Subject</th>
      <th>Time</th>
      <th>Teacher</th>
      <th>Attendance</th>
    </tr>
  </thead>
  <tbody>
    {getTodayScheduleType() === "T/TH" ? (
      schedule.filter(item => item.scheduleType === "T/TH").map((item) => (
        <tr key={item.id}>
          <td>{item.subject}</td>
          <td>{item.time}</td>
          <td>{item.teacher}</td>
          <td>
            {attendanceRecords[item.subject] ? (
              <>
                {attendanceRecords[item.subject]} <br />
                {attendanceRecords[item.subject] === "Absent" ? " (Unexcused)" : ""}
              </>
            ) : "-"}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="4" style={{ textAlign: "center" }}>No T/TH classes scheduled today.</td>
      </tr>
    )}
  </tbody>
</table>

          
        </>
        
      )}

      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
      </div>
    </div>
  );
};

export default ParentDashboard;

import React, { useEffect, useState } from "react";
import { db } from "../firebase"; 
import { collection, getDocs, doc, updateDoc, query, where, } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { markAttendance } from "../utils/attendanceUtils"; 
import "../Styles/sbteacher.css";

const SubjectTeachers = () => {
  const [students, setStudents] = useState([]);
  const [subjectHandled, setSubjectHandled] = useState(""); 
  const [attendanceRemarks, setAttendanceRemarks] = useState({}); 
  const [isEditing, setIsEditing] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();
  const teacherID = auth.currentUser.uid; 

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  
        // ❗ Reset attendanceRemarks at the start of each day
        setAttendanceRemarks({}); 
  
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const userData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Fetch subject teacher's assigned subject
        const teacher = userData.find((user) => user.uid === teacherID);
        if (teacher) {
          setSubjectHandled(teacher.subjectHandled);
        }
  
        // Get student list
        const studentList = userData
          .filter((user) => user.role === "Student")
          .map((student) => ({
            ...student,
            firstName: student.firstName.toUpperCase(),
            middleName: student.middleName.toUpperCase(),
            lastName: student.lastName.toUpperCase(),
          }))
          .sort((a, b) => a.studentID.localeCompare(b.studentID));
  
        setStudents(studentList);
  
        // Fetch today's attendance records for the teacher's subject
        if (teacher?.subjectHandled) {
          const attendanceCollection = collection(db, "attendance");
          const q = query(
            attendanceCollection,
            where("date", "==", today),
            where("subject", "==", teacher.subjectHandled)
          );
          const attendanceSnapshot = await getDocs(q);
  
          // Map attendance data to remarks
          const attendanceMap = {};
          attendanceSnapshot.docs.forEach((doc) => {
            const record = doc.data();
            attendanceMap[record.studentID] = record.status;
          });
  
          // ✅ Ensure this updates only with today's data
          setAttendanceRemarks(attendanceMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    if (teacherID) {
      fetchStudentsAndAttendance();
    }
  }, [teacherID]); // ✅ useEffect runs when teacherID changes
   // ✅ useEffect runs when teacherID changes
  
  
  
   const handleSaveSubject = async () => {
    try {
      if (!teacherID || !newSubject.trim()) return; 
  
      const teacherRef = doc(db, "users", teacherID);
      await updateDoc(teacherRef, { subjectHandled: newSubject });
  
      setSubjectHandled(newSubject); // Update UI state
      setIsEditing(false); // Exit editing mode
  
      alert("Subject updated successfully!");
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };
  
  // Function to enable editing mode


// Function to log out
const handleLogout = async () => {
  try {
    await signOut(auth);
    alert("Logged out successfully!");
    navigate("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};



const handleAttendance = async (studentID, studentName, section, status) => {
  try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const attendanceCollection = collection(db, "attendance");

      // Query Firestore for an existing record for this student, date, and subject
      const q = query(
          attendanceCollection,
          where("studentID", "==", studentID),
          where("date", "==", today),
          where("subject", "==", subjectHandled)
      );

      const attendanceSnapshot = await getDocs(q);
      if (!attendanceSnapshot.empty) {
          // Update the existing record
          const attendanceRef = doc(db, "attendance", attendanceSnapshot.docs[0].id);
          await updateDoc(attendanceRef, { status });
      } else {
          // Create a new attendance record for this subject
          await markAttendance(studentID, studentName, section, status, subjectHandled);
      }

      // ✅ Immediately update local state to reflect the changes in the UI
      setAttendanceRemarks((prev) => ({
          ...prev,
          [studentID]: status, // Keep it simple by using studentID as the key
      }));

  } catch (error) {
      console.error("Error marking attendance:", error);
  }
};

const handleEditClick = () => {
  setIsEditing(true);
  setNewSubject(subjectHandled); // Prefill input with the current subject
};
  

  return (
    <div className="Main-subject-dashboard" > 
    <div className="subject-container">
      <h2>Subject Teacher Dashboard - {subjectHandled}</h2>

      {isEditing ? (
        <div>
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button onClick={handleSaveSubject}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={handleEditClick}>Edit Subject</button>
      )}
     <div>
  <input
    type="text"
    placeholder="Enter new subject"
    value={newSubject}
    onChange={(e) => setNewSubject(e.target.value)}
  />
 
</div>


      <table className="sbteacher-table">
        <thead>
          <tr className=" subject-row-dashboard">
            <th>Student Name</th>
            <th>Student ID</th>
            <th>Section</th>
            <th>Attendance</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.firstName} {student.middleName} {student.lastName}</td>
              <td>{student.studentID}</td>
              <td>{student.section}</td>
              <td className="remarks-td">
                <button onClick={() => handleAttendance(student.studentID, `${student.firstName} ${student.lastName}`, student.section, "Present")} className="present-btn">
                  ✅ Present
                </button>
                <button onClick={() => handleAttendance(student.studentID, `${student.firstName} ${student.lastName}`, student.section, "Absent")} className="absent-btn">
                  ❌ Absent
                </button>
                <button onClick={() => handleAttendance(student.studentID, `${student.firstName} ${student.lastName}`, student.section, "Late")} className="late-btn">
                  ⏳ Late
                </button>
              </td>
              <td>{attendanceRemarks[student.studentID] || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
    </div>
    </div>
  );
};

export default SubjectTeachers;

import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import "../Styles/classlist.css";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

const ClassList = () => {
  const [boys, setBoys] = useState([]);
  const [girls, setGirls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceTimes, setAttendanceTimes] = useState({});

  const getTodayDate = () => {const today = new Date();return today.toISOString().split("T")[0]; // Format to "YYYY-MM-DD"
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
        const attendanceData = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const studentID = data.studentID;
  
          if (!attendanceData[studentID]) {
            attendanceData[studentID] = { logInTime: "-", logOutTime: "-" };
          }
  
          if (data.excused) {
            // If student was excused, override login/logout with "Excused"
            attendanceData[studentID].logInTime = "(Excused)";
            attendanceData[studentID].logOutTime = "(Excused)";
          } else {
            // Otherwise, show the regular login/logout times
            const formatTime = (timestamp) => {
              if (!timestamp) return "-";
              const date = new Date(timestamp.seconds * 1000);
              return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
            };
  
            if (data.checkInTime && isToday(data.checkInTime)) {
              attendanceData[studentID].logInTime = formatTime(data.checkInTime);
            }
            if (data.checkOutTime && isToday(data.checkOutTime)) {
              attendanceData[studentID].logOutTime = formatTime(data.checkOutTime);
            }
          }
        });
  
        setAttendanceTimes(attendanceData);
      },
      (error) => {
        console.error("Error fetching attendance data:", error);
      }
    );
  
    return () => unsubscribe();
  }, [isToday]);
  

  const handleExcuse = async (uid, studentID) => {
    if (!uid || !studentID) {
      console.error("Error: uid or studentID is undefined, cannot update excuse.");
      alert("Error: Unable to excuse student. Missing information.");
      return;
    }
  
    try {
      const today = getTodayDate();
      const recordRef = doc(db, "record", `${uid}_${today}`);
  
      console.log("Attempting to update excuse for:", { uid, studentID, date: today });
  
      await setDoc(recordRef, { 
        uid, 
        studentID, 
        date: today, 
        excused: true 
      }, { merge: true });
  
      console.log("Excuse successfully recorded in Firestore");
  
      // Update local state to reflect excuse in real-time
      setAttendanceTimes((prev) => ({
        ...prev,
        [studentID]: { logInTime: "(Excused)", logOutTime: "(Excused)" }
      }));
  
      alert("Excuse recorded successfully.");
    } catch (error) {
      console.error("Error updating excuse status:", error);
      alert("Error: Failed to update excuse status.");
    }
  };
  
  return (
    <div className="container-class-box">
      <div className="classlist-title">
      <h2 className="title-class11">📋 Class List</h2>
      </div>
      {loading ? (
        <p className="no-data">Loading class list...</p>
      ) : error ? (
        <p className="no-data">{error}</p>
      ) : (
        <div className="class112">
          <div>
            <div className="genders-classlist-cont">
            <h3 className="section-title">👦 Boys</h3>
            </div>
            <div className="table-container">
              <table className="wclass">
                <thead className="classssd">
                  <tr>
                    <th className="qwee">Item No.</th>
                    <th className="qwee">Name</th>
                    <th className="qwee">Log In</th>
                    <th className="qwee">Log Out</th>
                    <th className="qwee">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {boys.length > 0 ? (
                    boys.map((student, index) => (
                      <tr key={student.id}>
                        <td className="tdwe">{index + 1}</td>
                        <td className="tdwe">{student.lastName}, {student.firstName}
                        </td>
                        <td className="tdwe">{attendanceTimes[student.studentID]?.logInTime || "-"}</td>
                        <td className="tdwe">{attendanceTimes[student.studentID]?.logOutTime || "-"}</td>
                        <td className="tdwe">
  {attendanceTimes[student.studentID]?.logInTime === "(Excused)" ? (
    <span className="excused-text">Excused</span> 
  ) : (
    <button onClick={() => handleExcuse(student.id, student.studentID)} className="excuse-btn">
      Excuse
    </button>
  )}
</td>

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
          <div className="genders-classlist-cont">
            <h3 className="section-title">👧 Girls</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="qwee">#</th>
                    <th className="qwee">Name</th>
                    <th className="qwee">Log In</th>
                    <th className="qwee">Log Out</th>
                  </tr>
                </thead>
                <tbody>
                  {girls.length > 0 ? (
                    girls.map((student, index) => (
                      <tr key={student.id}>
                        <td className="tdwe">{index + 1}</td>
                        <td className="tdwe">
                          {student.lastName}, {student.firstName}
                        </td>
                        <td className="tdwe">{attendanceTimes[student.studentID]?.logInTime || "-"}</td>
                        <td className="tdwe">{attendanceTimes[student.studentID]?.logOutTime || "-"}</td>
                        <td className="tdwe">
  {attendanceTimes[student.studentID]?.logInTime === "(Excused)" ? (
    <span className="excused-text">Excused</span> 
  ) : (
    <button onClick={() => handleExcuse(student.id, student.studentID)} className="excuse-btn">
      Excuse
    </button>
  )}
</td>

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

import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import "../Styles/Dashboard.css";
import ClassList from "./ClassList";
import Appeals from "./Appeals";
import ExcuseLetter from "./ExcuseLetter";
import { useNavigate } from "react-router-dom";
import QRScanner from "./QRScanner";
import SubjectTeacherList from "./SubjectTeacherList";
import "../Styles/admin.css";
import AttendanceLogs from "./AttendanceLog";
import ExcuseLetterList from "./ExcuseLetter";

const Dashboard = () => {
  const [userRole, setUserRole] = useState("Loading...");
  const [view, setView] = useState("dashboard");
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const role = userSnap.data().role || "No role assigned";
          setUserRole(role);
  
          // 🔹 Redirect unauthorized users away from Admin Dashboard
          if (role !== "Admin") {
            navigate("/dashboard"); // Redirect non-admins to their own dashboard
          }
        } else {
          console.error("User data not found in Firestore!");
          setUserRole("No role assigned");
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);
  return (
    <div className="MAIN-ROOT">
        
      {userRole === "Admin" ? (
        <>
          {/* Sidebar */}
          <div className="w-1/5 bg-blue-900 text-white p-4 min-h-screen">
          
            <div className="sidebar">
            <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("schedule")}>
              📅 Add Schedule
            </button>
            <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("classlist")}>
              📋 Class List
            </button>
            <button
        className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("scanner")}>
        📷 Time IN/OUT
      </button>
            <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("attendance-log")}>
               📊 Attendance Log
            </button>
            <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("excuse-letter")}>
              📄 Excuse Letters
            </button>
            <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("appeal")}>
              ⚖️ Appeals
            </button>
            <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("teachers")}>
              👨‍🏫 Subject Teachers
            </button>

            <button className="w-full bg-red-600 text-white font-bold p-2 my-1 rounded mt-4" onClick={() => auth.signOut().then(() => navigate("/login"))}>
              🚪 Log Out
            </button>
          </div>
          </div>

          {/* Main Content */}
          <div className="content-adminstyle">
          <h2 className="admin-title">Welcome, Admin!</h2>
            {view === "schedule" && <Schedule />}
            {view === "classlist" && <ClassList />}
            {view === "excuse" && <ExcuseLetter />}
            {view === "appeal" && <Appeals />}
            {view === "teachers" && <SubjectTeacherList />}
            {view === "scanner" && <QRScanner />}
            {view === "attendance-log" && <AttendanceLogs />}
            {view === "excuse-letter" && <ExcuseLetterList />}
          </div>
        </>
      ) : (
        <div className="p-6">
          <h1>Dashboard</h1>
          <div className="welcom-div-style">
          <h1 className="admin-h1-style">Welcome, {userRole}!</h1>
          </div>
          {userRole === "Student" && <p>You can check your attendance here.</p>}
          {userRole === "Adviser" && <p>Here’s your class list.</p>}
          {userRole === "Subject Teacher" && <p>Mark student attendance here.</p>}
          {userRole === "Parent" && <p>You can track your child's attendance.</p>}

          <button
  className="w-full bg-red-600 text-white font-bold p-2 my-1 rounded mt-4"
  onClick={async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }}
>
  🚪 Log Out
</button>
        </div>
      )}
    </div>
  );
};

// ======================== SCHEDULE COMPONENT ======================== //
const Schedule = () => {
  const [subject, setSubject] = useState("");
  const [time, setTime] = useState("");
  const [teacher, setTeacher] = useState("");
  const [scheduleList, setScheduleList] = useState([]);
  const [scheduleType, setScheduleType] = useState("MWF"); // Default to MWF
  const [editingId, setEditingId] = useState(null);

  // Function to handle deleting a schedule entry
  const handleDeleteSchedule = async (id) => {
    try {
      await deleteDoc(doc(db, "schedule", id));
      setScheduleList(scheduleList.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting schedule: ", error);
    }
  };

  // Function to handle editing a schedule entry
  const handleEditSchedule = (id) => {
    const scheduleToEdit = scheduleList.find((item) => item.id === id);
    if (scheduleToEdit) {
      setSubject(scheduleToEdit.subject);
      setTime(scheduleToEdit.time);
      setTeacher(scheduleToEdit.teacher);
      setScheduleType(scheduleToEdit.scheduleType);
      setEditingId(id); // Store the ID of the schedule being edited
    }
  };

  // Function to update a schedule entry
  const handleUpdateSchedule = async () => {
    if (!subject || !time || !teacher) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      await updateDoc(doc(db, "schedule", editingId), {
        subject,
        time,
        teacher,
        scheduleType,
      });

      setScheduleList(scheduleList.map((item) => (item.id === editingId ? { id: editingId, subject, time, teacher, scheduleType } : item)));

      // Reset fields after updating
      setSubject("");
      setTime("");
      setTeacher("");
      setScheduleType("MWF");
      setEditingId(null);
    } catch (error) {
      console.error("Error updating schedule: ", error);
    }
  };

  // Fetch existing schedule from Firestore
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        await auth.currentUser?.getIdToken(true); // Refresh token before fetching
        const querySnapshot = await getDocs(collection(db, "schedule"));
        const schedules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (schedules.length === 0) {
          console.warn("No schedules found in Firestore.");
        }

        // Sort schedules by the start time (earliest start time first)
        schedules.sort((a, b) => {
          // Get start times for comparison
          const startTimeA = parseTime(a.time.split(" - ")[0]);
          const startTimeB = parseTime(b.time.split(" - ")[0]);
          return startTimeA - startTimeB;
        });

        setScheduleList(schedules);
      } catch (error) {
        console.error("Error fetching schedules: ", error);
      }
    };

    fetchSchedule();
  }, []);

  // Add new schedule to Firestore
  const handleAddSchedule = async () => {
    if (!subject || !time || !teacher) {
      alert("Please fill in all fields!");
      return;
    }

    const newSchedule = { subject, time, teacher, scheduleType }; // Include scheduleType
    const docRef = await addDoc(collection(db, "schedule"), newSchedule);
    setScheduleList([...scheduleList, { id: docRef.id, ...newSchedule }]);
    setSubject("");
    setTime("");
    setTeacher("");
    setScheduleType("MWF"); // Reset to default
  };

  // Helper function to parse time strings like "7:30 AM" into Date objects
  const parseTime = (timeString) => {
    const [time, period] = timeString.split(" "); // Separate time and AM/PM
    let [hours, minutes] = time.split(":").map(Number); // Split time into hours and minutes

    // Adjust hours for AM/PM
    if (period === "PM" && hours !== 12) {
      hours += 12; // Convert PM to 24-hour format
    } else if (period === "AM" && hours === 12) {
      hours = 0; // Convert 12 AM to 00:00
    }

    // Create a Date object for comparison (using a fixed date since we only care about time)
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0); // Ignore seconds

    return date;
  };

  return (
    <div className="AddSchedule">
      <div className="addsubject">
        <h2 className="text-xl font-bold mb-4">📅 Add Schedule</h2>
      </div>
      <div className="Input-schedule">
        <input 
          type="text"
          placeholder="Subject Name"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input-type-design"
        />
        <input
          type="text"
          placeholder="Time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="input-type-design"
        />
        <input
          type="text"
          placeholder="Teacher"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
          className="input-type-design"
        />

        <div className="flex gap-2">
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          >
            <option value="MWF">MWF Schedule</option>
            <option value="T/TH">T/TH Schedule</option>
          </select>

          <button className="add" onClick={editingId ? handleUpdateSchedule : handleAddSchedule}>
            {editingId ? "Update Subject" : "Add Subject"}
          </button>

          <button className="cancel" onClick={() => { setSubject(""); setTime(""); setTeacher(""); }}>
            Cancel
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      {["MWF", "T/TH"].map((type) => (
        <div key={type}>
          <h3 className="text-lg font-bold mt-4">📅 {type} Schedule</h3>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Subject</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Teacher</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduleList
                .filter((item) => item.scheduleType === type)
                .map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="border p-2">{item.subject}</td>
                    <td className="border p-2">{item.time}</td>
                    <td className="border p-2">{item.teacher}</td>
                    <td className="actions">
                      <button
                        className="edit-btn bg-yellow-500 text-white p-1 rounded mr-2"
                        onClick={() => handleEditSchedule(item.id)}
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn bg-red-500 text-white p-1 rounded"
                        onClick={() => handleDeleteSchedule(item.id)}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
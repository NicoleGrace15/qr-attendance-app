import React, { useEffect, useState } from "react"; 
import { auth, db } from "../firebase"; 
import { doc, getDoc } from "firebase/firestore"; 
import { signOut } from "firebase/auth"; 
import ClassList from "./ClassList"; 
import "../Styles/adviser.css"; 
import ExcuseLetter from "./ExcuseLetter";
import AttendanceLogs from "./AttendanceLog";

const AdviserDashboard = () => {
  const [adviserName, setAdviserName] = useState(""); 
  const [view, setView] = useState("adviser");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser; 
      if (user) { 
        const userDoc = await getDoc(doc(db, "users", user.uid)); 
        if (userDoc.exists()) { 
          setAdviserName(userDoc.data().firstName); 
        } 
      } 
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      window.location.href = "/"; 
    } catch (error) { 
      console.error("Logout failed:", error.message); 
    } 
  };

  return (
    <div className="Main-contaienr">
      <div className="Button-Container">
      <button onClick={() => setView("excuse-letter")}>Excuse Letters</button>
      <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("attendance-log")}>
               📊 Attendance Log
            </button>
      <button 
      
        onClick={handleLogout} 
        className="logout-btn" 
      >
        Logout
      </button>
      </div>
      <div className="content-adviser">
        {view === "classlist" && <ClassList />}
        {view === "excuse-letter" && <ExcuseLetter />}
        {view === "attendance-log" && <AttendanceLogs />}
      </div>

      <div className="container-adviser">
        <h1>Welcome, Teacher {adviserName}</h1>
        <h2>Here's your class list:</h2>
        <ClassList />
      </div>
    </div>
  );
};

export default AdviserDashboard;

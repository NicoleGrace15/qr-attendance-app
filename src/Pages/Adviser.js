import React, { useEffect, useState } from "react"; 
import { auth, db } from "../firebase"; 
import { doc, getDoc } from "firebase/firestore"; 
import ClassList from "./ClassList"; 
import "../Styles/adviser.css"; 
import AttendanceLogs from "./AttendanceLog";
import { useNavigate } from "react-router-dom";
import ExcuseLetterList from "./ExcuseLetter";



const Adviser = () => {
  const [view, setView] = useState("adviser");
  const [adviserName, setAdviserName] = useState(""); 
  const navigate = useNavigate();
  
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



  return (
    <div className="adviser-container"> {/* Root Container */}
      <div>
        <h1 className="h1-adviser-title">Welcome, Teacher {adviserName}</h1>
      </div>
      {/* Sidebar Section */}
      <div className="sidebar">
        <button
          className="sidebar-btn"
          onClick={() => setView("classlist")}
        >
          📋 Class List
        </button>
        <button
          className="sidebar-btn"
          onClick={() => setView("excuse-letter")}
        >
          📄 Excuse Letters
        </button>
        <button
          className="sidebar-btn"
          onClick={() => setView("attendance-log")}
        >
          📊 Attendance Log
        </button>
        <button
          className="logout-btn"
          onClick={() => auth.signOut().then(() => navigate("/login"))}
        >
          🚪 Log Out
        </button>
      </div>
  
      {/* Main Content Section */}
      <div className="content">
        {view === "classlist" && <ClassList />}
        {view === "excuse-letter" && <ExcuseLetterList />}
        {view === "attendance-log" && <AttendanceLogs />}
      </div>
    </div>
  )}
  
export default Adviser;
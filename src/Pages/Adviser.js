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
    <div className="flex h-screen">
        
          <div className="w-1/5 bg-blue-900 text-white p-4 min-h-screen">
          <h1>Welcome, Teacher {adviserName}</h1>
            <div className="sidebar">
            <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("classlist")}>
              📋 Class List
            </button>
            <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("attendance-log")}>
               📊 Attendance Log
            </button>
            <button className="w-full bg-white text-blue-900 font-bold p-2 my-1 rounded" onClick={() => setView("excuse-letter")}>
              📄 Excuse Letters
            </button>
            <button className="w-full bg-red-600 text-white font-bold p-2 my-1 rounded mt-4" onClick={() => auth.signOut().then(() => navigate("/login"))}>
              🚪 Log Out
            </button>
          </div>
          </div>

          {/* Main Content */}
          <div className="content">
            <div className="Display-container-adviser">
            {view === "classlist" && <ClassList />}
            </div>
            <div className="Display-container-adviser">
            {view === "excuse-letter" && <ExcuseLetterList />}
            </div>
            <div className="Display-container-adviser">
            {view === "attendance-log" && <AttendanceLogs />}
            </div>
            

      

          </div>
     
  
        </div>
      )}








export default Adviser;
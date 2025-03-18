import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";
import Dashboard from "./Pages/Admin";
import QRScanner from "./Pages/QRScanner";
import StudentDashboard from "./Pages/studentDashboard";
import ClassList from "./Pages/ClassList";
import Appeals from "./Pages/Appeals";
import SubjectTeacher from "./Pages/SubjectTeachers";
import SubjectTeacherList from "./Pages/SubjectTeacherList";
import Adviser from "./Pages/Adviser";
import Parent from "./Pages/Parents";
import AttendanceLogs from "./Pages/AttendanceLog";
import ExcuseLetterList from "./Pages/ExcuseLetter";

function App() {
  return (
    <div 
      className="app-background"
      style={{
        position: 'fixed',  /* Ensures full-screen coverage */
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: `url('/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        margin: 0,   /* Removes extra space */
        padding: 0   /* Ensures no unwanted padding */
      }}
    >
      {/* 🔹 Overlay for improved readability */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',  /* Softer overlay for better visibility */
          zIndex: 0  /* Ensures it stays below the content */
        }}
      />

      {/* 🔹 Main content with zIndex to stay above overlay */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/studentdashboard" element={<StudentDashboard />} />
          <Route path="/classlist" element={<ClassList />} />
          <Route path="/appeals" element={<Appeals />} />
          <Route path="/subject-teacher-dashboard" element={<SubjectTeacher />} />
          <Route path="/subject-teacher-list" element={<SubjectTeacherList />} />
          <Route path="/adviser-dashboard" element={<Adviser />} />
          <Route path="/parent" element={<Parent />} />
          <Route path="/attendance-log" element={<AttendanceLogs />} />
          <Route path="/excuse-letter" element={<ExcuseLetterList />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

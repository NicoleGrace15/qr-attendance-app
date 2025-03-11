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
import  Parent from "./Pages/Parents";
import AttendanceLogs from "./Pages/AttendanceLog";
import ExcuseLetterList from "./Pages/ExcuseLetter";

function App() {
  return (
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
  );
}

export default App;

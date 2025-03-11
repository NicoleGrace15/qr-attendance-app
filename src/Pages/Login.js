import React, { useState } from "react";
import { auth, db } from "../firebase"; // Import Firestore
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const email = `${username}@example.com`; 
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Navigate based on role
       // Navigate based on role
if (userData.role === "Admin") {
  navigate("/dashboard");
} else if (userData.role === "Student") {
  navigate("/studentdashboard");
} else if (userData.role === "Subject Teacher") {
  navigate("/subject-teacher-dashboard"); // ✅ Redirect Subject Teacher
} else if (userData.role === "Adviser") {
  navigate("/adviser-dashboard"); // ✅ Redirect Adviser
} else if (userData.role === "Parent") {
  navigate("/parent"); // ✅ Redirect Parent
} else {
  alert("Invalid role assigned to this user.");
}

      } else {
        alert("User not found in database.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancel = () => {
    navigate("/"); 
  };

  return (
    <div className="container-login">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input className="input-login-1" type="username" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required/>
        <input className="input-login-1" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <button className="button-login" type="submit">Login</button>
        <button className="button-login" type="button" onClick={handleCancel}>Cancel</button>
      </form>
    </div>
  );
};       

export default Login;

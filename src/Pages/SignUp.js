import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../Styles/signup.css";

function Signup() {
  // User account details
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student"); // Default role: Student

  // Personal details (for all roles)
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  // Student-specific fields
  const [gradeLevel, setGradeLevel] = useState("Grade 12");
  const [section, setSection] = useState("Feynman");
  const [studentID, setStudentID] = useState("");
  const [gender, setGender] = useState("Male"); // Default to Male
  // Parent Information (Father)
const [fatherFirstName, setFatherFirstName] = useState("");
const [fatherMiddleName, setFatherMiddleName] = useState("");
const [fatherLastName, setFatherLastName] = useState("");

// Parent Information (Mother)
const [motherFirstName, setMotherFirstName] = useState("");
const [motherMiddleName, setMotherMiddleName] = useState("");
const [motherLastName, setMotherLastName] = useState("");

 
 



  // Parent-specific fields
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentMiddleName, setParentMiddleName] = useState("");
  const [parentLastName, setParentLastName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // Adviser-specific fields
  const [sectionHandled, setSectionHandled] = useState("Feynman");

  // Subject Teacher-specific fields
  const [subjectHandled, setSubjectHandled] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async () => {
    // Basic validation for username and password
    if (!username.trim()) {
      alert("Username is required.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      alert("First and Last Name are required.");
      return;
    }

    // Role-based validation
    if (role === "Student") {
      if (
        !studentID.trim() ||
        !fatherFirstName.trim() || !fatherLastName.trim() ||
        !motherFirstName.trim() || !motherLastName.trim()
      ) {
        alert("Student ID and both parents' details are required.");
        return;
      }
    }
    if (role === "Adviser" && !sectionHandled) {
      alert("Section handled is required for advisers.");
      return;
    }
    if (role === "Subject Teacher" && !subjectHandled.trim()) {
      alert("Subject handled is required for subject teachers.");
      return;
    }
    if (role === "Parent" && (!parentFirstName.trim() || !parentLastName.trim() || !address.trim() || !contactNumber.trim())) {
      alert("Parent details, address, and contact number are required.");
      return;
    }

    try {
      const email = `${username}@example.com`; // Dummy email for Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        username,
        uid: user.uid,
        role,
        firstName,
        middleName,
        lastName,
      };

      if (role === "Student") {
        userData.gradeLevel = gradeLevel;
        userData.section = section;
        userData.studentID = studentID;
        userData.parents = {
          father: {
            firstName: fatherFirstName,
            middleName: fatherMiddleName,
            lastName: fatherLastName,
          },
          mother: {
            firstName: motherFirstName,
            middleName: motherMiddleName,
            lastName: motherLastName,
          }
        };
      } else if (role === "Adviser") {
        userData.sectionHandled = sectionHandled;
      } else if (role === "Subject Teacher") {
        userData.subjectHandled = subjectHandled;
      } else if (role === "Parent") {
        userData.address = address;
        userData.contactNumber = contactNumber;
        userData.childFirstName = parentFirstName;
        userData.childMiddleName = parentMiddleName;
        userData.childLastName = parentLastName;
      }

      // Save user details in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      alert("Sign-up successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      alert(error.message);
    }
  };


  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="container-SignUp">
      <h2>Sign Up</h2>
      <input className="input-signup"  type="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input className="input-signup" type="password" placeholder="Password (Min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />

      <h3>Personal Information</h3>
      <input className="input-signup" type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      <input className="input-signup" type="text" placeholder="Middle Name (Optional)" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
      <input className="input-signup" type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      
      <div className="Role-container">
      <h3>Role</h3>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Student">Student</option>
        <option value="Adviser">Adviser</option>
        <option value="Subject Teacher">Subject Teacher</option>
        <option value="Parent">Parent</option>
        <option value="Admin">Admin</option>
      </select>
      </div>

      {/* Student Fields */}
{role === "Student" && (
  <>
  <div className="studentinfo">
    <input 
      type="text" 
      placeholder="Student ID" 
      value={studentID} 
      onChange={(e) => setStudentID(e.target.value)} 
      required 
    />
    
    <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} required>
      <option value="" disabled>Select Grade Level</option>
      <option value="Grade 12">Grade 12</option>
    </select>

    <select value={gender} onChange={(e) => setGender(e.target.value)} required>
      <option value="" disabled>Select Gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>

    <select value={section} onChange={(e) => setSection(e.target.value)} required>
      <option value="" disabled>Select Section</option>
      <option value="Feynman">Feynman</option>
      <option value="Turing">Turing</option>
      <option value="Pasteur">Pasteur</option>
    </select>
    </div>
<div className="studentparentinfo">

  <div className="fathercontainer">
    {/* Parent Information */}
    <h4>Parent Information</h4>
    <input 
  type="text" 
  placeholder="Father's First Name" 
  value={fatherFirstName} 
  onChange={(e) => setFatherFirstName(e.target.value)} 
  required 
/>
<input 
  type="text" 
  placeholder="Father's Middle Name" 
  value={fatherMiddleName} 
  onChange={(e) => setFatherMiddleName(e.target.value)} 
/>
<input 
  type="text" 
  placeholder="Father's Last Name" 
  value={fatherLastName} 
  onChange={(e) => setFatherLastName(e.target.value)} 
  required 
/>
</div>
<div className="mothercontainer">
{/* Mother's Name */}
<input 
  type="text" 
  placeholder="Mother's First Name" 
  value={motherFirstName} 
  onChange={(e) => setMotherFirstName(e.target.value)} 
  required 
/>
<input 
  type="text" 
  placeholder="Mother's Middle Name" 
  value={motherMiddleName} 
  onChange={(e) => setMotherMiddleName(e.target.value)} 
/>
<input 
  type="text" 
  placeholder="Mother's Last Name" 
  value={motherLastName} 
  onChange={(e) => setMotherLastName(e.target.value)} 
  required 
/>
</div>

</div></>
)}


      {/* Adviser Fields */}
      {role === "Adviser" && (
        <select value={sectionHandled} onChange={(e) => setSectionHandled(e.target.value)}>
          <option value="Feynman">Feynman</option>
          <option value="Turing">Turing</option>
          <option value="Pasteur">Pasteur</option>
        </select>
      )}

      {/* Subject Teacher Fields */}
      {role === "Subject Teacher" && (
        <input type="text" placeholder="Subject Handled" value={subjectHandled} onChange={(e) => setSubjectHandled(e.target.value)} required />
      )}

      {/* Parent Fields */}
      {role === "Parent" && (
        <>
          <input type="text" placeholder="Child's First Name" value={parentFirstName} onChange={(e) => setParentFirstName(e.target.value)} required />
          <input type="text" placeholder="Child's Middle Name (Optional)" value={parentMiddleName} onChange={(e) => setParentMiddleName(e.target.value)} />
          <input type="text" placeholder="Child's Last Name" value={parentLastName} onChange={(e) => setParentLastName(e.target.value)} required />
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
        </>
      )}

      <button onClick={handleSignUp}>Sign Up</button>
      <button type="button" onClick={handleCancel}>Cancel</button>
    </div>
  );
}

export default Signup;

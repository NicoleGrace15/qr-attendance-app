import React, { useState, useEffect } from "react";
import { db, auth} from "../firebase"; // Ensure Firebase is configured properly
import {
  doc,
  updateDoc,
  collection,
  onSnapshot,
  addDoc, getDoc,
  query, where
} from "firebase/firestore";
import { updatePassword, signOut } from "firebase/auth";
import "../Styles/student.css";


  const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setStudentID] = useState("");

  // appeal button 
  const [appealMessage, setAppealMessage] = useState("");
  const [isAppealOpen, setIsAppealOpen] = useState(false);

    // Upload excuse letter state
    const [excuseFile, setExcuseFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);

// edit profile button
  const [editMode, setEditMode] = useState(false);
const [updatedProfile, setUpdatedProfile] = useState({
  firstName: "",
  middleName: "",
  lastName: "",
  fatherFirstName: "",
  fatherMiddleName: "",
  fatherLastName: "",
  motherFirstName: "",
  motherMiddleName: "",
  motherLastName: "",
  gradeLevel: "",
  section: "",
});

// log out
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully");
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  // change password

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
const [oldPassword, setOldPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

// upload file


// Utility function to determine the current day type
const getTodayScheduleType = () => {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  if (today === 1 || today === 3 || today === 5) return "MWF"; // Monday, Wednesday, Friday
  if (today === 2 || today === 4) return "T/TH"; // Tuesday, Thursday
  return "NONE"; // Weekends or unhandled cases
};


useEffect(() => {
  const fetchSchedule = async () => {
    try {
      const scheduleRef = collection(db, "schedule");

      onSnapshot(scheduleRef, (snapshot) => {
        if (!snapshot.empty) {
          const scheduleData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSchedule(scheduleData);
          console.log("Fetched schedule:", scheduleData);
        } else {
          console.log("No schedules found");
        }
      });
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  fetchSchedule();
  console.log("Current User:", auth.currentUser);
}, []); // ✅ First useEffect is now correct

useEffect(() => {
  if (!auth.currentUser) return;

  const studentID = auth.currentUser.uid; // Ensure this matches Firestore's "studentID"

  const attendanceQuery = query(
    collection(db, "attendance"),
    where("studentID", "==", studentID)
  );

  const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
    let attendanceData = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subject) {
        attendanceData[data.subject] = data.status; // Store subject-wise attendance
      } else {
        console.error("Missing subject field in attendance data:", data);
      }
    });

    console.log("Updated Attendance Records:", attendanceData);
    setAttendanceRecords(attendanceData); // ✅ Ensure state updates
  });

  return () => unsubscribe(); // Cleanup listener on unmount
}, []);

useEffect(() => {
  const fetchStudentData = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setStudentID(userData.studentID || "Unknown ID"); // ✅ Store student ID

        // ✅ Fetch Today's Attendance Records
        const today = new Date().toISOString().split('T')[0]; // Format: "YYYY-MM-DD"

        const attendanceQuery = query(
          collection(db, "attendance"),
          where("studentID", "==", userData.studentID)
        );

        onSnapshot(attendanceQuery, (snapshot) => {
          let records = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.date === today && data.subject) {
              records[data.subject] = data.status;
            }
          });

          setAttendanceRecords(records); // ✅ Store attendance records for today
        });
      } else {
        console.warn("No student data found for this user.");
      }
    } catch (error) {
      console.error("Error fetching student data or attendance:", error);
    }
  };

  fetchStudentData();
}, []); // ✅ Runs once when the component mounts

  

useEffect(() => {
  const fetchAttendance = async () => {
    if (!auth.currentUser) return;

    try {
      // Get user document
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("User data not found.");
        return;
      }

      const studentID = userSnap.data().studentID;
      if (!studentID) {
        console.error("Student ID is missing in user data.");
        return;
      }

      // Query attendance collection
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("studentID", "==", studentID)
      );

      const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
        if (snapshot.empty) {
          console.log("No attendance records found.");
          setAttendanceRecords({});
          return;
        }

        let attendanceData = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.subject && data.status) {
            attendanceData[data.subject] = data.status;
          } else {
            console.error("Invalid attendance record:", data);
          }
        });

        console.log("Updated Attendance Records:", attendanceData);
        setAttendanceRecords(attendanceData);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  fetchAttendance();
}, []);

 // ✅ Second useEffect is now separate

  

 const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  // Check if file type is PNG
  if (file.type !== "image/png") {
    alert("Only PNG files are allowed.");
    return;
  }

  // Check if file size is within 5MB
  if (file.size > 5 * 1024 * 1024) {
    alert("File size must be 5MB or less.");
    return;
  }

  // Convert to Base64
  const reader = new FileReader();
  reader.readAsDataURL(file); // Convert the file to Base64
  reader.onloadend = () => {
    setExcuseFile(reader.result); // Store the Base64 string
  };
};

const handleUploadExcuse = async () => {
  if (!excuseFile) {
    alert("Please select a file before submitting.");
    return;
  }

  if (!auth.currentUser) {
    alert("User not authenticated!");
    return;
  }

  setIsUploading(true);

  try {
    // 🔍 Fetch student details from Firestore using UID
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User data not found!");
      setIsUploading(false);
      return;
    }

    const userData = userSnap.data();
    const studentID = userData.studentID || "Unknown ID"; // Fetch studentID

    console.log("Fetched Student ID:", studentID); // Debugging log

    // ✅ Now we USE studentID when storing data
    await addDoc(collection(db, "excuse_letters"), {
      userId: auth.currentUser.uid,
      studentID: studentID,  // ✅ No more ESLint warning since we're using it!
      excuseFile,
      timestamp: new Date(),
    });

    alert("Excuse letter uploaded successfully.");
    setExcuseFile(null);
    setIsExcuseModalOpen(false);
  } catch (error) {
    console.error("Error uploading excuse letter:", error);
  } finally {
    setIsUploading(false);
  }
};



  const handleProfileUpdate = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid); // Adjust collection name if necessary
      await updateDoc(userRef, updatedProfile);
      setUser(updatedProfile);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };
  

  const handleChangePassword = async () => {
    if (!auth.currentUser) {
      alert("No user is logged in.");
      return;
    }
  
    if (newPassword === oldPassword) {
      alert("New password must be different from the old password");
      return;
    }
  
    // Password validation (1 uppercase, 1 lowercase, 1 number, 1 special character, at least 8 characters)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("Password must have at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 8 characters long.");
      return;
    }
  
    try {
      // Update password in Firebase Authentication
      await updatePassword(auth.currentUser, newPassword);
  
      // Update Firestore with timestamp
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        passwordUpdatedAt: new Date().toISOString(), // Store timestamp
      });
  
      alert("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password: " + error.message);
    }
  };
  

 
  
  const handleAppealSubmit = async () => {
    if (!appealMessage.trim()) {
      alert("Appeal message cannot be empty.");
      return;
    }
    if (appealMessage.length > 1000) {
      alert("Appeal must be under 1000 characters.");
      return;
    }
    try {
      await addDoc(collection(db, "appeals"), {
        userId: auth.currentUser.uid,
        message: appealMessage,
        timestamp: new Date(),
      });
      alert("Appeal submitted successfully.");
      setAppealMessage(""); // Reset input field
      setIsAppealOpen(false); // Close appeal form
    } catch (error) {
      console.error("Error submitting appeal:", error);
      alert("Failed to submit appeal.");
    }
  };
  

  return (
    <div className="Main-content-student-dashboard">
    <div className="student-dashboard-design">
      <h2>Welcome, {user?.firstName || "Student"}!</h2>

      
      {editMode && (
  <div className="edit-profile">
    <h3>Edit Profile</h3>
    <label>First Name: <input type="text" value={updatedProfile.firstName} onChange={(e) => setUpdatedProfile({ ...updatedProfile, firstName: e.target.value })} /></label>
    <label>Middle Name: <input type="text" value={updatedProfile.middleName} onChange={(e) => setUpdatedProfile({ ...updatedProfile, middleName: e.target.value })} /></label>
    <label>Last Name: <input type="text" value={updatedProfile.lastName} onChange={(e) => setUpdatedProfile({ ...updatedProfile, lastName: e.target.value })} /></label>
    <label>Grade Level: <input type="text" value={updatedProfile.gradeLevel} onChange={(e) => setUpdatedProfile({ ...updatedProfile, gradeLevel: e.target.value })} /></label>
    <label>Section: <input type="text" value={updatedProfile.section} onChange={(e) => setUpdatedProfile({ ...updatedProfile, section: e.target.value })} /></label>


    <h4>Father's Information</h4>
    <label>First Name: <input type="text" value={updatedProfile.fatherFirstName} onChange={(e) => setUpdatedProfile({ ...updatedProfile, fatherFirstName: e.target.value })} /></label>
    <label>Middle Name: <input type="text" value={updatedProfile.fatherMiddleName} onChange={(e) => setUpdatedProfile({ ...updatedProfile, fatherMiddleName: e.target.value })} /></label>
    <label>Last Name: <input type="text" value={updatedProfile.fatherLastName} onChange={(e) => setUpdatedProfile({ ...updatedProfile, fatherLastName: e.target.value })} /></label>

    <h4>Mother's Information</h4>
    <label>First Name: <input type="text" value={updatedProfile.motherFirstName} onChange={(e) => setUpdatedProfile({ ...updatedProfile, motherFirstName: e.target.value })} /></label>
    <label>Middle Name: <input type="text" value={updatedProfile.motherMiddleName} onChange={(e) => setUpdatedProfile({ ...updatedProfile, motherMiddleName: e.target.value })} /></label>
    <label>Last Name: <input type="text" value={updatedProfile.motherLastName} onChange={(e) => setUpdatedProfile({ ...updatedProfile, motherLastName: e.target.value })} /></label>

    
    <button onClick={handleProfileUpdate}>Save Changes</button>
    <button onClick={() => setEditMode(false)}>Cancel</button>

   


  </div>
)}

{isChangePasswordOpen && (
  <div className="change-password-modal">
    <h3>Change Password</h3>
    <label>Old Password:</label>
    <input
      type="password"
      value={oldPassword}
      onChange={(e) => setOldPassword(e.target.value)}
    />
    
    <label>New Password:</label>
    <input
      type="password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />

    <label>Confirm New Password:</label>
    <input
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />

    <button onClick={handleChangePassword}>Update Password</button>
    <button onClick={() => setIsChangePasswordOpen(false)}>Cancel</button>
  </div>

)}

 {/* 🚀 Excuse Letter Upload Modal */}
 {isExcuseModalOpen && (
        <div className="modal">
          <h3>Upload Excuse Letter</h3>
          <input type="file" onChange={handleFileChange} accept=".png" />
          <div className="modal-buttons">
            <button onClick={handleUploadExcuse} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Submit"}
            </button>
            <button onClick={() => setIsExcuseModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    



{isAppealOpen && (
  <div className="appeal-modal">
    <h3>Submit Attendance Appeal</h3>
    <textarea
      rows="4"
      placeholder="Explain why your attendance record is incorrect..."
      value={appealMessage}
      onChange={(e) => setAppealMessage(e.target.value)}
    />
    <div className="Appeal-buttons">
    <button onClick={handleAppealSubmit}>Submit</button>
    <button onClick={() => setIsAppealOpen(false)}>Cancel</button>
  </div>
  </div>
)}


      <button onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      {menuOpen && (
        <div className="menu">
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
          <button onClick={() => setIsChangePasswordOpen(true)}>Change Password</button>
          <button onClick={() => setIsExcuseModalOpen(true)}>Upload Excuse Letter</button>
          <button onClick={() => setIsAppealOpen(true)}>Submit Appeal</button>
          <button onClick={handleLogout}>Log Out</button>

        </div>
      )}
      
      <h3>Schedule</h3>



{/* Table for TTH */}
{/* MWF Schedule */}
<h4>Monday-Wednesday-Friday (MWF)</h4>
<table border="1">
  <thead>
    <tr>
      <th>Subject</th>
      <th>Time</th>
      <th>Teacher</th>
      <th>Attendance</th>
    </tr>
  </thead>
  <tbody>
    {getTodayScheduleType() === "MWF" ? (
      schedule.filter(item => item.scheduleType === "MWF").map((item) => (
        <tr key={item.id}>
          <td>{item.subject}</td>
          <td>{item.time}</td>
          <td>{item.teacher}</td>
          <td>
            {attendanceRecords[item.subject] ? (
              <>
                {attendanceRecords[item.subject]} <br />
                {attendanceRecords[item.subject] === "Absent" ? " (Unexcused)" : ""}
              </>
            ) : "-"}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="4" style={{ textAlign: "center" }}>No MWF classes scheduled today.</td>
      </tr>
    )}
  </tbody>
</table>

{/* TTH Schedule */}
<h4>Tuesday-Thursday (TTH)</h4>
<table border="1">
  <thead>
    <tr>
      <th>Subject</th>
      <th>Time</th>
      <th>Teacher</th>
      <th>Attendance</th>
    </tr>
  </thead>
  <tbody>
    {getTodayScheduleType() === "T/TH" ? (
      schedule.filter(item => item.scheduleType === "T/TH").map((item) => (
        <tr key={item.id}>
          <td>{item.subject}</td>
          <td>{item.time}</td>
          <td>{item.teacher}</td>
          <td>
            {attendanceRecords[item.subject] ? (
              <>
                {attendanceRecords[item.subject]} <br />
                {attendanceRecords[item.subject] === "Absent" ? " (Unexcused)" : ""}
              </>
            ) : "-"}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="4" style={{ textAlign: "center" }}>No T/TH classes scheduled today.</td>
      </tr>
    )}
  </tbody>
</table>


</div>
    </div>
  );
};
  

export default StudentDashboard;

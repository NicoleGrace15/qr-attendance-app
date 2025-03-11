import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

const SubjectTeacherList = () => {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "Subject Teacher"));
        const querySnapshot = await getDocs(q);

        let teacherData = [];

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          const uid = docSnap.id;

          // Fetch last login timestamp from sbteachers-activity
          const activityDocRef = doc(db, "sbteachers-activity", uid);
          const activityDocSnap = await getDoc(activityDocRef);

          let lastLoginTime = "No login data";

          if (activityDocSnap.exists()) {
            const activityData = activityDocSnap.data();
            if (activityData.lastLogin) {
              const dateObj = activityData.lastLogin.toDate();
              lastLoginTime = dateObj.toLocaleString(); // Convert to readable date/time
            }
          }

          teacherData.push({
            id: uid,
            name: `${data.lastName}, ${data.firstName}`,
            subjects: Array.isArray(data.subjectHandled)
              ? data.subjectHandled
              : [data.subjectHandled],
            lastLogin: lastLoginTime,
          });
        }

        // Sort teachers alphabetically by last name
        teacherData.sort((a, b) => a.name.localeCompare(b.name));

        setTeachers(teacherData);
      } catch (error) {
        console.error("Error fetching subject teachers:", error);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div>
      <h2>Subject Teacher List</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Subject 1</th>
            <th>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td>{teacher.name}</td>
              <td>{teacher.subjects[0] || "N/A"}</td>
              <td>{teacher.lastLogin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectTeacherList;

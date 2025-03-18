import { React, useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { format } from "date-fns"; 
import html2pdf from "html2pdf.js"; // Import html2pdf.js for the table-to-PDF conversion
import "../Styles/attendancelogs.css";

const AttendanceLogs = () => {
  const [subjects, setSubjects] = useState({ MWF: [], TTH: [] });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const [showTable, setShowTable] = useState(true); 


  useEffect(() => {
    fetchSubjects();
    generateWeekDates();
  }, []);

  const fetchSubjects = async () => {
    try {
      const scheduleSnapshot = await getDocs(collection(db, "schedule"));
      const categorizedSubjects = { MWF: [], TTH: [] };

      scheduleSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Fetched Subject Data:", data); // Debugging log

        if (data.subject && data.scheduleType) {
          if (data.scheduleType === "MWF") {
            categorizedSubjects.MWF.push(data.subject);
          } else if (data.scheduleType === "T/TH") {  // ✅ Fixed mismatch
            categorizedSubjects.TTH.push(data.subject);
          }
        }
      });

      console.log("Final Categorized Subjects:", categorizedSubjects); // Debugging log

      setSubjects(categorizedSubjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const generateWeekDates = () => {
    const today = new Date();
    const weekStart = new Date(today);
  
    // Always start from Monday of the **current** week
    const day = today.getDay();
    if (day !== 1) {
      weekStart.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    }
  
    // Ensure the MWF schedule persists until Sunday
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dates = weekDays.map((_, index) => {
      const newDate = new Date(weekStart);
      newDate.setDate(weekStart.getDate() + index);
      return format(newDate, "yyyy-MM-dd"); 
    });
  
    setWeekDates(dates);
    console.log("Updated Week Dates:", dates);
  };
  

  const fetchAttendanceForSubject = async (subject) => {
    try {
      console.log(`Fetching attendance for subject: ${subject}`);
  
      // Normalize subject name
      const normalizedSubject = subject.trim(); // Trim whitespace
  
      const q = query(
        collection(db, "attendance"),
        where("subject", "==", normalizedSubject)
      );
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.warn(`No attendance records found for subject: ${normalizedSubject}`);
      }
  
      let data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        let formattedDate = docData.date;
  
        // Convert Firestore Timestamp to string if needed
        if (docData.date && docData.date.toDate) {
          formattedDate = format(docData.date.toDate(), "yyyy-MM-dd");
        }
  
        return {
          ...docData,
          date: formattedDate,
        };
      });
  
      console.log("Raw Attendance Data:", data);
  
      // Filter records only for this week's dates
      const filteredData = data.filter((record) => weekDates.includes(record.date));
  
      console.log("Filtered Attendance Data:", filteredData);
  
      if (filteredData.length === 0) {
        console.warn("No attendance records match this week's dates.");
      }
  
      const attendanceMap = {};
      filteredData.forEach((record) => {
        const studentName = record.name;
        if (!attendanceMap[studentName]) {
          attendanceMap[studentName] = {};
        }
        attendanceMap[studentName][record.date] = record.status;
      });
  
      const finalAttendanceData = Object.entries(attendanceMap).map(([name, records]) => ({
        name: name.toUpperCase(),  // Convert name to uppercase
        records,
      }));

      // Sort by studentID (assuming you have studentID in the records)
      finalAttendanceData.sort((a, b) => {
        const studentIDa = a.records.studentID || "";  // Assuming studentID is part of the records
        const studentIDb = b.records.studentID || "";
        return studentIDa.localeCompare(studentIDb);  // Sorting by studentID
      });
      setShowTable(true);  // Show table when attendance data is fetched
      setAttendanceData(finalAttendanceData);
      setSelectedSubject(subject);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
    }
  };
  const handleBack = () => {
    setShowTable(false);  // Hide the attendance table
};

  const printPDF = () => {
    const element = document.getElementById("attendance-table");
    
    if (!element) {
      console.error("Element not found!");
      return;
    }
  
    // Create a new div that will hold the subject name and the table
    const subjectNameDiv = document.createElement("div");
    subjectNameDiv.style.textAlign = "center";  // Center-align the subject name
    subjectNameDiv.style.fontSize = "20px";     // Increase the font size of the subject name
    subjectNameDiv.style.marginBottom = "10px"; // Add some spacing
  
    const subjectNameText = `Subject: ${selectedSubject}`;  // Set the subject name
    subjectNameDiv.textContent = subjectNameText;           // Add the subject text to the div
  
    // Get the container of the table
    const tableContainer = document.createElement("div");
    tableContainer.appendChild(subjectNameDiv);  // Append the subject name div to the table container
    tableContainer.appendChild(element.cloneNode(true));  // Clone the table (to keep the original intact)
  
    // Now generate the PDF with both the subject name and the table
    const options = {
      margin: 1,
      filename: 'attendance_log.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
  
    html2pdf()
      .from(tableContainer)  // Use the new container with both subject name and table
      .set(options)
      .save()
      .then(() => {
        console.log("PDF generated successfully!");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };
 
  return (
    <div className="Attendance-logs-box">
      <h2 className="kdnad">📋 Attendance Log</h2>
      <div className="mwf-attendance-box">
        <h3 className="djansk">📌 MWF Subjects</h3>
        <ul>
          {subjects.MWF.map((subject, index) => (
            <li key={index}>
              <button className="subject-button-attendance" onClick={() => fetchAttendanceForSubject(subject)}>{subject}</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="t-th-attendance-box">  {/* ✅ Fixed class name */}
        <h3>📌 T/TH Subjects</h3>
        <ul>
          {subjects.TTH.map((subject, index) => (
            <li key={index}>
              <button className="subject-button-attendance" onClick={() => fetchAttendanceForSubject(subject)}>{subject}</button>
            </li>
          ))}
        </ul>
      </div>

      {showTable && selectedSubject &&(
        <div>
          <h1 className="kkmanwk">{selectedSubject} Weekly Attendance</h1>
          <table id="attendance-table"  border="1">
            <thead>
              <tr>
                <th>Name</th>
                {weekDates.map((date, index) => (
                  <th key={index}>{date}</th>
                ))}
              </tr>
            </thead>
            <tbody>
  {attendanceData.length > 0 ? (
    attendanceData.map((record, idx) => (
      <tr className="rared" key={idx}>
        <td className="lolppsd">{record.name}</td>
        {weekDates.map((date, index) => (
          <td className="lolppsd"cl key={index}>
            {record.records[date] ? record.records[date] : "-"} {/* ✅ Ensures proper mapping */}
          </td>
        ))}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={weekDates.length + 1}>No attendance records found.</td>
    </tr>
  )}
</tbody>

          </table>
          <button className="hasvsdhawvd"onClick={printPDF}>Download</button> {/* PDF Print Button */}
          <button  className="hasvsdhawvd" onClick={handleBack}>
      Back
    </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceLogs;

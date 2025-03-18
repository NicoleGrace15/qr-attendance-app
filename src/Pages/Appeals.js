import { useEffect, useState } from "react";

import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import "../Styles/appeals.css";
import autoTable from 'jspdf-autotable';

const AppealList = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        const appealsSnapshot = await getDocs(collection(db, "appeals"));
        const appealsData = [];

        for (const appealDoc of appealsSnapshot.docs) {
          const appeal = appealDoc.data();
          const userDoc = await getDoc(doc(db, "users", appeal.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};

          appealsData.push({
            id: appealDoc.id, // Firestore document ID
            appealID: appealDoc.id, // Explicitly assigning appealID
            studentName: `${userData.lastName}, ${userData.firstName}` || "Unknown",
            message: appeal.message,
            timestamp: appeal.timestamp.toDate(),
            reviewed: appeal.reviewed || false,
          });
          
        }

        setAppeals(appealsData);
      } catch (err) {
        console.error("Error fetching appeals:", err);
        setError("Failed to fetch appeals. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppeals();
  }, []);

  

  const handlePrint = (appeal) => {
    const doc = new jsPDF();
  
    // Set text color to black for the entire document
    doc.setTextColor(0, 0, 0); // Black color
    doc.setFontSize(18);
    doc.text("📌 Appeal Document -", 25, 20); // Appeal Document Title
  
    // Set font color to black for the content
    doc.setFontSize(12);
    doc.text(`Student: ${appeal.studentName}`, 20, 30);
    doc.text(`Date Submitted: ${appeal.timestamp.toLocaleDateString()}`, 20, 40);
    doc.text(`Time Submitted: ${appeal.timestamp.toLocaleTimeString()}`, 20, 50);
  
    // Blue-themed appeal message table (now left-aligned)
    autoTable(doc, {
      startY: 60,
      head: [["Appeal Message"]],
      body: [[appeal.message]],
      styles: {
        cellWidth: "wrap",
        halign: "left", // Left-align the appeal message
        fontSize: 11,
      },
      headStyles: {
        fillColor: [30, 144, 255], // DodgerBlue
        textColor: [255, 255, 255], // White
        fontStyle: "bold",
      },
      theme: "grid",
    });
  
    // Footer: Add the "Student Attendance Managing App" text at the bottom
    const footerText = "Student Attendance Managing App";
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(footerText, 20, pageHeight - 20); // Positioned near the bottom
  
    // Save the PDF
    doc.save(`Appeal_${appeal.studentName}.pdf`);
  };
  

  const markAsReviewed = async (id) => {
    try {
      const reviewedTimestamp = new Date();
      await updateDoc(doc(db, "appeals", id), { 
        reviewed: true,
        timestamp: reviewedTimestamp // Updating the timestamp when reviewed
      });
  
      setAppeals((prevAppeals) =>
        prevAppeals.map((a) =>
          a.id === id ? { ...a, reviewed: true, timestamp: reviewedTimestamp } : a
        )
      );
    } catch (err) {
      console.error("Error updating appeal:", err);
    }
  };
  
  return (
    <div className="appeal-4sdawd">
      <h2 className="h2-appeal">📋 Appeal List</h2>
     
      {loading ? (
        <p>Loading appeals...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="appeal-table">
      
          <h3 className="fafafaqwe">📌 Unreviewed Appeals</h3>
<table className="appeal-table">
  <thead>
    <tr className="appeal-row">
      <th>Student Name</th>
      <th>Appeal</th>
      <th>Date Submitted</th>
      <th>Time Submitted</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {appeals.filter(a => !a.reviewed).length > 0 ? (
      appeals.filter(a => !a.reviewed).map((appeal) => (
        <tr key={appeal.id}>
          <td className="sjdnakwdb">{appeal.studentName}</td>
          <td className="sjdnakwdb">{appeal.message}</td>
          <td className="sjdnakwdb">{appeal.timestamp.toLocaleDateString()}</td>
          <td className="sjdnakwdb">{appeal.timestamp.toLocaleTimeString()}</td>
          <td className="sjdnakwdb">
            <div className="posdkan-container">
            <button className="posdkan"onClick={() => handlePrint(appeal)}>🖨 Print</button>
            <button className="posdkan" onClick={() => markAsReviewed(appeal.id)}>✅ Done Review</button>
            </div>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="5"  className="sjdnakwdb">No unreviewed appeals</td>
      </tr>
    )}
  </tbody>
</table>

<h3 className="fafafaqwe">📂 Archived Appeals</h3>
<table className="appeal-table">
  <thead>
    <tr className="appeal-row">
      <th>Student Name</th>
      <th>Appeal</th>
      <th>Date Reviewed</th>
      <th>Time Reviewed</th>
    </tr>
  </thead>
  <tbody>
    {appeals.filter(a => a.reviewed).length > 0 ? (
      appeals.filter(a => a.reviewed).map((appeal) => (
        <tr key={appeal.id}>
         <td className="sjdnakwdb">{appeal.studentName}</td>
         <td className="sjdnakwdb">{appeal.message}</td>
         <td className="sjdnakwdb">{appeal.timestamp.toLocaleDateString()}</td>
         <td className="sjdnakwdb">{appeal.timestamp.toLocaleTimeString()}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="4" className="text-center border p-2">No reviewed appeals</td>
      </tr>
    )}
  </tbody>
</table>

        </table>
      )}
    </div>
  );
};

export default AppealList;

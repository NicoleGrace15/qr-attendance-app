import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";

const ExcuseLetterList = () => {
  const [excuseLetters, setExcuseLetters] = useState([]);

  useEffect(() => {
    const fetchExcuseLetters = async () => {
      try {
        const excuseRef = collection(db, "excuse_letters"); // Reference to the excuse_letters collection
        const excuseSnap = await getDocs(excuseRef); // Fetch all documents from the collection

        const excuseList = await Promise.all(
          excuseSnap.docs.map(async (docSnap) => {
            const excuseData = docSnap.data();
            const userId = excuseData.userId;
            let studentName = "Unknown";

            // Fetch student details from the users collection
            if (userId) {
              const userRef = doc(db, "users", userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                studentName = `${userData.firstName} ${userData.lastName}`;
              }
            }

            return {
              id: docSnap.id,
              studentName,
              document: excuseData.excuseFile, // Storing the excuse file (assumed to be base64 encoded image)
              timestamp: excuseData.timestamp?.toDate() || new Date(),
              userId,
            };
          })
        );

        setExcuseLetters(excuseList);
      } catch (error) {
        console.error("❌ Error fetching excuse letters:", error);
      }
    };

    fetchExcuseLetters();
  }, []);

  // Helper function to format date in a readable format
  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Helper function to format time
  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Function to generate a PDF file for the excuse document
  const handlePrint = (base64String) => {
    if (!base64String) {
      console.error("❌ No document available for printing.");
      return;
    }
  
    try {
      let cleanBase64 = base64String.replace(/^data:image\/png;base64,/, ""); // Ensure correct formatting
      const pdf = new jsPDF();
      const imgData = `data:image/png;base64,${cleanBase64}`; // Format image data
  
      pdf.addImage(imgData, "PNG", 15, 40, 180, 160); // Insert image into PDF
      pdf.save("Excuse_Letter.pdf"); // Save the generated PDF
  
      console.log("✅ PDF successfully generated!");
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
    }
  };
  
  // Function to mark an excuse letter as reviewed
  const markAsReviewed = async (id) => {
    try {
      const reviewedTimestamp = new Date(); // Get the current timestamp
  
      // Update Firestore document
      const excuseRef = doc(db, "excuse_letters", id);
      await updateDoc(excuseRef, { reviewed: true, reviewedAt: reviewedTimestamp });
  
      // Update the local state to reflect the change in UI
      setExcuseLetters((prevExcuses) =>
        prevExcuses.map((excuse) =>
          excuse.id === id
            ? { ...excuse, reviewed: true, reviewedAt: reviewedTimestamp }
            : excuse
        )
      );
  
      console.log("✅ Excuse letter marked as reviewed.");
    } catch (error) {
      console.error("❌ Error updating excuse letter:", error);
    }
  };
  
  
  return (
    <div className="Excuse-container">
      <h2>Excuse Letter List</h2>
      <div className="table-excuse">
        <table border="1">
          <thead>
            <tr>
              <th>Name of the Student</th>
              <th>Document</th>
              <th>Time</th>
              <th>Day</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {excuseLetters.filter(excuse => !excuse.reviewed).map((excuse) => (
    <tr key={excuse.id}>
      <td>{excuse.studentName}</td>
      <td>
        {excuse.document ? (
          <img
            src={`data:image/png;base64,${excuse.document}`}
            alt="Excuse Document"
            width="50"
          />
        ) : (
          "No File"
        )}
      </td>
      <td>{formatTime(excuse.timestamp)}</td>
      <td>{formatDate(excuse.timestamp)}</td>
      <td>
        <button onClick={() => handlePrint(excuse.document)}>Print</button>
        <button onClick={() => markAsReviewed(excuse.id)}>Done Review</button>
      </td>
    </tr>
  ))}
</tbody>

        </table>

        {/* Archived Excuse Letters Table */}
        <h3>📂 Archived Excuse Letters</h3>
        <table className="excuse-table">
          <thead>
            <tr className="tablel-row">
              <th>Student Name</th>
              <th>File</th>
              <th>Date Reviewed</th>
              <th>Time Reviewed</th>
            </tr>
          </thead>
          <tbody>
  {excuseLetters.filter(excuse => excuse.reviewed).length > 0 ? (
    excuseLetters.filter(excuse => excuse.reviewed).map((excuse) => (
      <tr key={excuse.id}>
        <td>{excuse.studentName}</td>
        <td>
          {excuse.document ? (
            <img
              src={`data:image/png;base64,${excuse.document}`}
              alt="Reviewed Excuse Document"
              width="50"
            />
          ) : (
            "No File"
          )}
        </td>
        <td>{formatDate(excuse.reviewedAt)}</td>
        <td>{formatTime(excuse.reviewedAt)}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" className="text-center border p-2">No reviewed excuse letters</td>
    </tr>
  )}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default ExcuseLetterList;

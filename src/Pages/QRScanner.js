import { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, Timestamp } from "firebase/firestore";

const QRScanner = () => {
  const [scannedData, setScannedData] = useState("");
  const [processing, setProcessing] = useState(false); // Prevent multiple scans
  const [popupMessage, setPopupMessage] = useState(""); // Popup message state
  const [showPopup, setShowPopup] = useState(false); // Toggle popup visibility

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);

    // Hide popup after 3 seconds
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleScan = async (event) => {
    if (event.key !== "Enter" || processing) return;
  
    setProcessing(true);
    const studentID = scannedData.trim();
  
    if (!studentID || studentID === "-1") {
      showPopupMessage("⚠️ Invalid scan. Please try again.");
      setScannedData("");
      setProcessing(false);
      return;
    }
  
    const today = new Date().toISOString().split("T")[0];
    const recordRef = collection(db, "record");
  
    try {
      const q = query(recordRef, where("studentID", "==", studentID), where("date", "==", today));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Student already scanned today, update as Check-Out
        const docRef = querySnapshot.docs[0].ref;
        const recordData = querySnapshot.docs[0].data();
  
        if (!recordData.checkOutTime) {
          await updateDoc(docRef, {
            status: "Check Out",
            checkOutTime: Timestamp.now(),
            checkOutTimeString: getFormattedTime(),
          });
          showPopupMessage(`✅ Check-Out Successful! (${getFormattedTime()})`);
        } else {
          showPopupMessage(`⏳ You have already checked out today.`);
        }
      } else {
        // First scan, mark as Check-In
        await addDoc(recordRef, {
          studentID: studentID,
          date: today,
          timestamp: Timestamp.now(),
          status: "Check In",
          checkInTime: Timestamp.now(),
          checkInTimeString: getFormattedTime(),
        });
        showPopupMessage(`✅ Check-In Successful! (${getFormattedTime()})`);
      }
    } catch (error) {
      showPopupMessage(`❌ Error: ${error.message}`);
    }
  
    setScannedData("");
    setTimeout(() => setProcessing(false), 1000);
  };
  
  return (
    <div>
      <h2>Scan Student QR Code</h2>
      <input
        type="text"
        value={scannedData}
        onChange={(e) => setScannedData(e.target.value)}
        onKeyDown={handleScan}
        autoFocus
        placeholder="Scan QR Code here..."
      />

      {/* Popup Message */}
      {showPopup && (
        <div style={popupStyle}>
          <p>{popupMessage}</p>
        </div>
      )}
    </div>
  );
};

// Popup Style
const popupStyle = {
  position: "fixed",
  top: "10px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "10px 20px",
  borderRadius: "5px",
  boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
  zIndex: 1000,
  fontWeight: "bold",
};

export default QRScanner;

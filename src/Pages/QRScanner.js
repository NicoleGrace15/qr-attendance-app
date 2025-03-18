import { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import "../Styles/qrscan.css";

const QRScanner = () => {
  const [scannedData, setScannedData] = useState("");
  const [processing, setProcessing] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);

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
    <div className="main-qr-cont">
      
      <h2 className="qr-123name">Scan Student QR Code</h2>
      <input
      className="input-qrscann"
        type="text"
        value={scannedData}
        onChange={(e) => setScannedData(e.target.value)}
        onKeyDown={handleScan}
        autoFocus
        placeholder="Scan QR Code here..."
      />

      {showPopup && (
        <div>
          <p>{popupMessage}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;

import React, { useEffect, useState } from "react";
import { doc, collection, addDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";



// ======================== SCHEDULE COMPONENT ======================== //
const AddSchedule = () => {
    const [subject, setSubject] = useState("");
    const [time, setTime] = useState("");
    const [teacher, setTeacher] = useState("");
    const [scheduleList, setScheduleList] = useState([]);
    const [scheduleType, setScheduleType] = useState("MWF"); // Default to MWF
    const [editingId, setEditingId] = useState(null);
  
  
  // Function to handle deleting a schedule entry
  const handleDeleteSchedule = async (id) => {
    try {
      await deleteDoc(doc(db, "schedule", id));
      setScheduleList(scheduleList.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting schedule: ", error);
    }
  };  
  
  // Function to handle editing a schedule entry
  const handleEditSchedule = (id) => {
    const scheduleToEdit = scheduleList.find((item) => item.id === id);
    if (scheduleToEdit) {
      setSubject(scheduleToEdit.subject);
      setTime(scheduleToEdit.time);
      setTeacher(scheduleToEdit.teacher);
      setScheduleType(scheduleToEdit.scheduleType);
      setEditingId(id); // Store the ID of the schedule being edited
    }
  };
  
  // Function to update a schedule entry
  const handleUpdateSchedule = async () => {
    if (!subject || !time || !teacher) {
      alert("Please fill in all fields!");
      return;
    }
  
    try {
      await updateDoc(doc(db, "schedule", editingId), {
        subject,
        time,
        teacher,
        scheduleType,
      });
  
      setScheduleList(scheduleList.map((item) => (item.id === editingId ? { id: editingId, subject, time, teacher, scheduleType } : item)));
  
      // Reset fields after updating
      setSubject("");
      setTime("");
      setTeacher("");
      setScheduleType("MWF");
      setEditingId(null);
    } catch (error) {
      console.error("Error updating schedule: ", error);
    }
  };
  
    // Fetch existing schedule from Firestore
    useEffect(() => {
      const fetchSchedule = async () => {
        try {
          await auth.currentUser?.getIdToken(true); // Refresh token before fetching
          const querySnapshot = await getDocs(collection(db, "schedule"));
          const schedules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          if (schedules.length === 0) {
            console.warn("No schedules found in Firestore.");
          }
    
          setScheduleList(schedules);
        } catch (error) {
          console.error("Error fetching schedules: ", error);
        }
      };
    
      fetchSchedule();
    }, []);
  
    // Add new schedule to Firestore
    const handleAddSchedule = async () => {
      if (!subject || !time || !teacher) {
        alert("Please fill in all fields!");
        return;
      }
    
      const newSchedule = { subject, time, teacher, scheduleType }; // Include scheduleType
      const docRef = await addDoc(collection(db, "schedule"), newSchedule);
      setScheduleList([...scheduleList, { id: docRef.id, ...newSchedule }]);
    
      setSubject("");
      setTime("");
      setTeacher("");
      setScheduleType("MWF"); // Reset to default
    };
    
    
  
    return (
      <div className="AddSchedule">
        <div className= "addsubject"> 
        <h2 className="addschedwew">📅 Add Schedule</h2>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <input type="text" placeholder="Subject Name" value={subject} onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 mb-2 border rounded" />
          <input type="text" placeholder="Time" value={time} onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 mb-2 border rounded" />
          <input type="text" placeholder="Teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)}
            className="w-full p-2 mb-2 border rounded" />
          
          <div className="flex gap-2">
          <select 
    value={scheduleType} 
    onChange={(e) => setScheduleType(e.target.value)}
    className="w-full p-2 mb-2 border rounded"
  >
    <option value="MWF">MWF Schedule</option>
    <option value="T/TH">T/TH Schedule</option>
  
  </select>
  
  <button className="add" onClick={editingId ? handleUpdateSchedule : handleAddSchedule}>
    {editingId ? "Update Subject" : "Add Subject"}
  </button>
  
            <button className="cancel" onClick={() => { setSubject(""); setTime(""); setTeacher(""); }}>Cancel</button>
          </div>
        </div>
  
        {/* Schedule Table */}
        {["MWF", "T/TH"].map((type) => (
    <div key={type}>
      <h3 className="babababa">📅 {type} Schedule</h3>
      <table className="amazing">
        <thead>
          <tr className="eee">
            <th className="border p-2">Subject</th>
            <th className="border p-2">Time</th>
            <th className="border p-2">Teacher</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {scheduleList
            .filter((item) => item.scheduleType === type)
            .map((item) => (
              <tr key={item.id} className="text-center">
                <td className="border p-2">{item.subject}</td>
                <td className="border p-2">{item.time}</td>
                <td className="border p-2">{item.teacher}</td>
                <td className="actions">
                  <button className="edit-btn bg-yellow-500 text-white p-1 rounded mr-2" onClick={() => handleEditSchedule(item.id)}>
                    ✏️
                  </button>
                  <button className="delete-btn bg-red-500 text-white p-1 rounded" onClick={() => handleDeleteSchedule(item.id)}>
                    ❌
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
  
    </div>
  
    
  ))}
  
  
  
  
      </div>
    );
  };
  
  export default AddSchedule;
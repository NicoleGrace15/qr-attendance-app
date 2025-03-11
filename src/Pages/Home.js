import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Home.css"; // Import CSS file

const Home = () => {
  return (
    <div className="container-Home-STYLE">
      <div className="header-conthome">
       <h1 className="header">QR Attendance App</h1>
       </div>
       <div className=" homeBox">
       <p className="description-style">
          Effortless attendance tracking with QR scanning.
        </p>
      <div className="home-card">
       
      

        <div className="button-container-HOMEPAGE">
          <Link to="/login" className="btn login-btn">Login</Link>
          <Link to="/signup" className="btn signup-btn">Sign Up</Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;

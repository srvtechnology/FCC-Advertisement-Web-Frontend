import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import axiosClient from "./axios-client";
import './views/Dashboard.css'; // Import custom CSS

function Dashboard() {
  const [counts, setCounts] = useState({
    spaces_count: 0,
    users_count: 0,
    space_categories_count: 0,
    bookings_count: 0,
    payments_count: 0,
  });

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = () => {
    axiosClient
      .get("/counts")
      .then(({ data }) =>  
        // console.log(data)
        setCounts(data)
    )
      .catch(() => setAgents([]));
  };


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      <div className="dashboard-grid">
        <div className="dashboard-box" style={{ backgroundColor: "#FF6B6B" }}>
          <h2 className="card-title">Spaces</h2>
          <p className="card-count">{counts?.spaces_count}</p>
        </div>
        <div className="dashboard-box" style={{ backgroundColor: "#4ECDC4" }}>
          <h2 className="card-title">Users</h2>
          <p className="card-count">{counts?.users_count}</p>
        </div>
        <div className="dashboard-box" style={{ backgroundColor: "#FFD93D" }}>
          <h2 className="card-title">Space Category</h2>
          <p className="card-count">{counts?.space_categories_count}</p>
        </div>
        <div className="dashboard-box" style={{ backgroundColor: "#1E90FF" }}>
          <h2 className="card-title">Bookings</h2>
          <p className="card-count">{counts?.bookings_count}</p>
        </div>
        <div className="dashboard-box" style={{ backgroundColor: "#9B59B6" }}>
          <h2 className="card-title">Payments</h2>
          <p className="card-count">{counts?.payments_count}</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

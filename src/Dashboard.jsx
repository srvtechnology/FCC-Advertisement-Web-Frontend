import React, { useState, useEffect } from "react";
import axiosClient from "./axios-client";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './views/Dashboard.css';

// Register ChartJS components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Dashboard() {
  const [counts, setCounts] = useState({
    spaces_count: 0,
    users_count: 0,
    space_categories_count: 0,
    bookings_count: 0,
    payments_count: 0,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [agentChartData, setAgentChartData] = useState({
    labels: [],
    datasets: []
  });
  const [systemUserChartData, setSystemUserChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    fetchCounts();
    getUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      prepareChartData();
      prepareSystemUsersChartData();
    }
  }, [users, timeRange]);

  const fetchCounts = () => {
    axiosClient
      .get("/counts")
      .then(({ data }) => setCounts(data))
      .catch(() => setCounts({}));
  };

  const getUsers = () => {
    setLoading(true);
    axiosClient.get("/users")
      .then(({ data }) => {
        setLoading(false);
        setUsers(data.data || []);
      })
      .catch(() => {
        setLoading(false);
        setUsers([]);
      });
  };

  const prepareChartData = () => {
    const agents = users.filter(user => user.user_type === "agent");
    const { labels, counts } = prepareTimeBasedData(agents);
    
    setAgentChartData({
      labels,
      datasets: [
        {
          label: 'Agents Created',
          data: counts,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  const prepareSystemUsersChartData = () => {
    const systemUsers = users.filter(user => user.user_type === "system");
    const { labels, counts } = prepareTimeBasedData(systemUsers);
    
    setSystemUserChartData({
      labels,
      datasets: [
        {
          label: 'System Users Created',
          data: counts,
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  const prepareTimeBasedData = (userList) => {
    const now = new Date();
    const labels = [];
    const userCounts = {};
    
    switch (timeRange) {
      case "day":
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now);
          hour.setHours(now.getHours() - i);
          const hourStr = hour.getHours() + ":00";
          labels.push(hourStr);
          userCounts[hourStr] = 0;
        }
        break;
      case "month":
        for (let i = 29; i >= 0; i--) {
          const day = new Date(now);
          day.setDate(now.getDate() - i);
          const dayStr = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          labels.push(dayStr);
          userCounts[dayStr] = 0;
        }
        break;
      case "6month":
        for (let i = 5; i >= 0; i--) {
          const month = new Date(now);
          month.setMonth(now.getMonth() - i);
          const monthStr = month.toLocaleDateString('en-US', { month: 'long' });
          labels.push(monthStr);
          userCounts[monthStr] = 0;
        }
        break;
      case "year":
        for (let i = 11; i >= 0; i--) {
          const month = new Date(now);
          month.setMonth(now.getMonth() - i);
          const monthStr = month.toLocaleDateString('en-US', { month: 'long' });
          labels.push(monthStr);
          userCounts[monthStr] = 0;
        }
        break;
    }
    
    userList.forEach(user => {
      const createdAt = new Date(user.created_at);
      let key;
      
      switch (timeRange) {
        case "day":
          key = createdAt.getHours() + ":00";
          break;
        case "month":
          key = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case "6month":
        case "year":
          key = createdAt.toLocaleDateString('en-US', { month: 'long' });
          break;
      }
      
      if (userCounts.hasOwnProperty(key)) {
        userCounts[key]++;
      }
    });
    
    return {
      labels,
      counts: labels.map(label => userCounts[label] || 0)
    };
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
      
      <div className="time-range-selector">
        <button 
          className={timeRange === "day" ? "active" : ""}
          onClick={() => setTimeRange("day")}
        >
          Daily
        </button>
        <button 
          className={timeRange === "month" ? "active" : ""}
          onClick={() => setTimeRange("month")}
        >
          Monthly
        </button>
        <button 
          className={timeRange === "6month" ? "active" : ""}
          onClick={() => setTimeRange("6month")}
        >
          6 Months
        </button>
        <button 
          className={timeRange === "year" ? "active" : ""}
          onClick={() => setTimeRange("year")}
        >
          Yearly
        </button>
      </div>
      
      <div className="charts-container">
        <div className="chart-card">
          <h2>Agent Creation Trends</h2>
          <Bar 
            data={agentChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: `Agent Creation (${getTimeRangeText()})`,
                },
              },
            }}
          />
        </div>
        
        <div className="chart-card">
          <h2>System User Creation Trends</h2>
          <Bar 
            data={systemUserChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: `System User Creation (${getTimeRangeText()})`,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  function getTimeRangeText() {
    switch (timeRange) {
      case "day": return "Last 24 Hours";
      case "month": return "Last 30 Days";
      case "6month": return "Last 6 Months";
      case "year": return "Last 12 Months";
      default: return "";
    }
  }
}

export default Dashboard;
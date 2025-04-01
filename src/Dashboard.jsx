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
  // State for counts data
  const [counts, setCounts] = useState({
    spaces_count: 0,
    users_count: 0,
    space_categories_count: 0,
    bookings_count: 0,
    payments_count: 0,
  });

   const [bookings, setBookings] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingTimeRange, setBookingTimeRange] = useState("month");
    const [bookingAgent, setBookingAgent] = useState("all");
    const [bookingChartData, setBookingChartData] = useState({
      labels: [],
      datasets: []
    });
    const [agentBookingChartData, setAgentBookingChartData] = useState({
      labels: [],
      datasets: []
    });
    const [bookingAgents, setBookingAgents] = useState([]);

  // State for user analytics
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userTimeRange, setUserTimeRange] = useState("month");
  const [agentChartData, setAgentChartData] = useState({
    labels: [],
    datasets: []
  });
  const [systemUserChartData, setSystemUserChartData] = useState({
    labels: [],
    datasets: []
  });

  // State for space analytics
  const [spaces, setSpaces] = useState([]);
  const [spaceLoading, setSpaceLoading] = useState(false);
  const [spaceTimeRange, setSpaceTimeRange] = useState("month");
  const [spaceCreationChartData, setSpaceCreationChartData] = useState({
    labels: [],
    datasets: []
  });
  const [spaceCountChartData, setSpaceCountChartData] = useState({
    labels: [],
    datasets: []
  });
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("all");

  // Fetch all initial data
  useEffect(() => {
    fetchCounts();
    fetchUsers();
    fetchSpaces();
    fetchBookings();
  }, []);

  // Prepare user charts when users or time range changes
  useEffect(() => {
    if (users.length > 0) {
      prepareUserChartData();
      prepareSystemUsersChartData();
    }
  }, [users, userTimeRange]);

  // Prepare space charts when spaces or filters change
  useEffect(() => {
    if (spaces.length > 0) {
      prepareSpaceCreationChartData();
      prepareSpaceCountChartData();
      extractUniqueAgents();
    }
  }, [spaces, spaceTimeRange, selectedAgent]);

  // Fetch counts data
  const fetchCounts = () => {
    axiosClient
      .get("/counts")
      .then(({ data }) => setCounts(data))
      .catch(() => setCounts({}));
  };

  // Fetch users data
  const fetchUsers = () => {
    setUserLoading(true);
    axiosClient.get("/users")
      .then(({ data }) => {
        setUserLoading(false);
        setUsers(data.data || []);
      })
      .catch(() => {
        setUserLoading(false);
        setUsers([]);
      });
  };

  // Add this new function to fetch bookings
  const fetchBookings = (agentName = "", startDate = "", endDate = "") => {
    setBookingLoading(true);
    axiosClient
      .get("/bookings", {
        params: { 
          agent_name: agentName === "all" ? "" : agentName, 
          start_date: startDate, 
          end_date: endDate 
        },
      })
      .then(({ data }) => {
        setBookingLoading(false);
        setBookings(data.data || []);
        extractUniqueBookingAgents(data.data || []);
      })
      .catch(() => {
        setBookingLoading(false);
        setBookings([]);
      });
  };

  // Extract unique booking agents
  const extractUniqueBookingAgents = (bookingsData) => {
    const uniqueAgents = new Set();

    bookingsData.forEach(booking => {
      const agent = booking.space?.name_of_advertise_agent_company_or_person ?? "N/A";
      uniqueAgents.add(agent);
    });

    setBookingAgents(Array.from(uniqueAgents).sort());
  };

  // Prepare booking chart data
  const prepareBookingChartData = () => {
    let filteredBookings = bookings;

    // Filter by selected agent if not "all"
    if (bookingAgent !== "all") {
      filteredBookings = bookings.filter(booking => {
        const agent = booking.space?.name_of_advertise_agent_company_or_person ?? "N/A";
        return agent === bookingAgent;
      });
    }

    const { labels, counts } = prepareTimeBasedData(filteredBookings, bookingTimeRange);

    setBookingChartData({
      labels,
      datasets: [
        {
          label: bookingAgent === "all" ? 'All Bookings' : `Bookings by ${bookingAgent}`,
          data: counts,
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  // Prepare agent-wise booking chart data
  const prepareAgentBookingChartData = () => {
    // Group bookings by agent
    const agentCounts = {};

    bookings.forEach(booking => {
      const agent = booking.space?.name_of_advertise_agent_company_or_person ?? "N/A";
      agentCounts[agent] = (agentCounts[agent] || 0) + 1;
    });

    const sortedAgents = Object.keys(agentCounts).sort((a, b) => agentCounts[b] - agentCounts[a]);
    const topAgents = sortedAgents.slice(0, 5); // Show top 5 agents

    setAgentBookingChartData({
      labels: topAgents,
      datasets: [
        {
          label: 'Bookings per Agent',
          data: topAgents.map(agent => agentCounts[agent]),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  // Update booking charts when bookings or filters change
  useEffect(() => {
    if (bookings.length > 0) {
      prepareBookingChartData();
      prepareAgentBookingChartData();
    }
  }, [bookings, bookingTimeRange, bookingAgent]);


  // Fetch spaces data
  const fetchSpaces = () => {
    setSpaceLoading(true);
    axiosClient.get("/spaces")
      .then(({ data }) => {
        setSpaceLoading(false);
        setSpaces(data.data || []);
      })
      .catch(() => {
        setSpaceLoading(false);
        setSpaces([]);
      });
  };

  // Extract unique agents from spaces
  const extractUniqueAgents = () => {
    const uniqueAgents = new Set();

    spaces.forEach(space => {
      if (space.name_of_advertise_agent_company_or_person) {
        uniqueAgents.add(space.name_of_advertise_agent_company_or_person);
      }
    });
    setAgents(Array.from(uniqueAgents).sort());
  };

  // Prepare user agent chart data
  const prepareUserChartData = () => {
    const agents = users.filter(user => user.user_type === "agent");
    const { labels, counts } = prepareTimeBasedData(agents, userTimeRange);
    
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

  // Prepare system users chart data
  const prepareSystemUsersChartData = () => {
    const systemUsers = users.filter(user => user.user_type === "system");
    const { labels, counts } = prepareTimeBasedData(systemUsers, userTimeRange);
    
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

  // Prepare space creation chart data
  const prepareSpaceCreationChartData = () => {
    let filteredSpaces = spaces;

    // Filter by selected agent if not "all"
    if (selectedAgent !== "all") {
      filteredSpaces = spaces.filter(space =>
        space.name_of_advertise_agent_company_or_person === selectedAgent
      );
    }

    const { labels, counts } = prepareTimeBasedData(filteredSpaces, spaceTimeRange);

    setSpaceCreationChartData({
      labels,
      datasets: [
        {
          label: selectedAgent === "all" ? 'All Spaces Created' : `Spaces by ${selectedAgent}`,
          data: counts,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  // Prepare space count by agent chart data
  const prepareSpaceCountChartData = () => {
    // Group spaces by agent
    const agentCounts = {};

    spaces.forEach(space => {
      const agent = space.name_of_advertise_agent_company_or_person || 'Unknown';
      agentCounts[agent] = (agentCounts[agent] || 0) + 1;
    });

    const sortedAgents = Object.keys(agentCounts).sort((a, b) => agentCounts[b] - agentCounts[a]);
    const topAgents = sortedAgents.slice(0, 5); // Show top 5 agents

    setSpaceCountChartData({
      labels: topAgents,
      datasets: [
        {
          label: 'Spaces per Agent',
          data: topAgents.map(agent => agentCounts[agent]),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  // Generic function to prepare time-based data
  const prepareTimeBasedData = (dataList, range) => {
    const now = new Date();
    const labels = [];
    const counts = {};

    switch (range) {
      case "day":
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now);
          hour.setHours(now.getHours() - i);
          const hourStr = hour.getHours() + ":00";
          labels.push(hourStr);
          counts[hourStr] = 0;
        }
        break;
      case "month":
        for (let i = 29; i >= 0; i--) {
          const day = new Date(now);
          day.setDate(now.getDate() - i);
          const dayStr = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          labels.push(dayStr);
          counts[dayStr] = 0;
        }
        break;
      case "6month":
        for (let i = 5; i >= 0; i--) {
          const month = new Date(now);
          month.setMonth(now.getMonth() - i);
          const monthStr = month.toLocaleDateString('en-US', { month: 'long' });
          labels.push(monthStr);
          counts[monthStr] = 0;
        }
        break;
      case "year":
        for (let i = 11; i >= 0; i--) {
          const month = new Date(now);
          month.setMonth(now.getMonth() - i);
          const monthStr = month.toLocaleDateString('en-US', { month: 'long' });
          labels.push(monthStr);
          counts[monthStr] = 0;
        }
        break;
    }

    dataList.forEach(item => {
      const createdAt = new Date(item.created_at);
      let key;

      switch (range) {
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

      if (counts.hasOwnProperty(key)) {
        counts[key]++;
      }
    });

    return {
      labels,
      counts: labels.map(label => counts[label] || 0)
    };
  };

  // Helper function to get time range text
  const getTimeRangeText = (range) => {
    switch (range) {
      case "day": return "Last 24 Hours";
      case "month": return "Last 30 Days";
      case "6month": return "Last 6 Months";
      case "year": return "Last 12 Months";
      default: return "";
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      
      {/* Summary Cards */}
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
      
      {/* User Analytics Section */}
      <section className="analytics-section">
        <h2 className="section-title">User Analytics</h2>
        
        <div className="time-range-selector">
          <button 
            className={userTimeRange === "day" ? "active" : ""}
            onClick={() => setUserTimeRange("day")}
          >
            Daily
          </button>
          <button 
            className={userTimeRange === "month" ? "active" : ""}
            onClick={() => setUserTimeRange("month")}
          >
            Monthly
          </button>
          <button 
            className={userTimeRange === "6month" ? "active" : ""}
            onClick={() => setUserTimeRange("6month")}
          >
            6 Months
          </button>
          <button 
            className={userTimeRange === "year" ? "active" : ""}
            onClick={() => setUserTimeRange("year")}
          >
            Yearly
          </button>
        </div>
        
        <div className="charts-container">
          <div className="chart-card">
            <h3>Agent Creation Trends</h3>
            {userLoading ? (
              <div className="loading-indicator">Loading user data...</div>
            ) : (
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
                      text: `Agent Creation (${getTimeRangeText(userTimeRange)})`,
                    },
                  },
                }}
              />
            )}
          </div>
          
          <div className="chart-card">
            <h3>System User Creation Trends</h3>
            {userLoading ? (
              <div className="loading-indicator">Loading user data...</div>
            ) : (
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
                      text: `System User Creation (${getTimeRangeText(userTimeRange)})`,
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </section>
      
      {/* Space Analytics Section */}
      <section className="analytics-section">
        <h2 className="section-title">Space Analytics</h2>
        
        <div className="controls-row">
          <div className="time-range-selector">
            <button
              className={spaceTimeRange === "day" ? "active" : ""}
              onClick={() => setSpaceTimeRange("day")}
            >
              Daily
            </button>
            <button
              className={spaceTimeRange === "month" ? "active" : ""}
              onClick={() => setSpaceTimeRange("month")}
            >
              Monthly
            </button>
            <button
              className={spaceTimeRange === "6month" ? "active" : ""}
              onClick={() => setSpaceTimeRange("6month")}
            >
              6 Months
            </button>
            <button
              className={spaceTimeRange === "year" ? "active" : ""}
              onClick={() => setSpaceTimeRange("year")}
            >
              Yearly
            </button>
          </div>

          <div className="agent-selector">
            <label htmlFor="agent-filter">Filter by Agent:</label>
            <select
              id="agent-filter"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="all">All Agents</option>
              {agents.map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="charts-container">
          <div className="chart-card">
            <h3>Space Creation Trends</h3>
            {spaceLoading ? (
              <div className="loading-indicator">Loading space data...</div>
            ) : (
              <Bar
                data={spaceCreationChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: `Space Creation (${getTimeRangeText(spaceTimeRange)})`,
                    },
                  },
                }}
              />
            )}
          </div>
          
          <div className="chart-card">
            <h3>Top Agents by Space Count</h3>
            {spaceLoading ? (
              <div className="loading-indicator">Loading space data...</div>
            ) : (
              <Bar
                data={spaceCountChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Total Spaces per Agent',
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </section>

       {/* Bookings Analytics Section */}
            <section className="analytics-section">
              <h2 className="section-title">Booking Analytics</h2>
              
              <div className="controls-row">
                <div className="time-range-selector">
                  <button
                    className={bookingTimeRange === "day" ? "active" : ""}
                    onClick={() => setBookingTimeRange("day")}
                  >
                    Daily
                  </button>
                  <button
                    className={bookingTimeRange === "month" ? "active" : ""}
                    onClick={() => setBookingTimeRange("month")}
                  >
                    Monthly
                  </button>
                  <button
                    className={bookingTimeRange === "6month" ? "active" : ""}
                    onClick={() => setBookingTimeRange("6month")}
                  >
                    6 Months
                  </button>
                  <button
                    className={bookingTimeRange === "year" ? "active" : ""}
                    onClick={() => setBookingTimeRange("year")}
                  >
                    Yearly
                  </button>
                </div>
      
                <div className="agent-selector">
                  <label htmlFor="booking-agent-filter">Filter by Agent:</label>
                  <select
                    id="booking-agent-filter"
                    value={bookingAgent}
                    onChange={(e) => setBookingAgent(e.target.value)}
                  >
                    <option value="all">All Agents</option>
                    {bookingAgents.map(agent => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="charts-container">
                <div className="chart-card">
                  <h3>Booking Trends</h3>
                  {bookingLoading ? (
                    <div className="loading-indicator">Loading booking data...</div>
                  ) : (
                    <Bar
                      data={bookingChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: `Bookings (${getTimeRangeText(bookingTimeRange)})`,
                          },
                        },
                      }}
                    />
                  )}
                </div>
                
                <div className="chart-card">
                  <h3>Top Agents by Bookings</h3>
                  {bookingLoading ? (
                    <div className="loading-indicator">Loading booking data...</div>
                  ) : (
                    <Bar
                      data={agentBookingChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Total Bookings per Agent',
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </section>
    </div>
  );
}

export default Dashboard;
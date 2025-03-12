import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setNotification } = useStateContext();

  // Pagination, Search, and Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("All"); // Filter state
  const perPage = 10;

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, userTypeFilter, currentPage]);

  const getUsers = () => {
    setLoading(true);
    axiosClient.get(`/users`).then(({ data }) => {
      setLoading(false);
      setUsers(data.data || []);
      setTotalPages(Math.ceil((data.data || []).length / perPage));
    }).catch(() => {
      setLoading(false);
      setUsers([]);
    });
  };

  const filterUsers = () => {
    let filtered = users;

    if (userTypeFilter !== "All") {
      filtered = filtered.filter((u) => u.user_type === userTypeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / perPage));
  };

  const exportToCSV = () => {
    const headers = ["User ID", "Name", "Email", "User Type", "Create Date"];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.name,
      u.email,
      u.user_type,
      u.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      {/* Header, Search, Filter, and Export Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h1>Users</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search by Name or Email Address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "250px",
              padding: "5px 10px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />
          <label style={{ fontSize: "14px", fontWeight: "bold", marginRight: "10px" }}>
            User Type:
          </label>
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            style={{
              padding: "5px 10px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          >

            <option value="All">All</option>
            <option value="agent">Agent</option>
            <option value="system">System</option>
          </select>
          <button onClick={exportToCSV} style={{ marginRight: "10px" }} className="btn btn-sm  btn-warning">Export</button>
          <Link style={{ marginRight: "10px" }} className="btn btn-sm  btn-primary" to="/users/new">Add New</Link>
        </div>
      </div>

      <div className="card animated fadeInDown">
      <table className="table table-striped">
      <thead className="table-primary"> {/* Makes header gray */}
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Create Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          {loading && (
            <tbody>
              <tr>
                <td colSpan="6" className="text-center">Loading...</td>
              </tr>
            </tbody>
          )}
          {!loading && (
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers
                  .slice((currentPage - 1) * perPage, currentPage * perPage)
                  .map((u) => (
                    <tr key={u.id}>
                      <td> FCC/US/{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.user_type}</td>
                      <td>{u.created_at}</td>
                      <td>
                        <Link  style={{ marginRight: "10px" }} className="btn btn-sm btn-primary w-24 text-center" to={`/users/${u.id}`}>Edit</Link>
                        &nbsp;
                        <button  style={{ marginRight: "10px" }} className="btn btn-sm btn-danger w-24 text-center" onClick={() => onDeleteClick(u)}>Delete</button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No users found</td>
                </tr>
              )}
            </tbody>
          )}
        </table>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-center align-items-center mt-3">
          <button
            className="btn btn-primary me-2"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <i className="bi bi-arrow-left"></i> Previous
          </button>

          <span className="fw-bold mx-2"> Page {currentPage} of {totalPages} </span>

          <button
            className="btn btn-primary ms-2"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

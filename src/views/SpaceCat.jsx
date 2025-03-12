import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link, useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function SpaceCat() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setNotification } = useStateContext();
    const navigate = useNavigate(); // Used for navigation

    useEffect(() => {
        getUsers();
    }, []);

    const onDeleteClick = (user) => {
        if (!window.confirm("Are you sure you want to delete this category?")) {
            return;
        }
        axiosClient.delete(`/space-categories/${user.id}`).then(() => {
            setNotification("Category was successfully deleted");
            getUsers();
        });
    };

    const getUsers = () => {
        setLoading(true);
        axiosClient
            .get(`/space-categories`)
            .then(({ data }) => {
                setLoading(false);
                setUsers(data || []);
            })
            .catch(() => {
                setLoading(false);
                setUsers([]);
            });
    };

    // 🔹 Export Table Data as CSV
    const exportToCSV = () => {
        if (users.length === 0) {
            setNotification("No data available to export!", "error");
            return;
        }

        const headers = ["Category ID", "Name", "Rate"];
        const rows = users.map((u) => [u.id, u.name, u.rate]);

        let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.href = encodedUri;
        link.download = "space_categories.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            {/* Header & Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h1>Space Category</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                    <button  style={{ marginRight: "10px" }} className="btn btn-sm  btn-warning" onClick={exportToCSV}>Export</button>
                    <Link style={{ marginRight: "10px" }} className=" btn btn-sm  btn-primary" to="/space-category/new">Add New</Link>
                </div>
            </div>

            <div className="card animated fadeInDown">
                <table className="table table-striped">
                    <thead className="table-primary"> {/* Makes header gray */}
                        <tr>
                            <th>Category ID</th>
                            <th>Name</th>
                            <th>Rate</th>
                            <th style={{textAlign:"center"}}>Actions</th>
                        </tr>
                    </thead>
                    {loading && (
                        <tbody>
                            <tr>
                                <td colSpan="4" className="text-center">Loading...</td>
                            </tr>
                        </tbody>
                    )}
                    {!loading && (
                        <tbody>
                            {users.length > 0 ? (
                                users.map((u) => (
                                    <tr key={u.id}>
                                        <td> FCC/SP/{u.id}</td>
                                        <td>{u.name}</td>
                                        <td>{u.rate}</td>
                                        <td style={{ display: "flex", gap: "10px", justifyContent: "center" }}>

                                            <button style={{ marginRight: "10px" }} className="btn btn-sm btn-primary w-24 text-center" onClick={() => navigate(`/space-category/edit/${u.id}`)}>Edit</button>

                                            <button style={{ marginRight: "10px" }} className="btn btn-sm btn-danger w-24 text-center" onClick={() => onDeleteClick(u)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">No Category found</td>
                                </tr>
                            )}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
}

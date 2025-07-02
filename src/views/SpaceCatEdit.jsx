import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";

const SpaceCatEdit = () => {
    const { id } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    const { setNotification } = useStateContext();

    // State for space category
    const [spaceCat, setSpaceCat] = useState({
        name: "",
        rate: "",
        system_agent_rate: "",
        corporate_agent_rate: ""
    });

    const [loading, setLoading] = useState(false);

    // Fetch specific space category
    useEffect(() => {
        setLoading(true);
        axiosClient
            .get(`/space-categories/${id}`)
            .then(({ data }) => {
                setSpaceCat(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    // Handle form submission (Update API)
    const handleSubmit = (e) => {
        e.preventDefault();

        axiosClient
            .put(`/space-categories/${id}`, spaceCat)
            .then(() => {
                setNotification("Space Category updated successfully!");
                navigate("/space-category"); // Redirect after update
            })
            .catch((error) => {
                console.error("Error updating space category:", error);
            });
    };

    return (
        <div className="card">
            <h2>Edit Space Category</h2>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            value={spaceCat.name}
                            onChange={(e) => setSpaceCat({ ...spaceCat, name: e.target.value })}
                            required
                        />
                    </div>

                    {/* Rate Field */}
                    <div className="form-group">
                        <label>Agents Rate:</label>
                        <input
                            type="number"
                            value={spaceCat.rate}
                            onChange={(e) => setSpaceCat({ ...spaceCat, rate: e.target.value })}
                            required
                        />
                    </div>
                   
                   
                    {/*System Agent Rate Field */}
                    <div className="form-group">
                        <label>General and Unclaimed Rate:</label>
                        <input
                            type="number"
                            value={spaceCat.system_agent_rate}
                            onChange={(e) => setSpaceCat({ ...spaceCat, system_agent_rate: e.target.value })}
                            required
                        />
                    </div>
                 
                 
                    {/*Corporate Agent Rate Field */}
                    <div className="form-group">
                        <label>Other Institutional/Business Rate:</label>
                        <input
                            type="number"
                            value={spaceCat.corporate_agent_rate}
                            onChange={(e) => setSpaceCat({ ...spaceCat, corporate_agent_rate: e.target.value })}
                            required
                        />
                    </div>

                    {/* Buttons */}


                    <div style={{ marginTop:"10px", display: "flex", gap: "10px", justifyContent: "center", float: "left" }}>
                        <button type="submit" className="btn btn-warning" >Update </button>
                        <button className="btn btn-danger" onClick={() => navigate("/space-category")}>Cancel</button>
                    </div>

                </form>
            )}
        </div>
    );
};

export default SpaceCatEdit;

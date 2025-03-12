import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function RolesCreate() {
    const navigate = useNavigate();
    const { setNotification } = useStateContext();

    const [roleName, setRoleName] = useState("");
    const [permissionName, setPermissionName] = useState("");
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch Roles & Permissions on Load
    useEffect(() => {
        fetchRolesAndPermissions();
    }, []);

    const fetchRolesAndPermissions = () => {
        setLoading(true);
        axiosClient
            .get("/roles")
            .then(({ data }) => {
                setRoles(data.roles); // Access roles from data object
            })
            .catch((err) => console.error(err));

        axiosClient
            .get("/permissions")
            .then(({ data }) => {
                setPermissions(data.permissions); // Access permissions from data object
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    // Create Role
    const createRole = (ev) => {
        ev.preventDefault();
        axiosClient
            .post("/roles", { name: roleName })
            .then(() => {
                setNotification("Role was successfully created");
                setRoleName(""); // Clear input
                fetchRolesAndPermissions(); // Refresh list
            })
            .catch((err) => {
                if (err.response && err.response.status === 422) {
                    setErrors(err.response.data.errors);
                }
            });
    };

    // Create Permission
    const createPermission = (ev) => {
        ev.preventDefault();
        axiosClient
            .post("/permissions", { name: permissionName })
            .then(() => {
                setNotification("Permission was successfully created");
                setPermissionName(""); // Clear input
                fetchRolesAndPermissions(); // Refresh list
            })
            .catch((err) => {
                if (err.response && err.response.status === 422) {
                    setErrors(err.response.data.errors);
                }
            });
    };

    return (
        <>
            <h1>Manage Roles & Permissions</h1>
            <div className="card animated fadeInDown">
                {loading && <div className="text-center">Loading...</div>}

                {errors && (
                    <div className="alert">
                        {Object.keys(errors).map((key) => (
                            <p key={key}>{errors[key][0]}</p>
                        ))}
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Role Creation Form */}
                        <form onSubmit={createRole} style={{ marginBottom: "20px" }}>
                            <h3>Create Role</h3>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                    value={roleName}
                                    onChange={(ev) => setRoleName(ev.target.value)}
                                    placeholder="Role Name"
                                />
                                <button className="btn btn-primary">Save</button>
                            </div>
                        </form>

                        {/* Permission Creation Form */}
                        {/* <form onSubmit={createPermission} style={{ marginBottom: "20px" }}>
                            <h3>Create Permission</h3>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                    value={permissionName}
                                    onChange={(ev) => setPermissionName(ev.target.value)}
                                    placeholder="Permission Name"
                                />
                                <button className="btn btn-primary">Save</button>
                            </div>
                        </form> */}

                        {/* Display Roles and Permissions */}
                        <div style={{ display: "flex", gap: "30px" }}>
                            <div>
                                <h3>Roles List</h3>
                                <ul>
                                    {roles.map((role) => (
                                        <li key={role.id}>
                                            {role.name}:{" "}
                                            {role.permissions
                                                .map((perm) => perm.name)
                                                .join(", ")}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3>Permissions List</h3>
                                <ul>
                                    {permissions.map((perm) => (
                                        <li key={perm.id}>{perm.name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function PermissionAssign() {
    const navigate = useNavigate();
    const { setNotification } = useStateContext();

    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRolesAndPermissions();
    }, []);

    const fetchRolesAndPermissions = () => {
        setLoading(true);
        axiosClient
            .get("/roles")
            .then(({ data }) => setRoles(data.roles)) // Access roles from data object
            .catch(console.error)
            .finally(() => setLoading(false));

        axiosClient
            .get("/permissions")
            .then(({ data }) => setPermissions(data.permissions)) // Access permissions from data object
            .catch(console.error);
    };

    const handlePermissionChange = (permissionId) => {
        setSelectedPermissionIds((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const onSubmit = (ev) => {
        ev.preventDefault();
        axiosClient
            .post("/assign-permissions", {
                role_id: selectedRoleId,
                permission_ids: selectedPermissionIds,
            })
            .then(() => {
                setNotification("Permissions assigned successfully");
                navigate("/roles");
            })
            .catch((err) => {
                if (err.response && err.response.status === 422) {
                    setErrors(err.response.data.errors);
                }
            });
    };

    return (
        <>
            <h1>Assign Permissions to Role</h1>
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
                    <form onSubmit={onSubmit}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {/* Role Selection Dropdown */}
                            <div>
                                <label>Role</label>
                                <select
                                    value={selectedRoleId}
                                    onChange={(ev) => setSelectedRoleId(ev.target.value)}
                                >
                                    <option value="">Select Role</option>
                                    {roles
                                        .filter((role) => role.name.toLowerCase() !== "admin") // Hide "admin"
                                        .map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                </select>

                            </div>

                            {/* Permissions Checkboxes */}
                            <div>
                                <label>Permissions</label>
                                <div mt-2>
                                    {permissions.map((permission) => (
                                        <label key={permission.id} style={{ display: "block" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissionIds.includes(permission.id)}
                                                onChange={() => handlePermissionChange(permission.id)}
                                            />
                                            {permission.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button className="btn btn-primary">Assign Permissions</button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
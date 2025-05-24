import { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function RolesCreate() {
    const { setNotification } = useStateContext();
    const [roleName, setRoleName] = useState("");
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState({});

    useEffect(() => {
        fetchRolesAndPermissions();
    }, []);

    const fetchRolesAndPermissions = async () => {
        setLoading(true);
        try {
            const [rolesRes, permissionsRes] = await Promise.all([
                axiosClient.get("/roles-new"),
                axiosClient.get("/permissions-new")
            ]);

            setRoles(rolesRes.data.data || []);
            setPermissions(permissionsRes.data || []);

            // Initialize permission selections
            const initialPermissions = {};
            (permissionsRes.data.data || []).forEach(perm => {
                initialPermissions[perm.id] = false;
            });
            setSelectedPermissions(initialPermissions);
        } catch (err) {
            console.error("Fetch error:", err);
            setNotification("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const createRole = async (ev) => {
        ev.preventDefault();
        setErrors(null);

        try {
            const response = await axiosClient.post("/roles-new", { name: roleName });
            setNotification(response.data.message || "Role created successfully");
            setRoleName("");
            fetchRolesAndPermissions();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setNotification(err.response?.data?.message || "Failed to create role", "error");
            }
        }
    };

    const deleteRole = async (roleId) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;

        try {
            await axiosClient.delete(`/roles-new/${roleId}`);
            setNotification("Role deleted successfully");
            fetchRolesAndPermissions();
        } catch (err) {
            setNotification(err.response?.data?.message || "Failed to delete role", "error");
        }
    };

    const viewRole = (role) => {
        setSelectedRole(role);
        setShowViewModal(true);
    };

    const editRole = (role) => {
        setSelectedRole(role);

        // Set current permissions for the role
        const rolePermissions = {};
        permissions.forEach(perm => {
            rolePermissions[perm.id] = role.permissions?.some(p => p.id === perm.id) || false;
        });
        setSelectedPermissions(rolePermissions);
        setShowEditModal(true);
    };

    const handlePermissionChange = (permId) => {
        setSelectedPermissions(prev => ({
            ...prev,
            [permId]: !prev[permId]
        }));
    };

    const updateRolePermissions = async () => {
        const selectedPermIds = Object.keys(selectedPermissions)
            .filter(permId => selectedPermissions[permId])
            .map(id => parseInt(id));

        try {
            const response = await axiosClient.post(`/roles-new/${selectedRole.id}/permissions`, {
                permission_ids: selectedPermIds
            });

            setNotification(response.data.message || "Permissions updated successfully");
            setShowEditModal(false);
            fetchRolesAndPermissions();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setNotification(err.response?.data?.message || "Failed to update permissions", "error");
            }
        }
    };

    const formatPermission = (permission) => {
        const capitalizeWords = (str) =>
            str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

        return `${capitalizeWords(permission.module)} (${permission.action})`;
    };



    const groupPermissionsByModule = (permissions) => {
        const grouped = {};

        permissions.forEach((perm) => {
            const moduleName = perm.module.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            if (!grouped[moduleName]) {
                grouped[moduleName] = [];
            }
            grouped[moduleName].push(perm.action);
        });

        return grouped;
    };




    return (
        <div className="container py-4">
            <h1 className="mb-4">Manage Roles & Permissions</h1>

            {/* Create Role */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <h2 className="h4 mb-3">Create Role</h2>
                    {errors && (
                        <div className="alert alert-danger">
                            {Object.values(errors).flat().map((err, i) => (
                                <p key={i} className="mb-0">{err}</p>
                            ))}
                        </div>
                    )}
                    <form onSubmit={createRole} className="row g-3">
                        <div className="col-md-8">
                            <input
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="Enter role name"
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Role'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Roles & Permissions */}
            <div className="row">
                <div className="col-md-12">
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Roles List</h5>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center p-4">
                                    <div className="spinner-border text-primary" role="status" />
                                </div>
                            ) : (
                                <div className="table-responsive" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                                    <table className="table table-hover" style={{ minWidth: '800px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '200px', minWidth: '200px' }}>Role</th>
                                                <th style={{ minWidth: '400px' }}>Permissions</th>
                                                <th style={{ width: '150px', minWidth: '150px' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roles.map(role => (
                                                <tr key={role.id}>
                                                    <td className="align-top fw-semibold" style={{ width: '200px' }}>{role.name}</td>
                                                    <td className="align-top" style={{ maxWidth: '600px' }}>
                                                        {role.permissions?.length > 0 ? (
                                                            <div
                                                                className="d-flex flex-wrap gap-2 py-2"
                                                                style={{
                                                                    maxHeight: '150px',
                                                                    overflowY: 'auto',
                                                                    alignItems: 'flex-start'
                                                                }}
                                                            >
                                                                {role.permissions.map(perm => (
                                                                    <span
                                                                        key={perm.id}
                                                                        className="badge bg-primary bg-opacity-10 text-primary text-truncate"
                                                                        style={{
                                                                            fontSize: '0.85rem',
                                                                            maxWidth: '180px'
                                                                        }}
                                                                        title={formatPermission(perm)}
                                                                    >
                                                                        {formatPermission(perm)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">None</span>
                                                        )}
                                                    </td>
                                                    <td className="align-top" style={{ width: '150px' }}>
                                                        <div className="d-flex flex-column gap-2 py-2">
                                                            <button
                                                                onClick={() => viewRole(role)}
                                                                className="btn btn-sm btn-outline-primary text-nowrap"
                                                                disabled={loading}
                                                            >
                                                                <i className="bi bi-eye-fill me-1"></i>View
                                                            </button>
                                                            { role.name != "Super Admin" && (
                                                            <button
                                                                onClick={() => editRole(role)}
                                                                className="btn btn-sm btn-outline-success text-nowrap"
                                                                disabled={loading}
                                                            >
                                                                <i className="bi bi-pencil-fill me-1"></i>Edit
                                                            </button>
                                                            )}

                                                            {role.name != "Admin" && role.name != "Super Admin" && (
                                                                <button
                                                                    onClick={() => deleteRole(role.id)}
                                                                    className="btn btn-sm btn-outline-danger text-nowrap"
                                                                    disabled={loading}
                                                                >
                                                                    <i className="bi bi-trash-fill me-1"></i>Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Permissions List */}
                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">All Permissions</h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                {Object.entries(groupPermissionsByModule(permissions)).map(([module, actions]) => (
                                    <li key={module} className="list-group-item">
                                        <strong>{module}</strong>
                                        <div className="mt-1 ms-3">
                                            {actions.map((action, idx) => (
                                                <span key={idx} className="badge bg-secondary me-2 mb-1 text-capitalize">
                                                    {action}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>

            {/* View Role Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-semibold">👤 Role Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRole && (
                        <div>
                            <h5 className="fw-bold mb-3">{selectedRole.name}</h5>

                            <h6 className="text-secondary">Permissions:</h6>
                            {selectedRole.permissions?.length > 0 ? (
                                <div className="border rounded p-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    <ul className="list-group list-group-flush">
                                        {Object.entries(groupPermissionsByModule(selectedRole.permissions)).map(([module, actions]) => (
                                            <li key={module} className="list-group-item">
                                                <strong>{module}</strong>
                                                <div className="mt-1 ms-3">
                                                    {actions.map((action, index) => (
                                                        <span key={index} className="badge bg-primary me-2 mb-1 text-capitalize">
                                                            {action}
                                                        </span>
                                                    ))}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-muted fst-italic mt-2">No permissions assigned</p>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowViewModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>



            {/* Edit Role Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Role Permissions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRole && (
                        <>
                            <h4 className="mb-3">Role: {selectedRole.name}</h4>
                            <h5 className="mb-3">Select Permissions:</h5>

                            <div className="permissions-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {Object.entries(
                                    permissions.reduce((groups, perm) => {
                                        const module = perm.module;
                                        if (!groups[module]) {
                                            groups[module] = [];
                                        }
                                        groups[module].push(perm);
                                        return groups;
                                    }, {})
                                ).map(([module, modulePermissions]) => (
                                    <div key={module} className="mb-4">
                                        <h6 className="fw-bold text-primary mb-3">
                                            {module.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </h6>
                                        <div className="row">
                                            {modulePermissions.map(perm => (
                                                <div key={perm.id} className="col-md-6 mb-2">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={selectedPermissions[perm.id] || false}
                                                            onChange={() => handlePermissionChange(perm.id)}
                                                            id={`edit-perm-${perm.id}`}
                                                            disabled={loading}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`edit-perm-${perm.id}`}
                                                        >
                                                            {perm.action.charAt(0).toUpperCase() + perm.action.slice(1)}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={updateRolePermissions} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
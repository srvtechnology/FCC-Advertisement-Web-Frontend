import { Navigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider"; // Import your context
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";

function ProtectedRoute({ children, allowedRoles }) {
    const { token } = useStateContext();
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        if (token) {
            axiosClient
                .get("/user")
                .then(({ data }) => {
                    if (isMounted) {
                        setUserRoles(data.roles.map((role) => role.name));
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user roles:", error);
                })
                .finally(() => {
                    if (isMounted) {
                        setLoading(false);
                    }
                });
        } else {
            setLoading(false);
        }

        return () => {
            isMounted = false; // Cleanup to prevent setting state on unmounted component
        };
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.some((role) => userRoles.includes(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { getUserPermissions } from "../views/getUserPermissions.js";


function ProtectedRoute({ children, allowedRoles, requiredPermission }) {
    const { token, user } = useStateContext();
    const [userRoles, setUserRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

  

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                if (token) {
                    // Load user roles
                    const userData = await axiosClient.get("/user");
                    // console.log((userData.data.role.name || '').toLowerCase())
                    // if (isMounted) setUserRoles(userData.data.roles?.map(role => role.name) || []);
                    if (isMounted) setUserRoles((userData.data.role.name || '').toLowerCase());

                    
                    // Load permissions
                    const permData = await getUserPermissions();
                    if (isMounted) setPermissions(permData || []);
                }
            } catch (error) {
                console.error("Error loading auth data:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has the required role
    const hasRole = allowedRoles?.length === 0 || 
                   allowedRoles?.some(role => userRoles.includes(role));

    // Check if user has the required permission
    const hasPermission = !requiredPermission || 
                        permissions.some(perm => 
                            perm.module === requiredPermission.module && 
                            perm.action === requiredPermission.action
                        );

    if (!hasRole || !hasPermission) {
        return <Navigate to="/not-found" replace />;
    }

    return children;
}

export default ProtectedRoute;
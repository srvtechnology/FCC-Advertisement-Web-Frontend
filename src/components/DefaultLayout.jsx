import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios-client.js";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { LayoutDashboard, Users, Building2, Map, CalendarCheck, CreditCard, ShieldCheck, KeyRound } from "lucide-react";
import { getUserPermissions } from "../views/getUserPermissions.js";

export default function DefaultLayout() {
    const { user, token, setUser, setToken, notification } = useStateContext();
    const [userRoles, setUserRoles] = useState([]);
    const [userRolesPermission, setUserRolesPermission] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation(); // Get the current location

    const [permissions, setPermissions] = useState({}); // step 2
    // step-3
    useEffect(() => {
        const loadPermissions = async () => {
            const raw = await getUserPermissions();
            // console.log(raw)
            setPermissions(raw);
        };
        loadPermissions();
    }, []);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        axiosClient.get('/user')
            .then(({ data }) => {
                console.log(data);
                setUser(prevUser => prevUser?.id === data.id ? prevUser : data);
                setUserRoles((data.role.name || '').toLowerCase());
                // setUserRoles(prevRoles => JSON.stringify(prevRoles) === JSON.stringify(data.roles?.map(role => role.name)) ? prevRoles : data.roles?.map(role => role.name) || []);
                setUserRolesPermission(prevPermissions => JSON.stringify(prevPermissions) === JSON.stringify(data.roles?.flatMap(role => role.permissions?.map(permission => permission.name))) ? prevPermissions : data.roles?.flatMap(role => role.permissions?.map(permission => permission.name)) || []);
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" />;
    }

    const onLogout = (ev) => {
        ev.preventDefault();
        axiosClient.post('/logout').then(() => {
            setUser({});
            setToken(null);
        });
    };
    // console.log(location.pathname.split('/')[1])



    const renderSideNav = () => {
        // console.log(userRoles.length, userRoles)
        if (!userRoles.length) return null;

        let links = [];
        const basePath = location.pathname.split('/')[1];

        const navItemStyle = (path) => ({
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            borderRadius: "6px",
            color: basePath === path ? "#ffffff" : "#d1d5db",
            backgroundColor: basePath === path ? "#861ce7" : "transparent",
            transition: "background 0.3s, color 0.3s",
            fontSize: "14px",
            fontWeight: "500",
            textDecoration: "none",
        });

        // Helper function to check if user has any permission for a module
        const hasModulePermission = (moduleName) => {
            return Array.isArray(permissions) &&
                permissions.some(perm => perm.module === moduleName);
        };

        if (userRoles==="admin" || userRoles==="super admin") {
            // Admin sees all links by default, but we can make it more precise
            links.push(
                <Link key="dashboard" to="/dashboard" style={navItemStyle("dashboard")} className="sidebar-link">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
            );

            // Only show Users if has any manage_user permissions
            if (hasModulePermission("manage_user")) {
                links.push(
                    <Link key="users" to="/users" style={navItemStyle("users")} className="sidebar-link">
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                );
            }

            // Only show Space related items if has any manage_space_category permissions
            if (hasModulePermission("manage_space_category")) {
                links.push(
                    <Link key="space-category" to="/space-category" style={navItemStyle("space-category")} className="sidebar-link">
                        <Building2 size={20} />
                        <span>Space Category</span>
                    </Link>
                );


            }


            // Only show Space related items if has any manage_spaces permissions
            if (hasModulePermission("manage_spaces")) {

                links.push(
                    <Link key="space" to="/space" style={navItemStyle("space")} className="sidebar-link">
                        <Map size={20} />
                        <span>Space List</span>
                    </Link>
                );
            }

            // Only show Bookings if has any manage_booking permissions
            if (hasModulePermission("manage_booking")) {
                links.push(
                    <Link key="bookings" to="/bookings" style={navItemStyle("bookings")} className="sidebar-link">
                        <CalendarCheck size={20} />
                        <span>Bookings</span>
                    </Link>
                );
            }

            // Only show Payments if has any manage_payment permissions
            if (hasModulePermission("manage_payment")) {
                links.push(
                    <Link key="payments" to="/payments" style={navItemStyle("payments")} className="sidebar-link">
                        <CreditCard size={20} />
                        <span>Payments</span>
                    </Link>
                );
            }

            // Admin-specific items (always visible)
            links.push(
                <Link key="roles" to="/roles" style={navItemStyle("roles")} className="sidebar-link">
                    <ShieldCheck size={20} />
                    <span>Roles & Permissions</span>
                </Link>
            );

            links.push(
                <Link key="logs" to="/logs" style={navItemStyle("logs")} className="sidebar-link">
                    <KeyRound size={20} />
                    <span>Audit Logs</span>
                </Link>
            );
        } else {
            // Regular users see only what they have permissions for

            if (hasModulePermission("manage_user")) {
                links.push(
                    <Link key="users" to="/users" style={navItemStyle("users")} className="sidebar-link">
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                );
            }


            if (hasModulePermission("manage_space_category")) {
                links.push(
                    <Link key="space-category" to="/space-category" style={navItemStyle("space-category")} className="sidebar-link">
                        <Building2 size={20} />
                        <span>Space Category</span>
                    </Link>
                );
            }
            if (hasModulePermission("manage_spaces")) {
                links.push(
                    <Link key="space" to="/space" style={navItemStyle("space")} className="sidebar-link">
                        <Map size={20} />
                        <span>Space List</span>
                    </Link>
                );
            }

            if (hasModulePermission("manage_booking")) {
                links.push(
                    <Link key="bookings" to="/bookings" style={navItemStyle("bookings")} className="sidebar-link">
                        <CalendarCheck size={20} />
                        <span>Bookings</span>
                    </Link>
                );
            }

            if (hasModulePermission("manage_payment")) {
                links.push(
                    <Link key="payments" to="/payments" style={navItemStyle("payments")} className="sidebar-link">
                        <CreditCard size={20} />
                        <span>Payments</span>
                    </Link>
                );
            }
        }

        return links.length > 0 ? <div className="sidebar-nav">{links}</div> : null;
    };
    // Add CSS for hover effects
    const style = document.createElement('style');
    style.innerHTML = `
        .sidebar-link {
            transition: all 0.3s ease-in-out;
        }
        .sidebar-link:hover {
            background-color: #6d14c5 !important;
            color: #ffffff !important;
        }
        .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
    `;
    document.head.appendChild(style);


    return (
        <div id="defaultLayout">
            <aside className="w-64 h-full bg-gray-200 p-4">
                {/* Logo */}
                <div className="text-center mb-4">
                    <img
                       style={{width:"190px"}}
                        src={`${import.meta.env.VITE_API_BASE_URL}/storage/image4.png`}
                        alt="Logo"
                        className="w-24 h-auto mx-auto"
                    />
                </div>

                {/* Text Styling */}
                <h2 className="text-white font-bold text-lg text-center bg-gray-800 p-2 rounded">
                    FCC AMS
                </h2>

                {/* Navigation */}
                <nav>{renderSideNav()}</nav>
            </aside>

            <div className="content">
                <header className="flex justify-between items-center p-4 bg-gray-300">
                    <div><b style={{ fontSize: "20px" }}> Freetown City Council - Advertisement
                        Management System </b></div>
                    <div style={{ justifyContent: "center", display: "flex" }}>
                        <span style={{ color: "#5b08a7", marginTop: "10px", fontWeight: "bold" }}>
                            {user?.name} &nbsp; &nbsp;
                        </span>

                        <a
                            onClick={onLogout}
                            className="btn-logout"
                            style={{
                                background: "rgb(206 184 225)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                marginBottom: "10px",  /* Fixed typo from 'marginButtom' to 'marginBottom' */
                                padding: "8px 12px",
                                borderRadius: "5px",
                                transition: "background 0.3s ease, color 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#5b08a7";
                                e.target.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "rgb(206 184 225)";
                                e.target.style.color = "inherit";
                            }}
                        >
                            <LogOut size={18} style={{ transition: "color 0.3s ease" }} />
                            Logout
                        </a>

                    </div>
                </header>
                <main className="p-4">
                    <Outlet />
                </main>
                {notification && <div className="notification p-2 bg-green-200">{notification}</div>}
            </div>
        </div>
    );
}
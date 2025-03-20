import { createBrowserRouter, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import Signup from "./views/Signup";
import Users from "./views/Users";
import UserForm from "./views/UserForm";
import SpaceEntryForm from "./views/SpaceEntryForm.jsx";
import Spaces from "./views/Spaces.jsx";
import SpaceEntryView from "./views/spaceEntryView.jsx";
import SpaceBook from "./views/SpaceBook.jsx";
import SpaceCat from "./views/SpaceCat.jsx";
import SpaceCatForm from "./views/SpaceCatForm.jsx";
import Bookings from "./views/Bookings.jsx";
import Payments from "./views/Payments.jsx";
import PaymentView from "./views/PaymentView.jsx";
import BookingView from "./views/BookingView.jsx";
import RolesCreate from "./views/RolesCreate.jsx";
import PermissionAssign from "./views/PermissionAssign.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // Import ProtectedRoute
import SpaceCatEdit from "./views/SpaceCatEdit.jsx";
import OtpSubmit from "./views/OtpSubmit.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <DefaultLayout />,
        children: [
            
            {
                path: '/dashboard',
                element: (
                    // <ProtectedRoute allowedRoles={['admin']}>
                        <Dashboard />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/users',
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Users />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/users/new',
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <UserForm key="userCreate" />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/users/:id',
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <UserForm key="userUpdate" />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/space-category',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
                        <SpaceCat />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/space-category/new',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
                        <SpaceCatForm key="spaceCatCreate" />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/space-category/edit/:id',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
                        <SpaceCatEdit key="SpaceCatEdit" />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/space',
                element: (
                    // <ProtectedRoute allowedRoles={['admin', 'subadmin','user']}>
                        <Spaces />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/space/new',
                element: (
                    // <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
                        <SpaceEntryForm key="spaceCreate" />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/space/:id',
                element: (
                    // <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
                        <SpaceEntryForm key="spaceUpdate" />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/space/view/:id',
                element: (
                    // <ProtectedRoute allowedRoles={['admin', 'subadmin', 'user']}>
                        <SpaceEntryView key="spaceView" />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/space/book/:id',
                element: (
                    // <ProtectedRoute allowedRoles={['admin', 'subadmin', 'user']}>
                        <SpaceBook key="spaceBook" />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/bookings',
                element: (
                    // <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
                        <Bookings key="bookings" />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/bookings/:id',
                element: (
                    // <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
                        <BookingView key="bookingView" />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/payments',
                element: (
                    // <ProtectedRoute allowedRoles={['admin']}>
                        <Payments key="payments" />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/payments/:id',
                element: (
                    // <ProtectedRoute allowedRoles={['admin']}>
                        <PaymentView key="paymentView" />
                    // </ProtectedRoute>
                ),
            },
            {
                path: '/roles',
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <RolesCreate key="roles" />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/permissions',
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <PermissionAssign key="permissions" />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: '/',
        element: <GuestLayout />,
        children: [
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '/signup',
                element: <Signup />,
            },
            {
                path: '/otp',
                element: <OtpSubmit />,
            },
        ],
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

export default router;
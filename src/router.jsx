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
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SpaceCatEdit from "./views/SpaceCatEdit.jsx";
import OtpSubmit from "./views/OtpSubmit.jsx";
import Logs from "./views/Logs.jsx";

// Permission mapping for all routes
const routePermissions = {
  // Dashboard
//   '/dashboard': { module: 'dashboard', action: '' },
  
  // User Management done
  '/users': { module: 'manage_user', action: 'list' },
  '/users/new': { module: 'manage_user', action: 'add' },
  '/users/:id': { module: 'manage_user', action: 'edit' },
  
  // Space Management  //done
  '/space': { module: 'manage_spaces', action: 'list' },
  '/space/new': { module: 'manage_spaces', action: 'add' },
  '/space/:id': { module: 'manage_spaces', action: 'edit' },
  '/space/view/:id': { module: 'manage_spaces', action: 'view' },
  '/space/book/:id': { module: 'manage_spaces', action: 'edit' },
  
  
  // Space Category //done
  '/space-category': { module: 'manage_space_category', action: 'list' },
  '/space-category/new': { module: 'manage_space_category', action: 'add' },
  '/space-category/edit/:id': { module: 'manage_space_category', action: 'edit' },
  
  // Booking Management
  '/bookings': { module: 'manage_booking', action: 'list' },
  '/bookings/:id': { module: 'manage_booking', action: 'view' },
 
  
  // Payment Management
  '/payments': { module: 'manage_payment', action: 'list' },
  '/payments/:id': { module: 'manage_payment', action: 'view' },
  
 
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      // Dashboard
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute 
            allowedRoles={['admin']}
            // requiredPermission={routePermissions['/dashboard']}
          >
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      
      // User Management
      {
        path: '/users',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/users']}
          >
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: '/users/new',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/users/new']}
          >
            <UserForm key="userCreate" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/users/:id',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/users/:id']}
          >
            <UserForm key="userUpdate" />
          </ProtectedRoute>
        ),
      },
      
      // Space Category
      {
        path: '/space-category',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/space-category']}
          >
            <SpaceCat />
          </ProtectedRoute>
        ),
      },
      {
        path: '/space-category/new',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/space-category/new']}
          >
            <SpaceCatForm key="spaceCatCreate" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/space-category/edit/:id',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/space-category/edit/:id']}
          >
            <SpaceCatEdit key="SpaceCatEdit" />
          </ProtectedRoute>
        ),
      },
      
      // Space Management
      {
        path: '/space',
        element: (
          <ProtectedRoute 
            // allowedRoles={['']}
            allowedRoles={['']}
            requiredPermission={routePermissions['/space']}
          >
            <Spaces />
          </ProtectedRoute>
        ),
      },
      {
        path: '/space/new',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/space/new']}
          >
            <SpaceEntryForm key="spaceCreate" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/space/:id',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/space/:id']}
          >
            <SpaceEntryForm key="spaceUpdate" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/space/view/:id',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/space/view/:id']}
          >
            <SpaceEntryView key="spaceView" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/space/book/:id',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/space/book/:id']}
          >
            <SpaceBook key="spaceBook" />
          </ProtectedRoute>
        ),
      },
      
      // Booking Management
      {
        path: '/bookings',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/bookings']}
          >
            <Bookings key="bookings" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/bookings/:id',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/bookings/:id']}
          >
            <BookingView key="bookingView" />
          </ProtectedRoute>
        ),
      },
      
      // Payment Management
      {
        path: '/payments',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/payments']}
          >
            <Payments key="payments" />
          </ProtectedRoute>
        ),
      },
      {
        path: '/payments/:id',
        element: (
          <ProtectedRoute 
            allowedRoles={['']}
            requiredPermission={routePermissions['/payments/:id']}
          >
            <PaymentView key="paymentView" />
          </ProtectedRoute>
        ),
      },
      
      // Role & Permission Management
      {
        path: '/roles',
        element: (
            <ProtectedRoute 
            allowedRoles={['admin']}
            >
                <RolesCreate key="roles" />
            </ProtectedRoute>
        ),
    },

      // Role & Permission Management
      {
        path: '/logs',
        element: (
            <ProtectedRoute 
            allowedRoles={['admin']}
            >
                <Logs/>
            </ProtectedRoute>
        ),
    },
    
      
      // Catch-all route
      {
        path: '*',
        element: <NotFound />,
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
]);

export default router;
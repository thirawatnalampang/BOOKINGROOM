import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";
import Login from "./pages/Login";
import Users from "./pages/Users";
import AddRoom from "./pages/AddRoom";
import EditRoom from "./pages/EditRoom";

import ProtectedRoute from "./components/ProtectedRoute";

function AppLayout() {
  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        transition-colors duration-300

        dark:bg-slate-950
      "
    >
      {/* SIDEBAR */}
      <Sidebar />

      {/* TOPBAR */}
      <Topbar />

      {/* CONTENT */}
      <main
        className="
          ml-[250px]
          min-h-screen
          pt-[82px]
        "
      >
        <div className="p-6">
          <Routes>

            {/* =========================================
                DASHBOARD
            ========================================= */}
            <Route
              path="/"
              element={<Dashboard />}
            />

            {/* =========================================
                ROOMS
            ========================================= */}
            <Route
              path="/rooms"
              element={<Rooms />}
            />

            {/* =========================================
                ADD ROOM
            ========================================= */}
            <Route
              path="/rooms/add"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AddRoom />
                </ProtectedRoute>
              }
            />

            {/* =========================================
                EDIT ROOM
            ========================================= */}
            <Route
              path="/rooms/edit/:id"
              element={
                <ProtectedRoute adminOnly={true}>
                  <EditRoom />
                </ProtectedRoute>
              }
            />

            {/* =========================================
                BOOKING
            ========================================= */}
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />

            {/* =========================================
                MY BOOKINGS
            ========================================= */}
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />

            {/* =========================================
                ADMIN BOOKINGS
            ========================================= */}
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />

            {/* =========================================
                USERS
            ========================================= */}
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* =========================================
                NOT FOUND
            ========================================= */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================================
            LOGIN
        ========================================= */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* =========================================
            MAIN APP
        ========================================= */}
        <Route
          path="*"
          element={<AppLayout />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
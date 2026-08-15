import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import ProtectedRoute from "./components/ProtectedRoute";
import EditRoom from "./pages/EditRoom";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* =================================================
            MAIN SYSTEM
        ================================================= */}
        <Route
          path="*"
          element={
            <div className="app">

              <Sidebar />

              <div className="main-area">

                <Topbar />

                <main className="content">

                  <Routes>

                    {/* =========================
                        PUBLIC / GENERAL
                    ========================= */}

                    <Route
                      path="/"
                      element={<Dashboard />}
                    />

                    <Route
                      path="/rooms"
                      element={<Rooms />}
                    />

<Route
  path="/rooms/add"
  element={<AddRoom />}
/>
         <Route
  path="/rooms/edit/:id"
  element={
    <ProtectedRoute>
      <EditRoom />
    </ProtectedRoute>
  }
/>           {/* =========================
                        USER
                    ========================= */}

                    <Route
                      path="/booking"
                      element={
                        <ProtectedRoute>
                          <Booking />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/my-bookings"
                      element={
                        <ProtectedRoute>
                          <MyBookings />
                        </ProtectedRoute>
                      }
                    />


                    {/* =========================
                        ADMIN
                    ========================= */}

                    <Route
                      path="/admin/bookings"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminBookings />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <Users />
                        </ProtectedRoute>
                      }
                    />


                    {/* =========================
                        NOT FOUND
                    ========================= */}

                    <Route
                      path="*"
                      element={
                        <Navigate to="/" replace />
                      }
                    />

                  </Routes>

                </main>

              </div>

            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
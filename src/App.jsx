import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import Subjects from "./pages/Subjects.jsx";
import Exams from "./pages/Exams.jsx";
import Marks from "./pages/Marks.jsx";
import Results from "./pages/Results.jsx";
import Rankings from "./pages/Rankings.jsx";
import Marksheet from "./pages/Marksheet.jsx";
import AboveAverage from "./pages/AboveAverage.jsx";

import StudentLogin from "./pages/StudentLogin.jsx";
import StudentResult from "./pages/StudentResult.jsx";

import "./App.css";

/* =========================================================
   STUDENT PROTECTED ROUTE
========================================================= */

function StudentProtectedRoute({ children }) {
  const studentLoggedIn =
    localStorage.getItem("studentLoggedIn");

  const studentId =
    localStorage.getItem("studentId");

  if (
    studentLoggedIn !== "true" ||
    !studentId
  ) {
    return (
      <Navigate
        to="/student-login"
        replace
      />
    );
  }

  return children;
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [isLoggedIn, setIsLoggedIn] =
    useState(
      localStorage.getItem(
        "examAdminLoggedIn"
      ) === "true"
    );

  /* =====================================================
     ADMIN LOGIN
  ===================================================== */

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  /* =====================================================
     ADMIN LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "examAdminLoggedIn"
    );

    localStorage.removeItem(
      "examAdminName"
    );

    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            STUDENT LOGIN
        ================================================= */}

        <Route
          path="/student-login"
          element={<StudentLogin />}
        />

        {/* =================================================
            STUDENT RESULT
        ================================================= */}

        <Route
          path="/student-result"
          element={
            <StudentProtectedRoute>

              <StudentResult />

            </StudentProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN PORTAL
        ================================================= */}

        <Route
          path="/*"
          element={
            !isLoggedIn ? (

              <Login
                onLogin={handleLogin}
              />

            ) : (

              <div className="app">

                <Sidebar />

                <div className="main-content">

                  <Header
                    onLogout={handleLogout}
                  />

                  <div className="page-content">

                    <Routes>

                      {/* DASHBOARD */}

                      <Route
                        path="/"
                        element={
                          <Dashboard />
                        }
                      />

                      {/* STUDENTS */}

                      <Route
                        path="/students"
                        element={
                          <Students />
                        }
                      />

                      {/* SUBJECTS */}

                      <Route
                        path="/subjects"
                        element={
                          <Subjects />
                        }
                      />

                      {/* EXAMS */}

                      <Route
                        path="/exams"
                        element={
                          <Exams />
                        }
                      />

                      {/* ENTER MARKS */}

                      <Route
                        path="/marks"
                        element={
                          <Marks />
                        }
                      />

                      {/* FINAL RESULTS */}

                      <Route
                        path="/results"
                        element={
                          <Results />
                        }
                      />

                      {/* RANKINGS */}

                      <Route
                        path="/rankings"
                        element={
                          <Rankings />
                        }
                      />

                      {/* MARKSHEET */}

                      <Route
                        path="/marksheet"
                        element={
                          <Marksheet />
                        }
                      />

                      {/* ABOVE AVERAGE */}

                      <Route
                        path="/above-average"
                        element={
                          <AboveAverage />
                        }
                      />

                    </Routes>

                  </div>

                </div>

              </div>

            )
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
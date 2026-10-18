import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

import API from "../services/api";

function StudentLogin() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (
    event
  ) => {

    event.preventDefault();

    setError("");

    if (
      !username.trim() ||
      !password.trim()
    ) {
      setError(
        "Please enter username and password."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await API.post(
          "/student-login",
          {
            username:
              username.trim(),

            password:
              password.trim(),
          }
        );

      if (
        response.data.success
      ) {

        localStorage.setItem(
          "studentLoggedIn",
          "true"
        );

        localStorage.setItem(
          "studentId",
          String(
            response.data.studentId
          )
        );

        localStorage.setItem(
          "studentUsername",
          response.data.username
        );

        navigate(
          "/student-result"
        );
      }

    } catch (error) {

      console.error(
        "Student login error:",
        error
      );

      if (
        error.response?.status ===
        401
      ) {
        setError(
          "Invalid username or password."
        );
      } else {
        setError(
          "Unable to login. Please check whether Spring Boot backend is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-login-page">

      <div className="student-login-card">

        <div className="student-login-left">

          <div className="student-login-logo">
            <GraduationCap
              size={42}
            />
          </div>

          <h1>
            Student Portal
          </h1>

          <h2>
            St. Joseph&apos;s
            Institute of Technology
          </h2>

          <p>
            III Year Examination
            Management System
          </p>

          <div className="student-login-features">

            <div>
              ✓ View Final Result
            </div>

            <div>
              ✓ View Previous Results
            </div>

            <div>
              ✓ View GPA & CGPA
            </div>

            <div>
              ✓ Print / Save PDF
            </div>

          </div>

        </div>

        <div className="student-login-right">

          <div className="student-login-heading">

            <GraduationCap
              size={34}
            />

            <div>

              <h2>
                Student Login
              </h2>

              <p>
                Login to view your
                examination result
              </p>

            </div>

          </div>

          <form
            onSubmit={handleLogin}
          >

            <div className="student-login-field">

              <label>
                Username
              </label>

              <div className="student-login-input">

                <User size={19} />

                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  autoComplete="username"
                />

              </div>

            </div>

            <div className="student-login-field">

              <label>
                Password
              </label>

              <div className="student-login-input">

                <Lock size={19} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="student-password-button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >

                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}

                </button>

              </div>

            </div>

            {error && (

              <div className="student-login-error">
                {error}
              </div>

            )}

            <button
              type="submit"
              className="student-login-button"
              disabled={loading}
            >

              <LogIn size={18} />

              {loading
                ? "Logging in..."
                : "Login"}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default StudentLogin;
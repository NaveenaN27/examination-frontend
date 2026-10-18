import { useState } from "react";
import {
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    if (
      username === "naveenastjoseph" &&
      password === "naveeenastjoseph24-28"
    ) {
      localStorage.setItem("examAdminLoggedIn", "true");
      localStorage.setItem("examAdminName", "Naveena");

      setError("");

      if (onLogin) {
        onLogin();
      }
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT SIDE */}

        <div className="login-left">
          <div className="login-brand-icon">
            <GraduationCap size={42} />
          </div>

          <h1>ExamFlow</h1>

          <h2>
            3rd Year Examination
            <br />
            Management System
          </h2>

          <p>
            Manage III Year students, subjects,
            examinations, marks and academic results
            efficiently.
          </p>

          <div className="login-left-footer">
            Academic Management Portal
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="login-right">
          <div className="login-form-container">

            <div className="login-heading">
              <div className="login-small-icon">
                <GraduationCap size={26} />
              </div>

              <h2>Admin Login</h2>

              <p>
                Sign in to access the examination
                management dashboard
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="login-form"
            >

              {/* USERNAME */}

              <div className="login-form-group">
                <label>Username</label>

                <div className="login-input-wrapper">
                  <User size={19} />

                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="login-form-group">
                <label>Password</label>

                <div className="login-input-wrapper">
                  <Lock size={19} />

                  <input
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-button"
              >
                <LogIn size={18} />
                Login to Dashboard
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
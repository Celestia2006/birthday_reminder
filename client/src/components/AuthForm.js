import React from "react";
import { Link } from "react-router-dom";
import StarsBackground from "./StarsBackground";
import "../styles/Auth.css";

export const AuthForm = ({ type, onSubmit, error }) => {
  const [credentials, setCredentials] = React.useState({
    username: "",
    password: "",
    email: type === "signup" ? "" : undefined,
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const panelClass =
    type === "login" ? "auth-panel signin-panel" : "auth-panel signup-panel";

  return (
    <div className="app-wrapper">
      <StarsBackground />
      <div className="auth-container">
        <div className={panelClass}>
          <h2>{type === "login" ? "Sign In" : "Sign Up"}</h2>
          {error && <div className="auth-error">{error}</div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(credentials);
            }}
          >
            {type === "signup" && (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="styled-button auth-submit">
              {type === "login" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="auth-switch">
            {type === "login" ? (
              <>
                Don't have an account? <Link to="/signup">Sign up</Link>
              </>
            ) : (
              <>
                Already have an account? <Link to="/login">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

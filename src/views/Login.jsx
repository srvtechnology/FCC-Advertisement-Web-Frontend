import { Link } from "react-router-dom";
import axiosClient from "../axios-client.js";
import { createRef, useState } from "react";
import { useStateContext } from "../context/ContextProvider.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const emailRef = createRef();
  const passwordRef = createRef();
  const { setUser, setToken } = useStateContext();
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = (ev) => {
    ev.preventDefault();

    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };
    axiosClient
      .post("/login", payload)
      .then(({ data }) => {
        setUser(data.user);
        // setToken(data.token);
        navigate("/otp")
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setMessage(response.data.message);
        }
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "570px" }}>
        {/* Logo */}
        <div className="text-center mb-3">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/storage/image4.png`}
            alt="Logo"
            style={{ width: "160px", height: "auto" }}
          />

          <h1 style={{ color: 'rgb(151 43 169)', fontWeight: 'bold', margin: '8px 0 0 0' }}>
            FREETOWN CITY COUNCIL
          </h1>
          <h2 style={{ color: 'rgb(151 43 169)', fontWeight: 'bold', fontSize: '22px', margin: '4px 0 20px 0' }}>
            Advertisement Management System
          </h2>
        </div>

        <h2 style={{ fontWeight: 'bold', }} className="text-left mb-4">Login</h2>


        {message && <div className="alert alert-danger">{message}</div>}

        <form onSubmit={onSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              ref={emailRef}
              type="email"
              className="form-control"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3 position-relative">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
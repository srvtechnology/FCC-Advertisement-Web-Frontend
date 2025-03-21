import { Link } from "react-router-dom";
import axiosClient from "../axios-client.js";
import { createRef, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { useNavigate } from "react-router-dom";

export default function OtpSubmit() {
  const navigate=useNavigate();
  const { user } = useStateContext();
  console.log(user);
  const otpref = createRef();
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
      otp: otpref.current.value,
      email:user?.email,
    };
    axiosClient
      .post("/verify-otp", payload)
      .then(({ data }) => {
        setUser(data.user);
        setToken(data.token);
        // navigate("/otp")
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
      <div className="card shadow p-4" style={{ width: "350px" }}>
        {/* Logo */}
        <div className="text-center mb-3">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/storage/image4.png`}
            alt="Logo"
            style={{ width: "100px", height: "auto" }}
          />
        </div>

        <h2 className="text-center mb-4">Otp submit</h2>

        {message && <div className="alert alert-danger">{message}</div>}

        <form onSubmit={onSubmit}>
          {/* otp */}
          <div className="mb-3">
            <label className="form-label">Otp</label>
            <input
              ref={otpref}
              type="number"
              className="form-control"
              placeholder="Enter your otp"
              required
            />
          </div>

    
          {/* Login Button */}
          <button type="submit" className="btn btn-primary w-100">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
import {Link} from "react-router-dom";
import axiosClient from "../axios-client.js";
import {createRef} from "react";
import {useStateContext} from "../context/ContextProvider.jsx";
import { useState } from "react";

export default function Login() {
  const emailRef = createRef()
  const passwordRef = createRef()
  const { setUser, setToken } = useStateContext()
  const [message, setMessage] = useState(null)

  const onSubmit = ev => {
    ev.preventDefault()

    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    }
    axiosClient.post('/login', payload)
      .then(({data}) => {
        setUser(data.user)
        setToken(data.token);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setMessage(response.data.message)
        }
      })
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div className="card shadow p-4" style={{ width: "350px" }}>
      {/* Logo */}
      <div className="text-center mb-3">
        <img src="https://fccapi.srvtechservices.com/storage/image4.png" alt="Logo" style={{ width: "100px", height: "auto" }} />
      </div>
  
      <h2 className="text-center mb-4">Login</h2>
  
      {message && <div className="alert alert-danger">{message}</div>}
  
      <form onSubmit={onSubmit}>
        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input ref={emailRef} type="email" className="form-control" placeholder="Enter your email" required />
        </div>
  
        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input ref={passwordRef} type="password" className="form-control" placeholder="Enter your password" required />
        </div>
  
        {/* Login Button */}
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  </div>
  
  );
}

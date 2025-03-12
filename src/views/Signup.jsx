import {Link} from "react-router-dom";
import {createRef, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Signup() {
  const nameRef = createRef()
  const emailRef = createRef()
  const passwordRef = createRef()
  const passwordConfirmationRef = createRef()
  const {setUser, setToken} = useStateContext()
  const [errors, setErrors] = useState(null)

  const onSubmit = ev => {
    ev.preventDefault()

    const payload = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: passwordConfirmationRef.current.value,
    }
    axiosClient.post('/signup', payload)
      .then(({data}) => {
        setUser(data.user)
        setToken(data.token);
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors)
        }
      })
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Signup for Free</h2>

        {/* Display Errors */}
        {errors && (
          <div className="alert alert-danger">
            {Object.keys(errors).map((key) => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit}>
          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input ref={nameRef} type="text" className="form-control" placeholder="Enter your full name" required />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input ref={emailRef} type="email" className="form-control" placeholder="Enter your email" required />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input ref={passwordRef} type="password" className="form-control" placeholder="Enter a password" required />
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input ref={passwordConfirmationRef} type="password" className="form-control" placeholder="Repeat password" required />
          </div>

          {/* Signup Button */}
          <button type="submit" className="btn btn-primary w-100">Signup</button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-3">
          Already registered? <Link to="/login" className="text-decoration-none">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function UserForm() {
  const navigate = useNavigate();
  let { id } = useParams();
  const [user, setUser] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    user_type: 'agent',
    role_id: '',
  });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setNotification } = useStateContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchRoles();
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/users/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setUser(data);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const fetchRoles = () => {
    axiosClient
      .get("/roles")
      .then(({ data }) => setRoles(data.roles)) // Access roles from data object
      .catch(console.error);
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    
    // Prepare the user data to send
    const userData = {...user};
    
    // For agents, set default password if not provided
    if (userData.user_type === 'agent') {
      if (!userData.password) {
        userData.password = 'Demo@123@';
        userData.password_confirmation = 'Demo@123@';
      }
    }

    if (userData.id) {
      axiosClient
        .put(`/users/${userData.id}`, userData)
        .then(() => {
          setNotification("User was successfully updated");
          navigate("/users");
        })
        .catch((err) => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          }
        });
    } else {
      axiosClient
        .post("/users", userData)
        .then(() => {
          setNotification("User was successfully created");
          navigate("/users");
        })
        .catch((err) => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          }
        });
    }
  };

  return (
    <>
      {user.id && <h1>Update User: {user.name}</h1>}
      {!user.id && <h1>New User</h1>}
      <div className="card animated fadeInDown">
        {loading && <div className="text-center">Loading...</div>}
        {errors && (
          <div className="alert">
            {Object.keys(errors).map((key) => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        )}
        {!loading && (
          <form onSubmit={onSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label>Name</label>
                <input
                  value={user.name}
                  onChange={(ev) => setUser({ ...user, name: ev.target.value })}
                  placeholder="Name"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  value={user.email}
                  onChange={(ev) => setUser({ ...user, email: ev.target.value })}
                  placeholder="Email"
                />
              </div>
              
              {user.user_type !== "agent" && (
                <>
                  <div>
                    <label>Password</label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        onChange={(ev) => setUser({ ...user, password: ev.target.value })}
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ marginLeft: "10px", cursor: "pointer" }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label>Confirm Password</label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        onChange={(ev) => setUser({ ...user, password_confirmation: ev.target.value })}
                        placeholder="Password Confirmation"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ marginLeft: "10px", cursor: "pointer" }}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label>User Type</label>
                <select
                  className="form-control"
                  value={user.user_type}
                  onChange={(ev) => setUser({ ...user, user_type: ev.target.value })}
                >
                  <option value="">Select</option>
                  <option value="agent">Agent</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              {user.user_type === "system" && (
                <div>
                  <label>Role</label>
                  <select
                    className="form-control"
                    value={user.role_id}
                    onChange={(ev) => setUser({ ...user, role_id: ev.target.value })}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <button className="btn btn-primary m-2">Save</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
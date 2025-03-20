import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";

export default function SpaceCatForm() {
  const navigate = useNavigate();
  let { id } = useParams();
  const [user, setUser] = useState({
    id: null,
    name: '',
    rate: ''
  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const { setNotification } = useStateContext()

 

  const onSubmit = ev => {
    ev.preventDefault()
      axiosClient.post('/space-categories', user)
        .then(() => {
          setNotification('Space Category was successfully created')
          navigate('/space-category')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    
  }

  return (
    <>
     <h1>New Category</h1>
      <div className="card animated fadeInDown">
        {loading && (
          <div className="text-center">
            Loading...
          </div>
        )}
        {errors &&
          <div className="alert alert-danger">
            {Object.keys(errors).map(key => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        }
        {!loading && (
          <form onSubmit={onSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              <div><label>Name</label><input onChange={ev => setUser({ ...user, name: ev.target.value })} placeholder="Name" /></div>
              <div><label>Rate</label><input onChange={ev => setUser({ ...user, rate: ev.target.value })} placeholder="Rate" /></div>
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

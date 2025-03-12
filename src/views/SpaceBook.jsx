import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";

export default function SpaceBook() {
  const navigate = useNavigate();
  let { id } = useParams();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    user_name: "",
    space_id: id,
    start_date: "",
    period: "",
    end_date: "",
    customer_name: "",
    customer_email: "",
    mobile: "",
    address: "",
    description_of_ad:"",
  });

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`/spaces/${id}`)
      .then(({ data }) => setSpace(data))
      .catch(() => console.error("Error fetching space details."))
      .finally(() => setLoading(false));

    getUsers(); // Fetch users when the component mounts
  }, [id]);

  const getUsers = async () => {
    try {
      const { data } = await axiosClient.get("/agent-list");
      if (data && Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);  // Ensure it remains an array
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);  // Prevent issues if API fails
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      let updatedData = { ...prevData, [name]: value };

      // Calculate end_date when start_date or period changes
      if (name === "start_date" || name === "period") {
        const { start_date, period } = updatedData;
        if (start_date && period) {
          updatedData.end_date = calculateEndDate(start_date, period);
        }
      }
      return updatedData;
    });
  };

  const calculateEndDate = (startDate, period) => {
    const start = new Date(startDate);
    if (period === "6 months") start.setMonth(start.getMonth() + 6);
    else if (period === "1 year") start.setFullYear(start.getFullYear() + 1);
    else if (period === "2 years") start.setFullYear(start.getFullYear() + 2);
    return start.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  useEffect(() => {
    if (space?.name_of_advertise_agent_company_or_person) {
      setFormData(prev => ({
        ...prev,
        user_name: space.name_of_advertise_agent_company_or_person,
      }));
    }
  }, [space]);  // Runs when `space` is updated
  

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosClient
      .post("/bookings", formData)
      .then(() => {
        alert("Booking successful!");
        navigate("/space");
      })
      .catch((error) => console.error("Error submitting booking.", error));
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (!space) return <div className="text-center">No data available.</div>;

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/space")}>
        Back to Space List
      </button>

      <h1 className="text-center mb-4">Book Space From: {space.name_of_contact_person}</h1>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label"> Agent Name</label>
          <p>{space.name_of_advertise_agent_company_or_person}</p>
          <input type="hidden" name="user_name" value={formData.user_name} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Start Date</label>
          <input type="date" name="start_date" className="form-control" value={formData.start_date} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Period</label>
          <select name="period" className="form-control" value={formData.period} onChange={handleChange} required>
            <option value="">Select Period</option>
            {/* <option value="6 months">6 Months</option> */}
            <option value="1 year">1 Year</option>
            <option value="2 years">2 Years</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">End Date</label>
          <input type="date" name="end_date" className="form-control" value={formData.end_date} readOnly />
        </div>

        <div className="col-md-6">
          <label className="form-label">Customer Name</label>
          <input type="text" name="customer_name" className="form-control" value={formData.customer_name} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Customer Email</label>
          <input type="email" name="customer_email" className="form-control" value={formData.customer_email} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Mobile</label>
          <input type="text" name="mobile" className="form-control" value={formData.mobile} onChange={handleChange} required />
        </div>

        <div className="col-md-12">
          <label className="form-label">Address</label>
          <textarea name="address" className="form-control" value={formData.address} onChange={handleChange} required />
        </div>


        <div className="col-md-12">
          <label className="form-label">Description of advertisement</label>
          <textarea name="description_of_ad" className="form-control" value={formData.description_of_ad} onChange={handleChange} required />
        </div>


        <div className="col-md-12 text-center">
          <button type="submit" className="btn btn-primary">Submit Booking</button>
        </div>
      </form>
    </div>
  );
}

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";

export default function PaymentView() {
  const navigate = useNavigate();
  let { id } = useParams();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/payment/${id}`)
        .then(({ data }) => {
          console.log(data);

          setSpace(data);
        })
        .catch(() => {
          console.error("Error fetching space details.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (!space) return <div className="text-center">No data available.</div>;

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/payments")}>
        Back to Payment List
      </button>

      <h1 className="text-center mb-4">Payment Detail: Space ID FCC/SPC/{space.space_id}</h1>

      <div className="row">
        {/* Booking Information Card */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-light text-black">Booking Information</div>
            <div className="card-body">
              <p>
                <strong>Amount:</strong> NLe{" "}
                {Number(space.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>





              <p><strong>Address:</strong> {space.booking.address}</p>
              <p><strong>Customer Email:</strong> {space.booking.customer_email}</p>
              <p><strong>Customer Name:</strong> {space.booking.customer_name}</p>
              <p><strong>Start Date:</strong> {space.booking.start_date}</p>
              <p><strong>End Date:</strong> {space.booking.end_date}</p>
              <p><strong>Customer Telephone:</strong> {space.booking.mobile}</p>
              <p><strong>Period:</strong> {space.booking.period}</p>
              <p><strong>Payee Name:</strong> {space.payee_name}</p>
              <p><strong>Payee Adress:</strong> {space.payee_address}</p>
              <p><strong>Payment Date:</strong> {space.payment_date}</p>
              <p><strong>Payment Mode:</strong> {space.payment_mode}</p>
              {/* <p><strong>Period:</strong> {space.booking.period}</p> */}
              <p><strong>Status:</strong> {space.booking.status}</p>
              <p><strong>Payment Created By User Name:</strong>  {space?.created_by_user?.name}</p>
              <p><strong>Payment Created By User Id:</strong>  {space?.created_by_user?.id}</p>

              <div className="col-md-6">
              <p className="mt-2"><strong>Payment Document</strong></p>
                <img
                  src={`https://fccapi.srvtechservices.com/storage/${space.payment_slip}`}
                  alt="Document 2"
                  className="img-fluid rounded border"
                  style={{ maxHeight: "200px", objectFit: "cover" }}
                />
               
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information Card */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">Space Basic Information</div>
            <div className="card-body">
              <p><strong>Space Category:</strong> {space.space.category.name}</p>
              <p><strong>Data Collection Date:</strong> {space.space.data_collection_date}</p>
              <p><strong>Name of Person Collecting Data:</strong> {space.space.name_of_person_collection_data}</p>
              <p><strong>Advertisement Agent/Company:</strong> {space.space.name_of_advertise_agent_company_or_person}</p>
              <p><strong>Contact Person:</strong> {space.space.name_of_contact_person}</p>
              <p><strong>Telephone:</strong> {space.space.telephone}</p>
              <p><strong>Email:</strong> {space.space.email}</p>
            </div>
          </div>
        </div>

        {/* Advertisement Identification Information */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-warning text-white">Advertisement Identification</div>
            <div className="card-body">
              <p><strong>Space Category:</strong> {space.space.category.rate}</p>
              <p><strong>Location:</strong> {space.space.location}</p>
              <p><strong>Street/Road Number:</strong> {space.space.stree_rd_no}</p>
              <p><strong>Section of Road:</strong> {space.space.section_of_rd}</p>
              <p><strong>Landmark:</strong> {space.space.landmark}</p>
              <p><strong>GPS Coordinates:</strong> {space.space.gps_cordinate}</p>
            </div>
          </div>
        </div>

        {/* Advertisement Details */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-success text-white">Advertisement Details</div>
            <div className="card-body">
              <p><strong>Description:</strong> {space.space.description_property_advertisement}</p>
              <p><strong>Category:</strong> {space.space.advertisement_cat_desc}</p>
              <p><strong>Type:</strong> {space.space.type_of_advertisement}</p>
              <p><strong>Billboard Position:</strong> {space.space.position_of_billboard}</p>
              <p><strong>Length:</strong> {space.space.lenght_advertise}</p>
              <p><strong>Width:</strong> {space.space.width_advertise}</p>
              <p><strong>Area:</strong> {space.space.area_advertise}</p>
              <p><strong>No. of Sides:</strong> {space.space.no_advertisement_sides}</p>
              <p><strong>Clearance Height:</strong> {space.space.clearance_height_advertise}</p>
              <p><strong>Illumination:</strong> {space.space.illuminate_nonilluminate}</p>
              <p><strong>Certified Georgia Licensed:</strong> {space.space.certified_georgia_licensed ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        {/* Landowner Information */}
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white">Landowner Information</div>
            <div className="card-body">
              <p><strong>Company/Corporate:</strong> {space.space.landowner_company_corporate}</p>
              <p><strong>Landowner Name:</strong> {space.space.landowner_name}</p>
              <p><strong>Street Address:</strong> {space.space.landlord_street_address}</p>
              <p><strong>Telephone:</strong> {space.space.landlord_telephone}</p>
              <p><strong>Email:</strong> {space.space.landlord_email}</p>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

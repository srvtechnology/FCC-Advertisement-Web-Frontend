import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";

export default function SpaceEntryView() {
  const navigate = useNavigate();
  let { id } = useParams();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/spaces/${id}`)
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
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/space")}>
        Back to Space List
      </button>

      <h1 className="text-center mb-4">Space Detail: {space.name_of_person_collection_data}</h1>

      <div className="row">
        {/* Basic Information Card */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">Basic Information</div>
            <div className="card-body">
              <p><strong>Space Category:</strong> {space.category.name}</p>
              <p><strong>Data Collection Date:</strong> {space.data_collection_date}</p>
              <p><strong>Name of Person Collecting Data:</strong> {space.name_of_person_collection_data}</p>
              <p><strong>Advertisement Agent/Company:</strong> {space.name_of_advertise_agent_company_or_person}</p>
              <p><strong>Contact Person:</strong> {space.name_of_contact_person}</p>
              <p><strong>Telephone:</strong> {space.telephone}</p>
              <p><strong>Email:</strong> {space.email}</p>
              <p><strong>Space Created By User Name:</strong> {space?.created_by_user?.name}</p>
              <p><strong>Space Created By User Id:</strong> {space?.created_by_user?.id}</p>
              <p><strong>Business Name:</strong> {space?.business_name}</p>
              <p><strong>Business Address:</strong> {space?.business_address}</p>
              <p><strong>Business Contact:</strong> {space?.business_contact}</p>
            </div>
          </div>
        </div>

        {/* Advertisement Identification Information */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-warning text-white">Advertisement Identification</div>
            <div className="card-body">
              <p><strong>Space Category:</strong> {space.rate} ({space.agent_rate_name})</p>
              <p><strong>Location:</strong> {space.location}</p>
              <p><strong>Street/Road Number:</strong> {space.stree_rd_no}</p>
              <p><strong>Section of Road:</strong> {space.section_of_rd}</p>
              <p><strong>Landmark:</strong> {space.landmark}</p>
              <p><strong>GPS Coordinates:</strong> {space.gps_cordinate}</p>
            </div>
          </div>
        </div>

        {/* Advertisement Details */}
        <div className="col-md-12 mb-4">
          <div className="card">
            <div className="card-header bg-success text-white">Advertisement Details</div>
            <div className="card-body">
              <p><strong>Description:</strong> {space.description_property_advertisement}</p>
              <p><strong>Category:</strong> {space.advertisement_cat_desc}</p>
              <p><strong>Type:</strong> {space.type_of_advertisement}</p>
              <p><strong>Billboard Position:</strong> {space.position_of_billboard}</p>
              <p><strong>Length:</strong> {space.lenght_advertise}</p>
              <p><strong>Width:</strong> {space.width_advertise}</p>
              <p><strong>Area:</strong> {space.area_advertise}</p>
              <p><strong>No. of Sides:</strong> {space.no_advertisement_sides}</p>
              <p><strong>Clearance Height:</strong> {space.clearance_height_advertise}</p>
              <p><strong>Illumination:</strong> {space.illuminate_nonilluminate}</p>
              {/* <p><strong>Certified Georgia Licensed:</strong> {space.certified_georgia_licensed ? "Yes" : "No"}</p> */}
            </div>
          </div>
        </div>

        {/* Landowner Information */}
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white">Landowner Information</div>
            <div className="card-body">
              <p><strong>Company/Corporate:</strong> {space.landowner_company_corporate}</p>
              <p><strong>Landowner Name:</strong> {space.landowner_name}</p>
              <p><strong>Street Address:</strong> {space.landlord_street_address}</p>
              <p><strong>Telephone:</strong> {space.landlord_telephone}</p>
              <p><strong>Email:</strong> {space.landlord_email}</p>
            </div>
          </div>
        </div>

        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-dark text-white">Landowner Documents</div>
            <div className="card-body text-center">
              <div className="row">
                <div className="col-md-6">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/${space.image_1}`}
                    alt="Document 1"
                    className="img-fluid rounded border"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                  <p className="mt-2"><strong>Front view</strong></p>
                </div>
                <div className="col-md-6">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/${space.image_2}`}
                    alt="Document 2"
                    className="img-fluid rounded border"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                  <p className="mt-2"><strong>Back view</strong></p>
                </div>

                <div className="col-md-6">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/${space.image_3}`}
                    alt="Document 2"
                    className="img-fluid rounded border"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                  <p className="mt-2"><strong>Whole view</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";
import { FaMapMarkerAlt } from "react-icons/fa";


export default function SpaceEntryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1); // Step state for form navigation
  const [images, setImages] = useState([]);
  const [space, setSpace] = useState({
    id: null,
    space_cat_id: "",
    agent_rate_name: "",
    data_collection_date: '',
    name_of_person_collection_data: '',
    name_of_advertise_agent_company_or_person: '',
    name_of_contact_person: '',
    telephone: '',
    email: '',
    location: '',
    stree_rd_no: '',
    section_of_rd: '',
    landmark: '',
    gps_cordinate: '',
    description_property_advertisement: '',
    advertisement_cat_desc: '',
    type_of_advertisement: '',
    position_of_billboard: '',
    lenght_advertise: '',
    width_advertise: '',
    area_advertise: '',
    no_advertisement_sides: '',
    other_advertisement_sides: '',
    other_advertisement_sides_no: '',
    clearance_height_advertise: '',
    illuminate_nonilluminate: '',
    certified_georgia_licensed: '',
    landowner_company_corporate: '',
    landowner_name: '',
    landlord_street_address: '',
    landlord_telephone: '',
    landlord_email: '',
    business_name: '',
    business_address: '',
    business_contact: '',
  });

  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setNotification } = useStateContext();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const handleFileChange = (event, key) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Only JPG, JPEG, and PNG images are allowed.");
      return;
    }

    setImages((prev) => ({
      ...prev,
      [key]: file, // Store the new image file
    }));
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  useEffect(() => {
    axiosClient.get('/space-categories')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Unexpected API response:", data);
        }
      })
      .catch(error => {
        console.error("Error fetching space categories:", error);
      })
      .finally(() => {
        setLoadingCategories(false);
      });

    axiosClient.get('/agent-list')
      .then(({ data }) => setAgents(data))
      .catch(error => console.error("Error fetching agent list:", error))
      .finally(() => setLoadingAgents(false));

    if (id && id !== "new") {
      setLoading(true);
      axiosClient
        .get(`/spaces/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setSpace(data);
          setImages({
            image_1: data?.image_1 || null,
            image_2: data?.image_2 || null,
            image_3: data?.image_3 || null,
          });
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    setSpace(prevState => {
      const updatedPositions = checked
        ? [...(prevState.position_of_billboard?.split(", ") || []), value] // Convert string to array, add new value
        : prevState.position_of_billboard?.split(", ").filter(pos => pos !== value) || []; // Remove unchecked value

      return { ...prevState, position_of_billboard: updatedPositions.join(", ") }; // Convert array back to string
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude} ${position.coords.longitude}`;
          setSpace({ ...space, gps_cordinate: coords });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve location. Please enable GPS.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };



  // const onSubmit = (ev) => {
  //   ev.preventDefault();
  //   if (space.id) {
  //     axiosClient.put(`/spaces/${space.id}`, space)
  //       .then(() => {
  //         setNotification("Space was successfully updated");
  //         navigate("/space");
  //       })
  //       .catch(handleErrors);
  //   } else {
  //     axiosClient.post("/spaces", space)
  //       .then(() => {
  //         setNotification("Space was successfully created");
  //         navigate("/space");
  //       })
  //       .catch(handleErrors);
  //   }
  // };

  useEffect(() => {
    if (space?.no_advertisement_sides === "Double") {
      setSpace((prevSpace) => ({
        ...prevSpace,
        other_advertisement_sides_no: 2,
      }));
    } else if (space?.no_advertisement_sides === "Others") {
      setSpace((prevSpace) => ({
        ...prevSpace,
        other_advertisement_sides_no: space?.other_advertisement_sides_no,
      }));
    }
    else {
      setSpace((prevSpace) => ({
        ...prevSpace,
        other_advertisement_sides_no: 1,
      }));

    }
  }, [space?.no_advertisement_sides]); // Runs only when no_advertisement_sides changes



  const onSubmit = (ev) => {
    ev.preventDefault();
    // console.log("Submitting form with:", space);
    // return false;

    if (space.id) {
      // UPDATE request (Text Data)
      axiosClient.put(`/spaces/${space.id}`, space)
        .then((response) => {
          setNotification("Space was successfully updated");
          console.log("Response for edit:", response.data.data.id);

          // Now send images separately
          uploadImages(response.data.data.id);

          navigate("/space");
        })
        .catch(handleErrors);
    } else {

      // CREATE request (Text Data)
      axiosClient.post("/spaces", space)
        .then((response) => {
          setNotification("Space was successfully created");

          // Get new space ID & upload images
          uploadImages(response.data.id);

          navigate("/space");
        })
        .catch(handleErrors);
    }
  };

  // Function to upload images separately
  const uploadImages = (spaceId) => {
    const formData = new FormData();
    formData.append("id", spaceId)

    if (images.image_1 instanceof File) formData.append("image_1", images.image_1);
    if (images.image_2 instanceof File) formData.append("image_2", images.image_2);
    if (images.image_3 instanceof File) formData.append("image_3", images.image_3);

    if (formData.has("image_1") || formData.has("image_2") || formData.has("image_3")) {
      axiosClient.post(`/spacesUpadte`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
        .then(() => setNotification("Images uploaded successfully"))
        .catch(handleErrors);
    }
  };

  const handleErrors = (err) => {
    const response = err.response;
    if (response && response.status === 422) {
      setErrors(response.data.errors);
    }
  };

  const renderStepContent = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {(() => {
          switch (step) {
            case 1:
              return (
                <>
                  <h3>Step {step}: Basic Information:</h3>
                  <div>
                    <label className="form-label">Select Space Category</label>
                    {loadingCategories ? (
                      <p>Loading categories...</p>
                    ) : (
                      <select
                        className="form-select"
                        value={space.space_cat_id || ""}
                        onChange={(ev) => setSpace({ ...space, space_cat_id: ev.target.value })}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                     <label className="form-label">Select Agent Rate</label>
                     <select
                        className="form-select"
                        value={space.agent_rate_name || ""}
                        onChange={(ev) => setSpace({ ...space, agent_rate_name: ev.target.value })}
                      >
                        <option value="">Select Agent Rate</option>
                          <option key="general_agent_rate" value="general_agent_rate">
                            General Agent Rate
                          </option>
                          <option key="system_agent_rate" value="system_agent_rate">
                            System Agent Rate
                          </option>
                          <option key="corporate_agent_rate" value="corporate_agent_rate">
                            Corporate Agent Rate
                          </option>
                      </select>
                  </div>

                  <div>
                    <label>Data Collection Date</label>
                    <input
                      type="date"
                      value={space.data_collection_date ? space.data_collection_date : ""}
                      onChange={ev => setSpace({
                        ...space,
                        data_collection_date: ev.target.value
                      })}
                      placeholder="Data Collection Date"
                    />
                  </div>

                  <div>
                    <label>Name of Person Collecting Data</label>
                    <input value={space.name_of_person_collection_data} onChange={ev => setSpace({ ...space, name_of_person_collection_data: ev.target.value })} placeholder="Name of Person Collecting Data" />
                  </div>
                  {/* <div>
                    <label>Name of Advertisement Agent/Company/Person</label>
                    <input value={space.name_of_advertise_agent_company_or_person} onChange={ev => setSpace({ ...space, name_of_advertise_agent_company_or_person: ev.target.value })} placeholder="Name of Advertisement Agent/Company/Person" />
                  </div> */}
                  <div>
                    <label>Name of Advertisement Agent/Company/Person</label>
                    {loadingAgents ? (
                      <p>Loading Agents...</p>
                    ) : (
                      <select
                        className="form-select"
                        value={space.name_of_advertise_agent_company_or_person || ""}
                        onChange={ev => setSpace({ ...space, name_of_advertise_agent_company_or_person: ev.target.value })}
                      >
                        <option value="">Select Agent</option>
                        {agents.map(agent => (
                          <option key={agent.id} value={agent.name}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label>Business Name</label>
                    <input
                      value={space.business_name}
                      onChange={ev => setSpace({ ...space, business_name: ev.target.value })}
                      placeholder="Business Name" />
                  </div>

                  <div>
                    <label>Business Address</label>
                    <input
                      value={space.business_address}
                      onChange={ev => setSpace({ ...space, business_address: ev.target.value })}
                      placeholder="Business Address" />
                  </div>

                  <div>
                    <label>Business Contact No / Email</label>
                    <input
                      value={space.business_contact}
                      onChange={ev => setSpace({ ...space, business_contact: ev.target.value })}
                      placeholder="Business Contact No / Email" />
                  </div>


                  <div>
                    <label>Name of Contact Person</label>
                    <input value={space.name_of_contact_person} onChange={ev => setSpace({ ...space, name_of_contact_person: ev.target.value })} placeholder="Name of Contact Person" />
                  </div>
                  <div>
                    <label>Telephone</label>
                    <input value={space.telephone} onChange={ev => setSpace({ ...space, telephone: ev.target.value })} placeholder="Telephone" />
                  </div>
                  <div>
                    <label>Email</label>
                    <input value={space.email} onChange={ev => setSpace({ ...space, email: ev.target.value })} placeholder="Email" />
                  </div>
                </>
              );
            case 2:
              return (
                <>
                  <h3>Step {step}: Advertisement Identification Information:</h3>
                  <div>
                    <label>Location</label>
                    <input value={space.location} onChange={ev => setSpace({ ...space, location: ev.target.value })} placeholder="Location" />
                  </div>
                  <div>
                    <label>Street/Road Number</label>
                    <input value={space.stree_rd_no} onChange={ev => setSpace({ ...space, stree_rd_no: ev.target.value })} placeholder="Street/Road Number" />
                  </div>
                  <div>
                    <label>Section of Road</label>
                    <input value={space.section_of_rd} onChange={ev => setSpace({ ...space, section_of_rd: ev.target.value })} placeholder="Section of Road" />
                  </div>
                  <div>
                    <label>Landmark</label>
                    <input value={space.landmark} onChange={ev => setSpace({ ...space, landmark: ev.target.value })} placeholder="Landmark" />
                  </div>
                  <div>
                    <label>GPS Coordinate</label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        value={space.gps_cordinate}
                        onChange={(ev) => setSpace({ ...space, gps_cordinate: ev.target.value })}
                        placeholder="GPS Coordinate"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        style={{
                          marginLeft: "8px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "20px",
                        }}
                      >
                        <FaMapMarkerAlt color="blue" />

                      </button>
                    </div>
                  </div>
                </>
              );
            case 3:
              return (
                <>
                  <h3>Step {step}: Advertisement Details:</h3>
                  <div>
                    <label>Description of property on which advertisement will be situated</label>
                    <div className="mt-2">
                      <label>
                        <input
                          type="radio"
                          className="form-check-input"
                          name="propertyAdvertisement"
                          value="Private Property"
                          checked={space.description_property_advertisement === "Private Property"}
                          onChange={ev => setSpace({ ...space, description_property_advertisement: ev.target.value })}
                        />
                        &nbsp;&nbsp;Private Property
                      </label>

                      <label className="ms-3">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="propertyAdvertisement"
                          value="Right of Way"
                          checked={space.description_property_advertisement === "Right of Way"}
                          onChange={ev => setSpace({ ...space, description_property_advertisement: ev.target.value })}
                        />
                        &nbsp;&nbsp;Right of Way
                      </label>
                    </div>

                  </div>


                  <div>
                    <label>Advertisement Category Description</label>
                    <input value={space.advertisement_cat_desc} onChange={ev => setSpace({ ...space, advertisement_cat_desc: ev.target.value })} placeholder="Advertisement Category Description" />
                  </div>
                  <div>
                    <label className="form-label">Type of Advertisement</label>
                    <select
                      className="form-select"
                      value={space.type_of_advertisement || ""}
                      onChange={ev => setSpace({ ...space, type_of_advertisement: ev.target.value })}
                    >
                      <option value="" disabled>Select Type of Advertisement</option>
                      {/* <option value="Ordinary Billboards">Ordinary Billboards</option>
                      <option value="Static Billboard">Static Billboard</option>
                      <option value="LED Billboard">LED Billboard</option>
                      <option value="Digital Billboard">Digital Billboard</option>
                      <option value="Mobile Billboards">Mobile Billboards</option>

                      <option value="Bus Shelters">Bus Shelters</option>
                      <option value="Benches">Benches</option>
                      <option value="Kiosks">Kiosks</option>
                      <option value="Trash Bins">Trash Bins</option>


                      <option value="Bus Advertising">Bus Advertising</option>
                      <option value="Taxi Advertising">Taxi Advertising</option>
                      <option value="Sidewalk Signs">Sidewalk Signs</option>
                      <option value="Street Art Advertising">Street Art Advertising</option>

                      <option value="Projection Advertising">Projection Advertising</option>
                      <option value="Building Wraps Advertising">Building Wraps Advertising</option>
                      <option value="Bridge and Overpass Banners">Bridge and Overpass Banners</option>
                      <option value="Wall Branding">Wall Branding</option>
                      <option value="Light Boxes">Light Boxes</option>
                      <option value="Roundabouts">Roundabouts</option>

                      <option value="Lampposts">Lampposts</option>
                      <option value="Wall Panels">Wall Panels</option>
                      <option value="Banners">Banners</option>

                      <option value="Outdoor Billboards">Outdoor Billboards</option>
                      <option value="Sign Post">Sign Post</option>
                      <option value="Posters">Posters</option>
                      <option value="Wallscape">Wallscape</option>
                      <option value="Backlit Billboard">Backlit Billboard</option>
                      <option value="Point of Sale">Point of Sale</option>
                      <option value="Retail Advertisement">Retail Advertisement</option>
                      <option value="Other">Other</option> */}


                      <option value="Static Billboard">Static Billboard</option>
                      <option value="Digital Billboard">Digital Billboard</option>
                      <option value="LED Billboard">LED Billboard</option>
                      <option value="Mobile Billboard">Mobile Billboard</option>

                      <option value="Bus Shelters">Bus Shelters</option>
                      <option value="Benches">Benches</option>
                      <option value="Kiosks">Kiosks</option>
                      <option value="Trash Bins">Trash Bins</option>

                      <option value="Bus Advertising">Bus Advertising</option>
                      <option value="Taxi Advertising">Taxi Advertising</option>

                      <option value="Sidewalk Signs">Sidewalk Signs</option>

                      <option value="Street Art Advertising">Street Art Advertising</option>
                      <option value="Projection Advertising">Projection Advertising</option>

                      <option value="Building Wraps Advertising">Building Wraps Advertising</option>
                      <option value="Bridge and Overpass Banners">Bridge and Overpass Banners</option>
                      <option value="Wall Branding">Wall Branding</option>

                      <option value="Light Boxes">Light Boxes</option>
                      <option value="Roundabouts">Roundabouts</option>
                      <option value="Lampposts">Lampposts</option>
                      <option value="Wall Panels">Wall Panels</option>
                      <option value="Banners">Banners</option>
                      <option value="Totem Advertisement">Totem Advertisement</option>
                      <option value="Wallscapes and Murals">Wallscapes and Murals</option>
                      <option value="Pole Banners / Light Pole">Pole Banners / Light Pole</option>
                      <option value="Mall and Stadium Advertisement">Mall and Stadium Advertisement</option>
                      <option value="Signpost">Signpost</option>
                      <option value="Posters">Posters</option>
                      <option value="Point of Sale">Point of Sale</option>
                      <option value="Retail Advertisement">Retail Advertisement</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Position of Billboard</label>
                    <div className="d-flex gap-3"> {/* Flexbox container */}

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="positionOfBillboard"
                          id="freeStanding"
                          value="Free standing"
                          checked={space.position_of_billboard === "Free standing"}
                          onChange={(e) => setSpace({ ...space, position_of_billboard: e.target.value })}
                        />
                        <label className="form-check-label" htmlFor="freeStanding">&nbsp;&nbsp;Free standing</label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="positionOfBillboard"
                          id="affixed"
                          value="Affixed"
                          checked={space.position_of_billboard === "Affixed"}
                          onChange={(e) => setSpace({ ...space, position_of_billboard: e.target.value })}
                        />
                        <label className="form-check-label" htmlFor="affixed">&nbsp;&nbsp;Affixed</label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="positionOfBillboard"
                          id="others"
                          value="Others"
                          checked={space.position_of_billboard === "Others"}
                          onChange={(e) => setSpace({ ...space, position_of_billboard: e.target.value })}
                        />
                        <label className="form-check-label" htmlFor="others">&nbsp;&nbsp;Others</label>
                      </div>

                    </div>
                  </div>


                  <div>
                    <label>Advertisement Length</label>
                    <input
                      type="number"
                      value={space.lenght_advertise}
                      onChange={ev => {
                        const length = ev.target.value;
                        setSpace(prev => ({
                          ...prev,
                          lenght_advertise: length,
                          area_advertise: length * prev.width_advertise || ""
                        }));
                      }}
                      placeholder="Advertisement Length"
                    />
                  </div>
                  <div>
                    <label>Advertisement Width</label>
                    <input
                      type="number"
                      value={space.width_advertise}
                      onChange={ev => {
                        const width = ev.target.value;
                        setSpace(prev => ({
                          ...prev,
                          width_advertise: width,
                          area_advertise: prev.lenght_advertise * width || ""
                        }));
                      }}
                      placeholder="Advertisement Width"
                    />
                  </div>
                  <div>
                    <label>Advertisement Area</label>
                    <input
                      type="number"
                      value={space.area_advertise}
                      readOnly
                      placeholder="Advertisement Area"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Number of Advertisement Sides</label>
                    <select
                      className="form-select"
                      value={space.no_advertisement_sides}
                      onChange={ev => setSpace({ ...space, no_advertisement_sides: ev.target.value })}
                    >
                      <option value="">Select an option</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Sides Not Applicable">Sides Not Applicable</option>
                      <option value="V-shaped">V-shaped</option>
                      <option value="Multiple message">Multiple message</option>
                      <option value="Wall branding">Wall branding</option>
                      <option value="Surface branding">Surface branding</option>
                      <option value="Others">Others</option>
                    </select>

                    {/* Show input field when 'Others' is selected */}
                    {space.no_advertisement_sides === "Others" && (
                      <>
                        <input
                          type="text"
                          className="form-control mt-2"
                          placeholder="Name other advertisement side"
                          value={space.other_advertisement_sides || ""}
                          onChange={ev => setSpace({ ...space, other_advertisement_sides: ev.target.value })}
                        />

                        <input
                          type="number"
                          className="form-control mt-2"
                          placeholder="Number other advertisement side"
                          value={space.other_advertisement_sides_no || ""}
                          onChange={ev => setSpace({ ...space, other_advertisement_sides_no: ev.target.value })}
                        />
                      </>

                    )}
                  </div>

                  <div>
                    <label>Clearance Height</label>
                    <input type="number" value={space.clearance_height_advertise} onChange={ev => setSpace({ ...space, clearance_height_advertise: ev.target.value })} placeholder="Clearance Height" />
                  </div>
                </>
              );
            case 4:
              return (
                <>
                  <h3>Step {step}: Landowner (if different from applicant):</h3>
                  <div>
                    <label>Landowner Company/Corporate</label>
                    <input value={space.landowner_company_corporate} onChange={ev => setSpace({ ...space, landowner_company_corporate: ev.target.value })} placeholder="Landowner Company/Corporate" />
                  </div>
                  <div>
                    <label>Landowner Name</label>
                    <input value={space.landowner_name} onChange={ev => setSpace({ ...space, landowner_name: ev.target.value })} placeholder="Landowner Name" />
                  </div>
                  <div>
                    <label>Landowner Street Address</label>
                    <input value={space.landlord_street_address} onChange={ev => setSpace({ ...space, landlord_street_address: ev.target.value })} placeholder="Landowner Street Address" />
                  </div>
                  <div>
                    <label>Landowner Telephone</label>
                    <input value={space.landlord_telephone} onChange={ev => setSpace({ ...space, landlord_telephone: ev.target.value })} placeholder="Landowner Telephone" />
                  </div>
                  <div>
                    <label>Landowner Email</label>
                    <input value={space.landlord_email} onChange={ev => setSpace({ ...space, landlord_email: ev.target.value })} placeholder="Landowner Email" />
                  </div>

                  <div className="image-container">
                    {["image_1", "image_2", "image_3"].map((key, index) => (
                      <div key={index} className="image-box">
                        {/* Show existing image or new preview */}
                        {images[key] ? (
                          <img
                            src={
                              typeof images[key] === "string"
                                ? `${import.meta.env.VITE_API_BASE_URL}/storage/${images[key]}` // Backend Image
                                : URL.createObjectURL(images[key]) // New Preview
                            }
                            alt={`Preview ${key}`}
                          />

                        ) : (
                          <div className="placeholder">No Image</div>
                        )}

                        {/* Upload Input */}
                        {key == "image_1" ? <label>Front View</label>
                          : key == "image_2" ? <label>Back View</label>
                            : key == "image_3" ? <label>Whole View</label> : ""
                        }
                        <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e) => handleFileChange(e, key)} />
                      </div>
                    ))}

                    <style>
                      {`
          .image-container { display: flex; gap: 15px; margin-top: 10px; }
          .image-box { display: flex; flex-direction: column; align-items: center; gap: 5px; }
          .image-box img { width: 100px; height: 100px; object-fit: cover; border-radius: 5px; }
          .placeholder { width: 100px; height: 100px; background: #ccc; display: flex; align-items: center; justify-content: center; border-radius: 5px; }
        `}
                    </style>
                  </div>
                </>
              );
            default:
              return <h3>Invalid Step</h3>;
          }
        })()}
      </div>
    );
  };



  return (
    <div className="card animated fadeInDown">
      {loading && <div className="text-center">Loading...</div>}
      {errors && <div className="alert alert-danger">{Object.keys(errors).map(key => <p key={key}>{errors[key][0]}</p>)}</div>}
      <form onSubmit={onSubmit}>
        {renderStepContent()}
        <div className="form-navigation mt-2">
          {step > 1 && <button className="btn btn-primary" type="button" onClick={handlePrev}>Previous</button>} &nbsp;
          {step < 4 && <button className="btn btn-primary" type="button" onClick={handleNext}>Next</button>} {/* Corrected this line */}
          {step === 4 && <button className="btn btn-primary" type="submit">Submit</button>} {/* Corrected this line */}
        </div>
      </form>
    </div>
  );
}

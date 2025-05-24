import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider.jsx";
//step-1
import { getUserPermissions } from "./getUserPermissions.js";
import { formatPermissions } from "./formatPermissions.js";

export default function Spaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setNotification } = useStateContext();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");

  const [permissions, setPermissions] = useState({}); // step 2
  // step-3
  useEffect(() => {
    const loadPermissions = async () => {
      const raw = await getUserPermissions();
      // console.log(raw)
      const formatted = formatPermissions(raw);
      setPermissions(formatted);
    };

    loadPermissions();
  }, []);

  //step-4
  const can = (module, action) => {
    return permissions[module]?.has(action);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getSpaces();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]); // Removed fromDate & toDate

  const fetchAgents = () => {
    axiosClient
      .get("/agent-list")
      .then(({ data }) => setAgents(data))
      .catch(() => setAgents([]));
  };

  const handleSearch = () => {
    // if (!fromDate || !toDate) {
    //   alert("Please select both From and To dates.");
    //   return;
    // }

    if (new Date(fromDate) > new Date(toDate)) {
      alert("From date cannot be greater than To date.");
      return;
    }

    getSpaces(); // Call API only when search button is clicked
  };

  const getSpaces = () => {
    setLoading(true);
    axiosClient
      .get(`/spaces`, {
        params: {
          page: currentPage,
          limit: perPage,
          search: searchQuery,
          from_date: fromDate,
          to_date: toDate,
          agent: selectedAgent,
        },
      })
      .then(({ data }) => {
        setLoading(false);
        setSpaces(data.data || []);
        setTotalPages(data.last_page || 1);
      })
      .catch(() => {
        setLoading(false);
        setSpaces([]);
      });
  };

  const onDeleteClick = (space) => {
    if (!window.confirm("Are you sure you want to delete this space?")) return;

    axiosClient.delete(`/spaces/${space.id}`).then(() => {
      setNotification("Space was successfully deleted");
      getSpaces();
    });
  };

  const exportToCSV = () => {
    const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/storage/`;
    if (!spaces.length) return alert("No data to export");

    // Convert data to CSV-compatible format
    const csvData = spaces.map((space) => ({
      "Space ID": `"FCC/SPC/${space.id ?? "N/A"}"`,
      "Collection Date": `"${space.data_collection_date ?? "N/A"}"`,
      Name: `"${space.name_of_person_collection_data ?? "N/A"}"`,
      "Agent Name": `"${space.name_of_advertise_agent_company_or_person ?? "N/A"}"`,
      "Contact Person": `"${space.name_of_contact_person ?? "N/A"}"`,
      "Created By User Name": `"${space.created_by_user?.name ?? "N/A"}"`,
      "Created By User Id": `"${space.created_by_user?.id ?? "N/A"}"`,
      Telephone: `"${space.telephone ?? "N/A"}"`,
      Email: `"${space.email ?? "N/A"}"`,
      Location: `"${space.location ?? "N/A"}"`,
      "Street/Road No": `"${space.stree_rd_no ?? "N/A"}"`,
      "Section of Road": `"${space.section_of_rd ?? "N/A"}"`,
      Landmark: `"${space.landmark ?? "N/A"}"`,
      "GPS Coordinates": `"${space.gps_cordinate ?? "N/A"}"`,
      "Property Description": `"${(space.description_property_advertisement ?? "N/A").replace(/\n/g, " ")}"`,
      "Advertisement Category": `"${space.advertisement_cat_desc ?? "N/A"}"`,
      "Type of Advertisement": `"${space.type_of_advertisement ?? "N/A"}"`,
      "Billboard Position": `"${space.position_of_billboard ?? "N/A"}"`,
      "Advertisement Length": `"${space.lenght_advertise ?? "N/A"}"`,
      "Advertisement Width": `"${space.width_advertise ?? "N/A"}"`,
      "Advertisement Area": `"${space.area_advertise ?? "N/A"}"`,
      "Number of Sides": `"${space.no_advertisement_sides ?? "N/A"}"`,
      "Other Advertisement Sides": `"${space.other_advertisement_sides ?? "N/A"}"`,
      "Clearance Height": `"${space.clearance_height_advertise ?? "N/A"}"`,
      "Illumination": `"${space.illuminate_nonilluminate ?? "N/A"}"`,
      "Certified Georgia Licensed": `"${space.certified_georgia_licensed ?? "N/A"}"`,
      "Landowner (Company/Corporate)": `"${space.landowner_company_corporate ?? "N/A"}"`,
      "Landowner Name": `"${space.landowner_name ?? "N/A"}"`,
      "Landlord Street Address": `"${space.landlord_street_address ?? "N/A"}"`,
      "Landlord Telephone": `"${space.landlord_telephone ?? "N/A"}"`,
      "Landlord Email": `"${space.landlord_email ?? "N/A"}"`,
      "Created At": `"${space.created_at ?? "N/A"}"`,
      "Updated At": `"${space.updated_at ?? "N/A"}"`,
      "Space Category ID": `"${space.space_cat_id ?? "N/A"}"`,
      Rate: `"${space.rate ?? "N/A"}"`,
      "Other Advertisement Sides No": `"${space.other_advertisement_sides_no ?? "N/A"}"`,
      "Image 1": `"${space.image_1 ? BASE_URL + space.image_1 : "N/A"}"`,
      "Image 2": `"${space.image_2 ? BASE_URL + space.image_2 : "N/A"}"`,
      "Image 3": `"${space.image_3 ? BASE_URL + space.image_3 : "N/A"}"`
    }));

    // Generate CSV content
    const csvContent = "data:text/csv;charset=utf-8," +
      [Object.keys(csvData[0]).join(","), ...csvData.map(row => Object.values(row).join(","))].join("\n");

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "spaces_data.csv";
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <div>
        {/* Filters Section */}
        {can('manage_spaces', 'list') && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0">Spaces</h1>
            <div className="d-flex gap-2 align-items-center">
              {/* Search Input */}
              <div className="d-flex flex-column">
                <label className="small text-muted">Name</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control form-control-sm"
                  style={{ width: "200px" }}
                />
              </div>

              {/* Date Range */}
              <div className="d-flex flex-column">
                <label className="small text-muted">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="form-control form-control-sm"
                />
              </div>

              <div className="d-flex flex-column">
                <label className="small text-muted">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="form-control form-control-sm"
                />
              </div>

              <div className="d-flex flex-column">
                <label className="small text-muted">Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="form-control form-control-sm"
                >
                  <option value="">Select an option</option>
                  {agents?.map((option, index) => (
                    <option key={index} value={option?.name}>
                      {option?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button style={{ marginTop: "20px" }} className="btn btn-sm btn-success px-3" onClick={handleSearch}>
                Search
              </button>

              {/* Export Button */}
              <button style={{ marginTop: "20px" }} className="btn btn-sm btn-warning px-3" onClick={exportToCSV}>
                Export
              </button>

              {/* Add New Button */}
              {can('manage_spaces', 'add') && (
                <Link style={{ marginTop: "20px" }} className="btn btn-sm btn-primary px-3" to="/space/new">
                  Add New
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Table */}
      <div className="card animated fadeInDown table-responsive">
        <table className="table table-striped" >
          <thead className="table-primary"> {/* Makes header gray */}
            <tr>
              <th>Space ID</th>
              <th>Collection Date</th>
              <th>Name</th>
              <th>Agent Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          {loading && (
            <tbody>
              <tr>
                <td colSpan="5" className="text-center">Loading...</td>
              </tr>
            </tbody>
          )}
          {!loading && (
            <tbody>
              {spaces.map((u, index) => (
                <tr key={u.id} className={index % 2 === 0 ? "bg-light" : "bg-white"}>
                  <td> FCC/SPC/{u.id}</td>
                  <td>{u.data_collection_date}</td>
                  <td>{u.name_of_person_collection_data}</td>
                  <td>{u.name_of_advertise_agent_company_or_person}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2" >
                      {can('manage_spaces', 'edit') && (
                        <>
                          <Link style={{ marginRight: "10px" }} className="btn btn-sm btn-primary w-24 text-center" to={`/space/${u.id}`}>
                            Edit
                          </Link>


                          {u.bookings[0]?.status === "approved" ? (
                            <Link style={{ marginRight: "8px" }} className="btn btn-sm btn-success w-24 text-center" to={`/space/book/${u.id}`}>
                              Book Now
                            </Link>
                          ) : (
                            <Link style={{ marginRight: "8px" }} className="btn btn-sm btn-success w-24 text-center" to={`/space/book/${u.id}`}>
                              Book Now
                            </Link>
                          )}
                        </>
                      )}

                      {can('manage_spaces', 'delete') && (
                        <button style={{ marginRight: "10px" }} className="btn btn-sm btn-danger w-24 text-center" onClick={() => onDeleteClick(u)}>
                          Delete
                        </button>
                      )}
                      {can('manage_spaces', 'view') && (
                        <Link style={{ marginRight: "10px" }} className="btn btn-sm btn-success w-24 text-center" to={`/space/view/${u.id}`}>
                          View
                        </Link>
                      )}

                      <button
                        style={{ marginRight: "10px" }}
                        className="btn btn-sm btn-info w-24 text-center"
                        onClick={() => {
                          if (u.gps_cordinate) {
                            const parts = u.gps_cordinate.trim().split(/\s+/);  // Split on one or more spaces
                            const lat = parts[0];
                            const long = parts[1];
                            // console.log(parts, lat, long);
                            window.open(`https://www.google.com/maps?q=${lat},${long}`, "_blank");
                          } else {
                            alert("No GPS coordinates available for this space.");
                          }
                        }}
                      >
                        Track
                      </button>

                      {u?.bookings?.length ? (
                        <>
                        </>) : (
                        <>
                          <Link style={{ marginRight: "8px" }} className="btn btn-sm btn-success w-24 text-center" to={`/space/book/${u.id}`}>
                            Blank Space
                          </Link>
                        </>

                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          )}
        </table>

        {/* Pagination */}
        <div className="d-flex justify-content-center align-items-center mt-3">
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &lt; Previous
          </button>
          <span className="fw-bold mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-primary ms-2"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div >
  );
}

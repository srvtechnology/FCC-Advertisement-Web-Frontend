import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [amount, setAmount] = useState("");

  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    payeeName: "",
    paymentDate: "",
    paymentMode: "",
    payeeAddress: "",
    transactionId: "",
    paymentSlip: null,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = () => {
    axiosClient
      .get("/agent-list")
      .then(({ data }) => setAgents(data))
      .catch(() => setAgents([]));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  useEffect(() => {
    getBookings();
  }, []);

  const getBookings = (agentName = "", startDate = "", endDate = "") => {
    setLoading(true);
    axiosClient
      .get("/bookings", {
        params: { agent_name: selectedAgent, start_date: startDate, end_date: endDate },
      })
      .then(({ data }) => {
        setLoading(false);
        setBookings(data.data || []);
      })
      .catch(() => {
        setLoading(false);
        setBookings([]);
      });
  };

  const handleSearch = () => {
    // Validation: If either start or end date is selected, both must be filled
    if ((startDate && !endDate) || (!startDate && endDate)) {
      alert("Please select both start and end dates.");
      return;
    }
    // Validation: Start date should not be greater than end date
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be greater than end date.");
      return;
    }

    getBookings(selectedAgent, startDate, endDate);
  };

  const downloadPDF = (id) => {
    axiosClient
      .get(`/bookings/${id}/download-pdf`, { responseType: "blob" })
      .then((response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `Demand_Note_${id}.pdf`;
        link.click();
      })
      .catch((error) => console.error("Error downloading PDF:", error));
  };

  const PayforSpace = (bookingId, spaceId, amount) => {
    handleShow()
    setBookingId(bookingId)
    setSpaceId(spaceId)
    setAmount(amount)

  };


  // Function to export bookings as CSV
  const exportToCSV = () => {
    if (!bookings || bookings.length === 0) return alert("No data to export");

    const csvRows = [];
    const headers = [
      "Booking ID", "User Name", "User Email", "User Type", "Period", "Start Date", "End Date",
      "Customer", "Customer Email", "Mobile", "Address", "Status", "Created At", "Updated At",
      "Space ID", "Collection Date", "Person Collecting Data", "Agent Name", "Contact Person",
      "Telephone", "Email", "Location", "Street/Road No", "Section of Road", "Landmark",
      "GPS Coordinates", "Property Description", "Advertisement Category", "Type of Advertisement",
      "Billboard Position", "Advertisement Length", "Advertisement Width", "Advertisement Area",
      "Number of Sides", "Other Advertisement Sides", "Clearance Height", "Illumination",
      "Certified Georgia Licensed", "Landowner (Company/Corporate)", "Landowner Name",
      "Landlord Street Address", "Landlord Telephone", "Landlord Email", "Space Category",
      "Rate", "Other Advertisement Sides No", "Image 1", "Image 2", "Image 3"
    ];
    csvRows.push(headers.join(",")); // Add headers

    console.log("Total bookings:", bookings.length); // Check total rows
    const BASE_URL = "https://fccapi.srvtechservices.com/storage/";
    bookings.forEach((b, index) => {
        if (!b || Object.keys(b).length === 0) return; // Skip empty objects

        // console.log(`Processing row ${index + 1}: ID = ${b.id}`);

        const row = [
           "FCC/BK/"+ b.id ?? "N/A",
            b.user?.name ?? "N/A",
            b.user?.email ?? "N/A",
            b.user?.user_type ?? "N/A",
            b.period ?? "N/A",
            b.start_date ?? "N/A",
            b.end_date ?? "N/A",
            b.customer_name ?? "N/A",
            b.customer_email ?? "N/A",
            b.mobile ?? "N/A",
            b.address ?? "N/A",
            b.status ?? "N/A",
            b.created_at ?? "N/A",
            b.updated_at ?? "N/A",
            "FCC/SPC/"+b.space?.id ?? "N/A",
            b.space?.data_collection_date ?? "N/A",
            b.space?.name_of_person_collection_data ?? "N/A",
            b.space?.name_of_advertise_agent_company_or_person ?? "N/A",
            b.space?.name_of_contact_person ?? "N/A",
            b.space?.telephone ?? "N/A",
            b.space?.email ?? "N/A",
            b.space?.location ?? "N/A",
            b.space?.stree_rd_no ?? "N/A",
            b.space?.section_of_rd ?? "N/A",
            b.space?.landmark ?? "N/A",
            b.space?.gps_cordinate ?? "N/A",
            b.space?.description_property_advertisement ?? "N/A",
            b.space?.advertisement_cat_desc ?? "N/A",
            b.space?.type_of_advertisement ?? "N/A",
            b.space?.position_of_billboard ?? "N/A",
            b.space?.lenght_advertise ?? "N/A",
            b.space?.width_advertise ?? "N/A",
            b.space?.area_advertise ?? "N/A",
            b.space?.no_advertisement_sides ?? "N/A",
            b.space?.other_advertisement_sides ?? "N/A",
            b.space?.clearance_height_advertise ?? "N/A",
            b.space?.illuminate_nonilluminate ?? "N/A",
            b.space?.certified_georgia_licensed ?? "N/A",
            b.space?.landowner_company_corporate ?? "N/A",
            b.space?.landowner_name ?? "N/A",
            b.space?.landlord_street_address ?? "N/A",
            b.space?.landlord_telephone ?? "N/A",
            b.space?.landlord_email ?? "N/A",
            b.space?.category?.name ?? "N/A",
            b.space?.rate ?? "N/A",
            b.space?.other_advertisement_sides_no ?? "N/A",
            b.space?.image_1 ? BASE_URL + b.space.image_1 : "N/A",
            b.space?.image_2 ? BASE_URL + b.space.image_2 : "N/A",
            b.space?.image_3 ? BASE_URL + b.space.image_3 : "N/A"
        ];

        csvRows.push(row.map(value => `"${value}"`).join(",")); // Handle commas
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "bookings.csv";
    link.click();
};






  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payment Data:", formData);
    const paymentData = new FormData();
    paymentData.append("booking_id", bookingId);
    paymentData.append("space_id", spaceId);
    paymentData.append("amount", amount);
    paymentData.append("payee_name", formData.payeeName);
    paymentData.append("payment_date", formData.paymentDate);
    paymentData.append("payment_mode", formData.paymentMode);
    paymentData.append("payee_address", formData.payeeAddress);
    paymentData.append("transaction_id", formData.transactionId);
    if (formData.paymentSlip) {
      paymentData.append("payment_slip", formData.paymentSlip);
    }

    axiosClient
      .post("/payments", paymentData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        alert("Payment successful!");
        getBookings(); // Refresh the bookings list after payment
      })
      .catch((error) => {
        console.error("Payment failed:", error);
        alert("Payment failed. Please try again.");
      });
    // Call your payment API here
    handleClose();
    setFormData({
      payeeName: "",
      paymentDate: "",
      paymentMode: "",
      payeeAddress: "",
      transactionId: "",
      paymentSlip: null,
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Bookings</h1>
        <div className="d-flex gap-2 align-items-center">{/* Agent Dropdown */}
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

          {/* Start Date */}
          <div className="d-flex flex-column">
            <label className="small text-muted">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control form-control-sm"
              style={{ width: "150px" }}
            />
          </div>

          {/* End Date */}
          <div className="d-flex flex-column">
            <label className="small text-muted">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-control form-control-sm"
              style={{ width: "150px" }}
            />
          </div>

          {/* Search Button */}
          <button style={{ marginTop: "20px" }} className="btn btn-sm  btn-success" onClick={handleSearch}>
            Search
          </button>

          {/*Export Button */}
          <button style={{ float: "right", marginTop: "35px", marginRight: "30px" }} className="btn btn-sm  btn-warning mb-3" onClick={exportToCSV}>Export</button>

        </div>
      </div>


      {/* Card with scrollable table */ }
      <div className="card p-3 shadow">
        <div className="table-responsive" style={{ maxHeight: "500px", overflowX: "auto" }}>
        <table className="table table-striped">
        <thead className="table-primary"> {/* Makes header gray */}
              <tr>
                <th>Booking ID</th>
                <th>User Name</th>
                <th>Agent</th>
                <th>Period</th>
                <th>Space</th>
                <th>Space Category</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Address</th>
                <th>Booking Date</th>
                <th>Demand Note</th>
                <th>View</th>
                <th>Payment Status</th>
                {/* <th>Status</th> */}
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan="12" className="text-center">Loading...</td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <tr key={b.id}>
                      <td> FCC/BK/{b.id}</td>
                      <td>{b.user?.name || "N/A"}</td>
                      <td>{b.space?.name_of_advertise_agent_company_or_person || "N/A"}</td>
                      <td>{b.period}</td>
                      <td>FCC/SPC/{b.space?.id || "N/A"}</td>
                      <td>{b.space?.category?.name || "N/A"}</td>
                      <td>{b.customer_name || "N/A"}</td>
                      <td>{b.customer_email || "N/A"}</td>
                      <td>{b.mobile || "N/A"}</td>
                      <td>{b.address || "N/A"}</td>
                      <td>{b.created_at || "N/A"}</td>
                      <td>
                        <button  style={{ marginRight: "10px" }} className="btn btn-sm btn-primary w-24 text-center" onClick={() => downloadPDF(b.id)}>Download</button>
                      </td>
                      <td>
                        <Link  style={{ marginRight: "10px" }} className="btn btn-sm btn-success w-24 text-center" to={`/bookings/${b.id}`}>View</Link>
                      </td>
                      <td>
                        {b.status === "pending" ? (
                          <button  style={{ marginRight: "10px" }} className="btn btn-sm btn-warning w-24 text-center"onClick={() => PayforSpace(b.id, b.space?.id, b.space?.rate * b.space?.area_advertise* parseInt(b.space?.other_advertisement_sides_no ?? 1))}>
                            Pay NLe {b.space?.rate * b.space?.area_advertise * parseInt(b.space?.other_advertisement_sides_no ?? 1) }
                          </button>
                        ) : (
                          <button  style={{ marginRight: "10px" }} className="btn btn-sm btn-secondary w-24 text-center">Paid </button>
                        )}
                      </td>
                      {/* <td>{b.status || "N/A"}</td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center">No bookings found</td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Make Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Booking Details</h5>
          <p><strong>Space ID:</strong> {spaceId}</p>
          <p><strong>Rate:</strong> {amount}</p>

          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Payee Name</Form.Label>
              <Form.Control
                type="text"
                name="payeeName"
                value={formData.payeeName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Date of Payment</Form.Label>
              <Form.Control
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Payment Mode</Form.Label>
              <Form.Control
                as="select"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Payee Address</Form.Label>
              <Form.Control
                type="text"
                name="payeeAddress"
                value={formData.payeeAddress}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Bank Transaction ID</Form.Label>
              <Form.Control
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Payment Slip (Upload Proof)</Form.Label>
              <Form.Control
                type="file"
                name="paymentSlip"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              Submit Payment
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div >
  );
}

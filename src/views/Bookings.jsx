import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState(null);

  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    payeeName: "",
    paymentDate: "",
    paymentMode: "",
    payeeAddress: "",
    transactionId: "",
    paymentSlip: null,
    payment_type: "full",
    paymentamount: 0,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");

  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [amountToPay, setAmountToPay] = useState(0);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;
  
    let total = 0;
    let paid = 0;
    let pending = 0;
  
    bookings.forEach((b) => {
      // Calculate the total amount
      let amount = b.hasOwnProperty("payment") && b.payment != null
        ? Number(b.payment?.amount) || 0
        : Number(
            b.space?.rate * b.space?.area_advertise * parseInt(b.space?.other_advertisement_sides_no ?? 1) || 0
          );
  
      total += amount;
  
      // Calculate paid amount
      let paidAmount = b.hasOwnProperty("payment") && b.payment != null
        ? Number(b.payments_sum_payment_amount_1) || 0
        : 0;
  
      paid += paidAmount;
  
      // Calculate remaining amount
      let remainingAmount = amount - paidAmount;
      pending += remainingAmount;
    });
  
    setTotalAmount(total);
    setPaidAmount(paid);
    setAmountToPay(pending);
  }, [bookings]);
  

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

  const PayforSpace = (data, bookingId, spaceId, amount) => {
    console.log(data)
    handleShow()
    setTotalData(data)
    setBookingId(bookingId)
    setSpaceId(spaceId)
    setAmount(amount)
    setFormData((prevData) => ({
      ...prevData,
      paymentamount: amount,
    }));

  };

  useEffect(() => {
    if (formData.payment_type == "full") {
      setFormData((prevData) => ({
        ...prevData,
        paymentamount: amount,
      }));
    }

  }, [formData.payment_type])


  // Function to export bookings as CSV
  const exportToCSV = () => {
    if (!bookings || bookings.length === 0) return alert("No data to export");

    const csvRows = [];
    const headers = [
      "Booking ID", "User Name", "User Email", "User Type", "Booking Created By User Name", "Booking Created By User Id", "Period", "Start Date", "End Date",
      "Customer", "Customer Email", "Mobile", "Address", "Status", "Created At", "Updated At",
      "Space ID", "Collection Date", "Person Collecting Data", "Agent Name", "Contact Person",
      "Telephone", "Email", "Location", "Street/Road No", "Section of Road", "Landmark",
      "GPS Coordinates", "Property Description", "Advertisement Category", "Type of Advertisement",
      "Billboard Position", "Advertisement Length", "Advertisement Width", "Advertisement Area",
      "Number of Sides", "Other Advertisement Sides", "Clearance Height", "Illumination",
      "Certified Georgia Licensed", "Landowner (Company/Corporate)", "Landowner Name",
      "Landlord Street Address", "Landlord Telephone", "Landlord Email", "Space Category",
      "Rate", "Other Advertisement Sides No", "Image 1", "Image 2", "Image 3", "Total Amount", "Paid Amount",
      "Outstanding Amount"
    ];
    csvRows.push(headers.join(",")); // Add headers

    console.log("Total bookings:", bookings.length); // Check total rows
    const BASE_URL = "https://fccapi.srvtechservices.com/storage/";
    bookings.forEach((b, index) => {
      if (!b || Object.keys(b).length === 0) return; // Skip empty objects

      // console.log(`Processing row ${index + 1}: ID = ${b.id}`);

      const row = [
        "FCC/BK/" + b.id ?? "N/A",
        b.user?.name ?? "N/A",
        b.user?.email ?? "N/A",
        b.user?.user_type ?? "N/A",
        b.created_by_user?.name ?? "N/A",
        b.created_by_user?.id ?? "N/A",
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
        "FCC/SPC/" + b.space?.id ?? "N/A",
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
        b.space?.image_3 ? BASE_URL + b.space.image_3 : "N/A",
        b.hasOwnProperty("payment") && b.payment != null
          ? Number(b.payment?.amount).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
          : "0",
        b.hasOwnProperty("payment") && b.payment != null
          ? Number(b.payments_sum_payment_amount_1).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
          : "0",
        b.hasOwnProperty("payment") && b.payment != null
          ? Number(b.payment?.amount - b.payments_sum_payment_amount_1).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
          : "0",

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
    paymentData.append("payment_type", formData.payment_type);
    paymentData.append("paymentamount", formData.paymentamount)

    // {
    //   totalData.hasOwnProperty("payment") && totalData.payment != null ?
    //     paymentData.append("paymentamount", amount) :
    //     paymentData.append("paymentamount", formData.paymentamount)
    // }
    // {
    //   totalData.hasOwnProperty("payment") && totalData.payment != null ?
    //     paymentData.append("payment_type", "full") :
    //     paymentData.append("payment_type", formData.payment_type)
    // }
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
        // console.error("Payment failed:", error);
        const response = error.response;
        console.log(response.data.message)
        if (response && response.status === 422) {
          setMessage(response.data.message);
        }
        alert(response.data.message);
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
      payment_type: "full",
      paymentamount: amount,
    });
  };




  // Handle individual checkbox toggle
  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id) // Remove if already selected
        : [...prevSelected, id] // Add if not selected
    );
  };

  // Handle "Select All" checkbox
  const handleSelectAll = () => {
    if (selectedIds.length === bookings.length) {
      setSelectedIds([]); // Uncheck all
    } else {
      setSelectedIds(bookings.map((b) => b.id)); // Select all IDs
    }
  };


  // Handle API call with selected IDs
  const postSelectedIds = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one booking.");
      return;
    }

    axiosClient.post("/bulk-download-pdf", { ids: selectedIds }, {
      headers: { "Content-Type": "application/json" },
      responseType: "blob", // IMPORTANT: Treat response as binary file (PDF)
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Demand_Note_bulk.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("PDF generation failed:", error);
        alert("PDF generation failed. Please try again.");
      });
  };



  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Bookings</h1>
        {/* {message && <div className="alert alert-danger">{message}</div>} */}
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
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", padding: "10px", fontWeight: "bold" }}>
        <span>Total Amount: NLe {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
        <span>Paid Amount: NLe {paidAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
        <span>Need to Pay: NLe {amountToPay.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
      </div>



      {/* Card with scrollable table */}
      <div className="card p-3 shadow">
        <div className="table-responsive" style={{ maxHeight: "500px", overflowX: "auto" }}>
          <div>
            <button
              className="btn btn-primary mb-2"
              onClick={postSelectedIds}
              disabled={selectedIds.length === 0}
            >
              Selected Booking IDs
            </button>

            <table className="table table-striped">
              <thead className="table-primary" >
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === bookings.length && bookings.length > 0}
                    />
                  </th>
                  <th> Booking ID </th>
                  <th> User Name </th>
                  <th> Agent </th>
                  <th> Period </th>
                  <th> Space </th>
                  <th> Space Category </th>
                  <th> Customer </th>
                  <th> Email </th>
                  <th> Mobile </th>
                  <th> Address </th>
                  <th> Booking Date </th>
                  <th> Payment Status </th>
                  <th> Total amount </th>
                  <th> paid </th>
                  <th>Outstanding Amount</th>
                  <th> Demand Note </th>
                  <th> View </th>
                  <th> Payment Status </th>
                </tr>
              </thead>

              {
                loading ? (
                  <tbody>
                    <tr>
                      <td colSpan="15" className="text-center" > Loading...</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {
                      bookings.length > 0 ? (
                        bookings.map((b) => (
                          <tr key={b.id} >
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(b.id)}
                                onChange={() => handleCheckboxChange(b.id)}
                              />
                            </td>
                            <td> FCC/BK/{b.id} </td>
                            <td> {b.user?.name || "N/A"} </td>
                            <td> {b.space?.name_of_advertise_agent_company_or_person || "N/A"} </td>
                            <td> {b.period} </td>
                            <td> FCC/SPC/{b.space?.id || "N/A"} </td>
                            <td> {b.space?.category?.name || "N/A"} </td>
                            <td> {b.customer_name || "N/A"} </td>
                            <td> {b.customer_email || "N/A"} </td>
                            <td> {b.mobile || "N/A"} </td>
                            <td> {b.address || "N/A"} </td>
                            <td> {b.created_at.split("T")[0] || "N/A"} </td>
                            <td> {b.hasOwnProperty("payment") && b.payment != null ?
                              parseInt(b.payments_sum_payment_amount_1) === parseInt(b.payment?.amount) ?
                                "full" : b.payment?.payment_type : "not paid"} </td>
                            {/* total  */}
                            <td>NLe{" "}
                              {b.hasOwnProperty("payment") && b.payment != null
                                ? Number(b.payment?.amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                : `${Number(
                                  b.space?.rate * b.space?.area_advertise * parseInt(b.space?.other_advertisement_sides_no ?? 1) || 0
                                ).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                            </td>
                            {/* paid */}
                            <td> NLe{" "}
                              {b.hasOwnProperty("payment") && b.payment != null
                                ? Number(b.payments_sum_payment_amount_1).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                : "0"}
                            </td>
                            {/* rem */}
                            <td> NLe{" "}
                              {b.hasOwnProperty("payment") && b.payment != null
                                ? Number(b.payment?.amount - b.payments_sum_payment_amount_1).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                : "0"}
                            </td>
                            <td>
                              <button className="btn btn-sm btn-primary" onClick={() => downloadPDF(b.id)}>
                                Download
                              </button>
                            </td>
                            <td>
                              <Link className="btn btn-sm btn-success" to={`/bookings/${b.id}`}>
                                View
                              </Link>
                            </td>
                            <td>
                              {
                                b.status === "pending" ? (
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() =>
                                      PayforSpace(b, b.id, b.space?.id, b.space?.rate * b.space?.area_advertise * parseInt(b.space?.other_advertisement_sides_no ?? 1))
                                    }
                                  >
                                    Pay {`NLe ${Number(b.space?.rate * b.space?.area_advertise * parseInt(b.space?.other_advertisement_sides_no ?? 1) || 0)
                                      .toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}

                                  </button>
                                ) : b.hasOwnProperty("payment") && b.payment != null && b.payment.payment_type == "partial" &&
                                  parseInt(b.payments_sum_payment_amount_1) < parseInt(b.payment?.amount) ?
                                  (
                                    <button
                                      className="btn btn-sm"
                                      style={{ background: "#ffd453" }}
                                      onClick={() =>
                                        PayforSpace(b, b.id, b.space?.id, (b.payment?.amount - b.payments_sum_payment_amount_1))
                                      }
                                    >
                                      Pay {`NLe ${Number((b.payment?.amount - b.payments_sum_payment_amount_1) || 0)
                                        .toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}

                                    </button>
                                  )
                                  :
                                  (
                                    <button className="btn btn-sm btn-secondary" > Paid </button>
                                  )
                              }
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="15" className="text-center" > No bookings found </td>
                        </tr>
                      )}
                  </tbody>
                )}
            </table>
          </div>
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Make Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Booking Details</h5>
          <p><strong>Space ID: </strong>FCC/SPC/{spaceId}</p>
          <p>
            <strong>
              Amount: {`NLe ${Number(amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
            </strong>
          </p>

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
              <Form.Label>Payment type</Form.Label>
              <Form.Control
                as="select"
                name="payment_type"
                value={formData.payment_type}
                onChange={handleChange}
                required
              >
                <option value="full">Full</option>
                <option value="partial">Partial</option>
              </Form.Control>
            </Form.Group>

            {formData?.payment_type == "partial" &&
              <>
                <Form.Group>
                  <Form.Label>Partial Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="paymentamount"
                    value={formData.paymentamount}
                    onChange={handleChange}
                    required
                    max={amount}
                  />
                </Form.Group>
              </>
            }

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

import { useEffect, useState } from "react";
import axiosClient from "../axios-client.js";
import { Link } from "react-router-dom";

export default function Payments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchAgent, setSearchAgent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [bookingIds, setBookingIds] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");


  useEffect(() => {
    getBookings();
    fetchAgents();
  }, []);

  const fetchAgents = () => {
    axiosClient
      .get("/agent-list")
      .then(({ data }) => setAgents(data))
      .catch(() => setAgents([]));
  };

  const getBookings = (agentName = "", startDate = "", endDate = "") => {
    setLoading(true);
    axiosClient
      .get("/payments", {
        params: { agent_name: selectedAgent, start_date: startDate, end_date: endDate,selectedBookId:selectedBookId },
      })
      .then(({ data }) => {
        setLoading(false);
        setBookings(data.data || []);
        const ids = data.data.map((item) => item.booking_id);
        setBookingIds(ids);
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

  const downloadExcel = (id) => {
    axiosClient
      .get(`/payment/${id}/download-excel`, { responseType: "blob" })
      .then((response) => {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `Payment_Details_${id}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => console.error("Error downloading Excel:", error));
  };

  const downloadReceipt = (id) => {
    axiosClient
      .get(`/payment/${id}/download-receipt`, { responseType: "blob" })
      .then((response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `Payment_Receipt_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => console.error("Error downloading receipt:", error));
  };

  const downloadBulkExport = () => {
    if (bookings.length === 0) {
      alert("No data to export.");
      return;
    }

    const BASE_URL = "https://fccapi.srvtechservices.com/storage/";

    const csvData = bookings.map((b) => ({
      "Payment ID": "FCC/PMT/" + b.id,
      "Booking ID": "FCC/BK/" + b.booking_id,
      "Space ID": "FCC/SPC/" + b.space_id,
      "Total Bill": `NLe ${Number(b.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      "Amount Paid": `NLe ${Number(b.payment_amount_1 ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      Status: b.status,
      "Payee Name": b.payee_name,
      "Payment Date": b.payment_date,
      "Payment Mode": b.payment_mode,
      "Payee Address": b.payee_address,
      "Transaction ID": b.transaction_id,
      "Payment Slip": b.payment_slip ? BASE_URL + b.payment_slip : "N/A",
      "Created At": b.created_at,
      "Updated At": b.updated_at,
      "Payment Created By User Name": b.created_by_user?.name,
      "Payment Created By User Id": b.created_by_user?.id,
      "Customer Name": b.booking?.customer_name || "N/A",
      "Customer Email": b.booking?.customer_email || "N/A",
      "Customer Mobile": b.booking?.mobile || "N/A",
      "Booking Status": b.booking?.status || "N/A",
      "Start Date": b.booking?.start_date || "N/A",
      "End Date": b.booking?.end_date || "N/A",
      "Period": b.booking?.period || "N/A",
      "Space Category": b.space?.category?.name || "N/A",
      "Agent Name": b.space?.name_of_advertise_agent_company_or_person || "N/A",
      "Contact Person": b.space?.name_of_contact_person || "N/A",
      Telephone: b.space?.telephone || "N/A",
      Email: b.space?.email || "N/A",
      Location: b.space?.location || "N/A",
      "Street/Road No": b.space?.stree_rd_no || "N/A",
      "Section of Road": b.space?.section_of_rd || "N/A",
      Landmark: b.space?.landmark || "N/A",
      "GPS Coordinates": b.space?.gps_cordinate || "N/A",
      "Property Description": b.space?.description_property_advertisement || "N/A",
      "Advertisement Category": b.space?.advertisement_cat_desc || "N/A",
      "Type of Advertisement": b.space?.type_of_advertisement || "N/A",
      "Billboard Position": b.space?.position_of_billboard || "N/A",
      "Advertisement Length": b.space?.lenght_advertise || "N/A",
      "Advertisement Width": b.space?.width_advertise || "N/A",
      "Advertisement Area": b.space?.area_advertise || "N/A",
      "Number of Sides": b.space?.no_advertisement_sides || "N/A",
      "Clearance Height": b.space?.clearance_height_advertise || "N/A",
      "Illumination": b.space?.illuminate_nonilluminate || "N/A",
      "Certified Georgia Licensed": b.space?.certified_georgia_licensed || "N/A",
      "Landowner (Company/Corporate)": b.space?.landowner_company_corporate || "N/A",
      "Landowner Name": b.space?.landowner_name || "N/A",
      "Landlord Street Address": b.space?.landlord_street_address || "N/A",
      "Landlord Telephone": b.space?.landlord_telephone || "N/A",
      "Landlord Email": b.space?.landlord_email || "N/A",
      "Space Created At": b.space?.created_at || "N/A",
      "Space Updated At": b.space?.updated_at || "N/A",
      "Space Category ID": b.space?.space_cat_id || "N/A",
      Rate: b.space?.rate || "N/A",
      "Image 1": b.space?.image_1 ? BASE_URL + b.space.image_1 : "N/A",
      "Image 2": b.space?.image_2 ? BASE_URL + b.space.image_2 : "N/A",
      "Image 3": b.space?.image_3 ? BASE_URL + b.space.image_3 : "N/A",
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [Object.keys(csvData[0]).join(","), ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "All_Payments.csv");
    document.body.appendChild(link);
    link.click();
  };


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Payments</h1>

        <div className="d-flex gap-2">

        {/* Booking Dropdown */}
        <div className="d-flex flex-column">
            <label className="small text-muted">Booking Id</label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="form-control form-control-sm"
            >
              <option value="">Select an option</option>
              {bookingIds?.map((option, index) => (
                <option key={index} value={option}>
                FCC/BK/{option}
                </option>
              ))}
            </select>
          </div>


          {/* Agent Dropdown */}
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
          <button className="btn btn-sm btn-success align-self-end" onClick={handleSearch}>
            Search
          </button>

          {/* Bulk Export Button */}
          <button className="btn btn-sm btn-warning align-self-end" onClick={downloadBulkExport}>
            Export
          </button>
        </div>
      </div>



      <div className="card p-3 shadow">
        <div className="table-responsive" style={{ maxHeight: "500px", overflowX: "auto" }}>
          <table className="table table-striped">
            <thead className="table-primary"> {/* Makes header gray */}
              <tr>
                <th>Payment ID</th>
                <th>Space ID</th>
                <th>Booking ID</th>
                <th>Category</th>
                <th>Agent Name</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Total Bill</th>
                <th>Amount Paid</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Detail</th>
                {/* <th>Export</th> */}
                <th>Receipt</th>
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
                      <td> FCC/PMT/{b.id}</td>
                      <td>FCC/SPC/{b.space?.id || "N/A"}</td>
                      <td>FCC/BK/{b.booking_id || "N/A"}</td>
                      <td>{b.space?.category.name || "N/A"}</td>
                      <td>{b.space?.name_of_advertise_agent_company_or_person || "N/A"}</td>
                      <td>{b?.booking?.customer_name || "N/A"}</td>
                      <td>{b?.booking?.customer_email || "N/A"}</td>
                      <td>{b?.booking?.mobile || "N/A"}</td>
                      <td>
                        {`NLe ${Number(b?.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                      </td>
                      <td>
                        {`NLe ${Number(b?.payment_amount_1 ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                      </td>


                      <td>{b?.payment_date || "N/A"}</td>
                      <td>{b?.status || "N/A"}</td>
                      <td>
                        <Link style={{ marginRight: "10px" }} className="btn btn-sm btn-success w-24 text-center" to={`/payments/${b.id}`}>
                          View
                        </Link>
                      </td>
                      {/* <td>
                    <button  style={{ marginRight: "10px" }} className="btn btn-sm btn-primary w-24 text-center" onClick={() => downloadExcel(b.id)}>
                      Export
                    </button>
                  </td> */}
                      <td>
                        <button style={{ marginRight: "10px" }} className="btn btn-sm btn-primary w-24 text-center" onClick={() => downloadReceipt(b.id)}>
                          Receipt
                        </button>
                      </td>
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
    </div>
  );
}

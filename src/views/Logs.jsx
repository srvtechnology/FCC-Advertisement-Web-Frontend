import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Form, Modal, Spinner, Pagination, Badge } from 'react-bootstrap';
import axiosClient from '../axios-client';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    category: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Available filter options from your enum fields
  const actionOptions = ['', 'add', 'edit', 'delete', 'view'];
  const categoryOptions = ['', 'user', 'space_category', 'space', 'booking', 'payment', 'role'];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        ...(filters.action && { action: filters.action }),
        ...(filters.category && { category: filters.category })
      };

      const response = await axiosClient.get("/all-logs", { params });
      console.log(response)
      setLogs(response.data.data.data || []);
      setTotal(response.data.data.total || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      action: '',
      category: ''
    });
    setCurrentPage(1);
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'User ID', 'User Name', 'Action', 'Category',
      'Entity ID', 'Description', 'IP Address',
      'User Agent', 'Created At'
    ];

    const dataRows = logs.map(log => [
      log.id,
      log.user_id,
      log.user_data.name,
      log.action,
      log.category,
      log.entity_id,
      log.description,
      log.ip_address,
      log.user_agent,
      formatDateTime(log.created_at)
    ]);

    const csvRows = [
      headers.join(','),
      ...dataRows.map(row => row.map(item => `"${item}"`).join(','))
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "audit_logs.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'add': return 'success';
      case 'edit': return 'primary';
      case 'delete': return 'danger';
      case 'view': return 'info';
      default: return 'secondary';
    }
  };



  const isJSON = (str) => {
    if (!str) return false;
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const renderDescription = (description) => {
    if (!description) return <span className="text-muted">Empty description</span>;

    try {
      const parsed = JSON.parse(description);
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <pre style={{ margin: 0 }}>
            {JSON.stringify(parsed, null, 2)}
          </pre>
        );
      }
      return <div>{description}</div>;
    } catch (e) {
      return <div style={{ wordBreak: 'break-word' }}>{description}</div>;
    }
  };

  return (
    <>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="mb-0">Audit Log</h1>

          <div className="d-flex">
            <Form.Select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="me-2"
              style={{ width: '150px' }}
            >
              {actionOptions.map(option => (
                <option key={option} value={option}>
                  {option || 'All Actions'}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="me-2"
              style={{ width: '180px' }}
            >
              {categoryOptions.map(option => (
                <option key={option} value={option}>
                  {option || 'All Categories'}
                </option>
              ))}
            </Form.Select>
            <button
              // style={{ marginTop: "20px" }}
              className="btn btn-sm  btn-success mb-3"
              variant="outline-light"
              onClick={resetFilters}
            >
              Reset
            </button>

            <button
              style={{ marginLeft: "15px", }}
              className="btn btn-sm  btn-warning mb-3 ml-3"
              variant="outline-light"
              onClick={exportToCSV}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>









      <Card className="shadow-sm">


        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="table table-striped">
              <Table striped bordered hover >
                <thead className="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Action</th>
                    <th>Category</th>
                    <th>Entity ID</th>
                    <th>Description</th>
                    <th>IP Address</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map(log => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>{log.user_id}</td>
                        <td>{log.user_data.name}</td>
                        <td>
                          <Badge bg={getActionBadgeColor(log.action)}>
                            {log.action}
                          </Badge>
                        </td>
                        <td>{log.category}</td>
                        <td>{log.entity_id}</td>
                        <td className="text-truncate" style={{ maxWidth: '200px' }} title={log.description}>
                          {log.description}
                        </td>
                        <td>{log.ip_address}</td>
                        <td>{formatDateTime(log.created_at)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">No audit logs found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="d-flex justify-content-between align-items-center">
          <div className="text-muted">
            Showing {logs.length} of {total} entries
          </div>
          <div className="d-flex justify-content-center align-items-center">
            <button
              className="btn btn-sm btn-primary me-2"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt; Previous
            </button>
            <span className="fw-bold mx-2">
              Page {currentPage} of {Math.ceil(total / perPage)}
            </span>
            <button
              className="btn btn-sm btn-primary ms-2"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(total / perPage)))}
              disabled={currentPage === Math.ceil(total / perPage)}
            >
              Next &gt;
            </button>
          </div>
        </Card.Footer>

        {/* View Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Audit Log Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedLog && (
              <div className="row">
                <div className="col-md-6">
                  <p><strong>ID:</strong> {selectedLog.id}</p>
                  <p><strong>User ID:</strong> {selectedLog.user_id}</p>
                  <p><strong>User Name:</strong> {selectedLog.user_data.name}</p>
                  <p><strong>Action:</strong> <Badge bg={getActionBadgeColor(selectedLog.action)}>{selectedLog.action}</Badge></p>
                  <p><strong>Category:</strong> {selectedLog.category}</p>
                  <p><strong>Entity ID:</strong> {selectedLog.entity_id}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>IP Address:</strong> {selectedLog.ip_address}</p>
                  {/* <p><strong>User Agent:</strong> {selectedLog.user_agent}</p> */}
                  <p><strong>Created At:</strong> {formatDateTime(selectedLog.created_at)}</p>
                  <p><strong>Updated At:</strong> {formatDateTime(selectedLog.updated_at)}</p>
                </div>
                <div className="col-12 mt-3">
                  <h6 className="fw-bold mb-2">Description:</h6>
                  <div className="border rounded bg-light p-2" style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    backgroundColor: '#f8f9fa',
                    whiteSpace: 'pre-wrap',
                    fontFamily: selectedLog && isJSON(selectedLog.description) ? 'monospace' : 'inherit'
                  }}>
                    {selectedLog ? (
                      renderDescription(selectedLog.description)
                    ) : (
                      <div className="text-muted">No description available</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </>
  );
};

export default Logs;
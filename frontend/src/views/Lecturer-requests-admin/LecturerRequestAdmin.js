/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const LecturerRequestAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all room requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('api/room-allocation/room-requests/');
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

// Update request status and create room occupancy if approved
const updateRequestStatus = async (id, status) => {
  try {
    const request = requests.find(req => req.id === id);
    if (!request) {
      console.error('Request not found');
      return;
    }

    // Update the request status
    const response = await api.patch(`api/room-allocation/room-requests/${id}/`, {
      status: status
    });

    // If approved, create room occupancy record
    if (status === 'approved') {
      await api.post('api/room-allocation/room-occupancy/', {
        start_time: request.start_time,
        end_time: request.end_time,
        room_id: request.room.id  // Changed to room_id to match serializer
      });
    }

    // Update the local state
    setRequests(requests.map(req => 
      req.id === id ? response.data : req
    ));

    alert(`Request ${status} successfully!`);
  } catch (error) {
    console.error('Error updating request:', error);
    console.log('Error details:', error.response?.data);
    alert(`Failed to update request: ${error.response?.data?.message || error.message}`);
  }
};

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Room Requests Management</h1>

      {loading ? (
        <p>Loading requests...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Request ID</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Lecturer</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Room</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Start Time</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>End Time</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '12px 15px' }}>{request.id}</td>
                <td style={{ padding: '12px 15px' }}>{request.requested_by.username}</td>
                <td style={{ padding: '12px 15px' }}>{request.room.name}</td>
                <td style={{ padding: '12px 15px' }}>
                  {new Date(request.start_time).toLocaleString()}
                </td>
                <td style={{ padding: '12px 15px' }}>
                  {new Date(request.end_time).toLocaleString()}
                </td>
                <td style={{ padding: '12px 15px' }}>
                  <span style={{
                    color: request.status === 'approved' ? 'green' : 
                          request.status === 'rejected' ? 'red' : 'orange',
                    fontWeight: '500'
                  }}>
                    {request.status}
                  </span>
                </td>
                <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                  {request.status !== 'approved' && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                        style={{
                          backgroundColor: '#28a745',
                          padding: '5px 10px',
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'rejected')}
                        style={{
                          backgroundColor: '#dc3545',
                          padding: '5px 10px',
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          color: 'white',
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LecturerRequestAdmin;
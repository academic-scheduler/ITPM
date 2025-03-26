/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LecturerRequests = () => {
  const { username } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    room: '',
    start_time: '',
    end_time: '',
    status: 'pending',
  });
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(null);

  // Fetch user ID and data
  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get user ID by username
        const userResponse = await api.get('api/get-user-by-username/', {
          params: { username }
        });
        
        if (!userResponse.data?.id) {
          throw new Error('User ID not found');
        }
        
        const currentUserId = userResponse.data.id;
        setUserId(currentUserId);

        // 2. Fetch requests and rooms in parallel
        const [requestsResponse, roomsResponse] = await Promise.all([
          api.get('api/get-user-room-requests/', {
            params: { user_id: currentUserId }
          }),
          api.get('api/room-allocation/rooms/')
        ]);
        
        setRequests(requestsResponse.data);
        setRooms(roomsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate]);

  const validateDateTime = (startTime, endTime) => {
    const now = new Date();
    const errors = {};
    
    if (new Date(startTime) < now) {
      errors.start_time = "Start time cannot be in the past";
    }
    
    if (new Date(endTime) <= new Date(startTime)) {
      errors.end_time = "End time must be after start time";
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequest({ ...newRequest, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    
    // Validate date/time
    const validationErrors = validateDateTime(newRequest.start_time, newRequest.end_time);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        ...newRequest,
        requested_by: userId,
        start_time: new Date(newRequest.start_time).toISOString(),
        end_time: new Date(newRequest.end_time).toISOString(),
      };
      
      const response = await api.post('api/room-allocation/room-requests/', payload);
      setRequests([...requests, response.data]);
      setShowAddForm(false);
      setNewRequest({
        room: '',
        start_time: '',
        end_time: '',
        status: 'pending',
      });
      setErrors({});
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      console.error('Error adding request:', error.response?.data || error.message);
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request.id);
    setEditedData({ 
      ...request,
      start_time: request.start_time.slice(0, 16),
      end_time: request.end_time.slice(0, 16),
    });
  };

  const handleSave = async (id) => {
    // Validate date/time
    const validationErrors = validateDateTime(editedData.start_time, editedData.end_time);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        ...editedData,
        start_time: new Date(editedData.start_time).toISOString(),
        end_time: new Date(editedData.end_time).toISOString(),
      };
      
      const response = await api.put(`api/room-allocation/room-requests/${id}/`, payload);
      const updatedRequests = requests.map((request) => 
        request.id === id ? response.data : request
      );
      setRequests(updatedRequests);
      setEditingRequest(null);
      setErrors({});
    } catch (error) {
      console.error('Error saving request:', error);
    }
  };

  const handleCancel = () => {
    setEditingRequest(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this request?');
    if (confirmDelete) {
      try {
        await api.delete(`api/room-allocation/room-requests/${id}/`);
        setRequests(requests.filter((request) => request.id !== id));
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  if (!username) {
    return <div style={{ padding: '20px' }}>Please login to view your requests</div>;
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading requests...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error loading data</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>My Room Requests</h1>
      
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        style={{
          backgroundColor: 'green',
          padding: '10px 20px',
          fontSize: '14px',
          marginBottom: '20px',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '5px',
          color: 'white',
        }}
      >
        {showAddForm ? 'Cancel' : 'Create New Request'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddRequest} style={{ marginBottom: '20px', maxWidth: '500px' }}>
          <h3>Create New Request</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Room:</label>
              <select
                name="room"
                value={newRequest.room}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              >
                <option value="">Select a room</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} (Capacity: {room.capacity})
                  </option>
                ))}
              </select>
              {errors.room && <div style={{ color: 'red', fontSize: '12px' }}>{errors.room}</div>}
            </div>
            <div>
              <label>Start Date & Time:</label>
              <input
                type="datetime-local"
                name="start_time"
                value={newRequest.start_time}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
              {errors.start_time && <div style={{ color: 'red', fontSize: '12px' }}>{errors.start_time}</div>}
            </div>
            <div>
              <label>End Date & Time:</label>
              <input
                type="datetime-local"
                name="end_time"
                value={newRequest.end_time}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
              {errors.end_time && <div style={{ color: 'red', fontSize: '12px' }}>{errors.end_time}</div>}
            </div>
          </div>
          {errors.non_field_errors && (
            <div style={{ color: 'red', margin: '10px 0' }}>
              {errors.non_field_errors}
            </div>
          )}
          <button
            type="submit"
            style={{
              backgroundColor: 'green',
              padding: '10px 20px',
              fontSize: '14px',
              marginTop: '10px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
              color: 'white',
            }}
          >
            Submit Request
          </button>
        </form>
      )}

      {requests.length === 0 ? (
        <p>No room requests found. Create your first request above.</p>
      ) : (
        <table
          style={{
            width: '100%',
            marginTop: '20px',
            borderCollapse: 'separate',
            borderSpacing: '0 10px',
            border: 'none'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'transparent' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Request ID</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Room</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Start Time</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>End Time</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} style={{ 
                borderBottom: '1px solid #eee'
              }}>
                <td style={{ padding: '15px', border: 'none' }}>{request.id}</td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {rooms.find(r => r.id === request.room)?.name || 'Unknown Room'}
                </td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {editingRequest === request.id ? (
                    <div>
                      <input
                        type="datetime-local"
                        name="start_time"
                        value={editedData.start_time}
                        onChange={handleEditInputChange}
                        style={{ width: '100%', padding: '5px' }}
                      />
                      {errors.start_time && <div style={{ color: 'red', fontSize: '12px' }}>{errors.start_time}</div>}
                    </div>
                  ) : (
                    formatDateTime(request.start_time)
                  )}
                </td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {editingRequest === request.id ? (
                    <div>
                      <input
                        type="datetime-local"
                        name="end_time"
                        value={editedData.end_time}
                        onChange={handleEditInputChange}
                        style={{ width: '100%', padding: '5px' }}
                      />
                      {errors.end_time && <div style={{ color: 'red', fontSize: '12px' }}>{errors.end_time}</div>}
                    </div>
                  ) : (
                    formatDateTime(request.end_time)
                  )}
                </td>
                <td style={{ padding: '15px', border: 'none' }}>
                  <span style={{
                    color: request.status === 'approved' ? 'green' : 
                          request.status === 'rejected' ? 'red' : 'orange',
                    fontWeight: 'bold'
                  }}>
                    {request.status}
                  </span>
                </td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {request.status !== 'rejected' && (
                    editingRequest === request.id ? (
                      <>
                        <button
                          onClick={() => handleSave(request.id)}
                          style={{
                            backgroundColor: 'green',
                            padding: '5px 10px',
                            fontSize: '12px',
                            marginRight: '5px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            color: 'white',
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          style={{
                            backgroundColor: 'gray',
                            padding: '5px 10px',
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            color: 'white',
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(request)}
                          style={{
                            backgroundColor: '#8B8000',
                            padding: '5px 10px',
                            fontSize: '12px',
                            marginRight: '5px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            color: 'white',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
                          style={{
                            backgroundColor: '#8B0000',
                            padding: '5px 10px',
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            color: 'white',
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )
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

export default LecturerRequests;
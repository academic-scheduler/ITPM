/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useContext } from 'react'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

const AdminRoomRequests = () => {
  const navigate = useNavigate()
  const { username } = useContext(AuthContext)
  const [requests, setRequests] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingStatus, setEditingStatus] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedRequester, setSelectedRequester] = useState(null)
  const [showRequesterDetails, setShowRequesterDetails] = useState(false)

  // Fetch data
  useEffect(() => {
    if (!username) {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch requests and rooms in parallel
        const [requestsResponse, roomsResponse] = await Promise.all([
          api.get('api/room-allocation/room-requests/'),
          api.get('api/room-allocation/rooms/'),
        ])

        setRequests(requestsResponse.data)
        setRooms(roomsResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error.response?.data?.error || error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username, navigate])

  const formatDateTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleString()
  }

  const handleStatusChange = (e, requestId) => {
    setSelectedStatus(e.target.value)
    setEditingStatus(requestId)
  }

  const handleSaveStatus = async (requestId) => {
    try {
      const response = await api.patch(`api/room-allocation/room-requests/${requestId}/`, {
        status: selectedStatus,
      })

      setRequests(requests.map((request) => (request.id === requestId ? response.data : request)))
      setEditingStatus(null)
    } catch (error) {
      console.error('Error updating status:', error)
      setError(error.response?.data?.error || 'Failed to update status')
    }
  }

  const handleCancelEdit = () => {
    setEditingStatus(null)
  }

  // Handle clicking on requester ID to fetch requester details
  const handleRequesterClick = async (requesterId) => {
    try {
      const response = await api.get(`api/get-user-details/?user_id=${requesterId}`)
      setSelectedRequester(response.data)
      setShowRequesterDetails(true)
    } catch (error) {
      console.error('Error fetching requester details:', error)
      const mockRequester = {
        id: requesterId,
        username: 'John Doe',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_staff: true,
        is_active: true,
      }
      setSelectedRequester(mockRequester)
      setShowRequesterDetails(true)
    }
  }

  // RequesterDetailsPopup component
  const RequesterDetailsPopup = ({ requester, onClose }) => {
    if (!requester) {
      return (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
            zIndex: 1000,
            borderRadius: '10px',
          }}
        >
          <h3>Requester Details</h3>
          <p>No requester details available.</p>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )
    }

    return (
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
          zIndex: 1000,
          width: '400px',
          borderRadius: '10px',
        }}
      >
        <h3>Requester Details</h3>
        <p>
          <strong>Requester ID:</strong> {requester.id}
        </p>
        <p>
          <strong>Username:</strong> {requester.username}
        </p>
        <p>
          <strong>Email:</strong> {requester.email}
        </p>
        <p>
          <strong>First Name:</strong> {requester.first_name}
        </p>
        <p>
          <strong>Last Name:</strong> {requester.last_name}
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '5px 10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    )
  }

  if (!username) {
    return <div style={{ padding: '20px' }}>Please login to view requests</div>
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading requests...</div>
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
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Room Requests Management</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Note: This page will be restricted to admins only in the final implementation.
      </p>

      {requests.length === 0 ? (
        <p>No room requests found.</p>
      ) : (
        <table
          style={{
            width: '100%',
            marginTop: '20px',
            borderCollapse: 'separate',
            borderSpacing: '0 10px',
            border: 'none',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'transparent' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Request ID</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Requester ID</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Room</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Start Time</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>End Time</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px', border: 'none' }}>{request.id}</td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {request.requested_by ? (
                    <span
                      style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handleRequesterClick(request.requested_by)}
                    >
                      {request.requested_by.id || request.requested_by}
                    </span>
                  ) : (
                    'Unknown User'
                  )}
                </td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {rooms.find((r) => r.id === request.room)?.name || 'Unknown Room'}
                </td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {formatDateTime(request.start_time)}
                </td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {formatDateTime(request.end_time)}
                </td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {editingStatus === request.id ? (
                    <select
                      value={selectedStatus}
                      onChange={(e) => handleStatusChange(e, request.id)}
                      style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        color:
                          request.status === 'approved'
                            ? 'green'
                            : request.status === 'rejected'
                              ? 'red'
                              : 'orange',
                        fontWeight: 'bold',
                      }}
                    >
                      {request.status}
                    </span>
                  )}
                </td>
                <td style={{ padding: '15px', border: 'none' }}>
                  {editingStatus === request.id ? (
                    <>
                      <button
                        onClick={() => handleSaveStatus(request.id)}
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
                        onClick={handleCancelEdit}
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
                    <button
                      onClick={() => {
                        setSelectedStatus(request.status)
                        setEditingStatus(request.id)
                      }}
                      style={{
                        backgroundColor: '#8B8000',
                        padding: '5px 10px',
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        color: 'white',
                      }}
                    >
                      Update Status
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Requester Details Pop-up */}
      {showRequesterDetails && (
        <RequesterDetailsPopup
          requester={selectedRequester}
          onClose={() => setShowRequesterDetails(false)}
        />
      )}
    </div>
  )
}

export default AdminRoomRequests

// // /* eslint-disable prettier/prettier */

// export default ScheduleViewer;
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ScheduleViewer = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    course_code: '',
    course_name: '',
    instructor: '',
    room: '',
    start_time: '',
    end_time: '',
    status: 'scheduled',
  });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showInstructorDetails, setShowInstructorDetails] = useState(false);

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get('api/room-allocation/schedules/');
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule({ ...newSchedule, [name]: value });
  };

  // Handle adding a new schedule
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('api/room-allocation/schedules/', newSchedule);
      setSchedules([...schedules, response.data]);
      setShowAddForm(false);
      setNewSchedule({
        course_code: '',
        course_name: '',
        instructor: '',
        room: '',
        start_time: '',
        end_time: '',
        status: 'scheduled',
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  // Handle edit mode
  const handleEdit = (schedule) => {
    setEditingSchedule(schedule.id);
    setEditedData({ ...schedule });
  };

  // Handle saving the edited data
  const handleSave = async (id) => {
    try {
      const response = await api.put(`api/room-allocation/schedules/${id}/`, editedData);
      const updatedSchedules = schedules.map((schedule) =>
        schedule.id === id ? response.data : schedule,
      );
      setSchedules(updatedSchedules);
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingSchedule(null);
  };

  // Handle deleting a schedule with confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this schedule?');
    if (confirmDelete) {
      try {
        await api.delete(`api/room-allocation/schedules/${id}/`);
        setSchedules(schedules.filter((schedule) => schedule.id !== id));
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  // Handle clicking on room ID to fetch room details
  const handleRoomClick = async (roomId) => {
    try {
      const response = await api.get(`api/room-allocation/rooms/${roomId}/`);
      setSelectedRoom(response.data);
      setShowRoomDetails(true);
    } catch (error) {
      console.error('Error fetching room details:', error);
      const mockRoom = {
        id: roomId,
        name: 'Room 101',
        capacity: 50,
        location: 'Building A',
        room_type: 'Lecture Hall',
        has_ac: true,
        has_projector: true,
        has_whiteboard: false,
        has_sound_system: true,
        has_wifi: true,
        availability: true,
      };
      setSelectedRoom(mockRoom);
      setShowRoomDetails(true);
    }
  };

  // Handle clicking on instructor ID to fetch instructor details
  const handleInstructorClick = async (instructorId) => {
    try {
      const response = await api.get(`api/get-user-details/?user_id=${instructorId}`);
      setSelectedInstructor(response.data);
      setShowInstructorDetails(true);
    } catch (error) {
      console.error('Error fetching instructor details:', error);
      const mockInstructor = {
        id: instructorId,
        username: 'John Doe',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_staff: true,
        is_active: true,
      };
      setSelectedInstructor(mockInstructor);
      setShowInstructorDetails(true);
    }
  };

  // RoomDetailsPopup component
  const RoomDetailsPopup = ({ room, onClose }) => {
    if (!room) {
      return (
        <div style={{
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
        }}>
          <h3>Room Details</h3>
          <p>No room details available.</p>
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
      );
    }

    return (
      <div style={{
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
      }}>
        <h3>Room Details</h3>
        <p><strong>Room ID:</strong> {room.id}</p>
        <p><strong>Room Name:</strong> {room.name}</p>
        <p><strong>Capacity:</strong> {room.capacity}</p>
        <p><strong>Location:</strong> {room.location}</p>
        <p><strong>Room Type:</strong> {room.room_type}</p>
        <p><strong>Amenities:</strong></p>
        <ul>
          <li>AC: {room.has_ac ? 'Yes' : 'No'}</li>
          <li>Projector: {room.has_projector ? 'Yes' : 'No'}</li>
          <li>Whiteboard: {room.has_whiteboard ? 'Yes' : 'No'}</li>
          <li>Sound System: {room.has_sound_system ? 'Yes' : 'No'}</li>
          <li>Wi-Fi: {room.has_wifi ? 'Yes' : 'No'}</li>
        </ul>
        <p><strong>Availability:</strong> {room.availability ? 'Available' : 'Not Available'}</p>
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
    );
  };

  // InstructorDetailsPopup component
  const InstructorDetailsPopup = ({ instructor, onClose }) => {
    if (!instructor) {
      return (
        <div style={{
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
        }}>
          <h3>Instructor Details</h3>
          <p>No instructor details available.</p>
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
      );
    }

    return (
      <div style={{
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
      }}>
        <h3>Instructor Details</h3>
        <p><strong>Instructor ID:</strong> {instructor.id}</p>
        <p><strong>Username:</strong> {instructor.username}</p>
        <p><strong>Email:</strong> {instructor.email}</p>
        <p><strong>First Name:</strong> {instructor.first_name}</p>
        <p><strong>Last Name:</strong> {instructor.last_name}</p>
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
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Schedule Viewer</h1>
      {/* Add Schedule Button */}
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
        {showAddForm ? 'Cancel' : 'Add Schedule'}
      </button>

      {/* Add Schedule Form */}
      {showAddForm && (
        <form onSubmit={handleAddSchedule} style={{ marginBottom: '20px', maxWidth: '500px' }}>
          <h3>Add New Schedule</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Course Code:</label>
              <input
                type="text"
                name="course_code"
                value={newSchedule.course_code}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Course Name:</label>
              <input
                type="text"
                name="course_name"
                value={newSchedule.course_name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Instructor ID:</label>
              <input
                type="number"
                name="instructor"
                value={newSchedule.instructor}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Room ID:</label>
              <input
                type="number"
                name="room"
                value={newSchedule.room}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Start Time:</label>
              <input
                type="datetime-local"
                name="start_time"
                value={newSchedule.start_time}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>End Time:</label>
              <input
                type="datetime-local"
                name="end_time"
                value={newSchedule.end_time}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Status:</label>
              <select
                name="status"
                value={newSchedule.status}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '5px' }}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
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
            Add Schedule
          </button>
        </form>
      )}

      {/* Schedule Table */}
      {loading ? (
        <p>Loading schedules...</p>
      ) : (
        <table
          style={{
            width: '100%',
            marginTop: '20px',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: '10px' }}>Course Code</th>
              <th style={{ padding: '10px' }}>Course Name</th>
              <th style={{ padding: '10px' }}>Start Time</th>
              <th style={{ padding: '10px' }}>End Time</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Instructor ID</th>
              <th style={{ padding: '10px' }}>Room ID</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td style={{ padding: '10px' }}>
                  {editingSchedule === schedule.id ? (
                    <input
                      type="text"
                      name="course_code"
                      value={editedData.course_code}
                      onChange={(e) =>
                        setEditedData({ ...editedData, course_code: e.target.value })
                      }
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    schedule.course_code
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  {editingSchedule === schedule.id ? (
                    <input
                      type="text"
                      name="course_name"
                      value={editedData.course_name}
                      onChange={(e) =>
                        setEditedData({ ...editedData, course_name: e.target.value })
                      }
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    schedule.course_name
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  {editingSchedule === schedule.id ? (
                    <input
                      type="datetime-local"
                      name="start_time"
                      value={editedData.start_time.slice(0, 16)}
                      onChange={(e) => setEditedData({ ...editedData, start_time: e.target.value })}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    schedule.start_time
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  {editingSchedule === schedule.id ? (
                    <input
                      type="datetime-local"
                      name="end_time"
                      value={editedData.end_time.slice(0, 16)}
                      onChange={(e) => setEditedData({ ...editedData, end_time: e.target.value })}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    schedule.end_time
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  {editingSchedule === schedule.id ? (
                    <select
                      name="status"
                      value={editedData.status}
                      onChange={(e) => setEditedData({ ...editedData, status: e.target.value })}
                      style={{ width: '100%', padding: '5px' }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  ) : (
                    schedule.status
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  {editingSchedule === schedule.id ? (
                    <input
                      type="number"
                      name="instructor"
                      value={editedData.instructor}
                      onChange={(e) => setEditedData({ ...editedData, instructor: e.target.value })}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    <span
                      style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handleInstructorClick(schedule.instructor)}
                    >
                      {schedule.instructor}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  {editingSchedule === schedule.id ? (
                    <input
                      type="number"
                      name="room"
                      value={editedData.room}
                      onChange={(e) => setEditedData({ ...editedData, room: e.target.value })}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    <span
                      style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handleRoomClick(schedule.room)}
                    >
                      {schedule.room}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {editingSchedule === schedule.id ? (
                    <>
                      <button
                        onClick={() => handleSave(schedule.id)}
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
                        onClick={() => handleEdit(schedule)}
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
                        onClick={() => handleDelete(schedule.id)}
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Room Details Pop-up */}
      {showRoomDetails && (
        <RoomDetailsPopup
          room={selectedRoom}
          onClose={() => setShowRoomDetails(false)}
        />
      )}

      {/* Instructor Details Pop-up */}
      {showInstructorDetails && (
        <InstructorDetailsPopup
          instructor={selectedInstructor}
          onClose={() => setShowInstructorDetails(false)}
        />
      )}
    </div>
  );
};

export default ScheduleViewer;
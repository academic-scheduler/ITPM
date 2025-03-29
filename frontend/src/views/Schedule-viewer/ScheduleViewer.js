/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';

const ScheduleViewer = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    course_code: '',
    course_name: '',
    instructor: '',
    room: '',
    start_time: '',
    end_time: '',
    status: 'scheduled',
  });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showInstructorDetails, setShowInstructorDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Refs for focusing inputs
  const searchInputRef = useRef(null);
  const courseCodeRef = useRef(null);
  const editCourseCodeRef = useRef(null);

  // Load jsPDF and jspdf-autotable from CDN
  const loadPDFLibrary = () => {
    return new Promise((resolve) => {
      if (window.jspdf && window.jspdf.autotable) {
        resolve(window.jspdf);
      } else {
        const jsPDFScript = document.createElement('script');
        jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jsPDFScript.onload = () => {
          const autoTableScript = document.createElement('script');
          autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
          autoTableScript.onload = () => {
            resolve(window.jspdf);
          };
          document.body.appendChild(autoTableScript);
        };
        document.body.appendChild(jsPDFScript);
      }
    });
  };

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get('api/room-allocation/schedules/');
        setSchedules(response.data);
        setFilteredSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Focus search input on initial load
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Filter schedules based on search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredSchedules(schedules);
    } else {
      const filtered = schedules.filter(schedule =>
        schedule.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.instructor.toString().includes(searchTerm) ||
        schedule.room.toString().includes(searchTerm) ||
        schedule.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSchedules(filtered);
    }
  }, [searchTerm, schedules]);

  // Validate add form
  const validateAddForm = () => {
    const newErrors = {};

    if (!newSchedule.course_code.trim()) {
      newErrors.course_code = 'Course code is required';
    } else if (newSchedule.course_code.length > 20) {
      newErrors.course_code = 'Course code must be 20 characters or less';
    }

    if (!newSchedule.course_name.trim()) {
      newErrors.course_name = 'Course name is required';
    }

    if (!newSchedule.instructor) {
      newErrors.instructor = 'Instructor is required';
    } else if (isNaN(newSchedule.instructor)) {
      newErrors.instructor = 'Instructor must be a number';
    }

    if (!newSchedule.room) {
      newErrors.room = 'Room is required';
    } else if (isNaN(newSchedule.room)) {
      newErrors.room = 'Room must be a number';
    }

    if (!newSchedule.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!newSchedule.end_time) {
      newErrors.end_time = 'End time is required';
    } else if (newSchedule.start_time && new Date(newSchedule.end_time) <= new Date(newSchedule.start_time)) {
      newErrors.end_time = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};

    if (!editingSchedule.course_code.trim()) {
      newErrors.course_code = 'Course code is required';
    } else if (editingSchedule.course_code.length > 20) {
      newErrors.course_code = 'Course code must be 20 characters or less';
    }

    if (!editingSchedule.course_name.trim()) {
      newErrors.course_name = 'Course name is required';
    }

    if (!editingSchedule.instructor) {
      newErrors.instructor = 'Instructor is required';
    } else if (isNaN(editingSchedule.instructor)) {
      newErrors.instructor = 'Instructor must be a number';
    }

    if (!editingSchedule.room) {
      newErrors.room = 'Room is required';
    } else if (isNaN(editingSchedule.room)) {
      newErrors.room = 'Room must be a number';
    }

    if (!editingSchedule.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!editingSchedule.end_time) {
      newErrors.end_time = 'End time is required';
    } else if (editingSchedule.start_time && new Date(editingSchedule.end_time) <= new Date(editingSchedule.start_time)) {
      newErrors.end_time = 'End time must be after start time';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes for both add and edit forms
  const handleInputChange = (e, isEditForm = false) => {
    const { name, value } = e.target;
    if (isEditForm) {
      setEditingSchedule({ ...editingSchedule, [name]: value });
    } else {
      setNewSchedule({ ...newSchedule, [name]: value });
    }
  };

  // Handle adding a new schedule
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) return;

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
      setErrors({});
      // Focus search input after adding
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      if (error.response && error.response.data) {
        // Handle API validation errors
        const apiErrors = {};
        for (const key in error.response.data) {
          apiErrors[key] = error.response.data[key].join(' ');
        }
        setErrors(apiErrors);
      }
    }
  };

  // Handle edit mode
  const handleEdit = (schedule) => {
    setEditingSchedule({ ...schedule });
    setShowEditForm(true);
    setEditErrors({});
  };

  // Handle saving the edited data
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    try {
      const response = await api.put(
        `api/room-allocation/schedules/${editingSchedule.id}/`,
        editingSchedule
      );
      const updatedSchedules = schedules.map((schedule) =>
        schedule.id === editingSchedule.id ? response.data : schedule
      );
      setSchedules(updatedSchedules);
      setShowEditForm(false);
      setEditingSchedule(null);
      setEditErrors({});
      // Focus search input after editing
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      if (error.response && error.response.data) {
        // Handle API validation errors
        const apiErrors = {};
        for (const key in error.response.data) {
          apiErrors[key] = error.response.data[key].join(' ');
        }
        setEditErrors(apiErrors);
      }
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingSchedule(null);
    setEditErrors({});
    // Focus search input after cancel
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
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

  // Generate PDF report
  const generatePDF = async () => {
    try {
      const { jsPDF } = await loadPDFLibrary();

      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text('Schedule Report', 105, 15, { align: 'center' });

      // Date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });

      // Table data
      const tableData = filteredSchedules.map(schedule => [
        schedule.course_code,
        schedule.course_name,
        schedule.start_time,
        schedule.end_time,
        schedule.status,
        schedule.instructor,
        schedule.room
      ]);

      // Table headers
      const headers = [
        'Course Code',
        'Course Name',
        'Start Time',
        'End Time',
        'Status',
        'Instructor ID',
        'Room ID'
      ];

      // Generate table
      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 10,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [0, 0, 0], // Black header
          textColor: [255, 255, 255] // White text
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240] // Light gray for alternate rows
        }
      });

      // Save the PDF
      doc.save('schedule_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // RoomDetailsPopup component
  const RoomDetailsPopup = ({ room, onClose }) => {
    if (!room) {
      return (
        <div className="popup-container">
          <h3>Room Details</h3>
          <p>No room details available.</p>
          <button className="popup-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      );
    }

    return (
      <div className="popup-container">
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
        <button className="popup-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };

  // InstructorDetailsPopup component
  const InstructorDetailsPopup = ({ instructor, onClose }) => {
    if (!instructor) {
      return (
        <div className="popup-container">
          <h3>Instructor Details</h3>
          <p>No instructor details available.</p>
          <button className="popup-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      );
    }

    return (
      <div className="popup-container">
        <h3>Instructor Details</h3>
        <p><strong>Instructor ID:</strong> {instructor.id}</p>
        <p><strong>Username:</strong> {instructor.username}</p>
        <p><strong>Email:</strong> {instructor.email}</p>
        <p><strong>First Name:</strong> {instructor.first_name}</p>
        <p><strong>Last Name:</strong> {instructor.last_name}</p>
        <button className="popup-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };

  // Form component for both add and edit
  const ScheduleForm = ({ isEdit, schedule, onSubmit, onCancel, formErrors }) => {
    // Focus on the first input when the form mounts
    useEffect(() => {
      const inputRef = isEdit ? editCourseCodeRef : courseCodeRef;
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEdit]);

    return (
      <form onSubmit={onSubmit} className="schedule-form">
        <h3>{isEdit ? 'Edit Schedule' : 'Add New Schedule'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Course Code:</label>
            <input
              ref={isEdit ? editCourseCodeRef : courseCodeRef}
              type="text"
              name="course_code"
              value={schedule.course_code}
              onChange={(e) => handleInputChange(e, isEdit)}
              required
              className={formErrors.course_code ? 'input-error' : ''}
            />
            {formErrors.course_code && <span className="error-message">{formErrors.course_code}</span>}
          </div>
          <div className="form-group">
            <label>Course Name:</label>
            <input
              type="text"
              name="course_name"
              value={schedule.course_name}
              onChange={(e) => handleInputChange(e, isEdit)}
              required
              className={formErrors.course_name ? 'input-error' : ''}
            />
            {formErrors.course_name && <span className="error-message">{formErrors.course_name}</span>}
          </div>
          <div className="form-group">
            <label>Instructor ID:</label>
            <input
              type="number"
              name="instructor"
              value={schedule.instructor}
              onChange={(e) => handleInputChange(e, isEdit)}
              required
              className={formErrors.instructor ? 'input-error' : ''}
            />
            {formErrors.instructor && <span className="error-message">{formErrors.instructor}</span>}
          </div>
          <div className="form-group">
            <label>Room ID:</label>
            <input
              type="number"
              name="room"
              value={schedule.room}
              onChange={(e) => handleInputChange(e, isEdit)}
              required
              className={formErrors.room ? 'input-error' : ''}
            />
            {formErrors.room && <span className="error-message">{formErrors.room}</span>}
          </div>
          <div className="form-group">
            <label>Start Time:</label>
            <input
              type="datetime-local"
              name="start_time"
              value={isEdit ? schedule.start_time.slice(0, 16) : schedule.start_time}
              onChange={(e) => handleInputChange(e, isEdit)}
              required
              className={formErrors.start_time ? 'input-error' : ''}
            />
            {formErrors.start_time && <span className="error-message">{formErrors.start_time}</span>}
          </div>
          <div className="form-group">
            <label>End Time:</label>
            <input
              type="datetime-local"
              name="end_time"
              value={isEdit ? schedule.end_time.slice(0, 16) : schedule.end_time}
              onChange={(e) => handleInputChange(e, isEdit)}
              required
              className={formErrors.end_time ? 'input-error' : ''}
            />
            {formErrors.end_time && <span className="error-message">{formErrors.end_time}</span>}
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select
              name="status"
              value={schedule.status}
              onChange={(e) => handleInputChange(e, isEdit)}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {isEdit ? 'Save Changes' : 'Add Schedule'}
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="schedule-viewer-container">
      <h1>Schedule Viewer</h1>

      {/* Search Controls */}
      <div className="controls-container">
        <div className="search-container">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Add Schedule Button */}
      {!showAddForm && !showEditForm && (
        <button className="btn-add" onClick={() => setShowAddForm(true)}>
          Add Schedule
        </button>
      )}

      {/* Add Schedule Form */}
      {showAddForm && (
        <ScheduleForm
          isEdit={false}
          schedule={newSchedule}
          onSubmit={handleAddSchedule}
          onCancel={() => setShowAddForm(false)}
          formErrors={errors}
        />
      )}

      {/* Edit Schedule Form */}
      {showEditForm && (
        <ScheduleForm
          isEdit={true}
          schedule={editingSchedule}
          onSubmit={handleSave}
          onCancel={handleCancelEdit}
          formErrors={editErrors}
        />
      )}

      {/* Schedule Table */}
      {loading ? (
        <p>Loading schedules...</p>
      ) : (
        <>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Instructor ID</th>
                <th>Room ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.course_code}</td>
                  <td>{schedule.course_name}</td>
                  <td>{schedule.start_time}</td>
                  <td>{schedule.end_time}</td>
                  <td>{schedule.status}</td>
                  <td>
                    <span
                      className="clickable-text"
                      onClick={() => handleInstructorClick(schedule.instructor)}
                    >
                      {schedule.instructor}
                    </span>
                  </td>
                  <td>
                    <span
                      className="clickable-text"
                      onClick={() => handleRoomClick(schedule.room)}
                    >
                      {schedule.room}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(schedule)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(schedule.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Export to PDF Button */}
          <div className="export-container">
            <button className="btn-export" onClick={generatePDF}>
              Export to PDF
            </button>
          </div>
        </>
      )}

      {/* Room Details Pop-up */}
      {showRoomDetails && (
        <div className="popup-overlay">
          <RoomDetailsPopup
            room={selectedRoom}
            onClose={() => setShowRoomDetails(false)}
          />
        </div>
      )}

      {/* Instructor Details Pop-up */}
      {showInstructorDetails && (
        <div className="popup-overlay">
          <InstructorDetailsPopup
            instructor={selectedInstructor}
            onClose={() => setShowInstructorDetails(false)}
          />
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        .schedule-viewer-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .controls-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          align-items: center;
        }

        .search-container {
          display: flex;
          align-items: center;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 300px;
        }

        .export-container {
          margin-top: 20px;
          text-align: right;
        }

        .btn-export {
          background-color: #4CAF50;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-export:hover {
          background-color: #45a049;
        }

        .btn-add, .btn-submit {
          background-color: green;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-bottom: 20px;
        }

        .btn-edit {
          background-color: #8B8000;
          color: white;
          padding: 5px 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 5px;
        }

        .btn-delete {
          background-color: #8B0000;
          color: white;
          padding: 5px 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .btn-cancel {
          background-color: gray;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-left: 10px;
        }

        .schedule-form {
          margin-bottom: 20px;
          max-width: 500px;
          background: #2b2b2b;
          padding: 20px;
          border-radius: 5px;
          color: white;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .form-group {
          margin-bottom: 10px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 5px;
          background: #3d3d3d;
          color: white;
          border: 1px solid #555;
          border-radius: 3px;
        }

        .input-error {
          border-color: #ff4444 !important;
        }

        .error-message {
          color: #ff4444;
          font-size: 12px;
          margin-top: 5px;
          display: block;
        }

        .form-actions {
          margin-top: 15px;
        }

        .schedule-table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
          color: white;
        }

        .schedule-table th, .schedule-table td {
          padding: 10px;
          border: 1px solid #444;
          text-align: left;
        }

        .schedule-table th {
          background-color: #333;
        }

        .schedule-table tr:hover {
          background-color: #3d3d3d;
        }

        .actions-cell {
          text-align: center;
        }

        .clickable-text {
          color: #4dabf7;
          cursor: pointer;
          text-decoration: underline;
        }

        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .popup-container {
          position: relative;
          background-color: #333;
          color: white;
          padding: 20px;
          border-radius: 10px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }

        .popup-close-btn {
          background-color: #007bff;
          color: white;
          padding: 5px 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default ScheduleViewer;

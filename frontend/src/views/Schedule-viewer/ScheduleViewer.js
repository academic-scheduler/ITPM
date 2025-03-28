// // /* eslint-disable prettier/prettier */
// export default ScheduleViewer;
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import './ScheduleViewer.css'
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilePdf } from 'react-icons/fa'

const ScheduleViewer = () => {
  const [schedules, setSchedules] = useState([])
  const [filteredSchedules, setFilteredSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingScheduleId, setEditingScheduleId] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    course_code: '',
    course_name: '',
    instructor: '',
    room: '',
    start_time: '',
    end_time: '',
    status: 'scheduled',
  })
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showRoomDetails, setShowRoomDetails] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState(null)
  const [showInstructorDetails, setShowInstructorDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load jsPDF and autotable from CDN
  useEffect(() => {
    const loadScripts = async () => {
      if (!window.jspdf) {
        const jsPDFScript = document.createElement('script')
        jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        jsPDFScript.onload = () => {
          const autoTableScript = document.createElement('script')
          autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'
          document.body.appendChild(autoTableScript)
        }
        document.body.appendChild(jsPDFScript)
      }
    }

    loadScripts()
  }, [])

  // Helper function to format ISO string for datetime-local input
  const formatForDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get('api/room-allocation/schedules/')
        setSchedules(response.data)
        setFilteredSchedules(response.data)
      } catch (error) {
        console.error('Error fetching schedules:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [])

  // Handle search functionality
  useEffect(() => {
    const results = schedules.filter(
      (schedule) =>
        schedule.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.instructor.toString().includes(searchTerm) ||
        schedule.room.toString().includes(searchTerm) ||
        schedule.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSchedules(results)
  }, [searchTerm, schedules])

  // Handle form field changes for new schedule
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For datetime fields, convert to ISO string
    if (name === 'start_time' || name === 'end_time') {
      if (value) {
        // Convert local datetime to ISO string
        const date = new Date(value);
        const isoString = date.toISOString();
        setNewSchedule({ ...newSchedule, [name]: isoString });
        return;
      }
    }

    // For other fields
    setNewSchedule({ ...newSchedule, [name]: value });
  };

  // Handle adding a new schedule
  const handleAddSchedule = async (e) => {
    e.preventDefault()
    try {
      // Normalize the datetime values before sending
      const scheduleToAdd = {
        ...newSchedule,
        start_time: newSchedule.start_time ? new Date(newSchedule.start_time).toISOString() : '',
        end_time: newSchedule.end_time ? new Date(newSchedule.end_time).toISOString() : ''
      };

      const response = await api.post('api/room-allocation/schedules/', scheduleToAdd)
      setSchedules([...schedules, response.data])
      setFilteredSchedules([...filteredSchedules, response.data])
      setShowAddForm(false)
      setNewSchedule({
        course_code: '',
        course_name: '',
        instructor: '',
        room: '',
        start_time: '',
        end_time: '',
        status: 'scheduled',
      })
    } catch (error) {
      console.error('Error adding schedule:', error)
    }
  }

  // Handle edit mode
  const handleEdit = (schedule) => {
    setEditingScheduleId(schedule.id)
    setEditFormData({
      course_code: schedule.course_code,
      course_name: schedule.course_name,
      instructor: schedule.instructor,
      room: schedule.room,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      status: schedule.status,
    })
  }

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    // For datetime fields, convert to ISO string
    if (name === 'start_time' || name === 'end_time') {
      if (value) {
        // Convert local datetime to ISO string
        const date = new Date(value);
        const isoString = date.toISOString();
        setEditFormData({ ...editFormData, [name]: isoString });
        return;
      }
    }

    // For other fields
    setEditFormData({ ...editFormData, [name]: value });
  };

  // Handle saving the edited data
  const handleSave = async (e) => {
    e.preventDefault()
    try {
      // Normalize the datetime values before sending
      const scheduleToUpdate = {
        ...editFormData,
        start_time: editFormData.start_time ? new Date(editFormData.start_time).toISOString() : '',
        end_time: editFormData.end_time ? new Date(editFormData.end_time).toISOString() : ''
      };

      const response = await api.put(
        `api/room-allocation/schedules/${editingScheduleId}/`,
        scheduleToUpdate,
      )
      const updatedSchedules = schedules.map((schedule) =>
        schedule.id === editingScheduleId ? response.data : schedule,
      )
      setSchedules(updatedSchedules)
      setFilteredSchedules(updatedSchedules)
      setEditingScheduleId(null)
    } catch (error) {
      console.error('Error saving schedule:', error)
    }
  }

  // Handle deleting a schedule with confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this schedule?')
    if (confirmDelete) {
      try {
        await api.delete(`api/room-allocation/schedules/${id}/`)
        const updatedSchedules = schedules.filter((schedule) => schedule.id !== id)
        setSchedules(updatedSchedules)
        setFilteredSchedules(updatedSchedules)
      } catch (error) {
        console.error('Error deleting schedule:', error)
      }
    }
  }

  // Handle clicking on room ID to fetch room details
  const handleRoomClick = async (roomId) => {
    try {
      const response = await api.get(`api/room-allocation/rooms/${roomId}/`)
      setSelectedRoom(response.data)
      setShowRoomDetails(true)
    } catch (error) {
      console.error('Error fetching room details:', error)
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
      }
      setSelectedRoom(mockRoom)
      setShowRoomDetails(true)
    }
  }

  // Handle clicking on instructor ID to fetch instructor details
  const handleInstructorClick = async (instructorId) => {
    try {
      const response = await api.get(`api/get-user-details/?user_id=${instructorId}`)
      setSelectedInstructor(response.data)
      setShowInstructorDetails(true)
    } catch (error) {
      console.error('Error fetching instructor details:', error)
      const mockInstructor = {
        id: instructorId,
        username: 'John Doe',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_staff: true,
        is_active: true,
      }
      setSelectedInstructor(mockInstructor)
      setShowInstructorDetails(true)
    }
  }

  // Generate PDF report using CDN version
  const generatePDFReport = () => {
    if (!window.jspdf) {
      alert('PDF library is still loading. Please try again in a moment.')
      return
    }

    const { jsPDF } = window.jspdf

    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'landscape'
    })

    // Title
    doc.setFontSize(18)
    doc.setTextColor(40)
    doc.text('Schedule Report', 14, 22)

    // Date
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    // Prepare table data
    const tableData = filteredSchedules.map((schedule) => [
      schedule.course_code,
      schedule.course_name,
      new Date(schedule.start_time).toLocaleString(),
      new Date(schedule.end_time).toLocaleString(),
      schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1),
      schedule.instructor,
      schedule.room,
    ])

    // Add the table using autoTable plugin
    doc.autoTable({
      head: [
        [
          'Course Code',
          'Course Name',
          'Start Time',
          'End Time',
          'Status',
          'Instructor ID',
          'Room ID',
        ],
      ],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 15 },
      },
    })

    // Add summary statistics
    const summaryY = doc.lastAutoTable.finalY + 15
    doc.setFontSize(12)
    doc.text('Summary Statistics', 14, summaryY)

    const statusCounts = filteredSchedules.reduce((acc, schedule) => {
      acc[schedule.status] = (acc[schedule.status] || 0) + 1
      return acc
    }, {})

    doc.setFontSize(10)
    let yPos = summaryY + 10
    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, 14, yPos)
      yPos += 7
    })

    doc.text(`Total Schedules: ${filteredSchedules.length}`, 14, yPos + 7)

    // Save the PDF
    doc.save(`schedule_report_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  // RoomDetailsPopup component
  const RoomDetailsPopup = ({ room, onClose }) => {
    if (!room) {
      return (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Room Details</h3>
            <p>No room details available.</p>
            <button className="popup-close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h3>Room Details</h3>
          <p>
            <strong>Room ID:</strong> {room.id}
          </p>
          <p>
            <strong>Room Name:</strong> {room.name}
          </p>
          <p>
            <strong>Capacity:</strong> {room.capacity}
          </p>
          <p>
            <strong>Location:</strong> {room.location}
          </p>
          <p>
            <strong>Room Type:</strong> {room.room_type}
          </p>
          <p>
            <strong>Amenities:</strong>
          </p>
          <ul>
            <li>AC: {room.has_ac ? 'Yes' : 'No'}</li>
            <li>Projector: {room.has_projector ? 'Yes' : 'No'}</li>
            <li>Whiteboard: {room.has_whiteboard ? 'Yes' : 'No'}</li>
            <li>Sound System: {room.has_sound_system ? 'Yes' : 'No'}</li>
            <li>Wi-Fi: {room.has_wifi ? 'Yes' : 'No'}</li>
          </ul>
          <p>
            <strong>Availability:</strong> {room.availability ? 'Available' : 'Not Available'}
          </p>
          <button className="popup-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  // InstructorDetailsPopup component
  const InstructorDetailsPopup = ({ instructor, onClose }) => {
    if (!instructor) {
      return (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Instructor Details</h3>
            <p>No instructor details available.</p>
            <button className="popup-close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h3>Instructor Details</h3>
          <p>
            <strong>Instructor ID:</strong> {instructor.id}
          </p>
          <p>
            <strong>Username:</strong> {instructor.username}
          </p>
          <p>
            <strong>Email:</strong> {instructor.email}
          </p>
          <p>
            <strong>First Name:</strong> {instructor.first_name}
          </p>
          <p>
            <strong>Last Name:</strong> {instructor.last_name}
          </p>
          <button className="popup-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="schedule-viewer-container">
      <h1>Schedule Viewer</h1>

      {/* Search Bar and Add Schedule Button */}
      <div className="search-add-container">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`add-btn ${showAddForm ? 'cancel-btn' : ''}`}
        >
          {showAddForm ? (
            'Cancel'
          ) : (
            <>
              <FaPlus /> Add Schedule
            </>
          )}
        </button>
      </div>

      {/* Add Schedule Form */}
      {showAddForm && (
        <form onSubmit={handleAddSchedule} className="add-schedule-form">
          <h3>Add New Schedule</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Course Code:</label>
              <input
                type="text"
                name="course_code"
                value={newSchedule.course_code}
                onChange={handleInputChange}
                required
                pattern="[A-Za-z0-9]+"
                title="Only letters and numbers allowed"
              />
            </div>
            <div className="form-group">
              <label>Course Name:</label>
              <input
                type="text"
                name="course_name"
                value={newSchedule.course_name}
                onChange={handleInputChange}
                required
                minLength={3}
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label>Instructor ID:</label>
              <input
                type="number"
                name="instructor"
                value={newSchedule.instructor}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Room ID:</label>
              <input
                type="number"
                name="room"
                value={newSchedule.room}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Start Time:</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formatForDateTimeLocal(newSchedule.start_time)}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formatForDateTimeLocal(newSchedule.end_time)}
                onChange={handleInputChange}
                required
                min={newSchedule.start_time ? formatForDateTimeLocal(newSchedule.start_time) : new Date().toISOString().slice(0, 16)}
              />
              {newSchedule.start_time &&
                newSchedule.end_time &&
                new Date(newSchedule.end_time) <= new Date(newSchedule.start_time) && (
                  <span className="validation-error">End time must be after start time</span>
                )}
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={newSchedule.status}
                onChange={handleInputChange}
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="submit-btn"
            disabled={
              !newSchedule.course_code ||
              !newSchedule.course_name ||
              !newSchedule.instructor ||
              !newSchedule.room ||
              !newSchedule.start_time ||
              !newSchedule.end_time ||
              new Date(newSchedule.end_time) <= new Date(newSchedule.start_time)
            }
          >
            Add Schedule
          </button>
        </form>
      )}

      {/* Edit Schedule Form */}
      {editingScheduleId && (
        <form onSubmit={handleSave} className="edit-schedule-form">
          <h3>Edit Schedule</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Course Code:</label>
              <input
                type="text"
                name="course_code"
                value={editFormData.course_code}
                onChange={handleEditInputChange}
                required
                pattern="[A-Za-z0-9]{3,10}"
                title="3-10 letters/numbers only, no spaces"
                maxLength="10"
              />
            </div>
            <div className="form-group">
              <label>Course Name:</label>
              <input
                type="text"
                name="course_name"
                value={editFormData.course_name}
                onChange={handleEditInputChange}
                required
                minLength="5"
                maxLength="100"
                title="5-100 characters required"
              />
            </div>
            <div className="form-group">
              <label>Instructor ID:</label>
              <input
                type="number"
                name="instructor"
                value={editFormData.instructor}
                onChange={handleEditInputChange}
                required
                min="1"
                max="9999"
                title="Must be a positive number (1-9999)"
              />
            </div>
            <div className="form-group">
              <label>Room ID:</label>
              <input
                type="number"
                name="room"
                value={editFormData.room}
                onChange={handleEditInputChange}
                required
                min="1"
                max="999"
                title="Must be a positive number (1-999)"
              />
            </div>
            <div className="form-group">
              <label>Start Time:</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formatForDateTimeLocal(editFormData.start_time)}
                onChange={handleEditInputChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                title="Must be a future date/time"
              />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formatForDateTimeLocal(editFormData.end_time)}
                onChange={handleEditInputChange}
                required
                min={editFormData.start_time ? formatForDateTimeLocal(editFormData.start_time) : new Date().toISOString().slice(0, 16)}
                title="Must be after start time"
              />
              {editFormData.start_time &&
                editFormData.end_time &&
                new Date(editFormData.end_time) <= new Date(editFormData.start_time) && (
                  <span className="validation-error">End time must be after start time</span>
                )}
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={editFormData.status}
                onChange={handleEditInputChange}
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
          <div className="form-buttons">
            <button
              type="submit"
              className="submit-btn"
              disabled={
                !editFormData.course_code ||
                !editFormData.course_name ||
                !editFormData.instructor ||
                !editFormData.room ||
                !editFormData.start_time ||
                !editFormData.end_time ||
                new Date(editFormData.end_time) <= new Date(editFormData.start_time)
              }
            >
              Save Changes
            </button>
            <button type="button" onClick={() => setEditingScheduleId(null)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Schedule Table */}
      {loading ? (
        <p className="loading-text">Loading schedules...</p>
      ) : (
        <>
          <div className="table-info">
            <p>Showing {filteredSchedules.length} schedules</p>
          </div>

          <div className="table-container">
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
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>{schedule.course_code}</td>
                      <td>{schedule.course_name}</td>
                      <td>{new Date(schedule.start_time).toLocaleString()}</td>
                      <td>{new Date(schedule.end_time).toLocaleString()}</td>
                      <td>{schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}</td>
                      <td>
                        <span
                          className="clickable-id"
                          onClick={() => handleInstructorClick(schedule.instructor)}
                        >
                          {schedule.instructor}
                        </span>
                      </td>
                      <td>
                        <span
                          className="clickable-id"
                          onClick={() => handleRoomClick(schedule.room)}
                        >
                          {schedule.room}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="edit-btn"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="delete-btn"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results">
                      No schedules found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Report Download Button */}
          <div className="report-download-container">
            <button onClick={generatePDFReport} className="download-btn">
              <FaFilePdf /> Download PDF Report
            </button>
          </div>
        </>
      )}

      {/* Room Details Pop-up */}
      {showRoomDetails && (
        <RoomDetailsPopup room={selectedRoom} onClose={() => setShowRoomDetails(false)} />
      )}

      {/* Instructor Details Pop-up */}
      {showInstructorDetails && (
        <InstructorDetailsPopup
          instructor={selectedInstructor}
          onClose={() => setShowInstructorDetails(false)}
        />
      )}
    </div>
  )
}

export default ScheduleViewer

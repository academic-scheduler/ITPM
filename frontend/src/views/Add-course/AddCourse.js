import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa' // Import icons

const CoursesPage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCourse, setEditingCourse] = useState(null)
  const [editedData, setEditedData] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [exportLoading, setExportLoading] = useState(false)
  const [newCourse, setNewCourse] = useState({
    course_code: '',
    course_name: '',
    credits: '',
    description: '',
    status: 'available',
  })
  const [errors, setErrors] = useState({
    course_name: '',
    credits: '',
  })

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get(`api/add-course/courses/?search=${searchTerm}`)
        setCourses(response.data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [searchTerm])

  // Handle input changes for new course form
  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'course_name') {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setNewCourse({ ...newCourse, [name]: value })
        setErrors({ ...errors, course_name: '' })
      } else {
        setErrors({ ...errors, course_name: 'Only alphabetic characters and spaces are allowed' })
      }
    } else if (name === 'credits') {
      if (value === '' || (!isNaN(value) && parseFloat(value) <= 10)) {
        setNewCourse({ ...newCourse, [name]: value })
        setErrors({ ...errors, credits: '' })
      } else {
        setErrors({ ...errors, credits: 'Credits must be a number and cannot exceed 10' })
      }
    } else {
      setNewCourse({ ...newCourse, [name]: value })
    }
  }

  // Handle input changes for edited course
  const handleEditInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'course_name') {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setEditedData({ ...editedData, [name]: value })
        setErrors({ ...errors, course_name: '' })
      } else {
        setErrors({ ...errors, course_name: 'Only alphabetic characters and spaces are allowed' })
      }
    } else if (name === 'credits') {
      if (value === '' || (!isNaN(value) && parseFloat(value) <= 10)) {
        setEditedData({ ...editedData, [name]: value })
        setErrors({ ...errors, credits: '' })
      } else {
        setErrors({ ...errors, credits: 'Credits must be a number and cannot exceed 10' })
      }
    } else {
      setEditedData({ ...editedData, [name]: value })
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Add new course
  const handleAddCourse = async (e) => {
    e.preventDefault()

    if (
      !newCourse.course_code ||
      !newCourse.course_name ||
      !newCourse.credits ||
      !newCourse.description
    ) {
      alert('All fields are required.')
      return
    }

    if (parseFloat(newCourse.credits) > 10) {
      setErrors({ ...errors, credits: 'Credits cannot exceed 10' })
      return
    }

    if (!/^[a-zA-Z\s]+$/.test(newCourse.course_name)) {
      setErrors({
        ...errors,
        course_name: 'Course name can only contain alphabetic characters and spaces',
      })
      return
    }

    try {
      const response = await api.post('api/add-course/courses/', {
        ...newCourse,
        credits: parseFloat(newCourse.credits),
      })
      setCourses([...courses, response.data])
      setShowAddForm(false)
      setNewCourse({
        course_code: '',
        course_name: '',
        credits: '',
        description: '',
        status: 'available',
      })
      setErrors({ course_name: '', credits: '' })
      alert('Course added successfully!')
    } catch (error) {
      console.error('Error adding course:', error.response?.data || error.message)
      alert('Failed to add course.')
    }
  }

  // Handle edit
  const handleEdit = (course) => {
    setEditingCourse(course.id)
    setEditedData({ ...course })
    setErrors({ course_name: '', credits: '' })
  }

  // Save edited course
  const handleSave = async (id) => {
    if (
      !editedData.course_code ||
      !editedData.course_name ||
      !editedData.credits ||
      !editedData.description
    ) {
      alert('All fields are required.')
      return
    }

    if (parseFloat(editedData.credits) > 10) {
      setErrors({ ...errors, credits: 'Credits cannot exceed 10' })
      return
    }
    if (!/^[a-zA-Z\s]+$/.test(editedData.course_name)) {
      setErrors({
        ...errors,
        course_name: 'Course name can only contain alphabetic characters and spaces',
      })
      return
    }

    try {
      const response = await api.put(`api/add-course/courses/${id}/`, {
        ...editedData,
        credits: parseFloat(editedData.credits),
      })
      const updatedCourses = courses.map((course) => (course.id === id ? response.data : course))
      setCourses(updatedCourses)
      setEditingCourse(null)
      alert('Course updated successfully!')
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Failed to update course.')
    }
  }

  // Cancel edit
  const handleCancel = () => {
    setEditingCourse(null)
    setErrors({ course_name: '', credits: '' })
  }

  // Delete course with confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this course?')
    if (confirmDelete) {
      try {
        await api.delete(`api/add-course/courses/${id}/`)
        setCourses(courses.filter((course) => course.id !== id))
        alert('Course deleted successfully!')
      } catch (error) {
        console.error('Error deleting course:', error)
        alert('Failed to delete course.')
      }
    }
  }

  // Export courses as PDF
  const handleExportPDF = async () => {
    try {
      setExportLoading(true)
      // Use the current search term to filter the PDF if a search is active
      const url = `api/add-course/courses/export-pdf/?search=${searchTerm}`

      // Use axios to get the PDF as a blob
      const response = await api.get(url, {
        responseType: 'blob', // Important: tells axios to treat response as binary data
      })

      // Create a blob URL for the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const downloadUrl = window.URL.createObjectURL(blob)

      // Create a temporary link element and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = 'courses_report.pdf'
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF.')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Course Management</h1>

      {/* Search and Export Controls */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            padding: '10px',
            width: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />

        <button
          onClick={handleExportPDF}
          disabled={exportLoading || loading || courses.length === 0}
          style={{
            backgroundColor: '#2a52be',
            padding: '10px 20px',
            fontSize: '14px',
            border: 'none',
            cursor: courses.length === 0 ? 'not-allowed' : 'pointer',
            borderRadius: '5px',
            color: 'white',
            opacity: exportLoading || loading || courses.length === 0 ? 0.7 : 1,
          }}
        >
          {exportLoading ? 'Exporting...' : 'Export as PDF'}
        </button>
      </div>

      {/* Add Course Button */}
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
        {showAddForm ? 'Cancel' : 'Add Course'}
      </button>

      {/* Add Course Form */}
      {showAddForm && (
        <form onSubmit={handleAddCourse} style={{ marginBottom: '20px', maxWidth: '500px' }}>
          <h3>Add New Course</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            <div>
              <label>Course Code:</label>
              <input
                type="text"
                name="course_code"
                value={newCourse.course_code}
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
                value={newCourse.course_name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '5px',
                  borderColor: errors.course_name ? 'red' : '',
                }}
              />
              {errors.course_name && (
                <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                  {errors.course_name}
                </div>
              )}
            </div>
            <div>
              <label>Credits:</label>
              <input
                type="number"
                name="credits"
                value={newCourse.credits}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '5px',
                  borderColor: errors.credits ? 'red' : '',
                }}
              />
              {errors.credits && (
                <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                  {errors.credits}
                </div>
              )}
            </div>
            <div>
              <label>Description:</label>
              <textarea
                name="description"
                value={newCourse.description}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Status:</label>
              <select
                name="status"
                value={newCourse.status}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '5px' }}
                required
              >
                <option value="available">Available</option>
                <option value="not_available">Not Available</option>
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
            Add Course
          </button>
        </form>
      )}

      {/* Courses Table */}
      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>No courses found. {searchTerm && 'Try a different search term.'}</p>
      ) : (
        <table
          style={{
            width: '100%',
            marginTop: '20px',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#e6f3ff', color: 'black' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Course Code
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Course Name
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Credits
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Description
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Status
              </th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingCourse === course.id ? (
                    <input
                      type="text"
                      name="course_code"
                      value={editedData.course_code}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    course.course_code
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingCourse === course.id ? (
                    <div>
                      <input
                        type="text"
                        name="course_name"
                        value={editedData.course_name}
                        onChange={handleEditInputChange}
                        style={{
                          width: '100%',
                          padding: '5px',
                          borderColor: errors.course_name ? 'red' : '',
                        }}
                      />
                      {errors.course_name && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                          {errors.course_name}
                        </div>
                      )}
                    </div>
                  ) : (
                    course.course_name
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingCourse === course.id ? (
                    <div>
                      <input
                        type="number"
                        name="credits"
                        value={editedData.credits}
                        onChange={handleEditInputChange}
                        style={{
                          width: '100%',
                          padding: '5px',
                          borderColor: errors.credits ? 'red' : '',
                        }}
                      />
                      {errors.credits && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                          {errors.credits}
                        </div>
                      )}
                    </div>
                  ) : (
                    course.credits
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingCourse === course.id ? (
                    <textarea
                      name="description"
                      value={editedData.description}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    course.description
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingCourse === course.id ? (
                    <select
                      name="status"
                      value={editedData.status}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
                    >
                      <option value="available">Available</option>
                      <option value="not_available">Not Available</option>
                    </select>
                  ) : course.status === 'available' ? (
                    'Available'
                  ) : (
                    'Not Available'
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {editingCourse === course.id ? (
                    <>
                      <button
                        onClick={() => handleSave(course.id)}
                        style={{
                          backgroundColor: 'green',
                          padding: '5px 10px',
                          fontSize: '12px',
                          marginRight: '5px',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '5px',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Save"
                      >
                        <FaSave style={{ marginRight: '4px' }} /> Save
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
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Cancel"
                      >
                        <FaTimes style={{ marginRight: '4px' }} /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(course)}
                        style={{
                          backgroundColor: '#8B8000',
                          padding: '5px 10px',
                          fontSize: '12px',
                          marginRight: '5px',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '5px',
                          color: 'white',
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        style={{
                          backgroundColor: '#8B0000',
                          padding: '5px 10px',
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '5px',
                          color: 'white',
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default CoursesPage

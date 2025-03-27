/* eslint-disable prettier/prettier */

// frontend/src/views/smart-assistant/SmartAssistant.js
import React, { useState } from 'react'
import axios from 'axios'

const SmartAssistant = () => {
  const [inputs, setInputs] = useState({
    instructor_id: '',
    room_id: '',
    start_time: '',
    end_time: '',
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    // Validate inputs
    if (!inputs.instructor_id || !inputs.room_id || !inputs.start_time || !inputs.end_time) {
      setError('All fields are required')
      return
    }

    try {
      const payload = {
        instructor_id: parseInt(inputs.instructor_id),
        room_id: parseInt(inputs.room_id),
        start_time: new Date(inputs.start_time).toISOString(),
        end_time: new Date(inputs.end_time).toISOString(),
      }

      const response = await axios.post('http://localhost:8000/api/find-slot/', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.data.error) {
        setError(response.data.error)
      } else {
        setResult({
          start: new Date(response.data.start_time),
          end: new Date(response.data.end_time),
        })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request')
    }
  }

  return (
    <div className="smart-assistant-container">
      <h2>Find Available Time Slot</h2>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label>Instructor ID:</label>
          <input
            type="number"
            name="instructor_id"
            value={inputs.instructor_id}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Room ID:</label>
          <input
            type="number"
            name="room_id"
            value={inputs.room_id}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Start Time:</label>
          <input
            type="datetime-local"
            name="start_time"
            value={inputs.start_time}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>End Time:</label>
          <input
            type="datetime-local"
            name="end_time"
            value={inputs.end_time}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Find Best Slot
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-container">
          <h3>Best Available Slot Found:</h3>
          <p>Start: {result.start.toLocaleString()}</p>
          <p>End: {result.end.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}

export default SmartAssistant

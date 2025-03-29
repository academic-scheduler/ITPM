/* eslint-disable prettier/prettier */

// frontend/src/views/smart-assistant/SmartAssistant.js
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../smart-assistant/SmartAssistant.css'

// Added validation utility function
const validateTimes = (startTime, endTime) => {
  const errors = {}
  const now = new Date()
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)

  if (startDate < now) errors.start_time = 'Start time cannot be in the past'
  if (endDate < now) errors.end_time = 'End time cannot be in the past'
  if (endDate <= startDate) errors.end_time = 'End time must be after start time'

  return errors
}

const SmartAssistant = () => {
  const [inputs, setInputs] = useState({
    instructor_id: '',
    room_id: '',
    start_time: '',
    end_time: '',
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Added separate state for field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    start_time: '',
    end_time: '',
  })

  // Added useEffect to set initial times
  useEffect(() => {
    const now = new Date()
    const defaultStart = new Date(now.getTime() + 330 * 60000) // 5 minutes from now
    const defaultEnd = new Date(defaultStart.getTime() + 60 * 60000) // +1 hour

    setInputs({
      ...inputs,
      start_time: defaultStart.toISOString().slice(0, 16),
      end_time: defaultEnd.toISOString().slice(0, 16),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'instructor_id' || name === 'room_id') {
      // Allow only digits (0-9) and empty string
      const numericValue = value.replace(/[^0-9]/g, '')
      setInputs((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
    } else {
      // Handle other fields normally
      setInputs((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Added real-time validation
    if (name === 'start_time' || name === 'end_time') {
      const errors = validateTimes(inputs.start_time, inputs.end_time)
      setFieldErrors(errors)
    }
  }

  // Add key press blocking for non-numeric input
  const handleNumberKeyPress = (e) => {
    const charCode = e.key
    if (!/[0-9]|Backspace|Delete|Arrow/.test(charCode)) {
      e.preventDefault()
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    // Modified validation to include time checks
    const timeErrors = validateTimes(inputs.start_time, inputs.end_time)
    if (Object.keys(timeErrors).length > 0) {
      setFieldErrors(timeErrors)
      return
    }

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
            type="text" // Changed from number to text for better control
            name="instructor_id"
            value={inputs.instructor_id}
            onChange={handleInputChange}
            onKeyDown={handleNumberKeyPress} // Added key press handler
            inputMode="numeric" // Shows numeric keyboard on mobile
            pattern="[0-9]*" // HTML5 pattern validation
            required
          />
        </div>

        <div className="form-group">
          <label>Room ID:</label>
          <input
            type="text" // Changed from number to text
            name="room_id"
            value={inputs.room_id}
            onChange={handleInputChange}
            onKeyDown={handleNumberKeyPress}
            inputMode="numeric"
            pattern="[0-9]*"
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
            min={new Date().toISOString().slice(0, 16)}
            required
          />
          {fieldErrors.start_time && <div className="error-text">{fieldErrors.start_time}</div>}
        </div>

        <div className="form-group">
          <label>End Time:</label>
          <input
            type="datetime-local"
            name="end_time"
            value={inputs.end_time}
            onChange={handleInputChange}
            min={inputs.start_time || new Date().toISOString().slice(0, 16)}
            required
          />
          {fieldErrors.end_time && <div className="error-text">{fieldErrors.end_time}</div>}
        </div>

        <button type="submit" className="submit-btn">
          Find Best Slot
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-container">
          <h3>Best Available Time Slot </h3>
          <p>Start: {result.start.toLocaleString()}</p>
          <p>End: {result.end.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}

export default SmartAssistant

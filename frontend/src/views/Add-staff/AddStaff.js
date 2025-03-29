import React, { useEffect, useState } from 'react'
import api from '../../services/api'

const AddStaff = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password1: '',
    password2: '',
    role: '',
  })
  const [showForm, setShowForm] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [editedUserData, setEditedUserData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    role: '',
    is_instructor: false,
    is_lecturer: false,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
  })

  // Fetch users from API
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/get-user-details/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes for the form
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'first_name' || name === 'last_name') {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setFormData({ ...formData, [name]: value })
        setErrors({ ...errors, [name]: '' })
      } else {
        setErrors({ ...errors, [name]: 'Only alphabetic characters and spaces are allowed' })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  // Handle input changes for edited user
  const handleEditInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'first_name' || name === 'last_name') {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setEditedUserData({ ...editedUserData, [name]: value })
        setErrors({ ...errors, [name]: '' })
      } else {
        setErrors({ ...errors, [name]: 'Only alphabetic characters and spaces are allowed' })
      }
    } else if (name === 'role') {
      setEditedUserData({
        ...editedUserData,
        role: value,
        is_instructor: value === 'instructor',
        is_lecturer: value === 'lecturer',
      })
    } else {
      setEditedUserData({ ...editedUserData, [name]: value })
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase())
  }

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    return (
      user.first_name.toLowerCase().includes(searchTerm) ||
      user.last_name.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    )
  })

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password1 !== formData.password2) {
      alert('Passwords do not match')
      return
    }

    if (!formData.role) {
      alert('Please select a role (lecturer or instructor)')
      return
    }

    try {
      const response = await api.post('/api/register/', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      await fetchUsers()
      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password1: '',
        password2: '',
        role: '',
      })
      setShowForm(false)
      alert('Account created successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed')
      console.error(err)
    }
  }

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user.id)
    setEditedUserData({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      role: user.role,
      is_instructor: user.role === 'instructor',
      is_lecturer: user.role === 'lecturer',
    })
    setErrors({ first_name: '', last_name: '' })
  }

  // Save edited user
  const handleSave = async (id) => {
    if (!/^[a-zA-Z\s]+$/.test(editedUserData.first_name)) {
      setErrors({ ...errors, first_name: 'Only alphabetic characters and spaces are allowed' })
      return
    }
    if (!/^[a-zA-Z\s]+$/.test(editedUserData.last_name)) {
      setErrors({ ...errors, last_name: 'Only alphabetic characters and spaces are allowed' })
      return
    }

    try {
      const requestData = {
        user: {
          username: editedUserData.username,
          email: editedUserData.email,
          first_name: editedUserData.first_name,
          last_name: editedUserData.last_name,
        },
        is_instructor: editedUserData.role === 'instructor',
        is_lecturer: editedUserData.role === 'lecturer',
      }

      const response = await api.put(`/api/edit-user/${id}/`, requestData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      // Update the user in the state without refreshing the entire list
      setUsers(
        users.map((user) =>
          user.id === id
            ? {
                ...user,
                first_name: editedUserData.first_name,
                last_name: editedUserData.last_name,
                username: editedUserData.username,
                email: editedUserData.email,
                role: editedUserData.role,
              }
            : user,
        ),
      )

      setEditingUser(null)
      alert('User updated successfully!')
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Failed to update user. ' + (error.response?.data?.error || ''))
    }
  }

  // Cancel edit
  const handleCancel = () => {
    setEditingUser(null)
  }

  // Delete user with confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?')
    if (confirmDelete) {
      try {
        await api.delete(`/api/delete-user/${id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        setUsers(users.filter((user) => user.id !== id))
        alert('User deleted successfully!')
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user.')
      }
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Staff Management</h1>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search staff..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            padding: '10px',
            width: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
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
        {showForm ? 'Cancel' : 'Add Staff'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', maxWidth: '500px' }}>
          <h3>Add New Staff</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            <div>
              <label>First Name:</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '5px',
                  borderColor: errors.first_name ? 'red' : '',
                }}
              />
              {errors.first_name && (
                <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                  {errors.first_name}
                </div>
              )}
            </div>
            <div>
              <label>Last Name:</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '5px',
                  borderColor: errors.last_name ? 'red' : '',
                }}
              />
              {errors.last_name && (
                <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                  {errors.last_name}
                </div>
              )}
            </div>
            <div>
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                name="password1"
                value={formData.password1}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Confirm Password:</label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Role:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ width: '100%', padding: '5px' }}
                required
              >
                <option value="">Select Role</option>
                <option value="lecturer">Lecturer</option>
                <option value="instructor">Instructor</option>
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
            Add Staff
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading users...</p>
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
                ID
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                First Name
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Last Name
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Username
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Email
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                Role
              </th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', textAlign: 'left' }}>{user.id}</td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingUser === user.id ? (
                    <div>
                      <input
                        type="text"
                        name="first_name"
                        value={editedUserData.first_name}
                        onChange={handleEditInputChange}
                        style={{
                          width: '100%',
                          padding: '5px',
                          borderColor: errors.first_name ? 'red' : '',
                        }}
                      />
                      {errors.first_name && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                          {errors.first_name}
                        </div>
                      )}
                    </div>
                  ) : (
                    user.first_name
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingUser === user.id ? (
                    <div>
                      <input
                        type="text"
                        name="last_name"
                        value={editedUserData.last_name}
                        onChange={handleEditInputChange}
                        style={{
                          width: '100%',
                          padding: '5px',
                          borderColor: errors.last_name ? 'red' : '',
                        }}
                      />
                      {errors.last_name && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                          {errors.last_name}
                        </div>
                      )}
                    </div>
                  ) : (
                    user.last_name
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      name="username"
                      value={editedUserData.username}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      name="email"
                      value={editedUserData.email}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  {editingUser === user.id ? (
                    <select
                      name="role"
                      value={editedUserData.role}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
                    >
                      <option value="lecturer">Lecturer</option>
                      <option value="instructor">Instructor</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {editingUser === user.id ? (
                    <>
                      <button
                        onClick={() => handleSave(user.id)}
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
                        onClick={() => handleEdit(user)}
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
                        onClick={() => handleDelete(user.id)}
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
    </div>
  )
}

export default AddStaff

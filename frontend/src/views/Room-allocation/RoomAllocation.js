/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    room_type: '',
    has_ac: false,
    has_projector: false,
    has_whiteboard: false,
    has_sound_system: false,
    has_wifi: false,
    availability: false,
    min_capacity: '',
  });
  const [newRoom, setNewRoom] = useState({
    name: '',
    capacity: '',
    location: '',
    room_type: 'lecture_hall',
    has_ac: false,
    has_projector: false,
    has_whiteboard: false,
    has_sound_system: false,
    has_wifi: false,
    availability: true,
  });

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('api/room-allocation/rooms/');
        setRooms(response.data);
        setFilteredRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Apply search and filters whenever searchTerm or filters change
  useEffect(() => {
    const filtered = rooms.filter(room => {
      // Search by room name
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply filters
      const matchesFilters = (
        (filters.room_type === '' || room.room_type === filters.room_type) &&
        (!filters.has_ac || room.has_ac) &&
        (!filters.has_projector || room.has_projector) &&
        (!filters.has_whiteboard || room.has_whiteboard) &&
        (!filters.has_sound_system || room.has_sound_system) &&
        (!filters.has_wifi || room.has_wifi) &&
        (!filters.availability || room.availability) &&
        (filters.min_capacity === '' || room.capacity >= parseInt(filters.min_capacity))
      );
      
      return matchesSearch && matchesFilters;
    });
    
    setFilteredRooms(filtered);
  }, [searchTerm, filters, rooms]);

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Title and metadata
    doc.setFontSize(18);
    doc.text('Room Management Report', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`Total Rooms: ${rooms.length}`, 14, 42);
    doc.text(`Filtered Rooms: ${filteredRooms.length}`, 14, 52);
    
    // Active filters
    let filtersText = 'Active Filters: ';
    if (searchTerm) filtersText += `Search: "${searchTerm}" `;
    if (filters.room_type) filtersText += `Type: ${filters.room_type} `;
    if (filters.min_capacity) filtersText += `Min Capacity: ${filters.min_capacity} `;
    if (filters.has_ac) filtersText += 'AC ';
    if (filters.has_projector) filtersText += 'Projector ';
    if (filters.has_whiteboard) filtersText += 'Whiteboard ';
    if (filters.has_sound_system) filtersText += 'Sound System ';
    if (filters.has_wifi) filtersText += 'WiFi ';
    if (filters.availability) filtersText += 'Available Only ';
    
    doc.text(filtersText, 14, 62);
    
    // Table data with "Yes"/"No" instead of checkmarks
    const tableData = filteredRooms.map(room => [
      room.id,
      room.name,
      room.capacity,
      room.location,
      room.room_type.replace('_', ' '),
      room.has_ac ? 'Yes' : 'No',
      room.has_projector ? 'Yes' : 'No',
      room.has_whiteboard ? 'Yes' : 'No',
      room.has_sound_system ? 'Yes' : 'No',
      room.has_wifi ? 'Yes' : 'No',
      room.availability ? 'Yes' : 'No'
    ]);
    
    // Create table
    autoTable(doc, {
      head: [
        ['ID', 'Name', 'Capacity', 'Location', 'Type', 'AC', 'Projector', 'Whiteboard', 'Sound', 'WiFi', 'Available']
      ],
      body: tableData,
      startY: 70,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [52, 58, 64],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      // Optional: Center-align the Yes/No columns
      columnStyles: {
        5: { cellWidth: 'auto', halign: 'center' },
        6: { cellWidth: 'auto', halign: 'center' },
        7: { cellWidth: 'auto', halign: 'center' },
        8: { cellWidth: 'auto', halign: 'center' },
        9: { cellWidth: 'auto', halign: 'center' },
        10: { cellWidth: 'auto', halign: 'center' }
      }
    });
    
    // Save the PDF - REMOVED THE DUPLICATE LINE
    doc.save(`rooms_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      room_type: '',
      has_ac: false,
      has_projector: false,
      has_whiteboard: false,
      has_sound_system: false,
      has_wifi: false,
      availability: false,
      min_capacity: '',
    });
    setSearchTerm('');
  };

  // Handle input changes for new room form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom({ ...newRoom, [name]: type === 'checkbox' ? checked : value });
  };

  // Handle input changes for edited room
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedData({ ...editedData, [name]: type === 'checkbox' ? checked : value });
  };

  // Add new room
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('api/room-allocation/rooms/', {
        ...newRoom,
        capacity: parseInt(newRoom.capacity, 10),
      });
      setRooms([...rooms, response.data]);
      setShowAddForm(false);
      setNewRoom({
        name: '',
        capacity: '',
        location: '',
        room_type: 'lecture_hall',
        has_ac: false,
        has_projector: false,
        has_whiteboard: false,
        has_sound_system: false,
        has_wifi: false,
        availability: true,
      });
    } catch (error) {
      console.error('Error adding room:', error.response?.data || error.message);
    }
  };

  // Handle edit
  const handleEdit = (room) => {
    setEditingRoom(room.id);
    setEditedData({ ...room });
  };

  // Save edited room
  const handleSave = async (id) => {
    try {
      const response = await api.put(`api/room-allocation/rooms/${id}/`, {
        ...editedData,
        capacity: parseInt(editedData.capacity, 10),
      });
      const updatedRooms = rooms.map((room) => (room.id === id ? response.data : room));
      setRooms(updatedRooms);
      setEditingRoom(null);
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingRoom(null);
  };

  // Delete room with confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this room?');
    if (confirmDelete) {
      try {
        await api.delete(`api/room-allocation/rooms/${id}/`);
        setRooms(rooms.filter((room) => room.id !== id));
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Room Management</h1>
      
      {/* Search Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search rooms by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            padding: '8px 15px',
            width: '300px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            backgroundColor: '#1976d2',
            padding: '8px 15px',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            color: 'white',
          }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <button
          onClick={resetFilters}
          style={{
            backgroundColor: '#666',
            padding: '8px 15px',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            color: 'white',
          }}
        >
          Reset All
        </button>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div style={{
          backgroundColor: '#',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: '0', color: '#' }}>Filter Rooms</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '20px' 
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Room Type</label>
              <select
                name="room_type"
                value={filters.room_type}
                onChange={handleFilterChange}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              >
                <option value="">All Types</option>
                <option value="lecture_hall">Lecture Hall</option>
                <option value="lab">Lab</option>
                <option value="seminar_room">Seminar Room</option>
                <option value="auditorium">Auditorium</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Minimum Capacity</label>
              <input
                type="number"
                name="min_capacity"
                value={filters.min_capacity}
                onChange={handleFilterChange}
                placeholder="Any capacity"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="has_ac"
                  checked={filters.has_ac}
                  onChange={handleFilterChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Air Conditioning
              </label>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="has_projector"
                  checked={filters.has_projector}
                  onChange={handleFilterChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Projector
              </label>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="has_whiteboard"
                  checked={filters.has_whiteboard}
                  onChange={handleFilterChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Whiteboard
              </label>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="has_sound_system"
                  checked={filters.has_sound_system}
                  onChange={handleFilterChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Sound System
              </label>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="has_wifi"
                  checked={filters.has_wifi}
                  onChange={handleFilterChange}
                  style={{ width: '16px', height: '16px' }}
                />
                WiFi
              </label>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="availability"
                  checked={filters.availability}
                  onChange={handleFilterChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Available Only
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: '#28a745',
              padding: '10px 20px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              color: 'white',
              fontWeight: '500'
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add New Room'}
          </button>
          
          <button
            onClick={generatePDFReport}
            style={{
              backgroundColor: '#dc3545',
              padding: '10px 20px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              color: 'white',
              fontWeight: '500'
            }}
          >
            Generate PDF Report
          </button>
        </div>
        
        <div style={{ color: '#6c757d' }}>
          Showing {filteredRooms.length} of {rooms.length} rooms
        </div>
      </div>

      {/* Add Room Form */}
      {showAddForm && (
        <form onSubmit={handleAddRoom} style={{ 
          marginBottom: '30px', 
          maxWidth: '800px',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: '0', color: '#343a40' }}>Add New Room</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '15px' 
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Name:</label>
              <input
                type="text"
                name="name"
                value={newRoom.name}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Capacity:</label>
              <input
                type="number"
                name="capacity"
                value={newRoom.capacity}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Location:</label>
              <input
                type="text"
                name="location"
                value={newRoom.location}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Room Type:</label>
              <select
                name="room_type"
                value={newRoom.room_type}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              >
                <option value="lecture_hall">Lecture Hall</option>
                <option value="lab">Lab</option>
                <option value="seminar_room">Seminar Room</option>
                <option value="auditorium">Auditorium</option>
              </select>
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <h4 style={{ marginBottom: '10px', color: '#343a40' }}>Amenities</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '10px' 
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="has_ac"
                    checked={newRoom.has_ac}
                    onChange={handleInputChange}
                  />
                  Air Conditioning
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="has_projector"
                    checked={newRoom.has_projector}
                    onChange={handleInputChange}
                  />
                  Projector
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="has_whiteboard"
                    checked={newRoom.has_whiteboard}
                    onChange={handleInputChange}
                  />
                  Whiteboard
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="has_sound_system"
                    checked={newRoom.has_sound_system}
                    onChange={handleInputChange}
                  />
                  Sound System
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="has_wifi"
                    checked={newRoom.has_wifi}
                    onChange={handleInputChange}
                  />
                  WiFi
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="availability"
                    checked={newRoom.availability}
                    onChange={handleInputChange}
                  />
                  Available
                </label>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            style={{
              backgroundColor: '#28a745',
              padding: '10px 20px',
              fontSize: '14px',
              marginTop: '20px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              color: 'white',
              fontWeight: '500'
            }}
          >
            Add Room
          </button>
        </form>
      )}

      {/* Rooms Table */}
      {loading ? (
        <p>Loading rooms...</p>
      ) : filteredRooms.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ color: '#6c757d' }}>No rooms found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={{ 
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <table style={{ 
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#343a40',
                color: 'white'
              }}>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Capacity</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Location</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>AC</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>Projector</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>Whiteboard</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>Sound</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>WiFi</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>Available</th>
                <th style={{ padding: '12px 15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id} style={{ 
                  borderBottom: '1px solid #dee2e6',
                  ':hover': { backgroundColor: '#f8f9fa' }
                }}>
                  <td style={{ padding: '12px 15px' }}>{room.id}</td>
                  
                  <td style={{ padding: '12px 15px' }}>
                    {editingRoom === room.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editedData.name}
                        onChange={handleEditInputChange}
                        style={{ 
                          width: '100%', 
                          padding: '6px', 
                          borderRadius: '4px',
                          border: '1px solid #ced4da'
                        }}
                      />
                    ) : (
                      room.name
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px' }}>
                    {editingRoom === room.id ? (
                      <input
                        type="number"
                        name="capacity"
                        value={editedData.capacity}
                        onChange={handleEditInputChange}
                        style={{ 
                          width: '100%', 
                          padding: '6px', 
                          borderRadius: '4px',
                          border: '1px solid #ced4da'
                        }}
                      />
                    ) : (
                      room.capacity
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px' }}>
                    {editingRoom === room.id ? (
                      <input
                        type="text"
                        name="location"
                        value={editedData.location}
                        onChange={handleEditInputChange}
                        style={{ 
                          width: '100%', 
                          padding: '6px', 
                          borderRadius: '4px',
                          border: '1px solid #ced4da'
                        }}
                      />
                    ) : (
                      room.location
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px' }}>
                    {editingRoom === room.id ? (
                      <select
                        name="room_type"
                        value={editedData.room_type}
                        onChange={handleEditInputChange}
                        style={{ 
                          width: '100%', 
                          padding: '6px', 
                          borderRadius: '4px',
                          border: '1px solid #ced4da'
                        }}
                      >
                        <option value="lecture_hall">Lecture Hall</option>
                        <option value="lab">Lab</option>
                        <option value="seminar_room">Seminar Room</option>
                        <option value="auditorium">Auditorium</option>
                      </select>
                    ) : (
                      room.room_type.replace('_', ' ')
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    {editingRoom === room.id ? (
                      <input
                        type="checkbox"
                        name="has_ac"
                        checked={editedData.has_ac}
                        onChange={handleEditInputChange}
                      />
                    ) : room.has_ac ? (
                      '✓'
                    ) : (
                      '✗'
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    {editingRoom === room.id ? (
                      <input
                        type="checkbox"
                        name="has_projector"
                        checked={editedData.has_projector}
                        onChange={handleEditInputChange}
                      />
                    ) : room.has_projector ? (
                      '✓'
                    ) : (
                      '✗'
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    {editingRoom === room.id ? (
                      <input
                        type="checkbox"
                        name="has_whiteboard"
                        checked={editedData.has_whiteboard}
                        onChange={handleEditInputChange}
                      />
                    ) : room.has_whiteboard ? (
                      '✓'
                    ) : (
                      '✗'
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    {editingRoom === room.id ? (
                      <input
                        type="checkbox"
                        name="has_sound_system"
                        checked={editedData.has_sound_system}
                        onChange={handleEditInputChange}
                      />
                    ) : room.has_sound_system ? (
                      '✓'
                    ) : (
                      '✗'
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    {editingRoom === room.id ? (
                      <input
                        type="checkbox"
                        name="has_wifi"
                        checked={editedData.has_wifi}
                        onChange={handleEditInputChange}
                      />
                    ) : room.has_wifi ? (
                      '✓'
                    ) : (
                      '✗'
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    {editingRoom === room.id ? (
                      <input
                        type="checkbox"
                        name="availability"
                        checked={editedData.availability}
                        onChange={handleEditInputChange}
                      />
                    ) : room.availability ? (
                      '✓'
                    ) : (
                      '✗'
                    )}
                  </td>
                  
                  <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                    {editingRoom === room.id ? (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleSave(room.id)}
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
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          style={{
                            backgroundColor: '#6c757d',
                            padding: '5px 10px',
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            color: 'white',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleEdit(room)}
                          style={{
                            backgroundColor: '#ffc107',
                            padding: '5px 10px',
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            color: '#212529',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
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
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
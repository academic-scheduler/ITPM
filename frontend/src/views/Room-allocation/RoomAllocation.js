// /* eslint-disable prettier/prettier */
// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';

// const RoomsPage = () => {
//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingRoom, setEditingRoom] = useState(null);
//   const [editedData, setEditedData] = useState({});
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newRoom, setNewRoom] = useState({
//     name: '',
//     capacity: '',
//     location: '',
//     room_type: 'lecture_hall',
//     has_ac: false,
//     has_projector: false,
//     has_whiteboard: false,
//     has_sound_system: false,
//     has_wifi: false,
//     availability: true,
//   });

//   // Fetch rooms from API
//   useEffect(() => {
//     const fetchRooms = async () => {
//       try {
//         const response = await api.get('api/room-allocation/rooms/');
//         setRooms(response.data);
//       } catch (error) {
//         console.error('Error fetching rooms:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRooms();
//   }, []);

//   // Handle input changes for new room form
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setNewRoom({ ...newRoom, [name]: type === 'checkbox' ? checked : value });
//   };

//   // Handle input changes for edited room
//   const handleEditInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setEditedData({ ...editedData, [name]: type === 'checkbox' ? checked : value });
//   };

//   // Add new room
//   const handleAddRoom = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post('api/room-allocation/rooms/', {
//         ...newRoom,
//         capacity: parseInt(newRoom.capacity, 10),
//       });
//       setRooms([...rooms, response.data]);
//       setShowAddForm(false);
//       setNewRoom({
//         name: '',
//         capacity: '',
//         location: '',
//         room_type: 'lecture_hall',
//         has_ac: false,
//         has_projector: false,
//         has_whiteboard: false,
//         has_sound_system: false,
//         has_wifi: false,
//         availability: true,
//       });
//     } catch (error) {
//       console.error('Error adding room:', error.response?.data || error.message);
//     }
//   };

//   // Handle edit
//   const handleEdit = (room) => {
//     setEditingRoom(room.id);
//     setEditedData({ ...room });
//   };

//   // Save edited room
//   const handleSave = async (id) => {
//     try {
//       const response = await api.put(`api/room-allocation/rooms/${id}/`, {
//         ...editedData,
//         capacity: parseInt(editedData.capacity, 10), // Ensure capacity is an integer
//       });
//       const updatedRooms = rooms.map((room) => (room.id === id ? response.data : room));
//       setRooms(updatedRooms);
//       setEditingRoom(null);
//     } catch (error) {
//       console.error('Error saving room:', error);
//     }
//   };

//   // Cancel edit
//   const handleCancel = () => {
//     setEditingRoom(null);
//   };

//   // Delete room
//   const handleDelete = async (id) => {
//     try {
//       await api.delete(`api/room-allocation/rooms/${id}/`);
//       setRooms(rooms.filter((room) => room.id !== id));
//     } catch (error) {
//       console.error('Error deleting room:', error);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//       <h1>Rooms</h1>
//       <button
//         onClick={() => setShowAddForm(!showAddForm)}
//         style={{
//           backgroundColor: 'green',
//           padding: '10px 20px',
//           fontSize: '14px',
//           marginBottom: '20px',
//           border: 'none',
//           cursor: 'pointer',
//           borderRadius: '5px',
//           color: 'white',
//         }}
//       >
//         {showAddForm ? 'Cancel' : 'Add Room'}
//       </button>

//       {showAddForm && (
//         <form onSubmit={handleAddRoom} style={{ marginBottom: '20px', maxWidth: '500px' }}>
//           <h3>Add New Room</h3>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
//             <div>
//               <label>Name:</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={newRoom.name}
//                 onChange={handleInputChange}
//                 required
//                 style={{ width: '100%', padding: '5px' }}
//               />
//             </div>
//             <div>
//               <label>Capacity:</label>
//               <input
//                 type="number"
//                 name="capacity"
//                 value={newRoom.capacity}
//                 onChange={handleInputChange}
//                 required
//                 style={{ width: '100%', padding: '5px' }}
//               />
//             </div>
//             <div>
//               <label>Location:</label>
//               <input
//                 type="text"
//                 name="location"
//                 value={newRoom.location}
//                 onChange={handleInputChange}
//                 required
//                 style={{ width: '100%', padding: '5px' }}
//               />
//             </div>
//             <div>
//               <label>Room Type:</label>
//               <select
//                 name="room_type"
//                 value={newRoom.room_type}
//                 onChange={handleInputChange}
//                 style={{ width: '100%', padding: '5px' }}
//               >
//                 <option value="lecture_hall">Lecture Hall</option>
//                 <option value="lab">Lab</option>
//                 <option value="seminar_room">Seminar Room</option>
//                 <option value="auditorium">Auditorium</option>
//               </select>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   name="has_ac"
//                   checked={newRoom.has_ac}
//                   onChange={handleInputChange}
//                 />
//                 Air Conditioning
//               </label>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   name="has_projector"
//                   checked={newRoom.has_projector}
//                   onChange={handleInputChange}
//                 />
//                 Projector
//               </label>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   name="has_whiteboard"
//                   checked={newRoom.has_whiteboard}
//                   onChange={handleInputChange}
//                 />
//                 Whiteboard
//               </label>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   name="has_sound_system"
//                   checked={newRoom.has_sound_system}
//                   onChange={handleInputChange}
//                 />
//                 Sound System
//               </label>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   name="has_wifi"
//                   checked={newRoom.has_wifi}
//                   onChange={handleInputChange}
//                 />
//                 WiFi
//               </label>
//             </div>
//             <div>
//               <label>
//                 <input
//                   type="checkbox"
//                   name="availability"
//                   checked={newRoom.availability}
//                   onChange={handleInputChange}
//                 />
//                 Available
//               </label>
//             </div>
//           </div>
//           <button
//             type="submit"
//             style={{
//               backgroundColor: 'green',
//               padding: '10px 20px',
//               fontSize: '14px',
//               marginTop: '10px',
//               border: 'none',
//               cursor: 'pointer',
//               borderRadius: '5px',
//               color: 'white',
//             }}
//           >
//             Add Room
//           </button>
//         </form>
//       )}

//       {loading ? (
//         <p>Loading rooms...</p>
//       ) : (
//         <table
//           style={{
//             width: '100%',
//             marginTop: '20px',
//           }}
//         >
//           <thead>
//             <tr>
//               <th style={{ padding: '10px' }}>Room ID</th>
//               <th style={{ padding: '10px' }}>Name</th>
//               <th style={{ padding: '10px' }}>Capacity</th>
//               <th style={{ padding: '10px' }}>Location</th>
//               <th style={{ padding: '10px' }}>Room Type</th>
//               <th style={{ padding: '10px' }}>AC</th>
//               <th style={{ padding: '10px' }}>Projector</th>
//               <th style={{ padding: '10px' }}>Whiteboard</th>
//               <th style={{ padding: '10px' }}>Sound System</th>
//               <th style={{ padding: '10px' }}>WiFi</th>
//               <th style={{ padding: '10px' }}>Available</th>
//               <th style={{ padding: '10px' }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rooms.map((room) => (
//               <tr key={room.id}>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>{room.id}</td>
//                 <td style={{ padding: '10px' }}>
//                   {editingRoom === room.id ? (
//                     <input
//                       type="text"
//                       name="name"
//                       value={editedData.name}
//                       onChange={handleEditInputChange}
//                       style={{ width: '100%', padding: '5px' }}
//                     />
//                   ) : (
//                     room.name
//                   )}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {editingRoom === room.id ? (
//                     <input
//                       type="number"
//                       name="capacity"
//                       value={editedData.capacity}
//                       onChange={handleEditInputChange}
//                       style={{ width: '100%', padding: '5px' }}
//                     />
//                   ) : (
//                     room.capacity
//                   )}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {editingRoom === room.id ? (
//                     <input
//                       type="text"
//                       name="location"
//                       value={editedData.location}
//                       onChange={handleEditInputChange}
//                       style={{ width: '100%', padding: '5px' }}
//                     />
//                   ) : (
//                     room.location
//                   )}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {editingRoom === room.id ? (
//                     <select
//                       name="room_type"
//                       value={editedData.room_type}
//                       onChange={handleEditInputChange}
//                       style={{ width: '100%', padding: '5px' }}
//                     >
//                       <option value="lecture_hall">Lecture Hall</option>
//                       <option value="lab">Lab</option>
//                       <option value="seminar_room">Seminar Room</option>
//                       <option value="auditorium">Auditorium</option>
//                     </select>
//                   ) : (
//                     room.room_type.replace('_', ' ')
//                   )}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {editingRoom === room.id ? (
//                     <input
//                       type="checkbox"
//                       name="has_ac"
//                       checked={editedData.has_ac}
//                       onChange={handleEditInputChange}
//                     />
//                   ) : room.has_ac ? (
//                     'Yes'
//                   ) : (
//                     'No'
//                   )}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {editingRoom === room.id ? (
//                     <input
//                       type="checkbox"
//                       name="has_projector"
//                       checked={editedData.has_projector}
//                       onChange={handleEditInputChange}
//                     />
//                   ) : room.has_projector ? (
//                     'Yes'
//                   ) : (
//                     'No'
//                   )}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {editingRoom === room.id ? (
//                     <input
//                       type="checkbox"
//                       name="has_whiteboard"
//                       checked={editedData.has_whiteboard}
//                       onChange={handleEditInputChange}
//                     />
//                   ) : room.has_whiteboard ? (
//                     'Yes'
//                   ) : (
//                     'No'
//                   )}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {editingRoom === room.id ? (
//                     <input
//                       type="checkbox"
//                       name="has_sound_system"
//                       checked={editedData.has_sound_system}
//                       onChange={handleEditInputChange}
//                     />
//                   ) : room.has_sound_system ? (
//                     'Yes'
//                   ) : (
//                     'No'
//                   )}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {editingRoom === room.id ? (
//                     <input
//                       type="checkbox"
//                       name="has_wifi"
//                       checked={editedData.has_wifi}
//                       onChange={handleEditInputChange}
//                     />
//                   ) : room.has_wifi ? (
//                     'Yes'
//                   ) : (
//                     'No'
//                   )}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {editingRoom === room.id ? (
//                     <input
//                       type="checkbox"
//                       name="availability"
//                       checked={editedData.availability}
//                       onChange={handleEditInputChange}
//                     />
//                   ) : room.availability ? (
//                     'Yes'
//                   ) : (
//                     'No'
//                   )}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {editingRoom === room.id ? (
//                     <>
//                       <button
//                         onClick={() => handleSave(room.id)}
//                         style={{
//                           backgroundColor: 'green',
//                           padding: '5px 10px',
//                           fontSize: '12px',
//                           marginRight: '5px',
//                           border: 'none',
//                           cursor: 'pointer',
//                           borderRadius: '5px',
//                           color: 'white',
//                         }}
//                       >
//                         Save
//                       </button>
//                       <button
//                         onClick={handleCancel}
//                         style={{
//                           backgroundColor: 'gray',
//                           padding: '5px 10px',
//                           fontSize: '12px',
//                           border: 'none',
//                           cursor: 'pointer',
//                           borderRadius: '5px',
//                           color: 'white',
//                         }}
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <button
//                         onClick={() => handleEdit(room)}
//                         style={{
//                           backgroundColor: '#8B8000',
//                           padding: '5px 10px',
//                           fontSize: '12px',
//                           marginRight: '5px',
//                           border: 'none',
//                           cursor: 'pointer',
//                           borderRadius: '5px',
//                           color: 'white',
//                         }}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(room.id)}
//                         style={{
//                           backgroundColor: '#8B0000',
//                           padding: '5px 10px',
//                           fontSize: '12px',
//                           border: 'none',
//                           cursor: 'pointer',
//                           borderRadius: '5px',
//                           color: 'white',
//                         }}
//                       >
//                         Delete
//                       </button>
//                     </>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default RoomsPage;
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
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
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

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
        capacity: parseInt(editedData.capacity, 10), // Ensure capacity is an integer
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
      <h1>Rooms</h1>
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
        {showAddForm ? 'Cancel' : 'Add Room'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddRoom} style={{ marginBottom: '20px', maxWidth: '500px' }}>
          <h3>Add New Room</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={newRoom.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Capacity:</label>
              <input
                type="number"
                name="capacity"
                value={newRoom.capacity}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={newRoom.location}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div>
              <label>Room Type:</label>
              <select
                name="room_type"
                value={newRoom.room_type}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '5px' }}
              >
                <option value="lecture_hall">Lecture Hall</option>
                <option value="lab">Lab</option>
                <option value="seminar_room">Seminar Room</option>
                <option value="auditorium">Auditorium</option>
              </select>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="has_ac"
                  checked={newRoom.has_ac}
                  onChange={handleInputChange}
                />
                Air Conditioning
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="has_projector"
                  checked={newRoom.has_projector}
                  onChange={handleInputChange}
                />
                Projector
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="has_whiteboard"
                  checked={newRoom.has_whiteboard}
                  onChange={handleInputChange}
                />
                Whiteboard
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="has_sound_system"
                  checked={newRoom.has_sound_system}
                  onChange={handleInputChange}
                />
                Sound System
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="has_wifi"
                  checked={newRoom.has_wifi}
                  onChange={handleInputChange}
                />
                WiFi
              </label>
            </div>
            <div>
              <label>
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
            Add Room
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading rooms...</p>
      ) : (
        <table
          style={{
            width: '100%',
            marginTop: '20px',
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: '10px' }}>Room ID</th>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Capacity</th>
              <th style={{ padding: '10px' }}>Location</th>
              <th style={{ padding: '10px' }}>Room Type</th>
              <th style={{ padding: '10px' }}>AC</th>
              <th style={{ padding: '10px' }}>Projector</th>
              <th style={{ padding: '10px' }}>Whiteboard</th>
              <th style={{ padding: '10px' }}>Sound System</th>
              <th style={{ padding: '10px' }}>WiFi</th>
              <th style={{ padding: '10px' }}>Available</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td style={{ padding: '10px', textAlign: 'center' }}>{room.id}</td>
                <td style={{ padding: '10px' }}>
                  {editingRoom === room.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedData.name}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    room.name
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  {editingRoom === room.id ? (
                    <input
                      type="number"
                      name="capacity"
                      value={editedData.capacity}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    room.capacity
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  {editingRoom === room.id ? (
                    <input
                      type="text"
                      name="location"
                      value={editedData.location}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    room.location
                  )}
                </td>
                <td style={{ padding: '10px' }}>
                  {editingRoom === room.id ? (
                    <select
                      name="room_type"
                      value={editedData.room_type}
                      onChange={handleEditInputChange}
                      style={{ width: '100%', padding: '5px' }}
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
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {editingRoom === room.id ? (
                    <input
                      type="checkbox"
                      name="has_ac"
                      checked={editedData.has_ac}
                      onChange={handleEditInputChange}
                    />
                  ) : room.has_ac ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {editingRoom === room.id ? (
                    <input
                      type="checkbox"
                      name="has_projector"
                      checked={editedData.has_projector}
                      onChange={handleEditInputChange}
                    />
                  ) : room.has_projector ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {editingRoom === room.id ? (
                    <input
                      type="checkbox"
                      name="has_whiteboard"
                      checked={editedData.has_whiteboard}
                      onChange={handleEditInputChange}
                    />
                  ) : room.has_whiteboard ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {editingRoom === room.id ? (
                    <input
                      type="checkbox"
                      name="has_sound_system"
                      checked={editedData.has_sound_system}
                      onChange={handleEditInputChange}
                    />
                  ) : room.has_sound_system ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {editingRoom === room.id ? (
                    <input
                      type="checkbox"
                      name="has_wifi"
                      checked={editedData.has_wifi}
                      onChange={handleEditInputChange}
                    />
                  ) : room.has_wifi ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {editingRoom === room.id ? (
                    <input
                      type="checkbox"
                      name="availability"
                      checked={editedData.availability}
                      onChange={handleEditInputChange}
                    />
                  ) : room.availability ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {editingRoom === room.id ? (
                    <>
                      <button
                        onClick={() => handleSave(room.id)}
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
                        onClick={() => handleEdit(room)}
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
                        onClick={() => handleDelete(room.id)}
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
  );
};

export default RoomsPage;
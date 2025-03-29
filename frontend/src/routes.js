/* eslint-disable prettier/prettier */
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Your tabs
const RoomAllocation = React.lazy(() => import('./views/Room-allocation/RoomAllocation'))
const ScheduleViewer = React.lazy(() => import('./views/Schedule-viewer/ScheduleViewer'))
const LecturerRequests = React.lazy(() => import('./views/Lecturer-requests/LecturerRequests'))
const AddStaff = React.lazy(() => import('./views/Add-staff/AddStaff'))
const AddCourse = React.lazy(() => import('./views/Add-course/AddCourse'))
const LecturerRequestsAdmin = React.lazy(() => import('./views/Lecturer-requests-admin/LecturerRequestAdmin'))
const SmartAssistant = React.lazy(() => import('./views/smart-assistant/SmartAssistant'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/room-allocation', name: 'Room Allocation', element: RoomAllocation },
  { path: '/schedule-viewer', name: 'Schedule Viewer', element: ScheduleViewer },
  { path: '/lecturer-requests', name: 'Lecturer Requests', element: LecturerRequests },
  { path: '/add-staff', name: 'Add Staff', element: AddStaff },
  { path: '/add-course', name: 'Add Course', element: AddCourse },
  { path: '/lecturer-requests-admin', name: 'Lecturer Requests Admin', element: LecturerRequestsAdmin },
  { path: '/smart-assistant', name: 'Smart Assistant', element: SmartAssistant },
]

export default routes
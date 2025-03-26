/* eslint-disable prettier/prettier */
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Your tabs
const RoomAllocation = React.lazy(() => import('./views/Room-allocation/RoomAllocation'))
const ScheduleViewer = React.lazy(() => import('./views/Schedule-viewer/ScheduleViewer'))
const LecturerRequests = React.lazy(() => import('./views/Lecturer-requests/LecturerRequests'))
const LecturerRequestsAdmin = React.lazy(() => import('./views/Lecturer-requests-admin/LecturerRequestAdmin'))

const routes = [
  { path: '/room-allocation', name: 'Room Allocation', element: RoomAllocation },
  { path: '/schedule-viewer', name: 'Schedule Viewer', element: ScheduleViewer },
  { path: '/lecturer-requests', name: 'Lecturer Requests', element: LecturerRequests },
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/lecturer-requests-admin', name: 'Lecturer Requests Admin', element: LecturerRequestsAdmin },
]

export default routes

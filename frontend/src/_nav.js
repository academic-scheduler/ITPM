/* eslint-disable prettier/prettier */
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilChartPie,
  cilPuzzle,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const getNav = (username) => [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Functions',
  },
  {
    component: CNavItem,
    name: 'Room Allocation',
    to: '/room-allocation',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Schedule Viewer',
    to: '/schedule-viewer',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Lecturer Requests',
    to: '/lecturer-requests',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Account',
  },
  ...(username
    ? [{ component: CNavItem, name: 'Logout', to: '/logout' }]
    : [
        { component: CNavItem, name: 'Login', to: '/login' },
        { component: CNavItem, name: 'Register', to: '/register' },
      ]),
]

export default getNav

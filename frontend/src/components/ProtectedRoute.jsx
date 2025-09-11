import { useLayoutEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { recoverSession } from '../features/auth/authSlice'
import { Skeleton } from '@mui/material'


const ProtectedRoute = ({ children }) => {
  const { token, status } = useSelector((state) => state.auth) 
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    if (!token && status === 'idle') {
      // Intentar recuperar sesión primero
      dispatch(recoverSession())
    } 
  }, [])

  useLayoutEffect(() => {
    if (!token && status === 'failed') {
      // Si no se pudo recuperar la sesión, redirigir al login
      navigate('/login', { replace: true, state: { from: location } })
    } 
  }, [status, token])

  return status === 'succeeded' ? children :
  
  <Skeleton variant="rectangular" width="100%" height="100vh" animation="wave" />
}
export default ProtectedRoute
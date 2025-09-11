import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/index'


export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.login(email, password)
      return response
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No token found')
      }
      
      // Verificar token con el backend
      const response = await api.verifyToken(token)
      return response.data
    } catch (error) {
      localStorage.removeItem('authToken')
      return rejectWithValue(error.response?.data || { message: 'Token invalid' })
    }
  }
)
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.register(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const recoverSession = createAsyncThunk(
  'auth/recoverSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.recoverSession()
      // Puedes guardar el access_token en localStorage si tu flujo lo requiere
      localStorage.setItem('authToken', response.access_token)
      return response
    } catch (error) {
      localStorage.removeItem('authToken')
      return rejectWithValue(error.response?.data || { message: 'No se pudo recuperar la sesión' })
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    status: 'idle',
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('authToken')
      state.user = null
      state.token = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
      })
.addCase(loginUser.fulfilled, (state, action) => {
  state.status = 'succeeded'
  state.user = null
  state.token = action.payload.access_token
  state.isAuthenticated = true  
  localStorage.setItem('authToken', action.payload.access_token)
})
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload.message
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded'

      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload.message
      })
      .addCase(recoverSession.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(recoverSession.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = null
        state.token = action.payload.access_token
        state.isAuthenticated = true
        localStorage.setItem('authToken', action.payload.access_token)
      })
      .addCase(recoverSession.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload.message
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
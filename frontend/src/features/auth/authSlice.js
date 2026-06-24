import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
  try {
    const s = localStorage.getItem('spreetail_user');
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  accessToken: localStorage.getItem('spreetail_access_token') || null,
  refreshToken: localStorage.getItem('spreetail_refresh_token') || null,
  status: 'idle', // idle | loading | error
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess(state, action) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.status = 'idle';
      state.error = null;
      localStorage.setItem('spreetail_user', JSON.stringify(user));
      localStorage.setItem('spreetail_access_token', accessToken);
      localStorage.setItem('spreetail_refresh_token', refreshToken);
    },
    loginFailure(state, action) {
      state.status = 'error';
      state.error = action.payload;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
      localStorage.setItem('spreetail_access_token', action.payload);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('spreetail_user');
      localStorage.removeItem('spreetail_access_token');
      localStorage.removeItem('spreetail_refresh_token');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthStatus = (state) => state.auth.status;

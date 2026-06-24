import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/services/authApi';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction, selectCurrentUser, selectAuthStatus } from '../features/auth/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);

  async function login(email, password) {
    dispatch(loginStart());
    try {
      const { data } = await authApi.login(email, password);
      dispatch(loginSuccess(data.data));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to log in. Please try again.';
      dispatch(loginFailure(message));
      return { success: false, message };
    }
  }

  function logout() {
    authApi.logout().catch(() => {});
    dispatch(logoutAction());
    navigate('/login');
  }

  return { user, status, login, logout, isAuthenticated: Boolean(user) };
}

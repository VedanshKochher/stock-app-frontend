// In your client-side callback handler component
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';

function AuthCallback() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);

    const userData = {
      token: params.get('token'),
      email: params.get('email'),
      userId: params.get('userId'),
      userName: params.get('userName'),
      userType: params.get('userType'),
      isActive: params.get('isActive') === 'true',
    };

    console.log("Auth data:", userData);

    if (userData.token && userData.email && userData.userId && userData.userName && userData.userType) {
      // Store auth data in Redux
      dispatch(setCredentials({
        token: userData.token,
        user: {
          token: userData.token,
          email: userData.email,
          userId: userData.userId,
          userName: userData.userName,
          userType: userData.userType,
          isActive: userData.isActive
        }
      }));

      // Store auth data in localStorage for persistence
      localStorage.setItem('authData', JSON.stringify(userData));

      // Redirect to dashboard
      navigate('/');
    }
  }, [location, dispatch, navigate]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="ml-3">Authenticating...</p>
    </div>
  );
}

export default AuthCallback;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MarketQuotes from './pages/MarketQuotes';
import Trading from './pages/Trading';
import Alerts from './pages/Alerts';
import TargetOrders from './pages/TargetOrders';
import Orders from './pages/Orders';
import { targetOrderService } from './services/targetOrderService';
import AuthCallback from './pages/Callback';
import LearnTrading from './pages/LearnTrading';
import Portfolio from './pages/Portfolio';

// Start monitoring target orders
targetOrderService.startMonitoring();

// Component to initialize auth state from localStorage
const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if auth data exists in localStorage
    const storedAuthData = localStorage.getItem('authData');

    if (storedAuthData) {
      try {
        const authData = JSON.parse(storedAuthData);
        if (authData && authData.token) {
          // Restore auth state from localStorage
          dispatch(setCredentials({
            token: authData.token,
            user: authData
          }));
        }
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        localStorage.removeItem('authData');
      }
    }
  }, [dispatch]);

  return null;
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AuthInitializer />
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback/> }/>
              <Route path="/market-quotes" element={<MarketQuotes />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/trading" element={<Trading />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/target-orders" element={<TargetOrders />} />
              <Route path="/learn-trading" element={<LearnTrading />} />
              <Route path='/portfolio' element={<Portfolio />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
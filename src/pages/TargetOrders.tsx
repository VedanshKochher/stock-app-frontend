import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { RootState } from '../store';
import { addTargetOrder, setLoading, setError } from '../store/slices/targetOrdersSlice';
import axios from 'axios';
import { BASE_URL } from '../const';

interface OrderDetails {
  instrumentToken: string;
  symbol: string;
  targetPrice: string;
  quantity: string;
  transactionType: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  phoneNumber: string;
}

interface PreFilledData {
  instrumentToken: string;
  symbol: string;
  targetPrice: number;
  quantity: string;
  transactionType: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  phoneNumber: string;
}

const TargetOrders = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { orders, loading, error } = useSelector((state: RootState) => state.targetOrders);

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    instrumentToken: '',
    symbol: '',
    targetPrice: '',
    quantity: '',
    transactionType: 'BUY',
    orderType: 'MARKET',
    phoneNumber: '',
  });

  useEffect(() => {
    // Check if we have pre-filled data from navigation
    const preFilledData = (location.state as { preFilledData: PreFilledData })?.preFilledData;
    if (preFilledData) {
      setOrderDetails({
        ...preFilledData,
        targetPrice: preFilledData.targetPrice.toString(),
      });
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(''));

    try {
      const response = await axios.post(`${BASE_URL}/setup-trading-trigger`, {
        userId: '1', // You might want to get this from your auth context/state
        instrumentKey: orderDetails.instrumentToken,
        triggerPrice: parseFloat(orderDetails.targetPrice),
        quantity: parseInt(orderDetails.quantity),
        transactionType: orderDetails.transactionType,
        orderType: orderDetails.orderType,
      });

      dispatch(addTargetOrder({
        ...response.data,
        createdAt: new Date().toISOString(),
      }));

      setOrderDetails({
        instrumentToken: '',
        symbol: '',
        targetPrice: '',
        quantity: '',
        transactionType: 'BUY',
        orderType: 'MARKET',
        phoneNumber: '',
      });
    } catch (err) {
      dispatch(setError('Failed to set up trading trigger'));
      console.error('Trading trigger setup error:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans mb-6">Set Target Order</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-xl rounded-2xl px-6 py-8">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
                  Symbol
                </label>
                <input
                  type="text"
                  id="symbol"
                  value={orderDetails.symbol}
                  onChange={(e) => setOrderDetails({ ...orderDetails, symbol: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="instrumentToken" className="block text-sm font-medium text-gray-700">
                  Instrument Token
                </label>
                <input
                  type="text"
                  id="instrumentToken"
                  value={orderDetails.instrumentToken}
                  onChange={(e) => setOrderDetails({ ...orderDetails, instrumentToken: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700">
                  Target Price
                </label>
                <input
                  type="number"
                  id="targetPrice"
                  value={orderDetails.targetPrice}
                  onChange={(e) => setOrderDetails({ ...orderDetails, targetPrice: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={orderDetails.quantity}
                  onChange={(e) => setOrderDetails({ ...orderDetails, quantity: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">
                  Transaction Type
                </label>
                <select
                  id="transactionType"
                  value={orderDetails.transactionType}
                  onChange={(e) => setOrderDetails({ ...orderDetails, transactionType: e.target.value as 'BUY' | 'SELL' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>

              <div>
                <label htmlFor="orderType" className="block text-sm font-medium text-gray-700">
                  Order Type
                </label>
                <select
                  id="orderType"
                  value={orderDetails.orderType}
                  onChange={(e) => setOrderDetails({ ...orderDetails, orderType: e.target.value as 'MARKET' | 'LIMIT' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="MARKET">Market</option>
                  <option value="LIMIT">Limit</option>
                </select>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number for Notifications
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={orderDetails.phoneNumber}
                  onChange={(e) => setOrderDetails({ ...orderDetails, phoneNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up...' : 'Set Target Order'}
              </button>
            </div>
          </form>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 font-sans">Active Target Orders</h3>
            </div>
            <div className="divide-y divide-gray-100">
              <ul>
                {orders.map((order) => (
                  <li key={order.id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{order.symbol}</p>
                      <p className="text-sm text-gray-500">Target: ₹{order.targetPrice}</p>
                      <p className="text-sm text-gray-500">
                        {order.transactionType} {order.quantity} @ {order.orderType}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'TRIGGERED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </li>
                ))}
                {orders.length === 0 && (
                  <li className="px-6 py-5 text-center text-gray-500">No active target orders</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetOrders;
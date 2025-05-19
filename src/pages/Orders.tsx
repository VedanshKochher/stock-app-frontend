import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, placeOrder, cancelOrder, resetPlaceOrderStatus, resetCancelOrderStatus } from '../store/slices/ordersSlice';
import { setQuotes, setLoading as setMarketLoading, setError as setMarketError } from '../store/slices/marketSlice';
import type { RootState, AppDispatch } from '../store';
import type { Order, PlaceOrderRequest } from '../services/orderService';
import axios from 'axios';
import { BASE_URL } from '../const';

interface MarketQuote {
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  depth: {
    buy: Array<{ quantity: number; price: number; orders: number }>;
    sell: Array<{ quantity: number; price: number; orders: number }>;
  };
  timestamp: string;
  instrumentToken: string;
  symbol: string;
  lastPrice: number;
  volume: number;
  averagePrice: number;
  oi: number;
  netChange: number;
  totalBuyQuantity: number;
  totalSellQuantity: number;
  lowerCircuitLimit: number;
  upperCircuitLimit: number;
  lastTradeTime: string;
  oiDayHigh: number;
  oiDayLow: number;
}

const Orders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, placeOrderStatus, cancelOrderStatus, placeOrderError, cancelOrderError } = useSelector(
    (state: RootState) => state.orders
  );
  const { quotes, loading: marketLoading, error: marketError } = useSelector(
    (state: RootState) => state.market
  );
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchSymbol, setSearchSymbol] = useState('');

  // State for order creation modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<PlaceOrderRequest>({
    quantity: 1,
    instrument_token: '',
    transaction_type: 'BUY',
    order_type: 'MARKET',
    product: 'D',
    validity: 'DAY',
    price: 0,
    disclosed_quantity: 0,
    trigger_price: 0,
    is_amo: false,
  });

  // State for notifications
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load orders on component mount
  useEffect(() => {
    if (token) {
      dispatch(fetchOrders(token));
    }
  }, [dispatch, token]);

  // Fetch market quotes
  const fetchQuotes = async () => {
    try {
      dispatch(setMarketLoading(true));
      const response = await axios.get(`${BASE_URL}/market-quotes`, {
        params: { instrument_key: searchSymbol },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(setQuotes(response.data.data));
    } catch (err) {
      dispatch(setMarketError('Failed to fetch market quotes'));
      console.error('Market quotes error:', err);
    } finally {
      dispatch(setMarketLoading(false));
    }
  };

  useEffect(() => {
    if (token) {
      fetchQuotes();
      const interval = setInterval(fetchQuotes, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [searchSymbol, token]);

  // Handle place order success/failure
  useEffect(() => {
    if (placeOrderStatus === 'succeeded') {
      setIsOrderModalOpen(false);
      setSuccessMessage('Order placed successfully');
      setShowSuccess(true);
      // Reset the form
      setNewOrder({
        quantity: 1,
        instrument_token: '',
        transaction_type: 'BUY',
        order_type: 'MARKET',
        product: 'D',
        validity: 'DAY',
        price: 0,
        disclosed_quantity: 0,
        trigger_price: 0,
        is_amo: false,
      });
      // Refresh orders
      if (token) dispatch(fetchOrders(token));
      // Reset status
      dispatch(resetPlaceOrderStatus());
    }
  }, [placeOrderStatus, dispatch, token]);

  // Handle cancel order success/failure
  useEffect(() => {
    if (cancelOrderStatus === 'succeeded') {
      setSuccessMessage('Order cancelled successfully');
      setShowSuccess(true);
      // Reset status
      dispatch(resetCancelOrderStatus());
    }
  }, [cancelOrderStatus, dispatch]);

  // Handle opening order creation modal
  const handleOpenOrderModal = () => {
    setIsOrderModalOpen(true);
  };

  // Handle closing order creation modal
  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  // Handle order input changes
  const handleOrderInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: name === 'quantity' || name === 'price' || name === 'trigger_price' || name === 'disclosed_quantity'
        ? Number(value)
        : name === 'is_amo'
        ? value === 'true'
        : value,
    });
  };

  // Handle submitting order creation
  const handleSubmitOrder = () => {
    if (token) {
      dispatch(placeOrder({ orderData: newOrder, token }));
    }
  };

  // Handle cancelling an order
  const handleCancelOrder = (order_id: string) => {
    console.log('Cancel order clicked, order_id:', order_id);
    if (token) {
      dispatch(cancelOrder({ order_id, token }));
    }
  };

  // Handle refreshing orders
  const handleRefreshOrders = () => {
    if (token) {
      dispatch(fetchOrders(token));
    }
  };

  // Handle quick buy
  const handleQuickBuy = (quote: MarketQuote) => {
    setNewOrder({
      quantity: 1,
      instrument_token: quote.instrumentToken,
      transaction_type: 'BUY',
      order_type: 'MARKET',
      product: 'D',
      validity: 'DAY',
      price: 0,
      disclosed_quantity: 0,
      trigger_price: 0,
      is_amo: false,
    });
    setIsOrderModalOpen(true);
  };

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Function to determine status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Log the orders array for debugging
  console.log('Orders array:', orders);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 py-4 rounded-xl shadow-sm mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Orders</h1>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-lg font-semibold shadow flex items-center transition-all duration-200"
              onClick={handleOpenOrderModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Order
            </button>
            <button
              className="border border-gray-300 bg-white text-gray-700 px-5 py-2 rounded-lg font-semibold flex items-center hover:bg-gray-50 shadow transition-all duration-200"
              onClick={handleRefreshOrders}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Market Quotes Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 font-sans">Market Quotes</h2>
            <div className="relative w-full sm:w-auto">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Enter symbol (e.g., NSE_EQ|INE528G01035)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                className="block w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition"
              />
            </div>
          </div>

          {marketError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm mb-4" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{marketError}</p>
                </div>
              </div>
            </div>
          )}

          {marketLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(quotes).map(([key, quote]) => (
                <div key={key} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-gray-100 flex flex-col h-full">
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 font-sans">{quote.symbol}</h3>
                        <p className="text-xs text-gray-400 font-mono">{quote.instrumentToken}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-gray-900">₹{quote.lastPrice}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${quote.netChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {quote.netChange >= 0 ? '+' : ''}{quote.netChange.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="text-base font-semibold text-gray-800">{quote.volume}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">OI</p>
                        <p className="text-base font-semibold text-gray-800">{quote.oi}</p>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <button
                        onClick={() => handleQuickBuy(quote)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-sans mb-6">Your Orders</h2>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm mb-4" role="alert">
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

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-700">No orders found</h2>
              <p className="text-gray-500 mt-2">Click "New Order" to place an order</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instrument</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order: Order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.tradingSymbol || order.symbol || order.instrument_token}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-semibold ${order.transaction_type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                            {order.transaction_type} ({order.order_type})
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.price || order.average_price || 'Market Price'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                          {order.status_message && (
                            <div className="mt-1 text-xs text-gray-500">{order.status_message}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.order_timestamp)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleCancelOrder(order.order_id)}
                            disabled={
                              order.status.toUpperCase() === 'REJECTED' ||
                              order.status.toUpperCase() === 'CANCELLED' ||
                              order.status.toUpperCase() === 'COMPLETE' ||
                              cancelOrderStatus === 'loading'
                            }
                            className={`text-red-600 hover:text-red-900 ${
                              order.status.toUpperCase() === 'REJECTED' ||
                              order.status.toUpperCase() === 'CANCELLED' ||
                              order.status.toUpperCase() === 'COMPLETE' ||
                              cancelOrderStatus === 'loading'
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Order Creation Modal */}
        {isOrderModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-2xl rounded-2xl bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Place New Order</h3>
                <button onClick={handleCloseOrderModal} className="text-gray-400 hover:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-2 space-y-4">
                <div>
                  <label htmlFor="instrument_token" className="block text-sm font-medium text-gray-700">Instrument Token</label>
                  <input
                    type="text"
                    id="instrument_token"
                    name="instrument_token"
                    value={newOrder.instrument_token}
                    onChange={handleOrderInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Example: NSE_EQ|INE528G01035</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-700">Transaction Type</label>
                    <select
                      id="transaction_type"
                      name="transaction_type"
                      value={newOrder.transaction_type}
                      onChange={handleOrderInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="order_type" className="block text-sm font-medium text-gray-700">Order Type</label>
                    <select
                      id="order_type"
                      name="order_type"
                      value={newOrder.order_type}
                      onChange={handleOrderInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="MARKET">MARKET</option>
                      <option value="LIMIT">LIMIT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700">Product</label>
                    <select
                      id="product"
                      name="product"
                      value={newOrder.product}
                      onChange={handleOrderInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="D">Delivery (D)</option>
                      <option value="I">Intraday (I)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="validity" className="block text-sm font-medium text-gray-700">Validity</label>
                    <select
                      id="validity"
                      name="validity"
                      value={newOrder.validity}
                      onChange={handleOrderInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="DAY">DAY</option>
                      <option value="IOC">IOC</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={newOrder.quantity}
                      onChange={handleOrderInputChange}
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={newOrder.price}
                      onChange={handleOrderInputChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Set to 0 for market orders</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="trigger_price" className="block text-sm font-medium text-gray-700">Trigger Price</label>
                    <input
                      type="number"
                      id="trigger_price"
                      name="trigger_price"
                      value={newOrder.trigger_price}
                      onChange={handleOrderInputChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="disclosed_quantity" className="block text-sm font-medium text-gray-700">Disclosed Quantity</label>
                    <input
                      type="number"
                      id="disclosed_quantity"
                      name="disclosed_quantity"
                      value={newOrder.disclosed_quantity}
                      onChange={handleOrderInputChange}
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="is_amo" className="block text-sm font-medium text-gray-700">After Market Order</label>
                  <select
                    id="is_amo"
                    name="is_amo"
                    value={newOrder.is_amo ? 'true' : 'false'}
                    onChange={handleOrderInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                {placeOrderError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                    <p>{placeOrderError}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={handleCloseOrderModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={placeOrderStatus === 'loading' || !newOrder.instrument_token || !newOrder.quantity}
                  className={`px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow transition-all duration-200 ${
                    placeOrderStatus === 'loading' || !newOrder.instrument_token || !newOrder.quantity
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {placeOrderStatus === 'loading' ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md" role="alert">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>{successMessage}</p>
              <button onClick={() => setShowSuccess(false)} className="ml-auto">
                <svg className="h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Toast for Cancel Order */}
        {cancelOrderError && (
          <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{cancelOrderError}</p>
              <button onClick={() => dispatch(resetCancelOrderStatus())} className="ml-auto">
                <svg className="h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
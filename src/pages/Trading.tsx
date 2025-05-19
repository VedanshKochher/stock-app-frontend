import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../const';

const Trading = () => {
  const [orderDetails, setOrderDetails] = useState({
    instrumentKey: '',
    quantity: '',
    transactionType: 'BUY',
    orderType: 'MARKET',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${BASE_URL}/place-order`, {
        ...orderDetails,
        quantity: parseInt(orderDetails.quantity),
        price: orderDetails.orderType === 'LIMIT' ? parseFloat(orderDetails.price) : 0,
      });

      setSuccess('Order placed successfully!');
      setOrderDetails({
        instrumentKey: '',
        quantity: '',
        transactionType: 'BUY',
        orderType: 'MARKET',
        price: '',
      });
    } catch (err) {
      setError('Failed to place order');
      console.error('Order placement error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Place Order</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="instrumentKey" className="block text-sm font-medium text-gray-700">
              Instrument Key
            </label>
            <input
              type="text"
              id="instrumentKey"
              value={orderDetails.instrumentKey}
              onChange={(e) => setOrderDetails({ ...orderDetails, instrumentKey: e.target.value })}
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
              onChange={(e) => setOrderDetails({ ...orderDetails, transactionType: e.target.value })}
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
              onChange={(e) => setOrderDetails({ ...orderDetails, orderType: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="MARKET">Market</option>
              <option value="LIMIT">Limit</option>
            </select>
          </div>

          {orderDetails.orderType === 'LIMIT' && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                id="price"
                value={orderDetails.price}
                onChange={(e) => setOrderDetails({ ...orderDetails, price: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Trading;
import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../const';

const Alerts = () => {
  const [alertDetails, setAlertDetails] = useState({
    instrumentKey: '',
    targetPrice: '',
    notificationType: 'SMS',
    phoneNumber: '',
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
      await axios.post(`${BASE_URL}/setup-price-alert`, {
        ...alertDetails,
        targetPrice: parseFloat(alertDetails.targetPrice),
      });

      setSuccess('Price alert set up successfully!');
      setAlertDetails({
        instrumentKey: '',
        targetPrice: '',
        notificationType: 'SMS',
        phoneNumber: '',
      });
    } catch (err) {
      setError('Failed to set up price alert');
      console.error('Alert setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans mb-6">Set Price Alert</h1>

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

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-sm mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-xl rounded-2xl px-6 py-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="instrumentKey" className="block text-sm font-medium text-gray-700">
                Instrument Key
              </label>
              <input
                type="text"
                id="instrumentKey"
                value={alertDetails.instrumentKey}
                onChange={(e) => setAlertDetails({ ...alertDetails, instrumentKey: e.target.value })}
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
                value={alertDetails.targetPrice}
                onChange={(e) => setAlertDetails({ ...alertDetails, targetPrice: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={alertDetails.phoneNumber}
                onChange={(e) => setAlertDetails({ ...alertDetails, phoneNumber: e.target.value })}
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
              {loading ? 'Setting up Alert...' : 'Set Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Alerts;
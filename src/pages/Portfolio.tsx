import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import axios from 'axios';
import { BASE_URL } from '../const';

interface Holding {
  symbol: string;
  quantity: number;
  avg_price: number;
  last_price: number;
  pnl: number;
  investment: number;
}

interface Position {
  symbol: string;
  quantity: number;
  avg_price: number;
  last_price: number;
  pnl: number;
  investment: number;
}

const Portfolio = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError('');
      try {
        const [holdingsRes, positionsRes] = await Promise.all([
          axios.get(`${BASE_URL}/portfolio/holdings`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/portfolio/positions`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setHoldings(holdingsRes.data.holdings || []);
        setPositions(positionsRes.data.positions || []);
      } catch (err) {
          setError('Failed to fetch portfolio data');
          console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPortfolio();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-2 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans mb-6 text-center">Portfolio</h1>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm mb-4 text-center">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Holdings</h2>
              {holdings.length === 0 ? (
                <div className="text-gray-500 text-center">No holdings found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Last Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {holdings.map((h) => (
                        <tr key={h.symbol} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{h.symbol}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{h.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">₹{h.avg_price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">₹{h.last_price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">₹{h.investment.toFixed(2)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${h.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{h.pnl >= 0 ? '+' : ''}₹{h.pnl.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Positions</h2>
              {positions.length === 0 ? (
                <div className="text-gray-500 text-center">No open positions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Last Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {positions.map((p) => (
                        <tr key={p.symbol} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.symbol}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{p.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">₹{p.avg_price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">₹{p.last_price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">₹{p.investment.toFixed(2)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${p.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{p.pnl >= 0 ? '+' : ''}₹{p.pnl.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
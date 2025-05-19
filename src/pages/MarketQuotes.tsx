import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { setQuotes, setLoading, setError } from '../store/slices/marketSlice';
import axios from 'axios';
import { BASE_URL } from '../const';
import nseData from '../data/nse.json';

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

const MarketQuotes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quotes, loading, error } = useSelector((state: RootState) => state.market);
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchSymbol, setSearchSymbol] = useState('');

  const fetchQuotes = async () => {
    try {
      dispatch(setLoading(true));
      const instrumentKeys = nseData.stocks.map(stock => stock.instrument_key).join(',');
      const response = await axios.get(`${BASE_URL}/market-quotes`, {
        params: { instrument_key: instrumentKeys },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(setQuotes(response.data.data));
    } catch (err) {
      dispatch(setError('Failed to fetch market quotes'));
      console.error('Market quotes error:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSetTargetOrder = (quote: MarketQuote) => {
    navigate('/target-orders', {
      state: {
        preFilledData: {
          instrumentToken: quote.instrumentToken,
          symbol: quote.symbol,
          targetPrice: quote.lastPrice,
          quantity: '',
          transactionType: 'BUY' as const,
          orderType: 'MARKET' as const,
          email: '',
        }
      }
    });
  };

  const filteredQuotes = Object.entries(quotes).filter(([, quote]) =>
    searchSymbol === '' ||
    quote.symbol.toLowerCase().includes(searchSymbol.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 py-4 rounded-xl shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Market Quotes</h1>
          <div className="flex items-center w-full sm:w-auto">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by symbol..."
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                className="block w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
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

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredQuotes.map(([key, quote]) => (
              <div
                key={key}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-gray-100 flex flex-col h-full"
              >
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
                    <div>
                      <p className="text-xs text-gray-500">High</p>
                      <p className="text-base font-semibold text-gray-800">₹{quote.ohlc.high}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Low</p>
                      <p className="text-base font-semibold text-gray-800">₹{quote.ohlc.low}</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleSetTargetOrder(quote)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Set Target Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketQuotes;
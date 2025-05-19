import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface DepthEntry {
  quantity: number;
  price: number;
  orders: number;
}

interface Depth {
  buy: DepthEntry[];
  sell: DepthEntry[];
}

interface MarketQuote {
  ohlc: OHLC;
  depth: Depth;
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

interface MarketState {
  quotes: Record<string, MarketQuote>;
  loading: boolean;
  error: string | null;
}

const initialState: MarketState = {
  quotes: {},
  loading: false,
  error: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setQuotes: (state, action: PayloadAction<Record<string, MarketQuote>>) => {
      state.quotes = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setQuotes, setLoading, setError } = marketSlice.actions;
export default marketSlice.reducer;
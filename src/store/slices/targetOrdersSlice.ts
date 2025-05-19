import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface TargetOrder {
  id: string;
  instrumentToken: string;
  symbol: string;
  targetPrice: number;
  quantity: number;
  transactionType: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  status: 'PENDING' | 'TRIGGERED' | 'COMPLETED' | 'FAILED';
  email: string;
  createdAt: string;
}

interface TargetOrdersState {
  orders: TargetOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: TargetOrdersState = {
  orders: [],
  loading: false,
  error: null,
};

const targetOrdersSlice = createSlice({
  name: 'targetOrders',
  initialState,
  reducers: {
    addTargetOrder: (state, action: PayloadAction<TargetOrder>) => {
      state.orders.push(action.payload);
      state.error = null;
    },
    updateTargetOrder: (state, action: PayloadAction<{ id: string; updates: Partial<TargetOrder> }>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...action.payload.updates };
      }
    },
    removeTargetOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
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

export const { addTargetOrder, updateTargetOrder, removeTargetOrder, setLoading, setError } = targetOrdersSlice.actions;
export default targetOrdersSlice.reducer;
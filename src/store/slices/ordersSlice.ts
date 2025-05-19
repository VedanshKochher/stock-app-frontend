import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';
import type { Order, OrderBook, PlaceOrderRequest } from '../../services/orderService';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  placeOrderStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  cancelOrderStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  placeOrderError: string | null;
  cancelOrderError: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  placeOrderStatus: 'idle',
  cancelOrderStatus: 'idle',
  placeOrderError: null,
  cancelOrderError: null
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (token: string, { rejectWithValue }) => {
    try {
      const orderBook = await orderService.getOrderBook(token);
      return orderBook;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async ({ orderData, token }: { orderData: PlaceOrderRequest, token: string }, { rejectWithValue }) => {
    try {
      const response = await orderService.placeOrder(orderData, token);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ order_id, token }: { order_id: string, token: string }, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(order_id, token);
      return { response, order_id };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetPlaceOrderStatus: (state) => {
      state.placeOrderStatus = 'idle';
      state.placeOrderError = null;
    },
    resetCancelOrderStatus: (state) => {
      state.cancelOrderStatus = 'idle';
      state.cancelOrderError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<OrderBook>) => {
        state.loading = false;
        state.orders = action.payload.data || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Place order
      .addCase(placeOrder.pending, (state) => {
        state.placeOrderStatus = 'loading';
        state.placeOrderError = null;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.placeOrderStatus = 'succeeded';
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placeOrderStatus = 'failed';
        state.placeOrderError = action.payload as string;
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.cancelOrderStatus = 'loading';
        state.cancelOrderError = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelOrderStatus = 'succeeded';
        // Update the local state by removing the cancelled order
        if (action.payload.order_id) {
          state.orders = state.orders.filter(order => order.order_id !== action.payload.order_id);
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelOrderStatus = 'failed';
        state.cancelOrderError = action.payload as string;
      });
  },
});

export const { resetPlaceOrderStatus, resetCancelOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
import axios from 'axios';
import { BASE_URL } from '../const';

// Define order interfaces
export interface Order {
  order_id: string;
  exchange_order_id?: string;
  status: string;
  instrument_token: string;
  symbol?: string;
  tradingSymbol?: string;
  quantity: number;
  price?: number;
  product: string;
  transaction_type: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT';
  average_price?: number;
  placed_by?: string;
  disclosed_quantity?: number;
  order_timestamp?: string;
  exchange_timestamp?: string;
  validity?: string;
  trigger_price?: number;
  status_message?: string;
  status_message_raw?: string;
  variety?: string;
  is_amo?: boolean;
  order_request_id?: string;
  order_ref_id?: string;
}

export interface OrderBook {
  status: string;
  data: Order[];
}

export interface PlaceOrderRequest {
  quantity: number;
  instrument_token: string;
  order_type: 'MARKET' | 'LIMIT';
  transaction_type: 'BUY' | 'SELL';
  price?: number;
  trigger_price?: number;
  disclosed_quantity?: number;
  validity?: string;
  product?: string;
  is_amo?: boolean;
}

export interface OrderResponse {
  status: string;
  data?: {
    order_id?: string;
    message?: string;
  };
  message?: string;
}

// Order service class
class OrderService {
  getOrderBook = async (token: string): Promise<OrderBook> => {
    try {
      const response = await axios.get(`${BASE_URL}/get-order-book`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order book:', error);
      throw error;
    }
  };

  placeOrder = async (orderData: PlaceOrderRequest, token: string): Promise<OrderResponse> => {
    try {
      const response = await axios.post(`${BASE_URL}/place-order`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  };

  cancelOrder = async (orderId: string, token: string): Promise<OrderResponse> => {
    try {
      const response = await axios.post(`${BASE_URL}/cancel-order`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  };
}

export const orderService = new OrderService();
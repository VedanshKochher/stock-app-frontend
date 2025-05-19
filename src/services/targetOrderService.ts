import { store } from '../store';
import { updateTargetOrder } from '../store/slices/targetOrdersSlice';
import axios from 'axios';
import { BASE_URL } from '../const';

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

class TargetOrderService {
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private readonly CHECK_INTERVAL_MS = 5000; // Check every 5 seconds

  startMonitoring() {
    if (this.checkInterval) {
      return; // Already monitoring
    }

    this.checkInterval = setInterval(() => {
      this.checkTargetOrders();
    }, this.CHECK_INTERVAL_MS);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkTargetOrders() {
    const state = store.getState();
    const { orders } = state.targetOrders;
    const { quotes } = state.market;

    for (const order of orders) {
      if (order.status !== 'PENDING') {
        continue;
      }

      const quote = quotes[order.instrumentToken];
      if (!quote) {
        continue;
      }

      const currentPrice = quote.lastPrice;
      const shouldTrigger = this.shouldTriggerOrder(order, currentPrice);

      if (shouldTrigger) {
        await this.executeOrder(order);
      }
    }
  }

  private shouldTriggerOrder(order: TargetOrder, currentPrice: number): boolean {
    if (order.transactionType === 'BUY') {
      return currentPrice <= order.targetPrice;
    } else {
      return currentPrice >= order.targetPrice;
    }
  }

  private async executeOrder(order: TargetOrder) {
    try {
      // Update order status to TRIGGERED
      store.dispatch(updateTargetOrder({
        id: order.id,
        updates: { status: 'TRIGGERED' }
      }));

      // Place the actual order
      await axios.post(`${BASE_URL}/place-order`, {
        instrumentKey: order.instrumentToken,
        quantity: order.quantity,
        transactionType: order.transactionType,
        orderType: order.orderType,
        price: order.orderType === 'LIMIT' ? order.targetPrice : 0,
      });

      // Update order status to COMPLETED
      store.dispatch(updateTargetOrder({
        id: order.id,
        updates: { status: 'COMPLETED' }
      }));

      // Send email notification
      await axios.post(`${BASE_URL}/send-notification`, {
        email: order.email,
        subject: 'Target Order Executed',
        message: `Your target order for ${order.symbol} has been executed successfully.\n
                 Transaction Type: ${order.transactionType}\n
                 Quantity: ${order.quantity}\n
                 Price: ${order.targetPrice}\n
                 Order Type: ${order.orderType}`
      });

    } catch (error) {
      console.error('Error executing target order:', error);

      // Update order status to FAILED
      store.dispatch(updateTargetOrder({
        id: order.id,
        updates: { status: 'FAILED' }
      }));

      // Send failure notification
      await axios.post(`${BASE_URL}/send-notification`, {
        email: order.email,
        subject: 'Target Order Failed',
        message: `Your target order for ${order.symbol} failed to execute.\n
                 Please check your account or contact support for assistance.`
      });
    }
  }
}

export const targetOrderService = new TargetOrderService();
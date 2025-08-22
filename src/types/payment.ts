export interface Payment {
  id: string;
  booking_id: string;
  paytech_transaction_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  payment_method: string | null;
  error_message: string | null;
  paytech_response: any | null;
  created_at: string;
  updated_at: string;
}
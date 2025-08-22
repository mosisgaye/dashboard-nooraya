export interface Booking {
  id: string;
  user_id: string | null;
  booking_type: 'flight' | 'hotel' | 'package';
  external_booking_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed';
  total_amount: number;
  currency: string;
  passenger_details: any | null;
  flight_details: any | null;
  guest_email: string | null;
  guest_phone: string | null;
  created_at: string;
  updated_at: string;
  base_amount: number | null;
  commission_percentage: number | null;
  commission_amount: number | null;
  display_currency: string | null;
  // Champs virtuels pour compatibilité
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
}
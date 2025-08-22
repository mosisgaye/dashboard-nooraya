export interface Customer {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  booking_count: number;
  total_spent: number;
  last_booking_date: string | null;
  tags: string[] | null;
  notes: string | null;
}
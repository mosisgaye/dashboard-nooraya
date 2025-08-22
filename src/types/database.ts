export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          user_id: string | null
          booking_type: 'flight' | 'hotel' | 'package'
          external_booking_id: string | null
          status: 'pending' | 'confirmed' | 'cancelled' | 'failed'
          total_amount: number
          currency: string
          passenger_details: Json | null
          flight_details: Json | null
          guest_email: string | null
          guest_phone: string | null
          created_at: string
          updated_at: string
          base_amount: number | null
          commission_percentage: number | null
          commission_amount: number | null
          display_currency: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          booking_type: 'flight' | 'hotel' | 'package'
          external_booking_id?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'failed'
          total_amount: number
          currency?: string
          passenger_details?: Json | null
          flight_details?: Json | null
          guest_email?: string | null
          guest_phone?: string | null
          created_at?: string
          updated_at?: string
          base_amount?: number | null
          commission_percentage?: number | null
          commission_amount?: number | null
          display_currency?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          booking_type?: 'flight' | 'hotel' | 'package'
          external_booking_id?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'failed'
          total_amount?: number
          currency?: string
          passenger_details?: Json | null
          flight_details?: Json | null
          guest_email?: string | null
          guest_phone?: string | null
          created_at?: string
          updated_at?: string
          base_amount?: number | null
          commission_percentage?: number | null
          commission_amount?: number | null
          display_currency?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          paytech_transaction_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'success' | 'failed' | 'cancelled'
          payment_method: string | null
          error_message: string | null
          paytech_response: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          paytech_transaction_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'success' | 'failed' | 'cancelled'
          payment_method?: string | null
          error_message?: string | null
          paytech_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          paytech_transaction_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'success' | 'failed' | 'cancelled'
          payment_method?: string | null
          error_message?: string | null
          paytech_response?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      commission_settings: {
        Row: {
          id: string
          service_type: string
          commission_percentage: number
          fixed_amount: number | null
          currency: string | null
          is_active: boolean | null
          valid_from: string | null
          valid_until: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          service_type: string
          commission_percentage: number
          fixed_amount?: number | null
          currency?: string | null
          is_active?: boolean | null
          valid_from?: string | null
          valid_until?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          service_type?: string
          commission_percentage?: number
          fixed_amount?: number | null
          currency?: string | null
          is_active?: boolean | null
          valid_from?: string | null
          valid_until?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      commission_history: {
        Row: {
          id: string
          booking_id: string | null
          service_type: string
          base_amount: number
          commission_percentage: number
          commission_amount: number
          total_amount: number
          currency: string
          exchange_rate: number | null
          calculation_details: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          booking_id?: string | null
          service_type: string
          base_amount: number
          commission_percentage: number
          commission_amount: number
          total_amount: number
          currency: string
          exchange_rate?: number | null
          calculation_details?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string | null
          service_type?: string
          base_amount?: number
          commission_percentage?: number
          commission_amount?: number
          total_amount?: number
          currency?: string
          exchange_rate?: number | null
          calculation_details?: Json | null
          created_at?: string | null
        }
      }
      commission_rates: {
        Row: {
          id: string
          product_type: 'flight' | 'hotel' | 'package'
          rate_type: 'percentage' | 'fixed'
          rate_value: number
          min_amount: number | null
          max_amount: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_type: 'flight' | 'hotel' | 'package'
          rate_type: 'percentage' | 'fixed'
          rate_value: number
          min_amount?: number | null
          max_amount?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_type?: 'flight' | 'hotel' | 'package'
          rate_type?: 'percentage' | 'fixed'
          rate_value?: number
          min_amount?: number | null
          max_amount?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: 'info' | 'warning' | 'error' | 'success' | 'action_required'
          category: 'booking' | 'payment' | 'customer' | 'system' | 'commission' | 'alert'
          title: string
          message: string
          action_url: string | null
          action_label: string | null
          related_entity_id: string | null
          related_entity_type: 'booking' | 'customer' | 'payment' | 'commission' | 'alert' | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          is_read: boolean
          is_archived: boolean
          metadata: Json | null
          created_at: string
          read_at: string | null
          archived_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: 'info' | 'warning' | 'error' | 'success' | 'action_required'
          category: 'booking' | 'payment' | 'customer' | 'system' | 'commission' | 'alert'
          title: string
          message: string
          action_url?: string | null
          action_label?: string | null
          related_entity_id?: string | null
          related_entity_type?: 'booking' | 'customer' | 'payment' | 'commission' | 'alert' | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          is_read?: boolean
          is_archived?: boolean
          metadata?: Json | null
          created_at?: string
          read_at?: string | null
          archived_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: 'info' | 'warning' | 'error' | 'success' | 'action_required'
          category?: 'booking' | 'payment' | 'customer' | 'system' | 'commission' | 'alert'
          title?: string
          message?: string
          action_url?: string | null
          action_label?: string | null
          related_entity_id?: string | null
          related_entity_type?: 'booking' | 'customer' | 'payment' | 'commission' | 'alert' | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          is_read?: boolean
          is_archived?: boolean
          metadata?: Json | null
          created_at?: string
          read_at?: string | null
          archived_at?: string | null
          expires_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
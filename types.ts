import React from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PricingTier {
  type: 'Weekday' | 'Weekend';
  rate: number;
}

export interface Amenity {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  hour: number; // 24h format start time
  period: 'Morning' | 'Afternoon' | 'Evening';
}

export type BookingStatus = 'pending' | 'confirmed' | 'failed';

export interface Booking {
  id?: string;
  turfId: string; // For future multi-turf support
  date: string; // YYYY-MM-DD
  slotIds: string[];
  status: BookingStatus;
  paymentId?: string;
  orderId?: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  createdAt: number;
}

export interface BookingState {
  name: string;
  phone: string;
  date: string;
  selectedSlotIds: string[];
}
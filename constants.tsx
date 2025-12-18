import React from 'react';
import { Lightbulb, Car, Droplets, Coffee, Zap, ShieldCheck } from 'lucide-react';
import { Amenity, TimeSlot } from './types';

export const CONTACT_PHONE = "919840500943"; // Updated contact number
export const LOCATION_MAP_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.732386407074!2d72.855!3d19.075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMwLjAiTiA3MsKwNTEnMTguMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin";

export const PRICING = {
  WEEKDAY: 1200,
  WEEKEND: 1600,
};

export const AMENITIES: Amenity[] = [
  {
    icon: <Zap className="w-6 h-6 text-turf-green" />,
    title: "Pro Floodlights",
    description: "FIFA-grade LED lighting for perfect night matches."
  },
  {
    icon: <Car className="w-6 h-6 text-turf-green" />,
    title: "Free Parking",
    description: "Ample space for bikes and cars within premises."
  },
  {
    icon: <Droplets className="w-6 h-6 text-turf-green" />,
    title: "Clean Washrooms",
    description: "Hygienic changing rooms and shower facilities."
  },
  {
    icon: <Coffee className="w-6 h-6 text-turf-green" />,
    title: "Refreshments",
    description: "Energy drinks and snacks available at the turf."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-turf-green" />,
    title: "Premium Turf",
    description: "50mm high-density grass for injury-free play."
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-turf-green" />,
    title: "Power Backup",
    description: "Uninterrupted gameplay with full generator support."
  }
];

// Generate slots from 6 AM to 12 AM (24-hour safe)
export const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const startHour = i + 6; // 6 → 23
  const endHour = startHour + 1;

  const format = (h: number) => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  let period: 'Morning' | 'Afternoon' | 'Evening' = 'Morning';
  if (startHour >= 12 && startHour < 17) period = 'Afternoon';
  if (startHour >= 17) period = 'Evening';

  return {
    id: `slot-${startHour}`,
    label: `${format(startHour)} - ${format(endHour === 24 ? 0 : endHour)}`,
    hour: startHour,        // 🔥 TRUE 24H VALUE
    period,
  };
});

export const GALLERY_IMAGES = [
  "https://picsum.photos/800/600?random=1",
  "https://picsum.photos/800/600?random=2",
  "https://picsum.photos/800/600?random=3",
  "https://picsum.photos/800/600?random=4",
  "https://picsum.photos/800/600?random=5",
  "https://picsum.photos/800/600?random=6",
];

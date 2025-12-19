export enum TravelStyle {
  STANDARD = 'standard',
  DEEP = 'deep',
  BUDGET = 'budget',
  LUXURY = 'luxury',
  FOODIE = 'foodie'
}

export enum TransportMode {
  PUBLIC = 'public_transport',
  CAR = 'rental_car',
  SCOOTER = 'rental_scooter'
}

export enum ActivityType {
  SIGHTSEEING = 'sightseeing',
  FOOD = 'food',
  TRANSPORT = 'transport',
  REST = 'rest',
  SHOPPING = 'shopping',
  EVENT = 'special_event'
}

export type Language = 'zh-TW' | 'en';

export interface Restaurant {
  name: string;
  hours: string;
  price: string;
  rating: string; // e.g. "4.5"
  travelTime: string; // Time from previous attraction
  googleMapsQuery: string;
  mustTry?: string; // Recommended dish
}

export interface Activity {
  time: string;
  activity: string;
  description: string;
  location: string;
  type: ActivityType;
  estimatedCost?: string;
  travelTimeFromPrevious?: string; 
  travelAdvice?: string;
  googleMapsQuery: string;
  imagePrompt: string; 
  restaurantOptions?: Restaurant[]; 
  isSpecialEvent?: boolean; 
}

export interface DayPlan {
  dayNumber: number;
  date?: string; 
  title: string;
  theme: string;
  activities: Activity[];
}

export interface Accommodation {
  name: string;
  location: string;
  description: string;
  pricePerNight: string;
  reason: string;
  googleMapsQuery: string;
  rating: string; // New: Star rating
  reviews: string[]; // New: Top 3 review snippets
}

export interface TripPlan {
  destination: string;
  startDate?: string;
  endDate?: string;
  duration: string;
  style: string;
  transportMode: string;
  summary: string;
  totalBudgetEstimate: string;
  accommodations: Accommodation[]; 
  days: DayPlan[];
  language?: Language; 
}

export interface TripFormData {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  style: TravelStyle;
  transportMode: string;
  language: Language; 
  customPreferences?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}


export interface DutyShiftData {
  id?: string; // Firestore document ID
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  is24hs: boolean;
  notes?: string;
  // Timestamps might be present from Firestore but not always used directly in this interface
  createdAt?: any; 
  updatedAt?: any;
}

export interface FixedHours {
  lunes?: string;
  martes?: string;
  miercoles?: string;
  jueves?: string;
  viernes?: string;
  sabado?: string;
  domingo?: string;
}

export interface Pharmacy {
  id: string; // Firestore document UID from 'pharmacies' collection
  name: string;
  address: string;
  phone: string;
  province: string;
  municipality: string;
  email?: string; 
  fixedHours?: FixedHours;
  dutyShifts?: DutyShiftData[];
  dutyHours?: string; // Original field, now primarily for initial mock data or specific display cases. Logic should use fixedHours/dutyShifts.
  lat?: number;
  lng?: number;
}

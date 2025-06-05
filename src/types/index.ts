export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  dutyHours: string; // e.g., "08:00 - 22:00" or "24hs"
  province: string;
  municipality: string;
  lat?: number; // Optional latitude
  lng?: number; // Optional longitude
}

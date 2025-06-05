import type { Pharmacy } from '@/types';

export const mockPharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'Farmacia Central La Plata',
    address: 'Calle 7 N° 1234, La Plata',
    phone: '0221-456-7890',
    dutyHours: '08:00 - 22:00', // Example specific hours
    province: 'Buenos Aires',
    municipality: 'La Plata',
    lat: -34.9214,
    lng: -57.9545
  },
  {
    id: '2',
    name: 'Farmacia Avenida Siempre Viva',
    address: 'Av. 51 N° 789, La Plata',
    phone: '0221-444-5555',
    dutyHours: '24hs',
    province: 'Buenos Aires',
    municipality: 'La Plata',
    lat: -34.9180,
    lng: -57.9500
  },
  {
    id: '3',
    name: 'Farmacia Del Pueblo Tolosa',
    address: 'Calle 2 N° 567, Tolosa, La Plata',
    phone: '0221-422-3311',
    dutyHours: '09:00 - 21:00', // Example specific hours, might be currently closed
    province: 'Buenos Aires',
    municipality: 'La Plata',
  },
  {
    id: '4',
    name: 'Farmacia Salud Palermo',
    address: 'Av. Santa Fe 3450, Palermo, CABA',
    phone: '011-4888-9900',
    dutyHours: '24hs',
    province: 'CABA',
    municipality: 'Palermo',
  },
  {
    id: '5',
    name: 'Farmacia Norte Belgrano',
    address: 'Av. Cabildo 1230, Belgrano, CABA',
    phone: '011-4777-6655',
    dutyHours: '10:00 - 20:00',
    province: 'CABA',
    municipality: 'Belgrano',
  },
  {
    id: '6',
    name: 'Farmacia Nueva Córdoba',
    address: 'Bv. Chacabuco 550, Nueva Córdoba, Córdoba',
    phone: '0351-433-2211',
    dutyHours: '24hs',
    province: 'Córdoba',
    municipality: 'Córdoba Capital',
  },
  {
    id: '7',
    name: 'Farmacia Alberdi Centro',
    address: 'Av. Colón 800, Alberdi, Córdoba',
    phone: '0351-421-9876',
    dutyHours: '08:30 - 22:30',
    province: 'Córdoba',
    municipality: 'Córdoba Capital',
  },
  {
    id: '8',
    name: 'Farmacia Rosario Centro',
    address: 'Peatonal Córdoba 1050, Rosario',
    phone: '0341-466-5544',
    dutyHours: '24hs',
    province: 'Santa Fe',
    municipality: 'Rosario',
  },
  {
    id: '9',
    name: 'Farmacia Echesortu',
    address: 'Mendoza 4500, Echesortu, Rosario',
    phone: '0341-430-1234',
    dutyHours: '09:00 - 13:00', // Example short hours, likely closed
    province: 'Santa Fe',
    municipality: 'Rosario',
  },
  {
    id: '10',
    name: 'Farmacia Ciudad Mendoza',
    address: 'Av. San Martín 900, Mendoza Capital',
    phone: '0261-450-6789',
    dutyHours: '24hs',
    province: 'Mendoza',
    municipality: 'Mendoza Capital',
  },
];

export const provinces = [...new Set(mockPharmacies.map(p => p.province))].sort();

export const getMunicipalities = (province: string): string[] => {
  if (!province) return [];
  return [...new Set(mockPharmacies.filter(p => p.province === province).map(p => p.municipality))].sort();
};

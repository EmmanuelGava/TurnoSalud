
'use server';

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import type { Pharmacy, DutyShiftData, FixedHours } from '@/types';

export async function fetchPharmaciesWithShifts(): Promise<Pharmacy[]> {
  const pharmaciesCollectionRef = collection(db, 'pharmacies');
  const pharmacySnapshots = await getDocs(pharmaciesCollectionRef);
  const pharmaciesList: Pharmacy[] = [];

  for (const pharmacyDoc of pharmacySnapshots.docs) {
    const pharmacyData = pharmacyDoc.data();
    const dutyShiftsCollectionRef = collection(db, 'pharmacies', pharmacyDoc.id, 'dutyShifts');
    const dutyShiftSnapshots = await getDocs(dutyShiftsCollectionRef);
    
    const dutyShifts: DutyShiftData[] = dutyShiftSnapshots.docs.map(shiftDoc => ({
      id: shiftDoc.id,
      ...shiftDoc.data(),
    } as DutyShiftData));

    // Construct the pharmacy object ensuring all fields from the type are considered
    const pharmacy: Pharmacy = {
      id: pharmacyDoc.id,
      name: pharmacyData.name || 'Nombre no disponible',
      address: pharmacyData.address || 'Dirección no disponible',
      phone: pharmacyData.phone || 'Teléfono no disponible',
      province: pharmacyData.province || 'Provincia no disponible',
      municipality: pharmacyData.municipality || 'Municipio no disponible',
      email: pharmacyData.email || undefined,
      fixedHours: pharmacyData.fixedHours as FixedHours || {},
      dutyShifts: dutyShifts,
      // The old 'dutyHours' string is not directly available from Firestore profile/shifts in the same way.
      // It can be dynamically determined or omitted if not essential for initial display.
      // For now, let's leave it potentially undefined for Firestore-fetched pharmacies.
      // dutyHours: pharmacyData.displayableDutyHours || undefined, // Example if we decided to store a summary string
      lat: pharmacyData.lat || undefined,
      lng: pharmacyData.lng || undefined,
    };
    pharmaciesList.push(pharmacy);
  }
  return pharmaciesList;
}

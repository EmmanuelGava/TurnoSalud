
'use server';

import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import type { Pharmacy, DutyShiftData, FixedHours } from '@/types';

export async function fetchPharmaciesWithShifts(): Promise<Pharmacy[]> {
  const pharmaciesCollectionRef = collection(db, 'pharmacies');
  const pharmacySnapshots = await getDocs(pharmaciesCollectionRef);
  const pharmaciesList: Pharmacy[] = [];

  for (const pharmacyDoc of pharmacySnapshots.docs) {
    const pharmacyData = pharmacyDoc.data();
    const dutyShiftsQuery = query(collection(db, 'pharmacies', pharmacyDoc.id, 'dutyShifts'), orderBy('date', 'asc'));
    const dutyShiftSnapshots = await getDocs(dutyShiftsQuery);
    
    const dutyShifts: DutyShiftData[] = dutyShiftSnapshots.docs.map(shiftDoc => ({
      id: shiftDoc.id,
      ...shiftDoc.data(),
    } as DutyShiftData));

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
      lat: pharmacyData.lat || undefined,
      lng: pharmacyData.lng || undefined,
    };
    pharmaciesList.push(pharmacy);
  }
  return pharmaciesList;
}

export async function fetchPharmacyById(pharmacyId: string): Promise<Pharmacy | null> {
  if (!pharmacyId) return null;
  try {
    const pharmacyDocRef = doc(db, 'pharmacies', pharmacyId);
    const pharmacyDocSnap = await getDoc(pharmacyDocRef);

    if (!pharmacyDocSnap.exists()) {
      console.log(`No pharmacy found with ID: ${pharmacyId}`);
      return null;
    }

    const pharmacyData = pharmacyDocSnap.data();
    const dutyShiftsQuery = query(collection(db, 'pharmacies', pharmacyId, 'dutyShifts'), orderBy('date', 'asc'));
    const dutyShiftSnapshots = await getDocs(dutyShiftsQuery);
    
    const dutyShifts: DutyShiftData[] = dutyShiftSnapshots.docs.map(shiftDoc => ({
      id: shiftDoc.id,
      ...shiftDoc.data(),
    } as DutyShiftData));

    return {
      id: pharmacyDocSnap.id,
      name: pharmacyData.name || 'Nombre no disponible',
      address: pharmacyData.address || 'Dirección no disponible',
      phone: pharmacyData.phone || 'Teléfono no disponible',
      province: pharmacyData.province || 'Provincia no disponible',
      municipality: pharmacyData.municipality || 'Municipio no disponible',
      email: pharmacyData.email || undefined,
      fixedHours: pharmacyData.fixedHours as FixedHours || {},
      dutyShifts: dutyShifts,
      lat: pharmacyData.lat || undefined,
      lng: pharmacyData.lng || undefined,
    } as Pharmacy;
  } catch (error) {
    console.error(`Error fetching pharmacy by ID ${pharmacyId}:`, error);
    return null;
  }
}

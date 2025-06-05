
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Remove direct import of mockPharmacies, provinces, getMunicipalities from mockData
// import { provinces as allProvincesData, getMunicipalities as getMuniData, mockPharmacies } from '@/lib/mockData';
import { fetchPharmaciesWithShifts } from '@/lib/pharmacyService';
import type { Pharmacy } from '@/types';

interface AppStateWrapperProps {
  children: React.ReactNode;
}

export const AppContext = React.createContext<{
  selectedProvince: string;
  setSelectedProvince: React.Dispatch<React.SetStateAction<string>>;
  provinces: string[];
  getMunicipalities: (province: string) => string[];
  allPharmacies: Pharmacy[];
  isLoadingPharmacies: boolean;
} | null>(null);

export default function AppStateWrapper({ children }: AppStateWrapperProps) {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([]);
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(true);

  useEffect(() => {
    const loadPharmacies = async () => {
      setIsLoadingPharmacies(true);
      try {
        const fetchedPharmacies = await fetchPharmaciesWithShifts();
        setAllPharmacies(fetchedPharmacies);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
        // Set to empty array or handle error state appropriately
        setAllPharmacies([]); 
      } finally {
        setIsLoadingPharmacies(false);
      }
    };
    loadPharmacies();
  }, []);

  const provinces = useMemo(() => {
    if (isLoadingPharmacies || allPharmacies.length === 0) return [];
    return [...new Set(allPharmacies.map(p => p.province).filter(Boolean))].sort();
  }, [allPharmacies, isLoadingPharmacies]);

  const getMunicipalities = useCallback((provinceName: string): string[] => {
    if (isLoadingPharmacies || !provinceName || allPharmacies.length === 0) return [];
    return [...new Set(allPharmacies.filter(p => p.province === provinceName).map(p => p.municipality).filter(Boolean))].sort();
  }, [allPharmacies, isLoadingPharmacies]);
  
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
  };

  return (
    <AppContext.Provider value={{ selectedProvince, setSelectedProvince, provinces, getMunicipalities, allPharmacies, isLoadingPharmacies }}>
      <Header
        provinces={provinces}
        selectedProvince={selectedProvince}
        onProvinceChange={handleProvinceChange}
        // isLoadingProvinces={isLoadingPharmacies} // Pass loading state if Header needs it
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoadingPharmacies ? <div className="text-center py-10">Cargando farmacias...</div> : children}
      </main>
      <Footer />
    </AppContext.Provider>
  );
}

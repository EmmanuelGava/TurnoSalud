'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { provinces as allProvincesData, getMunicipalities as getMuniData, mockPharmacies } from '@/lib/mockData';
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
} | null>(null);

export default function AppStateWrapper({ children }: AppStateWrapperProps) {
  const [selectedProvince, setSelectedProvince] = useState('');
  const provinces = useMemo(() => allProvincesData, []);
  const allPharmacies = useMemo(() => mockPharmacies, []);

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
  };
  
  const getMunicipalities = (province: string) => getMuniData(province);

  return (
    <AppContext.Provider value={{ selectedProvince, setSelectedProvince, provinces, getMunicipalities, allPharmacies }}>
      <Header
        provinces={provinces}
        selectedProvince={selectedProvince}
        onProvinceChange={handleProvinceChange}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </AppContext.Provider>
  );
}

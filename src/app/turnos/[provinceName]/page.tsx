
'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import type { Pharmacy } from '@/types';
import PharmacyCard from '@/components/PharmacyCard';
import SearchAndFilters from '@/components/SearchAndFilters';
import { AppContext } from '@/app/AppStateWrapper';
import { Frown, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter

export default function ProvincePharmaciesPage() {
  const params = useParams();
  const router = useRouter(); // For potential redirect
  const context = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  
  const provinceNameFromUrl = useMemo(() => {
    const name = params.provinceName;
    return typeof name === 'string' ? decodeURIComponent(name) : '';
  }, [params.provinceName]);

  if (!context) {
     return <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />Cargando contexto...</div>;
  }
  const { setSelectedProvince, getMunicipalities, allPharmacies, provinces, isLoadingPharmacies } = context;

  useEffect(() => {
    if (isLoadingPharmacies) return; // Wait for provinces to be loaded

    if (provinceNameFromUrl && setSelectedProvince) {
      if (provinces.length > 0 && !provinces.includes(provinceNameFromUrl)) {
        // console.warn("Invalid province in URL:", provinceNameFromUrl, "Available:", provinces);
        // Consider redirecting to a 404 page or the homepage
        // router.push('/'); // Example redirect
        setSelectedProvince(''); // Clear selected province if invalid
      } else if (provinces.includes(provinceNameFromUrl)) {
        setSelectedProvince(provinceNameFromUrl);
      }
    }
  }, [provinceNameFromUrl, setSelectedProvince, provinces, isLoadingPharmacies, router]);

  const municipalities = useMemo(() => {
    if (isLoadingPharmacies || !provinceNameFromUrl || !provinces.includes(provinceNameFromUrl)) return [];
    return getMunicipalities(provinceNameFromUrl);
  }, [provinceNameFromUrl, getMunicipalities, provinces, isLoadingPharmacies]);

  useEffect(() => {
    if (isLoadingPharmacies) return;
    if (provinceNameFromUrl && municipalities.length > 0 && selectedMunicipality && !municipalities.includes(selectedMunicipality)) {
      setSelectedMunicipality('');
    }
  }, [provinceNameFromUrl, municipalities, selectedMunicipality, isLoadingPharmacies]);


  useEffect(() => {
    if (isLoadingPharmacies || !provinceNameFromUrl || (provinces.length > 0 && !provinces.includes(provinceNameFromUrl))) {
      setFilteredPharmacies([]);
      return;
    }

    let result = allPharmacies.filter(p => p.province === provinceNameFromUrl);

    if (selectedMunicipality) {
      result = result.filter(p => p.municipality === selectedMunicipality);
    }

    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowerSearchTerm) ||
        p.address.toLowerCase().includes(lowerSearchTerm) ||
        (p.municipality && p.municipality.toLowerCase().includes(lowerSearchTerm))
        // No need to search province name here as it's already filtered by URL
      );
    }
    setFilteredPharmacies(result);
  }, [searchTerm, provinceNameFromUrl, selectedMunicipality, allPharmacies, provinces, isLoadingPharmacies]);

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleMunicipalityChange = (municipality: string) => {
    setSelectedMunicipality(municipality);
  };

  if (isLoadingPharmacies) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-headline font-semibold mb-2">Cargando Farmacias en {provinceNameFromUrl || ''}...</h2>
        <p className="text-muted-foreground">
          Estamos obteniendo la información más reciente.
        </p>
      </div>
    );
  }
  
  // After loading, if province is still invalid (e.g., not in fetched list)
  if (!isLoadingPharmacies && provinceNameFromUrl && provinces.length > 0 && !provinces.includes(provinceNameFromUrl)) {
    return (
        <div className="text-center py-12">
          <Frown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-headline font-semibold mb-2">Provincia no encontrada</h2>
          <p className="text-muted-foreground">
            La provincia "{provinceNameFromUrl}" no es válida o no tiene farmacias registradas.
          </p>
          <Button onClick={() => router.push('/')} className="mt-4">Volver al inicio</Button>
        </div>
      );
  }


  return (
    <div>
      <h2 className="text-3xl font-headline font-bold mb-6 text-center">
        Farmacias de Turno en {provinceNameFromUrl || 'Provincia'}
      </h2>
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        municipalities={municipalities}
        selectedMunicipality={selectedMunicipality}
        onMunicipalityChange={handleMunicipalityChange}
        selectedProvince={provinceNameFromUrl}
      />

      {filteredPharmacies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Frown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-headline font-semibold mb-2">No hay farmacias para mostrar en {provinceNameFromUrl || 'esta provincia'}</h2>
          <p className="text-muted-foreground">
            Prueba ajustando los filtros o es posible que no haya farmacias cargadas para esta selección.
          </p>
        </div>
      )}
    </div>
  );
}

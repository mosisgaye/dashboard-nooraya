import { useState } from 'react';
import CurrencyConverter from '../components/CurrencyConverter';
import { Button } from '../components/ui/Button';

export default function Currency() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Convertisseur de Devises
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Convertissez entre différentes devises avec les taux actuels
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Actualiser les taux
        </Button>
      </div>

      <CurrencyConverter key={refreshKey} />
    </div>
  );
}
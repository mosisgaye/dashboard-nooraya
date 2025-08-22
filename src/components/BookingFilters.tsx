import React from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { DatePicker } from './ui/DatePicker';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/Sheet';
import { 
  Filter,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface BookingFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export function BookingFilters({ filters, onFiltersChange }: BookingFiltersProps) {
  const [tempFilters, setTempFilters] = React.useState(filters);

  const handleApply = () => {
    onFiltersChange(tempFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      booking_type: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      customer_email: ''
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtres avancés</SheetTitle>
          <SheetDescription>
            Affinez votre recherche avec des filtres détaillés
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Statut */}
          <div>
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              value={tempFilters.status}
              onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
              className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
              <option value="failed">Échouée</option>
              <option value="completed">Complétée</option>
            </select>
          </div>

          {/* Type de réservation */}
          <div>
            <Label htmlFor="booking_type">Type de réservation</Label>
            <select
              id="booking_type"
              value={tempFilters.booking_type}
              onChange={(e) => setTempFilters({ ...tempFilters, booking_type: e.target.value })}
              className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Tous les types</option>
              <option value="flight">Vols</option>
              <option value="hotel">Hôtels</option>
              <option value="package">Tous les Packages</option>
              <option value="package:umra">Package - Umra</option>
              <option value="package:can2025">Package - CAN 2025</option>
              <option value="package:visa">Package - Visa</option>
            </select>
          </div>

          {/* Période */}
          <div>
            <Label>Période</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="dateFrom" className="text-xs text-gray-500 dark:text-gray-400">Du</Label>
                <DatePicker
                  date={tempFilters.dateFrom ? new Date(tempFilters.dateFrom) : undefined}
                  onDateChange={(date) => setTempFilters({ 
                    ...tempFilters, 
                    dateFrom: date ? format(date, 'yyyy-MM-dd') : '' 
                  })}
                  placeholder="Date début"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-xs text-gray-500 dark:text-gray-400">Au</Label>
                <DatePicker
                  date={tempFilters.dateTo ? new Date(tempFilters.dateTo) : undefined}
                  onDateChange={(date) => setTempFilters({ 
                    ...tempFilters, 
                    dateTo: date ? format(date, 'yyyy-MM-dd') : '' 
                  })}
                  placeholder="Date fin"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Montant */}
          <div>
            <Label>Montant (XOF)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="amountMin" className="text-xs text-gray-500 dark:text-gray-400">Min</Label>
                <Input
                  id="amountMin"
                  type="number"
                  placeholder="0"
                  value={tempFilters.amountMin}
                  onChange={(e) => setTempFilters({ ...tempFilters, amountMin: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="amountMax" className="text-xs text-gray-500 dark:text-gray-400">Max</Label>
                <Input
                  id="amountMax"
                  type="number"
                  placeholder="∞"
                  value={tempFilters.amountMax}
                  onChange={(e) => setTempFilters({ ...tempFilters, amountMax: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Email client */}
          <div>
            <Label htmlFor="customer_email">Email client</Label>
            <Input
              id="customer_email"
              type="email"
              placeholder="client@example.com"
              value={tempFilters.customer_email}
              onChange={(e) => setTempFilters({ ...tempFilters, customer_email: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-8">
          <Button onClick={handleApply} className="flex-1">
            Appliquer les filtres
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
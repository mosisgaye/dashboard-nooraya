import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
}

export function useCurrency() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState<string>(() => {
    return localStorage.getItem('preferredCurrency') || 'XOF';
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('effective_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des taux:', error);
    } finally {
      setLoading(false);
    }
  };

  const convert = (amount: number, from: string, to: string): number => {
    if (!amount) return 0;
    if (from === to) return amount;

    // Chercher le taux direct
    const directRate = rates.find(
      r => r.from_currency === from && r.to_currency === to
    );

    if (directRate) {
      return amount * directRate.rate;
    }

    // Essayer via XOF
    const toXof = rates.find(r => r.from_currency === from && r.to_currency === 'XOF');
    const fromXof = rates.find(r => r.from_currency === 'XOF' && r.to_currency === to);
    
    if (toXof && fromXof) {
      return amount * toXof.rate * fromXof.rate;
    }

    // Si aucun taux trouvé, retourner le montant original
    return amount;
  };

  const formatAmount = (amount: number, currency?: string): string => {
    const curr = currency || preferredCurrency;
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: curr === 'XOF' ? 'XOF' : curr,
      minimumFractionDigits: curr === 'XOF' ? 0 : 2,
      maximumFractionDigits: curr === 'XOF' ? 0 : 2
    }).format(amount);
  };

  const convertToPreferred = (amount: number, from: string = 'XOF'): number => {
    return convert(amount, from, preferredCurrency);
  };

  const formatInPreferred = (amount: number, from: string = 'XOF'): string => {
    const converted = convertToPreferred(amount, from);
    return formatAmount(converted, preferredCurrency);
  };

  const updatePreferredCurrency = (currency: string) => {
    setPreferredCurrency(currency);
    localStorage.setItem('preferredCurrency', currency);
  };

  const getRate = (from: string, to: string): number | null => {
    const rate = rates.find(
      r => r.from_currency === from && r.to_currency === to
    );
    return rate?.rate || null;
  };

  return {
    rates,
    loading,
    preferredCurrency,
    convert,
    formatAmount,
    convertToPreferred,
    formatInPreferred,
    updatePreferredCurrency,
    getRate,
    refreshRates: fetchRates
  };
}

// Hook pour les statistiques multi-devises
export function useCurrencyStats(bookings: any[]) {
  const { convert, preferredCurrency } = useCurrency();
  
  const calculateStats = () => {
    let totalXOF = 0;
    let totalEUR = 0;
    let totalUSD = 0;
    
    bookings.forEach(booking => {
      const amount = booking.total_amount || 0;
      const currency = booking.currency || 'XOF';
      
      totalXOF += convert(amount, currency, 'XOF');
      totalEUR += convert(amount, currency, 'EUR');
      totalUSD += convert(amount, currency, 'USD');
    });
    
    return {
      totalXOF,
      totalEUR,
      totalUSD,
      totalPreferred: convert(totalXOF, 'XOF', preferredCurrency),
      preferredCurrency
    };
  };
  
  return calculateStats();
}
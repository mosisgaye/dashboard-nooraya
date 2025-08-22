import { useState, useEffect } from 'react';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(1000000);
  const [fromCurrency, setFromCurrency] = useState<string>('XOF');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number>(0);
  const [rates, setRates] = useState<ExchangeRate[]>([]);

  const currencies = ['XOF', 'EUR', 'USD', 'GBP', 'CAD', 'AED', 'SAR', 'NGN'];

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    calculateConversion();
  }, [amount, fromCurrency, toCurrency, rates]);

  const fetchExchangeRates = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('effective_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des taux:', error);
    }
  };

  const calculateConversion = () => {
    if (fromCurrency === toCurrency) {
      setResult(amount);
      return;
    }

    const rate = rates.find(
      r => r.from_currency === fromCurrency && r.to_currency === toCurrency
    );

    if (rate) {
      setResult(amount * rate.rate);
    } else {
      // Essayer via XOF
      const toXof = rates.find(r => r.from_currency === fromCurrency && r.to_currency === 'XOF');
      const fromXof = rates.find(r => r.from_currency === 'XOF' && r.to_currency === toCurrency);
      
      if (toXof && fromXof) {
        setResult(amount * toXof.rate * fromXof.rate);
      }
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XOF' ? 'XOF' : currency,
      minimumFractionDigits: currency === 'XOF' ? 0 : 2,
      maximumFractionDigits: currency === 'XOF' ? 0 : 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const getPopularRates = () => {
    const popularPairs = [
      { from: 'XOF', to: 'EUR' },
      { from: 'XOF', to: 'USD' },
      { from: 'EUR', to: 'XOF' },
      { from: 'USD', to: 'XOF' }
    ];

    return popularPairs.map(pair => {
      const rate = rates.find(r => r.from_currency === pair.from && r.to_currency === pair.to);
      return { ...pair, rate: rate?.rate || 0 };
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Convertisseur de Devises
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Montant
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <Select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={swapCurrencies}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Résultat
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formatNumber(result)}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <Select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-center text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(amount, fromCurrency)} = {formatCurrency(result, toCurrency)}
            </p>
            {fromCurrency !== toCurrency && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                Taux: 1 {fromCurrency} = {formatNumber(result / amount)} {toCurrency}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Taux de Change Actuels
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getPopularRates().map(({ from, to, rate }) => (
            <div key={`${from}-${to}`} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 dark:text-white">{from}/{to}</span>
                {rate > 1 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatNumber(rate)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                1 {from} = {formatNumber(rate)} {to}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
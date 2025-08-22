import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CreditCard,
  Download,
  Search,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

interface Payment {
  id: string;
  booking_id: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  transaction_id?: string;
  paytech_reference?: string;
  created_at: string;
  updated_at: string;
  bookings?: {
    id: string;
    guest_email: string;
    guest_phone: string;
    flight_details: any;
  };
}

interface PaymentStats {
  total_amount: number;
  total_count: number;
  success_count: number;
  failed_count: number;
  pending_count: number;
  refunded_amount: number;
}

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  // Récupérer les paiements
  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['payments', statusFilter, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          bookings (
            id,
            guest_email,
            guest_phone,
            flight_details
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Filtrer par date
      if (dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        if (dateRange !== 'all') {
          query = query.gte('created_at', startDate.toISOString());
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Payment[];
    }
  });

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (!payments) return null;
    
    const stats: PaymentStats = {
      total_amount: 0,
      total_count: payments.length,
      success_count: 0,
      failed_count: 0,
      pending_count: 0,
      refunded_amount: 0
    };

    payments.forEach(payment => {
      if (payment.status === 'success') {
        stats.total_amount += payment.amount;
        stats.success_count++;
      } else if (payment.status === 'failed') {
        stats.failed_count++;
      } else if (payment.status === 'pending') {
        stats.pending_count++;
      } else if (payment.status === 'refunded') {
        stats.refunded_amount += payment.amount;
      }
    });

    return stats;
  }, [payments]);

  // Filtrer les paiements par recherche
  const filteredPayments = React.useMemo(() => {
    if (!payments) return [];
    
    return payments.filter(payment => {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.transaction_id?.toLowerCase().includes(searchLower) ||
        payment.paytech_reference?.toLowerCase().includes(searchLower) ||
        payment.bookings?.guest_email?.toLowerCase().includes(searchLower) ||
        payment.bookings?.guest_phone?.toLowerCase().includes(searchLower)
      );
    });
  }, [payments, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'refunded':
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const exportToCSV = () => {
    if (!filteredPayments || filteredPayments.length === 0) return;

    const csv = [
      ['ID', 'Date', 'Montant', 'Devise', 'Statut', 'Méthode', 'Email Client', 'Référence PayTech'],
      ...filteredPayments.map(p => [
        p.id,
        format(new Date(p.created_at), 'dd/MM/yyyy HH:mm'),
        p.amount.toString(),
        p.currency,
        p.status,
        p.payment_method,
        p.bookings?.guest_email || '',
        p.paytech_reference || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paiements</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez et suivez tous les paiements</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Réussi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatAmount(stats.total_amount, 'XOF')}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_count}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Réussies</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.success_count}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Échouées</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.failed_count}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending_count}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par référence, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="success">Réussi</option>
              <option value="failed">Échoué</option>
              <option value="pending">En attente</option>
              <option value="refunded">Remboursé</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusBadgeClass(payment.status)
                    )}>
                      {getStatusIcon(payment.status)}
                      {payment.status === 'success' && 'Réussi'}
                      {payment.status === 'failed' && 'Échoué'}
                      {payment.status === 'pending' && 'En attente'}
                      {payment.status === 'refunded' && 'Remboursé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {format(new Date(payment.created_at), 'dd MMM yyyy', { locale: fr })}
                    <br />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(payment.created_at), 'HH:mm')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {payment.bookings?.guest_email || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {payment.bookings?.guest_phone || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatAmount(payment.amount, payment.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                      {payment.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {payment.paytech_reference || payment.transaction_id || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Ouvrir les détails du paiement
                        console.log('Voir détails:', payment.id);
                      }}
                    >
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun paiement</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Aucun paiement ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
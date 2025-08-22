import { useBookingStats } from '../hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Users, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign
} from 'lucide-react';
import { cn } from '../utils/cn';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Données de démonstration pour les graphiques
const revenueData = [
  { date: '01/12', revenue: 45000000 },
  { date: '02/12', revenue: 52000000 },
  { date: '03/12', revenue: 48000000 },
  { date: '04/12', revenue: 61000000 },
  { date: '05/12', revenue: 55000000 },
  { date: '06/12', revenue: 67000000 },
  { date: '07/12', revenue: 72000000 },
];

const bookingTypeData = [
  { name: 'Vols', value: 45, color: '#10b981' },
  { name: 'Hôtels', value: 30, color: '#3b82f6' },
  { name: 'Packages', value: 25, color: '#f59e0b' },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useBookingStats();

  const kpis = [
    {
      title: "Revenus aujourd'hui",
      value: stats?.revenue?.today || 0,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Nouvelles réservations',
      value: stats?.general?.todayBookings || 0,
      change: '+23.1%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Clients actifs',
      value: stats?.general?.activeCustomers || 0,
      change: '+18.2%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Taux de conversion',
      value: '68%',
      change: '-2.3%',
      trend: 'down',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Vue d'ensemble de votre activité
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {typeof kpi.value === 'number' ? formatCurrency(kpi.value) : kpi.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className={cn(
                      'text-sm font-medium ml-1',
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
                  </div>
                </div>
                <div className={cn('p-3 rounded-full', kpi.bgColor)}>
                  <kpi.icon className={cn('w-6 h-6', kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Booking Types */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'booking', message: 'Nouvelle réservation de vol Dakar - Paris', time: 'Il y a 5 min', amount: 450000 },
              { type: 'payment', message: 'Paiement réussi pour séjour Dubai', time: 'Il y a 12 min', amount: 1400000 },
              { type: 'customer', message: 'Nouveau client inscrit: Aminata Sow', time: 'Il y a 23 min' },
              { type: 'booking', message: 'Réservation package Umra confirmée', time: 'Il y a 45 min', amount: 800000 },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    activity.type === 'booking' ? 'bg-blue-600' :
                    activity.type === 'payment' ? 'bg-green-600' :
                    'bg-purple-600'
                  )} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(activity.amount)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
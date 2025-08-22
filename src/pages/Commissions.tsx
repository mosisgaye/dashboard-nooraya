import { useState } from 'react';
import { 
  useCommissionSettings, 
  useCommissionStats, 
  useMonthlyCommissionRevenue,
  useCommissionHistory
} from '../hooks/useCommissions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { 
  DollarSign, 
  Download,
  Plus,
  Edit,
  Plane,
  Building,
  Package
} from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CommissionSettingsModal from '../components/CommissionSettingsModal';

const COLORS = {
  flight: '#3b82f6',
  hotel: '#10b981',
  package: '#8b5cf6'
};

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function Commissions() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const currentYear = new Date().getFullYear();
  
  const { data: settings, isLoading: settingsLoading } = useCommissionSettings();
  const { data: stats, isLoading: statsLoading } = useCommissionStats();
  const { data: monthlyRevenue, isLoading: monthlyLoading } = useMonthlyCommissionRevenue(currentYear);
  const { data: history, isLoading: historyLoading } = useCommissionHistory({ limit: 10 });

  // Préparer les données pour les graphiques
  const monthlyChartData = monthlyRevenue?.map((data, index) => ({
    name: MONTHS[index],
    vol: data.flight,
    hotel: data.hotel,
    package: data.package,
    total: data.total
  })) || [];

  const pieChartData = stats ? [
    { name: 'Vols', value: stats.byType.flight, color: COLORS.flight },
    { name: 'Hôtels', value: stats.byType.hotel, color: COLORS.hotel },
    { name: 'Packages', value: stats.byType.package, color: COLORS.package }
  ].filter(item => item.value > 0) : [];

  const typeIcons = {
    flight: Plane,
    hotel: Building,
    package: Package
  };

  const handleExportCommissions = () => {
    // TODO: Implémenter l'export des commissions
    console.log('Export des commissions');
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Gestion des Commissions
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Gérez vos taux de commission et suivez vos revenus
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCommissions} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => {
              setSelectedSetting(null);
              setIsSettingsModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau taux
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Commissions totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(stats?.total || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Commissions vols</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(stats?.byType.flight || 0)}
                </p>
                <p className="text-xs text-gray-400">{stats?.count.flight || 0} réservations</p>
              </div>
              <Plane className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Commissions hôtels</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(stats?.byType.hotel || 0)}
                </p>
                <p className="text-xs text-gray-400">{stats?.count.hotel || 0} réservations</p>
              </div>
              <Building className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Commissions packages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(stats?.byType.package || 0)}
                </p>
                <p className="text-xs text-gray-400">{stats?.count.package || 0} réservations</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique mensuel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Évolution mensuelle des commissions</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="vol" 
                        stackId="1" 
                        stroke={COLORS.flight} 
                        fill={COLORS.flight} 
                        name="Vols"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="hotel" 
                        stackId="1" 
                        stroke={COLORS.hotel} 
                        fill={COLORS.hotel} 
                        name="Hôtels"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="package" 
                        stackId="1" 
                        stroke={COLORS.package} 
                        fill={COLORS.package} 
                        name="Packages"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Répartition par type */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par type</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Paramètres */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Taux de commission actuels</CardTitle>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Type de service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Taux
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Montant fixe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Valide depuis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {settings?.map((setting) => {
                        const Icon = typeIcons[setting.service_type as keyof typeof typeIcons];
                        return (
                          <tr key={setting.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Icon className="h-5 w-5 mr-2 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {setting.service_type === 'flight' ? 'Vols' :
                                   setting.service_type === 'hotel' ? 'Hôtels' : 'Packages'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {(setting.commission_percentage * 100).toFixed(2)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {setting.fixed_amount ? formatCurrency(setting.fixed_amount) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={setting.is_active ? 'success' : 'secondary'}>
                                {setting.is_active ? 'Actif' : 'Inactif'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(setting.valid_from), 'dd MMM yyyy', { locale: fr })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedSetting(setting);
                                  setIsSettingsModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des commissions</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Réservation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Montant base
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Taux
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Commission
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {history?.map((item) => {
                        const Icon = typeIcons[item.service_type as keyof typeof typeIcons];
                        return (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {format(new Date(item.created_at), 'dd MMM yyyy', { locale: fr })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  #{item.booking_id?.slice(0, 8).toUpperCase()}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">
                                  {item.booking?.guest_email}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Icon className="h-5 w-5 mr-2 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                  {item.service_type === 'flight' ? 'Vol' :
                                   item.service_type === 'hotel' ? 'Hôtel' : 'Package'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {formatCurrency(item.base_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {(item.commission_percentage * 100).toFixed(2)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(item.commission_amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal des paramètres */}
      <CommissionSettingsModal
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        setting={selectedSetting}
      />
    </div>
  );
}
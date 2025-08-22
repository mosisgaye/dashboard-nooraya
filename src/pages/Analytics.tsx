import { useState } from 'react';
import { 
  useSearchStats, 
  useConversionRate, 
  usePriceTrends,
  useFavoritesAnalysis,
  useTrendPredictions
} from '../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { DatePicker } from '../components/ui/DatePicker';
import { 
  TrendingUp, 
  Search, 
  Target,
  Heart,
  Plane,
  MapPin,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { format, subDays } from 'date-fns';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: searchStats, isLoading: searchLoading } = useSearchStats(dateRange);
  const { data: conversionData, isLoading: conversionLoading } = useConversionRate(dateRange);
  const { data: priceTrends, isLoading: priceLoading } = usePriceTrends();
  const { data: favoritesData, isLoading: favoritesLoading } = useFavoritesAnalysis();
  const { data: predictions, isLoading: predictionsLoading } = useTrendPredictions();

  // Préparer les données pour les graphiques
  const routeChartData = searchStats?.topRoutes.map((route, index) => ({
    name: `${route.from} → ${route.to}`,
    recherches: route.count,
    fill: COLORS[index % COLORS.length]
  })) || [];

  const destinationChartData = searchStats?.topDestinations.map((dest, index) => ({
    name: dest.destination,
    value: dest.count,
    fill: COLORS[index % COLORS.length]
  })) || [];


  const predictionChartData = predictions?.predictions.map(pred => ({
    mois: MONTHS[pred.month],
    recherches: pred.predictedSearches,
    réservations: pred.predictedBookings,
    revenus: pred.predictedRevenue
  })) || [];

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Analytics & Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Analysez les tendances et optimisez votre stratégie
            </p>
          </div>
          <div className="flex gap-2">
            <DatePicker
              date={dateRange.startDate ? new Date(dateRange.startDate) : undefined}
              onDateChange={(date) => setDateRange({ 
                ...dateRange, 
                startDate: date ? format(date, 'yyyy-MM-dd') : '' 
              })}
              placeholder="Date début"
            />
            <DatePicker
              date={dateRange.endDate ? new Date(dateRange.endDate) : undefined}
              onDateChange={(date) => setDateRange({ 
                ...dateRange, 
                endDate: date ? format(date, 'yyyy-MM-dd') : '' 
              })}
              placeholder="Date fin"
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recherches totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {searchStats?.totalSearches || 0}
                </p>
              </div>
              <Search className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Taux de conversion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {conversionData?.conversionRate.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-gray-400">
                  {conversionData?.totalBookings || 0} réservations
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alertes de prix</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {priceTrends?.totalAlerts || 0}
                </p>
                <p className="text-xs text-gray-400">
                  {priceTrends?.activeAlerts || 0} actives
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Favoris</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {favoritesData?.total || 0}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="searches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="searches">Recherches</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
        </TabsList>

        {/* Onglet Recherches */}
        <TabsContent value="searches" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top routes */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 des routes recherchées</CardTitle>
              </CardHeader>
              <CardContent>
                {searchLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={routeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="recherches" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top destinations */}
            <Card>
              <CardHeader>
                <CardTitle>Destinations populaires</CardTitle>
              </CardHeader>
              <CardContent>
                {searchLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={destinationChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {destinationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tendance mensuelle */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des recherches</CardTitle>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={searchStats?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Recherches"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Conversion */}
        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Taux de conversion global
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {conversionData?.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                  {conversionData && conversionData.conversionRate > 5 ? (
                    <ArrowUpRight className="h-8 w-8 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-8 w-8 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Recherches
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {conversionData?.totalSearches || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Réservations
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {conversionData?.totalBookings || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Taux de conversion par route */}
          <Card>
            <CardHeader>
              <CardTitle>Taux de conversion par route</CardTitle>
            </CardHeader>
            <CardContent>
              {conversionLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Recherches
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Réservations
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Taux
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {conversionData?.routeConversionRates.map((route, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Plane className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {route.route}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {route.searches}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {route.bookings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={route.conversionRate > 5 ? 'success' : 'warning'}>
                              {route.conversionRate.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Tendances */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertes de prix */}
            <Card>
              <CardHeader>
                <CardTitle>Alertes de prix par route</CardTitle>
              </CardHeader>
              <CardContent>
                {priceLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {priceTrends?.avgPricesByRoute.slice(0, 5).map((route, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {route.route}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {route.count} alertes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(route.avgTargetPrice)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency(route.minPrice)} - {formatCurrency(route.maxPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favoris */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse des favoris</CardTitle>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Plane className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Routes favorites
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {favoritesData?.byType.flight_route || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Destinations favorites
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {favoritesData?.byType.destination || 0}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Top routes favorites
                      </p>
                      {favoritesData?.topRoutes.map((route, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {route.route}
                          </span>
                          <Badge variant="secondary">{route.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Prédictions */}
        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>Prévisions pour les 3 prochains mois</CardTitle>
            </CardHeader>
            <CardContent>
              {predictionsLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={predictionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="recherches" fill="#3b82f6" name="Recherches prévues" />
                      <Bar yAxisId="left" dataKey="réservations" fill="#f59e0b" name="Réservations prévues" />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="revenus" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Revenus prévus"
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {predictions?.predictions.map((pred, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {MONTHS[pred.month]}
                            </span>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Recherches
                              </span>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                {pred.predictedSearches}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Réservations
                              </span>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                {pred.predictedBookings}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Revenus
                              </span>
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(pred.predictedRevenue, true)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
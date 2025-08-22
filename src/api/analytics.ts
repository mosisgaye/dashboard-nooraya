import { supabase } from '../lib/supabase';

export const analyticsApi = {
  // Récupérer les statistiques de recherche
  async getSearchStats(period?: { startDate: string; endDate: string }) {
    let query = supabase
      .from('flight_searches')
      .select('*');

    if (period) {
      query = query
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate);
    }

    const { data: searches, error } = await query;
    if (error) throw error;

    // Analyser les routes populaires
    const routeMap = new Map<string, number>();
    const destinationMap = new Map<string, number>();
    const monthlySearches = new Map<string, number>();

    searches?.forEach(search => {
      // Routes
      const route = `${search.from_airport}-${search.to_airport}`;
      routeMap.set(route, (routeMap.get(route) || 0) + 1);

      // Destinations
      destinationMap.set(search.to_airport, (destinationMap.get(search.to_airport) || 0) + 1);

      // Recherches mensuelles
      const month = new Date(search.created_at).toISOString().slice(0, 7);
      monthlySearches.set(month, (monthlySearches.get(month) || 0) + 1);
    });

    // Top 10 routes
    const topRoutes = Array.from(routeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([route, count]) => {
        const [from, to] = route.split('-');
        return { from, to, count };
      });

    // Top 10 destinations
    const topDestinations = Array.from(destinationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([destination, count]) => ({ destination, count }));

    return {
      totalSearches: searches?.length || 0,
      topRoutes,
      topDestinations,
      monthlyTrend: Array.from(monthlySearches.entries()).map(([month, count]) => ({ month, count }))
    };
  },

  // Taux de conversion recherche -> réservation
  async getConversionRate(period?: { startDate: string; endDate: string }) {
    // Récupérer les recherches
    let searchQuery = supabase
      .from('flight_searches')
      .select('from_airport, to_airport, created_at, user_id');

    if (period) {
      searchQuery = searchQuery
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate);
    }

    const { data: searches, error: searchError } = await searchQuery;
    if (searchError) throw searchError;

    // Récupérer les réservations de vols
    let bookingQuery = supabase
      .from('bookings')
      .select('flight_details, created_at, user_id')
      .eq('booking_type', 'flight');

    if (period) {
      bookingQuery = bookingQuery
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate);
    }

    const { data: bookings, error: bookingError } = await bookingQuery;
    if (bookingError) throw bookingError;

    // Calculer le taux de conversion global
    const totalSearches = searches?.length || 0;
    const totalBookings = bookings?.length || 0;
    const conversionRate = totalSearches > 0 ? (totalBookings / totalSearches) * 100 : 0;

    // Conversion par route
    const routeConversions = new Map<string, { searches: number; bookings: number }>();

    searches?.forEach(search => {
      const route = `${search.from_airport}-${search.to_airport}`;
      const current = routeConversions.get(route) || { searches: 0, bookings: 0 };
      current.searches++;
      routeConversions.set(route, current);
    });

    bookings?.forEach(booking => {
      if (booking.flight_details?.departure && booking.flight_details?.arrival) {
        const route = `${booking.flight_details.departure}-${booking.flight_details.arrival}`;
        const current = routeConversions.get(route) || { searches: 0, bookings: 0 };
        current.bookings++;
        routeConversions.set(route, current);
      }
    });

    const routeConversionRates = Array.from(routeConversions.entries())
      .map(([route, data]) => ({
        route,
        searches: data.searches,
        bookings: data.bookings,
        conversionRate: data.searches > 0 ? (data.bookings / data.searches) * 100 : 0
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);

    return {
      totalSearches,
      totalBookings,
      conversionRate,
      routeConversionRates
    };
  },

  // Analyse des tendances de prix
  async getPriceTrends() {
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Analyser les prix cibles par route
    const routePrices = new Map<string, number[]>();

    alerts?.forEach(alert => {
      const route = `${alert.from_airport}-${alert.to_airport}`;
      if (!routePrices.has(route)) {
        routePrices.set(route, []);
      }
      routePrices.get(route)?.push(alert.target_price);
    });

    // Calculer les prix moyens demandés
    const avgPricesByRoute = Array.from(routePrices.entries())
      .map(([route, prices]) => ({
        route,
        avgTargetPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        count: prices.length
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalAlerts: alerts?.length || 0,
      activeAlerts: alerts?.filter(a => a.is_active).length || 0,
      avgPricesByRoute
    };
  },

  // Analyse des favoris
  async getFavoritesAnalysis() {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*');

    if (error) throw error;

    // Analyser les types de favoris
    const typeCount = {
      flight_route: 0,
      destination: 0
    };

    const routeFavorites = new Map<string, number>();
    const destinationFavorites = new Map<string, number>();

    favorites?.forEach(fav => {
      typeCount[fav.type as keyof typeof typeCount]++;

      if (fav.type === 'flight_route' && fav.data) {
        const route = `${fav.data.from}-${fav.data.to}`;
        routeFavorites.set(route, (routeFavorites.get(route) || 0) + 1);
      } else if (fav.type === 'destination' && fav.data) {
        const dest = fav.data.name || fav.data.code;
        destinationFavorites.set(dest, (destinationFavorites.get(dest) || 0) + 1);
      }
    });

    return {
      total: favorites?.length || 0,
      byType: typeCount,
      topRoutes: Array.from(routeFavorites.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([route, count]) => ({ route, count })),
      topDestinations: Array.from(destinationFavorites.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([destination, count]) => ({ destination, count }))
    };
  },

  // Prévisions basées sur l'historique
  async getTrendPredictions() {
    // Récupérer les données des 12 derniers mois
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: searches, error: searchError } = await supabase
      .from('flight_searches')
      .select('created_at, from_airport, to_airport, departure_date')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (searchError) throw searchError;

    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('created_at, booking_type, total_amount')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (bookingError) throw bookingError;

    // Analyser les tendances saisonnières
    const monthlyData = new Map<number, { searches: number; bookings: number; revenue: number }>();

    searches?.forEach(search => {
      const month = new Date(search.created_at).getMonth();
      const current = monthlyData.get(month) || { searches: 0, bookings: 0, revenue: 0 };
      current.searches++;
      monthlyData.set(month, current);
    });

    bookings?.forEach(booking => {
      const month = new Date(booking.created_at).getMonth();
      const current = monthlyData.get(month) || { searches: 0, bookings: 0, revenue: 0 };
      current.bookings++;
      current.revenue += booking.total_amount;
      monthlyData.set(month, current);
    });

    // Prévoir les 3 prochains mois
    const predictions = [];
    const currentMonth = new Date().getMonth();
    
    for (let i = 1; i <= 3; i++) {
      const targetMonth = (currentMonth + i) % 12;
      const historicalData = monthlyData.get(targetMonth) || { searches: 0, bookings: 0, revenue: 0 };
      
      predictions.push({
        month: targetMonth,
        predictedSearches: Math.round(historicalData.searches * 1.1), // +10% de croissance
        predictedBookings: Math.round(historicalData.bookings * 1.1),
        predictedRevenue: Math.round(historicalData.revenue * 1.1)
      });
    }

    return {
      historicalData: Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        ...data
      })),
      predictions
    };
  }
};
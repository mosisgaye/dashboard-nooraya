/**
 * Templates de vols pré-configurés pour les routes populaires
 * Facilite la création rapide de vols récurrents
 */

export interface FlightTemplate {
  id: string;
  name: string;
  description: string;
  category: 'populaire' | 'hajj' | 'business' | 'etudiant' | 'vacances';
  data: {
    airline_code: string;
    airline_name: string;
    flight_number?: string;
    origin_code: string;
    origin_city: string;
    origin_airport: string;
    destination_code: string;
    destination_city: string;
    destination_airport: string;
    departure_time?: string;
    arrival_time?: string;
    duration_minutes?: number;
    cabin_class: string;
    stops: number;
    base_price_estimate: number;
    recommended_margin: number;
    peak_season_months?: number[];
    notes?: string;
  };
}

export const flightTemplates: FlightTemplate[] = [
  // Routes Populaires depuis Dakar
  {
    id: 'dss-cdg-af',
    name: 'Dakar → Paris (Air France)',
    description: 'Vol direct quotidien vers Paris CDG',
    category: 'populaire',
    data: {
      airline_code: 'AF',
      airline_name: 'Air France',
      flight_number: '718',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'CDG',
      destination_city: 'Paris',
      destination_airport: 'Charles de Gaulle Airport',
      departure_time: '01:50',
      arrival_time: '09:25',
      duration_minutes: 365,
      cabin_class: 'economy',
      stops: 0,
      base_price_estimate: 450000,
      recommended_margin: 10,
      peak_season_months: [6, 7, 8, 12],
      notes: 'Vol le plus demandé, forte demande été et fêtes'
    }
  },
  {
    id: 'dss-cmn-ram',
    name: 'Dakar → Casablanca (RAM)',
    description: 'Hub Royal Air Maroc pour connexions',
    category: 'populaire',
    data: {
      airline_code: 'AT',
      airline_name: 'Royal Air Maroc',
      flight_number: '541',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'CMN',
      destination_city: 'Casablanca',
      destination_airport: 'Mohammed V International Airport',
      departure_time: '03:40',
      arrival_time: '07:25',
      duration_minutes: 225,
      cabin_class: 'economy',
      stops: 0,
      base_price_estimate: 250000,
      recommended_margin: 12,
      notes: 'Excellent pour connexions vers Europe et Moyen-Orient'
    }
  },
  {
    id: 'dss-ist-tk',
    name: 'Dakar → Istanbul (Turkish)',
    description: 'Hub Turkish Airlines, connexions mondiales',
    category: 'business',
    data: {
      airline_code: 'TK',
      airline_name: 'Turkish Airlines',
      flight_number: '553',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'IST',
      destination_city: 'Istanbul',
      destination_airport: 'Istanbul Airport',
      departure_time: '20:00',
      arrival_time: '06:45',
      duration_minutes: 465,
      cabin_class: 'economy',
      stops: 0,
      base_price_estimate: 550000,
      recommended_margin: 12,
      notes: 'Très populaire pour Asie et Moyen-Orient'
    }
  },
  
  // Routes Hajj/Oumra
  {
    id: 'dss-jed-hajj',
    name: 'Dakar → Jeddah (Hajj/Oumra)',
    description: 'Vol pèlerinage vers Arabie Saoudite',
    category: 'hajj',
    data: {
      airline_code: 'SV',
      airline_name: 'Saudi Arabian Airlines',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'JED',
      destination_city: 'Jeddah',
      destination_airport: 'King Abdulaziz International Airport',
      cabin_class: 'economy',
      stops: 1,
      base_price_estimate: 750000,
      recommended_margin: 8,
      peak_season_months: [7, 8, 9], // Période Hajj
      notes: 'Forte demande pendant la saison du Hajj'
    }
  },
  {
    id: 'dss-med-oumra',
    name: 'Dakar → Médine (Oumra)',
    description: 'Vol direct pour Oumra',
    category: 'hajj',
    data: {
      airline_code: 'SV',
      airline_name: 'Saudi Arabian Airlines',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'MED',
      destination_city: 'Medina',
      destination_airport: 'Prince Mohammad Bin Abdulaziz Airport',
      cabin_class: 'economy',
      stops: 1,
      base_price_estimate: 780000,
      recommended_margin: 8,
      notes: 'Package Oumra très demandé'
    }
  },
  
  // Routes Business
  {
    id: 'dss-dxb-ek',
    name: 'Dakar → Dubai (Emirates)',
    description: 'Vol business vers Dubai',
    category: 'business',
    data: {
      airline_code: 'EK',
      airline_name: 'Emirates',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'DXB',
      destination_city: 'Dubai',
      destination_airport: 'Dubai International Airport',
      cabin_class: 'business',
      stops: 0,
      base_price_estimate: 1200000,
      recommended_margin: 8,
      notes: 'Clientèle business et luxe'
    }
  },
  {
    id: 'dss-lhr-ba',
    name: 'Dakar → Londres (British Airways)',
    description: 'Vol vers Londres Heathrow',
    category: 'business',
    data: {
      airline_code: 'BA',
      airline_name: 'British Airways',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'LHR',
      destination_city: 'Londres',
      destination_airport: 'Heathrow Airport',
      cabin_class: 'economy',
      stops: 0,
      base_price_estimate: 520000,
      recommended_margin: 10,
      notes: 'Forte demande business et étudiants'
    }
  },
  
  // Routes Étudiants
  {
    id: 'dss-yul-student',
    name: 'Dakar → Montréal (Étudiants)',
    description: 'Vol populaire pour étudiants Canada',
    category: 'etudiant',
    data: {
      airline_code: 'AT',
      airline_name: 'Royal Air Maroc',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'YUL',
      destination_city: 'Montréal',
      destination_airport: 'Montréal-Trudeau Airport',
      cabin_class: 'economy',
      stops: 1,
      base_price_estimate: 850000,
      recommended_margin: 12,
      peak_season_months: [8, 9], // Rentrée scolaire
      notes: 'Pic de demande en août-septembre'
    }
  },
  {
    id: 'dss-bru-student',
    name: 'Dakar → Bruxelles (Étudiants)',
    description: 'Vol étudiant vers Belgique',
    category: 'etudiant',
    data: {
      airline_code: 'SN',
      airline_name: 'Brussels Airlines',
      flight_number: '204',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'BRU',
      destination_city: 'Bruxelles',
      destination_airport: 'Brussels Airport',
      departure_time: '23:00',
      arrival_time: '06:35',
      duration_minutes: 395,
      cabin_class: 'economy',
      stops: 0,
      base_price_estimate: 480000,
      recommended_margin: 10,
      peak_season_months: [8, 9],
      notes: 'Forte communauté sénégalaise'
    }
  },
  
  // Routes Vacances
  {
    id: 'dss-bcn-vacation',
    name: 'Dakar → Barcelone (Vacances)',
    description: 'Vol touristique vers Espagne',
    category: 'vacances',
    data: {
      airline_code: 'VY',
      airline_name: 'Vueling',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'BCN',
      destination_city: 'Barcelone',
      destination_airport: 'Barcelona El Prat Airport',
      cabin_class: 'economy',
      stops: 0,
      base_price_estimate: 420000,
      recommended_margin: 15,
      peak_season_months: [6, 7, 8],
      notes: 'Destination touristique populaire'
    }
  },
  {
    id: 'dss-lis-tap',
    name: 'Dakar → Lisbonne (TAP)',
    description: 'Vol vers Portugal et connexions Brésil',
    category: 'vacances',
    data: {
      airline_code: 'TP',
      airline_name: 'TAP Air Portugal',
      flight_number: '1476',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'LIS',
      destination_city: 'Lisbonne',
      destination_airport: 'Lisbon Airport',
      departure_time: '02:35',
      arrival_time: '08:05',
      duration_minutes: 270,
      cabin_class: 'economy',
      stops: 0,
      base_price_estimate: 420000,
      recommended_margin: 12,
      notes: 'Bon pour connexions Amérique du Sud'
    }
  },
  
  // Routes Régionales
  {
    id: 'dss-abj-regional',
    name: 'Dakar → Abidjan',
    description: 'Vol régional Côte d\'Ivoire',
    category: 'populaire',
    data: {
      airline_code: 'HC',
      airline_name: 'Air Sénégal',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'ABJ',
      destination_city: 'Abidjan',
      destination_airport: 'Félix-Houphouët-Boigny Airport',
      cabin_class: 'economy',
      stops: 0,
      base_price_estimate: 180000,
      recommended_margin: 15,
      notes: 'Vol d\'affaires régional'
    }
  },
  {
    id: 'dss-cky-regional',
    name: 'Dakar → Conakry',
    description: 'Vol régional Guinée',
    category: 'populaire',
    data: {
      airline_code: 'HC',
      airline_name: 'Air Sénégal',
      origin_code: 'DSS',
      origin_city: 'Dakar',
      origin_airport: 'Blaise Diagne International Airport',
      destination_code: 'CKY',
      destination_city: 'Conakry',
      destination_airport: 'Conakry International Airport',
      cabin_class: 'economy',
      stops: 0,
      base_price_estimate: 150000,
      recommended_margin: 15,
      notes: 'Liaison régionale importante'
    }
  }
];

/**
 * Obtenir les templates par catégorie
 */
export const getTemplatesByCategory = (category: FlightTemplate['category']) => {
  return flightTemplates.filter(t => t.category === category);
};

/**
 * Obtenir un template par ID
 */
export const getTemplateById = (id: string) => {
  return flightTemplates.find(t => t.id === id);
};

/**
 * Obtenir les catégories disponibles
 */
export const templateCategories = [
  { value: 'populaire', label: 'Routes Populaires', icon: '✈️' },
  { value: 'hajj', label: 'Hajj & Oumra', icon: '🕋' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'etudiant', label: 'Étudiants', icon: '🎓' },
  { value: 'vacances', label: 'Vacances', icon: '🏖️' }
];
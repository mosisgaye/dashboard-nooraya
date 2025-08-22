/**
 * Utilitaires de validation pour les formulaires de vols
 * Respecte les contraintes de la base de données
 */

export const flightValidation = {
  /**
   * Valide que la date d'arrivée est égale ou après la date de départ
   */
  validateDates: (departureDate: string, arrivalDate: string): boolean => {
    const depDate = new Date(departureDate);
    const arrDate = new Date(arrivalDate);
    return arrDate >= depDate;
  },

  /**
   * Valide que le prix de vente est supérieur ou égal au prix de base
   */
  validatePrices: (basePrice: number, ourPrice: number): boolean => {
    return ourPrice >= basePrice;
  },

  /**
   * Valide que la date de fin de disponibilité est après la date de début
   */
  validateAvailability: (availableFrom: string, availableTo: string): boolean => {
    const fromDate = new Date(availableFrom);
    const toDate = new Date(availableTo);
    return toDate >= fromDate;
  },

  /**
   * Valide qu'au moins un jour d'opération est sélectionné pour un vol programmé
   */
  validateOperatingDays: (formData: any): boolean => {
    return formData.operates_monday || 
           formData.operates_tuesday || 
           formData.operates_wednesday || 
           formData.operates_thursday || 
           formData.operates_friday || 
           formData.operates_saturday || 
           formData.operates_sunday;
  },

  /**
   * Valide la durée du vol (doit être positive)
   */
  validateDuration: (durationMinutes: number): boolean => {
    return durationMinutes > 0;
  },

  /**
   * Valide le code IATA (3 lettres majuscules)
   */
  validateIATACode: (code: string): boolean => {
    return /^[A-Z]{3}$/.test(code.toUpperCase());
  },

  /**
   * Valide le code de compagnie aérienne (2 ou 3 caractères)
   */
  validateAirlineCode: (code: string): boolean => {
    return /^[A-Z0-9]{2,3}$/.test(code.toUpperCase());
  },

  /**
   * Valide le numéro de vol (alphanumeric, 1-20 caractères)
   */
  validateFlightNumber: (number: string): boolean => {
    return /^[A-Z0-9]{1,20}$/i.test(number);
  },

  /**
   * Valide les multiplicateurs de saison
   */
  validateSeasonMultipliers: (high: number, low: number): boolean => {
    return high >= 0.5 && high <= 3 && low >= 0.5 && low <= 3;
  },

  /**
   * Valide le taux de commission
   */
  validateCommissionRate: (rate: number): boolean => {
    return rate >= 0 && rate <= 100;
  },

  /**
   * Messages d'erreur pour la validation
   */
  errorMessages: {
    dates: "La date d'arrivée doit être égale ou après la date de départ",
    prices: "Le prix de vente doit être supérieur ou égal au prix de base",
    availability: "La date de fin de disponibilité doit être après la date de début",
    operatingDays: "Au moins un jour d'opération doit être sélectionné",
    duration: "La durée du vol doit être positive",
    iataCode: "Le code IATA doit contenir exactement 3 lettres",
    airlineCode: "Le code de compagnie doit contenir 2 ou 3 caractères alphanumériques",
    flightNumber: "Le numéro de vol doit être alphanumérique (1-20 caractères)",
    seasonMultipliers: "Les multiplicateurs de saison doivent être entre 0.5 et 3",
    commissionRate: "Le taux de commission doit être entre 0% et 100%"
  },

  /**
   * Validation complète d'un vol programmé
   */
  validateFlightSchedule: (formData: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation des codes
    if (!flightValidation.validateAirlineCode(formData.airline_code)) {
      errors.push(flightValidation.errorMessages.airlineCode);
    }

    if (!flightValidation.validateFlightNumber(formData.flight_number)) {
      errors.push(flightValidation.errorMessages.flightNumber);
    }

    // Validation des jours d'opération
    if (!flightValidation.validateOperatingDays(formData)) {
      errors.push(flightValidation.errorMessages.operatingDays);
    }

    // Validation de la durée
    if (formData.duration_minutes && !flightValidation.validateDuration(formData.duration_minutes)) {
      errors.push(flightValidation.errorMessages.duration);
    }

    // Validation des multiplicateurs de saison
    if (formData.high_season_multiplier && formData.low_season_multiplier) {
      if (!flightValidation.validateSeasonMultipliers(
        formData.high_season_multiplier, 
        formData.low_season_multiplier
      )) {
        errors.push(flightValidation.errorMessages.seasonMultipliers);
      }
    }

    // Validation du taux de commission
    if (formData.commission_rate !== undefined && 
        !flightValidation.validateCommissionRate(formData.commission_rate)) {
      errors.push(flightValidation.errorMessages.commissionRate);
    }

    // Validation des dates de validité
    if (formData.valid_from && formData.valid_until) {
      if (!flightValidation.validateAvailability(formData.valid_from, formData.valid_until)) {
        errors.push("La date de fin de validité doit être après la date de début");
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validation complète d'un vol spécial
   */
  validateFlight: (formData: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation des codes
    if (!flightValidation.validateAirlineCode(formData.airline_code)) {
      errors.push(flightValidation.errorMessages.airlineCode);
    }

    if (!flightValidation.validateFlightNumber(formData.flight_number)) {
      errors.push(flightValidation.errorMessages.flightNumber);
    }

    // Validation des dates
    if (formData.departure_date && formData.arrival_date) {
      if (!flightValidation.validateDates(formData.departure_date, formData.arrival_date)) {
        errors.push(flightValidation.errorMessages.dates);
      }
    }

    // Validation des prix
    if (formData.base_price && formData.our_price) {
      if (!flightValidation.validatePrices(formData.base_price, formData.our_price)) {
        errors.push(flightValidation.errorMessages.prices);
      }
    }

    // Validation de la disponibilité
    if (formData.available_from && formData.available_to) {
      if (!flightValidation.validateAvailability(formData.available_from, formData.available_to)) {
        errors.push(flightValidation.errorMessages.availability);
      }
    }

    // Validation de la durée
    if (formData.duration_minutes && !flightValidation.validateDuration(formData.duration_minutes)) {
      errors.push(flightValidation.errorMessages.duration);
    }

    // Validation du taux de commission
    if (formData.commission_rate !== undefined && 
        !flightValidation.validateCommissionRate(formData.commission_rate)) {
      errors.push(flightValidation.errorMessages.commissionRate);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

/**
 * Hook pour utiliser la validation dans les composants React
 */
export const useFlightValidation = () => {
  const validateAndShowErrors = (
    validationResult: { valid: boolean; errors: string[] },
    showAlert: boolean = true
  ): boolean => {
    if (!validationResult.valid && showAlert) {
      alert('Erreurs de validation:\n' + validationResult.errors.join('\n'));
    }
    return validationResult.valid;
  };

  return {
    ...flightValidation,
    validateAndShowErrors
  };
};
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExportData {
  id: string;
  date: string;
  client: string;
  email: string;
  telephone: string;
  type: string;
  statut: string;
  montant: number;
  commission: number;
}

export function exportToCSV(data: any[], filename = 'bookings.csv') {
  // Préparer les données
  const csvData: ExportData[] = data.map(booking => ({
    id: booking.id.slice(0, 8).toUpperCase(),
    date: format(new Date(booking.created_at), 'dd/MM/yyyy', { locale: fr }),
    client: booking.passenger_details?.passengers?.[0]?.name || 
            booking.guest_email?.split('@')[0] || 'Client',
    email: booking.guest_email || '',
    telephone: booking.guest_phone || '',
    type: getBookingTypeLabel(booking),
    statut: getStatusLabel(booking.status),
    montant: booking.total_amount,
    commission: booking.commission_amount || 0
  }));

  // Créer le CSV
  const headers = ['ID', 'Date', 'Client', 'Email', 'Téléphone', 'Type', 'Statut', 'Montant', 'Commission'];
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => 
      [
        row.id,
        row.date,
        `"${row.client}"`, // Encapsuler pour gérer les virgules
        row.email,
        row.telephone,
        row.type,
        row.statut,
        row.montant,
        row.commission
      ].join(',')
    )
  ].join('\n');

  // Télécharger le fichier
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export async function exportToExcel(data: any[], filename = 'bookings.xlsx') {
  // Importer dynamiquement xlsx pour réduire la taille du bundle
  const XLSX = await import('xlsx');
  
  // Préparer les données
  const excelData = data.map(booking => ({
    'ID Réservation': booking.id.slice(0, 8).toUpperCase(),
    'Date': format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
    'Client': booking.passenger_details?.passengers?.[0]?.name || 
              booking.guest_email?.split('@')[0] || 'Client',
    'Email': booking.guest_email || '',
    'Téléphone': booking.guest_phone || '',
    'Type': getBookingTypeLabel(booking),
    'Statut': getStatusLabel(booking.status),
    'Montant (XOF)': booking.total_amount,
    'Commission (XOF)': booking.commission_amount || 0,
    'Montant Net (XOF)': booking.total_amount - (booking.commission_amount || 0),
    'Référence Externe': booking.external_booking_id || '',
    'Date de Voyage': booking.flight_details?.date || 
                     booking.hotel_details?.checkIn || 
                     'Non spécifiée'
  }));

  // Créer le workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Ajuster la largeur des colonnes
  const colWidths = [
    { wch: 15 }, // ID
    { wch: 18 }, // Date
    { wch: 25 }, // Client
    { wch: 25 }, // Email
    { wch: 15 }, // Téléphone
    { wch: 10 }, // Type
    { wch: 12 }, // Statut
    { wch: 15 }, // Montant
    { wch: 15 }, // Commission
    { wch: 15 }, // Montant Net
    { wch: 20 }, // Référence
    { wch: 18 }, // Date voyage
  ];
  ws['!cols'] = colWidths;

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Réservations');

  // Ajouter une feuille de résumé
  const summary = [
    ['Résumé des Réservations'],
    [],
    ['Total réservations', data.length],
    ['Montant total', data.reduce((sum, b) => sum + b.total_amount, 0)],
    ['Commission totale', data.reduce((sum, b) => sum + (b.commission_amount || 0), 0)],
    [],
    ['Par statut:'],
    ...getStatusSummary(data),
    [],
    ['Par type:'],
    ...getTypeSummary(data)
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

  // Télécharger le fichier
  XLSX.writeFile(wb, filename);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    cancelled: 'Annulée',
    failed: 'Échouée',
    completed: 'Complétée'
  };
  return labels[status] || status;
}

function getBookingTypeLabel(booking: any): string {
  if (booking.booking_type !== 'package') {
    return booking.booking_type === 'flight' ? 'Vol' : 
           booking.booking_type === 'hotel' ? 'Hôtel' : 
           booking.booking_type;
  }
  
  // 1. Détection du sous-type de package par métadonnées
  const packageType = booking.passenger_details?.packageType;
  if (packageType) {
    const labels: Record<string, string> = {
      umra: 'Umra',
      can2025: 'CAN 2025',
      visa: 'Visa',
      sejour: 'Séjour'
    };
    return labels[packageType] || 'Package';
  }
  
  // 2. Détection par destination
  if (booking.flight_details?.destination) {
    const destination = booking.flight_details.destination.toLowerCase();
    if (destination.includes('mecca') || destination.includes('mecque') || 
        destination.includes('saudi') || destination.includes('arabie')) {
      return 'Umra';
    }
    if (destination.includes('abidjan') || destination.includes('côte d\'ivoire')) {
      return 'CAN 2025';
    }
  }
  
  // 3. Détection par prix par personne
  const passengers = booking.passenger_details?.passengers || [];
  const numberOfPassengers = passengers.length || 1;
  const pricePerPerson = booking.total_amount / numberOfPassengers;
  
  if (pricePerPerson >= 1100000 && pricePerPerson <= 1800000) return 'Umra';
  if (pricePerPerson >= 800000 && pricePerPerson <= 1200000) return 'CAN 2025';
  if (pricePerPerson >= 50000 && pricePerPerson <= 300000) return 'Visa';
  
  return 'Package';
}

function getStatusSummary(data: any[]): [string, number][] {
  const summary: Record<string, number> = {};
  data.forEach(booking => {
    const status = getStatusLabel(booking.status);
    summary[status] = (summary[status] || 0) + 1;
  });
  return Object.entries(summary);
}

function getTypeSummary(data: any[]): [string, number][] {
  const summary: Record<string, number> = {};
  data.forEach(booking => {
    const type = booking.booking_type === 'flight' ? 'Vol' : 
                 booking.booking_type === 'hotel' ? 'Hôtel' : 'Package';
    summary[type] = (summary[type] || 0) + 1;
  });
  return Object.entries(summary);
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(['\ufeff' + content], { type: mimeType }); // UTF-8 BOM
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
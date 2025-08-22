import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking } from '../types/booking';

export async function generateInvoicePDF(booking: Booking) {
  // Importer dynamiquement jsPDF
  const { default: jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Configuration
  const leftMargin = 20;
  const rightMargin = pageWidth - 20;
  let yPosition = 20;

  // En-tête
  doc.setFontSize(24);
  doc.setTextColor(33, 37, 41);
  doc.text('NOORAYA VOYAGE', leftMargin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text('Agence de voyage agréée', leftMargin, yPosition);
  
  // Logo (si disponible)
  // doc.addImage(logoBase64, 'PNG', rightMargin - 50, 10, 40, 20);

  // Titre Facture
  yPosition += 20;
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text('FACTURE', pageWidth / 2, yPosition, { align: 'center' });

  // Numéro et date
  yPosition += 15;
  doc.setFontSize(10);
  doc.text(`N° ${booking.id.slice(0, 8).toUpperCase()}`, leftMargin, yPosition);
  doc.text(`Date: ${format(new Date(booking.created_at), 'dd MMMM yyyy', { locale: fr })}`, rightMargin, yPosition, { align: 'right' });

  // Ligne de séparation
  yPosition += 10;
  doc.setLineWidth(0.5);
  doc.line(leftMargin, yPosition, rightMargin, yPosition);

  // Informations client
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('CLIENT', leftMargin, yPosition);
  
  yPosition += 8;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const clientName = booking.passenger_details?.passengers?.[0]?.name || 
                    booking.guest_email?.split('@')[0] || 'Client';
  doc.text(clientName, leftMargin, yPosition);
  
  if (booking.guest_email) {
    yPosition += 5;
    doc.text(booking.guest_email, leftMargin, yPosition);
  }
  
  if (booking.guest_phone) {
    yPosition += 5;
    doc.text(booking.guest_phone, leftMargin, yPosition);
  }

  // Détails de la réservation
  yPosition += 20;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('DÉTAILS DE LA RÉSERVATION', leftMargin, yPosition);

  // Tableau des services
  yPosition += 10;
  const colWidths = [80, 30, 40, 40];
  const headers = ['Description', 'Quantité', 'Prix unitaire', 'Total'];
  
  // En-tête du tableau
  doc.setFillColor(248, 249, 250);
  doc.rect(leftMargin, yPosition - 5, rightMargin - leftMargin, 10, 'F');
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  
  let xPos = leftMargin + 5;
  headers.forEach((header, index) => {
    doc.text(header, xPos, yPosition);
    xPos += colWidths[index];
  });

  // Contenu du tableau
  yPosition += 15;
  doc.setFont(undefined, 'normal');
  
  // Description du service
  let description = '';
  if (booking.booking_type === 'flight') {
    description = `Vol - ${booking.flight_details?.departure || 'Départ'} → ${booking.flight_details?.arrival || 'Arrivée'}`;
    if (booking.flight_details?.date) {
      description += `\nDate: ${booking.flight_details.date}`;
    }
  } else if (booking.booking_type === 'hotel') {
    description = 'Réservation Hôtel';
  } else {
    description = 'Package Voyage';
  }

  xPos = leftMargin + 5;
  const lines = doc.splitTextToSize(description, colWidths[0] - 10);
  doc.text(lines, xPos, yPosition);
  xPos += colWidths[0];
  
  doc.text('1', xPos, yPosition);
  xPos += colWidths[1];
  
  doc.text(formatCurrency(booking.total_amount), xPos, yPosition);
  xPos += colWidths[2];
  
  doc.text(formatCurrency(booking.total_amount), xPos, yPosition);

  // Ligne de séparation
  yPosition += lines.length * 5 + 10;
  doc.line(leftMargin, yPosition, rightMargin, yPosition);

  // Totaux
  yPosition += 10;
  const totalsX = rightMargin - 80;
  
  doc.text('Sous-total:', totalsX - 30, yPosition);
  doc.text(formatCurrency(booking.total_amount), totalsX + 30, yPosition, { align: 'right' });

  if (booking.commission_amount && booking.commission_amount > 0) {
    yPosition += 6;
    doc.text('Commission:', totalsX - 30, yPosition);
    doc.text(`-${formatCurrency(booking.commission_amount)}`, totalsX + 30, yPosition, { align: 'right' });
  }

  yPosition += 8;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL À PAYER:', totalsX - 30, yPosition);
  doc.text(formatCurrency(booking.total_amount), totalsX + 30, yPosition, { align: 'right' });

  // Conditions et mentions légales
  yPosition += 30;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(108, 117, 125);
  
  const mentions = [
    'Cette facture est payable à réception.',
    'En cas de retard de paiement, des pénalités pourront être appliquées.',
    'Conditions générales de vente disponibles sur demande.'
  ];
  
  mentions.forEach(mention => {
    doc.text(mention, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
  });

  // Pied de page
  const bottomY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.text('NOORAYA VOYAGE - Tel: +221 XX XXX XX XX - Email: contact@noorayagroup.com', pageWidth / 2, bottomY, { align: 'center' });
  doc.text('RC: XXXXXX - NINEA: XXXXXX', pageWidth / 2, bottomY + 4, { align: 'center' });

  // Sauvegarder le PDF
  doc.save(`facture-${booking.id.slice(0, 8)}.pdf`);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
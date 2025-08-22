import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components';

interface BookingConfirmationEmailProps {
  customerName: string;
  bookingId: string;
  bookingType: 'flight' | 'hotel' | 'package';
  bookingDetails: {
    from?: string;
    to?: string;
    departureDate?: string;
    returnDate?: string;
    hotelName?: string;
    checkIn?: string;
    checkOut?: string;
    packageName?: string;
    passengers?: Array<{
      firstName: string;
      lastName: string;
    }>;
  };
  totalAmount: number;
  currency: string;
  paymentStatus: string;
}

export const BookingConfirmationEmail = ({
  customerName,
  bookingId,
  bookingType,
  bookingDetails,
  totalAmount,
  currency,
  paymentStatus,
}: BookingConfirmationEmailProps) => {
  const previewText = `Confirmation de votre réservation ${bookingType === 'flight' ? 'de vol' : bookingType === 'hotel' ? "d'hôtel" : 'de package'} - Nooraya Voyage`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Nooraya Voyage</Heading>
            <Text style={tagline}>Votre partenaire de confiance pour tous vos voyages</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Confirmation de réservation
            </Heading>
            
            <Text style={paragraph}>
              Bonjour {customerName},
            </Text>
            
            <Text style={paragraph}>
              Nous avons le plaisir de vous confirmer votre réservation. Voici les détails :
            </Text>

            {/* Booking Details Box */}
            <Section style={bookingBox}>
              <Text style={bookingIdText}>
                Numéro de réservation : <strong>#{bookingId.slice(0, 8).toUpperCase()}</strong>
              </Text>
              
              {bookingType === 'flight' && (
                <>
                  <Row>
                    <Column>
                      <Text style={label}>Départ</Text>
                      <Text style={value}>{bookingDetails.from}</Text>
                    </Column>
                    <Column>
                      <Text style={label}>Destination</Text>
                      <Text style={value}>{bookingDetails.to}</Text>
                    </Column>
                  </Row>
                  <Row style={{ marginTop: '20px' }}>
                    <Column>
                      <Text style={label}>Date aller</Text>
                      <Text style={value}>{bookingDetails.departureDate}</Text>
                    </Column>
                    <Column>
                      <Text style={label}>Date retour</Text>
                      <Text style={value}>{bookingDetails.returnDate || 'Aller simple'}</Text>
                    </Column>
                  </Row>
                </>
              )}

              {bookingType === 'hotel' && (
                <>
                  <Text style={hotelName}>{bookingDetails.hotelName}</Text>
                  <Row>
                    <Column>
                      <Text style={label}>Check-in</Text>
                      <Text style={value}>{bookingDetails.checkIn}</Text>
                    </Column>
                    <Column>
                      <Text style={label}>Check-out</Text>
                      <Text style={value}>{bookingDetails.checkOut}</Text>
                    </Column>
                  </Row>
                </>
              )}

              {bookingType === 'package' && (
                <>
                  <Text style={packageTitle}>{bookingDetails.packageName}</Text>
                  <Text style={label}>Passagers :</Text>
                  {bookingDetails.passengers?.map((passenger, index) => (
                    <Text key={index} style={passengerText}>
                      • {passenger.firstName} {passenger.lastName}
                    </Text>
                  ))}
                </>
              )}

              {/* Price Section */}
              <Section style={priceSection}>
                <Row>
                  <Column align="left">
                    <Text style={priceLabel}>Montant total</Text>
                  </Column>
                  <Column align="right">
                    <Text style={priceValue}>
                      {new Intl.NumberFormat('fr-FR').format(totalAmount)} {currency}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column align="left">
                    <Text style={statusLabel}>Statut du paiement</Text>
                  </Column>
                  <Column align="right">
                    <Text style={paymentStatus === 'paid' ? statusPaid : statusPending}>
                      {paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* Call to Action */}
            <Section style={{ textAlign: 'center', marginTop: '30px' }}>
              <Button
                href={`https://dashboard.noorayavoyage.com/bookings/${bookingId}`}
                style={button}
              >
                Voir ma réservation
              </Button>
            </Section>

            {/* Important Information */}
            <Section style={infoSection}>
              <Heading as="h3" style={h3}>
                Informations importantes
              </Heading>
              <Text style={infoText}>
                • Veuillez vous présenter à l'aéroport au moins 2 heures avant le départ pour les vols domestiques et 3 heures pour les vols internationaux.
              </Text>
              <Text style={infoText}>
                • Assurez-vous que votre passeport est valide pour au moins 6 mois après la date de voyage.
              </Text>
              <Text style={infoText}>
                • Conservez ce email comme preuve de réservation.
              </Text>
            </Section>

            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>
                Besoin d'aide ? Contactez-nous :
              </Text>
              <Text style={footerContact}>
                📧 contact@noorayavoyage.com | 📞 +221 77 123 45 67
              </Text>
              <Text style={footerCopyright}>
                © 2024 Nooraya Voyage. Tous droits réservés.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#1e40af',
  padding: '24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const tagline = {
  color: '#dbeafe',
  fontSize: '14px',
  margin: '8px 0 0 0',
};

const content = {
  padding: '24px',
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const bookingBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const bookingIdText = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 16px 0',
};

const label = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 4px 0',
};

const value = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const hotelName = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const packageTitle = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const passengerText = {
  color: '#374151',
  fontSize: '14px',
  margin: '4px 0',
};

const priceSection = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '20px',
  paddingTop: '20px',
};

const priceLabel = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
};

const priceValue = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const statusLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0 0 0',
};

const statusPaid = {
  color: '#10b981',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const statusPending = {
  color: '#f59e0b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const button = {
  backgroundColor: '#1e40af',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const infoSection = {
  marginTop: '32px',
  padding: '24px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
};

const infoText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '8px 0',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '32px',
  paddingTop: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const footerContact = {
  color: '#374151',
  fontSize: '14px',
  margin: '0 0 16px 0',
};

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
};

export default BookingConfirmationEmail;
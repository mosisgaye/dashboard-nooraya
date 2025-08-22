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
} from '@react-email/components';

interface PaymentReminderEmailProps {
  customerName: string;
  bookingId: string;
  bookingType: string;
  totalAmount: number;
  currency: string;
  dueDate: string;
  paymentLink: string;
}

export const PaymentReminderEmail = ({
  customerName,
  bookingId,
  bookingType,
  totalAmount,
  currency,
  dueDate,
  paymentLink,
}: PaymentReminderEmailProps) => {
  const previewText = `Rappel de paiement - Réservation #${bookingId.slice(0, 8).toUpperCase()}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Nooraya Voyage</Heading>
          </Section>

          {/* Alert Banner */}
          <Section style={alertBanner}>
            <Text style={alertText}>⏰ Rappel de paiement</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>
              Bonjour {customerName},
            </Text>
            
            <Text style={paragraph}>
              Nous vous rappelons que le paiement de votre réservation est toujours en attente.
            </Text>

            {/* Booking Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Détails de la réservation :</Text>
              <Text style={detailsText}>
                • Numéro : <strong>#{bookingId.slice(0, 8).toUpperCase()}</strong>
              </Text>
              <Text style={detailsText}>
                • Type : <strong>{bookingType}</strong>
              </Text>
              <Text style={detailsText}>
                • Montant : <strong>{new Intl.NumberFormat('fr-FR').format(totalAmount)} {currency}</strong>
              </Text>
              <Text style={warningText}>
                ⚠️ Date limite de paiement : <strong>{dueDate}</strong>
              </Text>
            </Section>

            {/* CTA */}
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={paymentLink} style={button}>
                Payer maintenant
              </Button>
              <Text style={ctaSubtext}>
                Cliquez sur le bouton ci-dessus pour procéder au paiement sécurisé
              </Text>
            </Section>

            {/* Warning */}
            <Section style={warningBox}>
              <Text style={warningTitle}>⚠️ Important</Text>
              <Text style={warningContent}>
                Votre réservation sera automatiquement annulée si le paiement n'est pas effectué avant la date limite.
              </Text>
            </Section>

            {/* Help */}
            <Text style={helpText}>
              Besoin d'aide ? N'hésitez pas à nous contacter :
            </Text>
            <Text style={contactText}>
              📧 contact@noorayavoyage.com | 📞 +221 77 123 45 67
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 Nooraya Voyage. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#1e40af',
  padding: '20px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const alertBanner = {
  backgroundColor: '#fef3c7',
  padding: '12px',
  textAlign: 'center' as const,
};

const alertText = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '32px',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const detailsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const detailsTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const detailsText = {
  color: '#374151',
  fontSize: '14px',
  margin: '8px 0',
};

const warningText = {
  color: '#dc2626',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '16px 0 0 0',
};

const button = {
  backgroundColor: '#ef4444',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
};

const ctaSubtext = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '12px 0 0 0',
};

const warningBox = {
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningTitle = {
  color: '#991b1b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const warningContent = {
  color: '#991b1b',
  fontSize: '14px',
  margin: '0',
};

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '24px 0 8px 0',
};

const contactText = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
};

export default PaymentReminderEmail;
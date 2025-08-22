import { supabase } from '../supabase';
import { render } from '@react-email/render';
import BookingConfirmationEmail from './templates/BookingConfirmation';
import PaymentReminderEmail from './templates/PaymentReminder';

// Types pour les emails
export interface EmailOptions {
  to: string;
  subject: string;
  template: 'booking_confirmation' | 'payment_reminder' | 'status_update' | 'welcome' | 'custom';
  data: any;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

// Configuration email (à adapter selon votre fournisseur)
const EMAIL_CONFIG = {
  from: 'Nooraya Voyage <noreply@noorayavoyage.com>',
  replyTo: 'contact@noorayavoyage.com',
};

// Service principal d'email
export class EmailService {
  // Méthode principale pour envoyer un email
  static async send(options: EmailOptions): Promise<EmailResult> {
    try {
      // Générer le HTML selon le template
      const html = await this.generateEmailHtml(options.template, options.data);
      
      // Enregistrer l'email dans la base de données
      await this.logEmail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        status: 'pending',
        data: options.data,
      });

      // Envoyer via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: [options.to], // La fonction Edge attend un tableau
          template: 'custom',
          data: {
            subject: options.subject,
            content: html,
          },
          options: {
            replyTo: EMAIL_CONFIG.replyTo,
          }
        },
      });

      if (error) {
        await this.updateEmailStatus(options.to, 'failed', error.message);
        return { success: false, error: error.message };
      }

      await this.updateEmailStatus(options.to, 'sent', null, data?.messageId);
      return { success: true, messageId: data?.messageId };

    } catch (error) {
      console.error('Email sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Générer le HTML de l'email selon le template
  private static async generateEmailHtml(template: string, data: any): Promise<string> {
    switch (template) {
      case 'booking_confirmation':
        return render(BookingConfirmationEmail(data));
      
      case 'payment_reminder':
        return render(PaymentReminderEmail(data));
      
      case 'status_update':
        return this.generateStatusUpdateHtml(data);
      
      case 'welcome':
        return this.generateWelcomeHtml(data);
      
      case 'custom':
        return data.html || this.generateCustomHtml(data);
      
      default:
        throw new Error(`Template ${template} not found`);
    }
  }

  // Template pour mise à jour de statut
  private static generateStatusUpdateHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Mise à jour de votre réservation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Nooraya Voyage</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
              <h2>Mise à jour de votre réservation</h2>
              <p>Bonjour ${data.customerName},</p>
              
              <p>Le statut de votre réservation <strong>#${data.bookingId}</strong> a été mis à jour :</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Nouveau statut :</strong> ${data.newStatus}</p>
                <p style="margin: 5px 0;"><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                ${data.message ? `<p style="margin: 5px 0;"><strong>Message :</strong> ${data.message}</p>` : ''}
              </div>
              
              <p>Pour plus de détails, connectez-vous à votre espace client.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.bookingUrl}" style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Voir ma réservation
                </a>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              © 2024 Nooraya Voyage. Tous droits réservés.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Template de bienvenue
  private static generateWelcomeHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bienvenue chez Nooraya Voyage</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1e40af; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0;">Bienvenue chez Nooraya Voyage !</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
              <h2>Bonjour ${data.customerName} 👋</h2>
              
              <p>Nous sommes ravis de vous compter parmi nos clients !</p>
              
              <p>Chez Nooraya Voyage, nous nous engageons à vous offrir :</p>
              <ul>
                <li>Les meilleurs tarifs pour vos vols</li>
                <li>Un large choix d'hôtels de qualité</li>
                <li>Des packages sur mesure (Umra, CAN 2025, etc.)</li>
                <li>Un service client disponible 7j/7</li>
              </ul>
              
              <div style="background-color: #e0f2fe; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">🎁 Offre de bienvenue</h3>
                <p>Profitez de <strong>5% de réduction</strong> sur votre première réservation avec le code :</p>
                <p style="text-align: center; font-size: 24px; font-weight: bold; color: #1e40af;">
                  BIENVENUE2024
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://noorayavoyage.com" style="background-color: #1e40af; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px;">
                  Découvrir nos offres
                </a>
              </div>
              
              <p>À bientôt pour votre prochain voyage !</p>
              <p>L'équipe Nooraya Voyage</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666;">
              <p style="margin: 5px;">📧 contact@noorayavoyage.com | 📞 +221 77 123 45 67</p>
              <p style="margin: 5px; font-size: 12px;">© 2024 Nooraya Voyage. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Template personnalisé
  private static generateCustomHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${data.title || 'Nooraya Voyage'}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Nooraya Voyage</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
              ${data.content}
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              © 2024 Nooraya Voyage. Tous droits réservés.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Enregistrer l'email dans la base de données
  private static async logEmail(emailData: any) {
    const { error } = await supabase
      .from('email_logs')
      .insert({
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
        status: emailData.status,
        data: emailData.data,
        sent_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error logging email:', error);
    }
  }

  // Mettre à jour le statut de l'email
  private static async updateEmailStatus(
    to: string, 
    status: string, 
    error?: string | null,
    messageId?: string
  ) {
    const { error: updateError } = await supabase
      .from('email_logs')
      .update({ 
        status, 
        error_message: error,
        message_id: messageId,
        updated_at: new Date().toISOString(),
      })
      .eq('to', to)
      .order('created_at', { ascending: false })
      .limit(1);

    if (updateError) {
      console.error('Error updating email status:', updateError);
    }
  }
}

// Fonctions utilitaires pour envoyer des emails spécifiques
export const sendBookingConfirmation = async (booking: any) => {
  const emailData = {
    customerName: booking.guest_name || 'Client',
    bookingId: booking.id,
    bookingType: booking.booking_type,
    bookingDetails: {
      from: booking.flight_details?.from,
      to: booking.flight_details?.to,
      departureDate: booking.flight_details?.departureDate,
      returnDate: booking.flight_details?.returnDate,
      hotelName: booking.hotel_details?.name,
      checkIn: booking.hotel_details?.checkIn,
      checkOut: booking.hotel_details?.checkOut,
      packageName: booking.package_details?.name,
      passengers: booking.passenger_details?.passengers,
    },
    totalAmount: booking.total_amount,
    currency: booking.currency || 'XOF',
    paymentStatus: booking.payment_status || 'pending',
  };

  return EmailService.send({
    to: booking.guest_email,
    subject: `Confirmation de réservation - ${booking.id.slice(0, 8).toUpperCase()}`,
    template: 'booking_confirmation',
    data: emailData,
  });
};

export const sendPaymentReminder = async (booking: any) => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3); // 3 jours pour payer

  const emailData = {
    customerName: booking.guest_name || 'Client',
    bookingId: booking.id,
    bookingType: booking.booking_type === 'flight' ? 'Vol' : 
                 booking.booking_type === 'hotel' ? 'Hôtel' : 'Package',
    totalAmount: booking.total_amount,
    currency: booking.currency || 'XOF',
    dueDate: dueDate.toLocaleDateString('fr-FR'),
    paymentLink: `https://noorayavoyage.com/payment/${booking.id}`,
  };

  return EmailService.send({
    to: booking.guest_email,
    subject: `Rappel de paiement - Réservation ${booking.id.slice(0, 8).toUpperCase()}`,
    template: 'payment_reminder',
    data: emailData,
  });
};

export const sendStatusUpdate = async (booking: any, newStatus: string, message?: string) => {
  const emailData = {
    customerName: booking.guest_name || 'Client',
    bookingId: booking.id.slice(0, 8).toUpperCase(),
    newStatus: newStatus === 'confirmed' ? 'Confirmée' :
                newStatus === 'cancelled' ? 'Annulée' :
                newStatus === 'completed' ? 'Complétée' : newStatus,
    message,
    bookingUrl: `https://noorayavoyage.com/bookings/${booking.id}`,
  };

  return EmailService.send({
    to: booking.guest_email,
    subject: `Mise à jour de votre réservation - ${booking.id.slice(0, 8).toUpperCase()}`,
    template: 'status_update',
    data: emailData,
  });
};

export const sendWelcomeEmail = async (customer: any) => {
  return EmailService.send({
    to: customer.email,
    subject: 'Bienvenue chez Nooraya Voyage !',
    template: 'welcome',
    data: {
      customerName: customer.first_name || customer.email.split('@')[0],
    },
  });
};
import { supabase } from '../supabase';

export interface SlackNotification {
  channel: 'paiements-recus' | 'nouvelles-reservations' | 'reservations-urgentes';
  message: {
    text: string;
    username?: string;
    icon_emoji?: string;
    attachments?: Array<{
      color?: string;
      pretext?: string;
      fields?: Array<{
        title: string;
        value: string;
        short?: boolean;
      }>;
      footer?: string;
      ts?: number;
    }>;
  };
}

export class SlackService {
  // Envoyer une notification Slack
  static async sendNotification(notification: SlackNotification): Promise<boolean> {
    try {
      // Enregistrer dans la queue
      const { error } = await supabase
        .from('slack_notifications_log')
        .insert({
          channel: notification.channel,
          message: notification.message,
          status: 'pending'
        });

      if (error) throw error;

      // Appeler la fonction Edge pour traiter immédiatement
      const { error: fnError } = await supabase.functions.invoke('send-slack-notification');
      
      if (fnError) {
        console.error('Erreur envoi Slack:', fnError);
      }

      return true;
    } catch (error) {
      console.error('Erreur notification Slack:', error);
      return false;
    }
  }

  // Notification de paiement
  static async notifyPayment(data: {
    bookingRef: string;
    customerName: string;
    amountPaid: number;
    paymentMethod: string;
    totalAmount: number;
    remainingAmount: number;
    isFullPayment: boolean;
  }) {
    const notification: SlackNotification = {
      channel: 'paiements-recus',
      message: {
        text: `💰 ${data.isFullPayment ? 'Paiement Complet' : 'Paiement Partiel'} Confirmé`,
        username: 'Nooraya Paiements',
        icon_emoji: ':moneybag:',
        attachments: [{
          color: data.isFullPayment ? '#2eb886' : '#ff9800',
          pretext: data.isFullPayment ? 'Paiement complet reçu ✅' : 'Paiement partiel reçu',
          fields: [
            { title: 'Réservation', value: data.bookingRef, short: true },
            { title: 'Client', value: data.customerName, short: true },
            { title: 'Montant reçu', value: `${data.amountPaid.toLocaleString('fr-FR')} XOF`, short: true },
            { title: 'Mode', value: data.paymentMethod, short: true },
            { title: 'Total réservation', value: `${data.totalAmount.toLocaleString('fr-FR')} XOF`, short: true },
            { title: 'Reste à payer', value: `${data.remainingAmount.toLocaleString('fr-FR')} XOF`, short: true }
          ],
          footer: 'Nooraya Voyage',
          ts: Math.floor(Date.now() / 1000)
        }]
      }
    };

    return this.sendNotification(notification);
  }

  // Notification de nouvelle réservation (pour plus tard)
  static async notifyNewBooking(data: {
    bookingRef: string;
    customerName: string;
    packageType: string;
    amount: number;
    isUrgent?: boolean;
  }) {
    const channel = data.isUrgent || data.amount > 2000000 
      ? 'reservations-urgentes' 
      : 'nouvelles-reservations';

    const notification: SlackNotification = {
      channel,
      message: {
        text: data.isUrgent 
          ? `🚨 URGENT - Nouvelle Réservation ${data.bookingRef}`
          : `✅ Nouvelle Réservation ${data.bookingRef}`,
        username: 'Nooraya Bot',
        icon_emoji: data.isUrgent ? ':rotating_light:' : ':airplane:',
        attachments: [{
          color: data.isUrgent ? '#dc3545' : 'good',
          fields: [
            { title: 'Client', value: data.customerName, short: true },
            { title: 'Package', value: data.packageType, short: true },
            { title: 'Montant', value: `${data.amount.toLocaleString('fr-FR')} XOF`, short: true },
            { title: 'Statut', value: data.isUrgent ? '⚡ Action requise' : 'En attente', short: true }
          ],
          footer: 'Nooraya Voyage',
          ts: Math.floor(Date.now() / 1000)
        }]
      }
    };

    return this.sendNotification(notification);
  }
}
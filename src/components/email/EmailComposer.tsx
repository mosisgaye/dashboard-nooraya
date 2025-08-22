import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { 
  Mail, 
  Send, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { EmailService, sendBookingConfirmation, sendPaymentReminder, sendStatusUpdate } from '../../lib/email/service';
import toast from 'react-hot-toast';

interface EmailComposerProps {
  defaultTo?: string;
  defaultSubject?: string;
  defaultTemplate?: string;
  bookingData?: any;
  onClose?: () => void;
}

export default function EmailComposer({
  defaultTo = '',
  defaultSubject = '',
  defaultTemplate = 'custom',
  bookingData,
  onClose
}: EmailComposerProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [template, setTemplate] = useState(defaultTemplate);
  const [customContent, setCustomContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const templates = [
    { value: 'booking_confirmation', label: 'Confirmation de réservation' },
    { value: 'payment_reminder', label: 'Rappel de paiement' },
    { value: 'status_update', label: 'Mise à jour de statut' },
    { value: 'welcome', label: 'Email de bienvenue' },
    { value: 'custom', label: 'Email personnalisé' }
  ];

  const handleSend = async () => {
    if (!to || !subject) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSending(true);

    try {
      let result;

      // Utiliser les fonctions spécifiques selon le template
      if (template === 'booking_confirmation' && bookingData) {
        result = await sendBookingConfirmation(bookingData);
      } else if (template === 'payment_reminder' && bookingData) {
        result = await sendPaymentReminder(bookingData);
      } else if (template === 'status_update' && bookingData) {
        result = await sendStatusUpdate(bookingData, 'updated', customContent);
      } else {
        // Email personnalisé
        result = await EmailService.send({
          to,
          subject,
          template: 'custom',
          data: {
            content: customContent,
            title: subject
          }
        });
      }

      if (result.success) {
        toast.success('Email envoyé avec succès !');
        if (onClose) onClose();
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSending(false);
    }
  };

  const getPreviewContent = () => {
    switch (template) {
      case 'booking_confirmation':
        return `
          <h3>Aperçu : Confirmation de réservation</h3>
          <p>Cet email confirmera la réservation avec :</p>
          <ul>
            <li>Numéro de réservation</li>
            <li>Détails du voyage/hôtel/package</li>
            <li>Montant total</li>
            <li>Instructions suivantes</li>
          </ul>
        `;
      case 'payment_reminder':
        return `
          <h3>Aperçu : Rappel de paiement</h3>
          <p>Cet email rappellera au client :</p>
          <ul>
            <li>Montant dû</li>
            <li>Date limite de paiement</li>
            <li>Lien de paiement sécurisé</li>
            <li>Conséquences du non-paiement</li>
          </ul>
        `;
      case 'status_update':
        return `
          <h3>Aperçu : Mise à jour de statut</h3>
          <p>Cet email informera le client du changement de statut de sa réservation.</p>
        `;
      case 'welcome':
        return `
          <h3>Aperçu : Email de bienvenue</h3>
          <p>Cet email souhaitera la bienvenue au nouveau client avec :</p>
          <ul>
            <li>Message de bienvenue personnalisé</li>
            <li>Code de réduction pour la première réservation</li>
            <li>Présentation des services</li>
          </ul>
        `;
      default:
        return customContent || '<p>Entrez votre contenu personnalisé...</p>';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Composer un Email
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Destinataire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Destinataire *
          </label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="email@exemple.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type d'email
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {templates.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Sujet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sujet *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet de l'email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Contenu personnalisé pour template custom */}
        {template === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contenu
            </label>
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="Entrez le contenu de votre email..."
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Vous pouvez utiliser du HTML pour formater votre email
            </p>
          </div>
        )}

        {/* Message additionnel pour status update */}
        {template === 'status_update' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message additionnel (optionnel)
            </label>
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="Message complémentaire pour le client..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* Aperçu */}
        {!previewMode && template !== 'custom' && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Aperçu du template
              </h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setPreviewMode(true)}
              >
                Voir l'aperçu complet
              </Button>
            </div>
            <div 
              className="text-sm text-gray-600 dark:text-gray-400"
              dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
            />
          </div>
        )}

        {/* Informations sur la réservation */}
        {bookingData && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Email lié à la réservation #{bookingData.id?.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  Les informations de la réservation seront automatiquement incluses dans l'email.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          )}
          <Button
            onClick={handleSend}
            disabled={isSending || !to || !subject}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
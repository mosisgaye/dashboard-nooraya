import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Save,
  Key,
  AlertCircle,
  Edit2,
  Loader2,
  Percent,
  Slack,
  MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';


interface CommissionSettings {
  id?: string;
  percentage: number;
  min_amount: number;
  max_amount: number;
  currency: string;
  is_active: boolean;
}

interface SlackConfig {
  id?: string;
  webhook_url: string;
  channel: string;
  is_active: boolean;
  notify_bookings: boolean;
  notify_payments: boolean;
  notify_errors: boolean;
}

export default function Settings() {
  const { profile, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // États pour le formulaire profil
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    email: '',
    language: 'fr',
    timezone: 'Africa/Dakar'
  });

  // États pour les paramètres de commission
  const [commissionData, setCommissionData] = useState<CommissionSettings>({
    percentage: 5,
    min_amount: 10000,
    max_amount: 10000000,
    currency: 'XOF',
    is_active: true
  });

  // États pour Slack
  const [slackData, setSlackData] = useState<SlackConfig>({
    webhook_url: '',
    channel: '#general',
    is_active: false,
    notify_bookings: true,
    notify_payments: true,
    notify_errors: true
  });

  // États pour les notifications
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    booking_confirmation: true,
    payment_received: true,
    daily_report: false,
    weekly_summary: true
  });

  // Charger le profil utilisateur
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        company: (profile as any).company || '',
        email: profile.email || '',
        language: (profile as any).language || 'fr',
        timezone: (profile as any).timezone || 'Africa/Dakar'
      });
    }
  }, [profile]);

  // Charger les paramètres de commission
  useQuery({
    queryKey: ['commission-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('commission_settings')
        .select('*')
        .single();
      
      if (data) {
        setCommissionData(data);
      }
      return data;
    }
  });

  // Charger la configuration Slack
  useQuery({
    queryKey: ['slack-config'],
    queryFn: async () => {
      const { data } = await supabase
        .from('slack_config')
        .select('*')
        .single();
      
      if (data) {
        setSlackData(data);
      }
      return data;
    }
  });

  // Mutation pour sauvegarder le profil
  const saveProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profile?.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
      updateProfile(formData);
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    }
  });

  // Mutation pour sauvegarder les commissions
  const saveCommissionMutation = useMutation({
    mutationFn: async (data: CommissionSettings) => {
      if (data.id) {
        const { error } = await supabase
          .from('commission_settings')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('commission_settings')
          .insert(data);
        if (error) throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Paramètres de commission mis à jour');
    },
    onError: (error: any) => {
      toast.error('Erreur: ' + error.message);
    }
  });

  // Mutation pour sauvegarder Slack
  const saveSlackMutation = useMutation({
    mutationFn: async (data: SlackConfig) => {
      if (data.id) {
        const { error } = await supabase
          .from('slack_config')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('slack_config')
          .insert(data);
        if (error) throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Configuration Slack mise à jour');
    },
    onError: (error: any) => {
      toast.error('Erreur: ' + error.message);
    }
  });

  // Tester la connexion Slack
  const testSlackConnection = async () => {
    try {
      const response = await fetch(slackData.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '🎉 Test de connexion depuis Nooraya Dashboard!',
          channel: slackData.channel
        })
      });
      
      if (response.ok) {
        toast.success('Message de test envoyé à Slack!');
      } else {
        toast.error('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      toast.error('Impossible de se connecter à Slack');
    }
  };

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
    
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'commission', label: 'Commissions', icon: Percent },
    { id: 'integrations', label: 'Intégrations', icon: MessageSquare },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Globe }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gérez vos préférences et configurations
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Profil */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informations personnelles
                  </h2>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveProfileMutation.mutate(formData)}
                        disabled={saveProfileMutation.isPending}
                      >
                        {saveProfileMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Enregistrer
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Langue
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Préférences de notifications
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Canaux de notification
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Notifications par email
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Notifications push
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.push}
                          onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          SMS
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Types de notifications
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Confirmation de réservation
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.booking_confirmation}
                          onChange={(e) => setNotifications({ ...notifications, booking_confirmation: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Paiement reçu
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.payment_received}
                          onChange={(e) => setNotifications({ ...notifications, payment_received: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Rapport quotidien
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.daily_report}
                          onChange={(e) => setNotifications({ ...notifications, daily_report: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Résumé hebdomadaire
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications.weekly_summary}
                          onChange={(e) => setNotifications({ ...notifications, weekly_summary: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full sm:w-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder les préférences
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Commissions */}
            {activeTab === 'commission' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Paramètres de commission
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pourcentage de commission (%)
                    </label>
                    <input
                      type="number"
                      value={commissionData.percentage}
                      onChange={(e) => setCommissionData({ ...commissionData, percentage: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Devise
                    </label>
                    <select
                      value={commissionData.currency}
                      onChange={(e) => setCommissionData({ ...commissionData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="XOF">XOF</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Montant minimum
                    </label>
                    <input
                      type="number"
                      value={commissionData.min_amount}
                      onChange={(e) => setCommissionData({ ...commissionData, min_amount: parseFloat(e.target.value) })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Montant maximum
                    </label>
                    <input
                      type="number"
                      value={commissionData.max_amount}
                      onChange={(e) => setCommissionData({ ...commissionData, max_amount: parseFloat(e.target.value) })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={commissionData.is_active}
                      onChange={(e) => setCommissionData({ ...commissionData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Activer le calcul automatique des commissions
                    </span>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Information</p>
                      <p>Les commissions seront automatiquement calculées sur chaque réservation confirmée.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => saveCommissionMutation.mutate(commissionData)}
                    disabled={saveCommissionMutation.isPending}
                  >
                    {saveCommissionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Sauvegarder les paramètres
                  </Button>
                </div>
              </div>
            )}

            {/* Intégrations */}
            {activeTab === 'integrations' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Intégrations externes
                </h2>

                <div className="space-y-6">
                  {/* Slack */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Slack className="w-6 h-6 text-[#4A154B]" />
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        Slack
                      </h3>
                      <span className={cn(
                        'ml-auto px-2 py-1 text-xs rounded-full',
                        slackData.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      )}>
                        {slackData.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={slackData.webhook_url}
                          onChange={(e) => setSlackData({ ...slackData, webhook_url: e.target.value })}
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Canal
                        </label>
                        <input
                          type="text"
                          value={slackData.channel}
                          onChange={(e) => setSlackData({ ...slackData, channel: e.target.value })}
                          placeholder="#general"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slackData.is_active}
                            onChange={(e) => setSlackData({ ...slackData, is_active: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Activer les notifications Slack
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slackData.notify_bookings}
                            onChange={(e) => setSlackData({ ...slackData, notify_bookings: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Nouvelles réservations
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slackData.notify_payments}
                            onChange={(e) => setSlackData({ ...slackData, notify_payments: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Paiements reçus
                          </span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={testSlackConnection}
                          disabled={!slackData.webhook_url}
                        >
                          Tester la connexion
                        </Button>
                        <Button
                          onClick={() => saveSlackMutation.mutate(slackData)}
                          disabled={saveSlackMutation.isPending}
                        >
                          {saveSlackMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Sauvegarder
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sécurité */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Sécurité du compte
                </h2>

                <div className="space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Mot de passe
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Dernière modification il y a 30 jours
                    </p>
                    <Button variant="outline">
                      <Key className="w-4 h-4 mr-2" />
                      Changer le mot de passe
                    </Button>
                  </div>

                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Authentification à deux facteurs
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Ajoutez une couche de sécurité supplémentaire à votre compte
                    </p>
                    <Button variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Configurer 2FA
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Sessions actives
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Session actuelle
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Chrome sur Windows • Dakar, Sénégal
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Maintenant
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Apparence */}
            {activeTab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Apparence
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Thème
                    </h3>
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {darkMode ? (
                          <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        ) : (
                          <Sun className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Mode {darkMode ? 'sombre' : 'clair'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {darkMode ? 'Réduire la fatigue oculaire dans les environnements sombres' : 'Meilleure visibilité en pleine lumière'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDarkModeToggle}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          darkMode ? 'bg-primary' : 'bg-gray-200'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            darkMode ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Densité d'affichage
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="density"
                          value="comfortable"
                          defaultChecked
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Confortable</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="density"
                          value="compact"
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Compact</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
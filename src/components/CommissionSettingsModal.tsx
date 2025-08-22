import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Switch } from './ui/Switch';
import { useCreateCommissionSetting, useUpdateCommissionSetting } from '../hooks/useCommissions';

interface CommissionSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting?: any;
}

export default function CommissionSettingsModal({ 
  open, 
  onOpenChange, 
  setting 
}: CommissionSettingsModalProps) {
  const [formData, setFormData] = useState({
    service_type: 'flight',
    commission_percentage: 0,
    fixed_amount: 0,
    currency: 'XOF',
    is_active: true,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: ''
  });

  const createMutation = useCreateCommissionSetting();
  const updateMutation = useUpdateCommissionSetting();

  useEffect(() => {
    if (setting) {
      setFormData({
        service_type: setting.service_type,
        commission_percentage: setting.commission_percentage * 100,
        fixed_amount: setting.fixed_amount || 0,
        currency: setting.currency || 'XOF',
        is_active: setting.is_active,
        valid_from: setting.valid_from?.split('T')[0] || new Date().toISOString().split('T')[0],
        valid_until: setting.valid_until?.split('T')[0] || ''
      });
    } else {
      setFormData({
        service_type: 'flight',
        commission_percentage: 0,
        fixed_amount: 0,
        currency: 'XOF',
        is_active: true,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: ''
      });
    }
  }, [setting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      commission_percentage: formData.commission_percentage / 100,
      fixed_amount: formData.fixed_amount || null,
      valid_until: formData.valid_until || null
    };

    try {
      if (setting) {
        await updateMutation.mutateAsync({ 
          id: setting.id, 
          updates: dataToSubmit 
        });
      } else {
        await createMutation.mutateAsync(dataToSubmit);
      }
      onOpenChange(false);
    } catch (error) {
      // Les erreurs sont gérées par les mutations
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {setting ? 'Modifier le taux de commission' : 'Nouveau taux de commission'}
          </DialogTitle>
          <DialogDescription>
            Définissez les paramètres de commission pour ce type de service
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de service */}
          <div>
            <Label htmlFor="service_type">Type de service</Label>
            <select
              id="service_type"
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={!!setting}
            >
              <option value="flight">Vols</option>
              <option value="hotel">Hôtels</option>
              <option value="package">Packages</option>
            </select>
          </div>

          {/* Taux de commission */}
          <div>
            <Label htmlFor="commission_percentage">Taux de commission (%)</Label>
            <Input
              id="commission_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.commission_percentage}
              onChange={(e) => setFormData({ 
                ...formData, 
                commission_percentage: parseFloat(e.target.value) || 0 
              })}
              placeholder="Ex: 5.5"
              required
            />
          </div>

          {/* Montant fixe */}
          <div>
            <Label htmlFor="fixed_amount">
              Montant fixe (optionnel)
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                En plus du pourcentage
              </span>
            </Label>
            <Input
              id="fixed_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.fixed_amount}
              onChange={(e) => setFormData({ 
                ...formData, 
                fixed_amount: parseFloat(e.target.value) || 0 
              })}
              placeholder="0"
            />
          </div>

          {/* Devise */}
          <div>
            <Label htmlFor="currency">Devise</Label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="XOF">XOF - Franc CFA</option>
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dollar US</option>
            </select>
          </div>

          {/* Date de validité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_from">Valide à partir du</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="valid_until">Valide jusqu'au (optionnel)</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                min={formData.valid_from}
              />
            </div>
          </div>

          {/* Statut actif */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active" className="text-base">
              Statut actif
            </Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Enregistrement...' : 
               setting ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
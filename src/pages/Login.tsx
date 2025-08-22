import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      // L'erreur est gérée dans le store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nooraya Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour vous connecter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="admin@nooraya.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          © 2024 Nooraya Group. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
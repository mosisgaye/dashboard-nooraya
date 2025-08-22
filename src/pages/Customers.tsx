import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api/customers';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { Input } from '../components/ui/Input';
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Package,
  CreditCard,
  Plus,
  MoreVertical,
  Tag,
  StickyNote,
  Eye
} from 'lucide-react';
import { formatDate } from '../utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import type { Customer } from '../types/customer';
import type { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Customers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = React.useState(false);
  const [tagsDialogOpen, setTagsDialogOpen] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [newTag, setNewTag] = React.useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ email, notes }: { email: string; notes: string }) =>
      customersApi.updateNotes(email, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Notes mises à jour');
      setNotesDialogOpen(false);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des notes');
    }
  });

  const addTagMutation = useMutation({
    mutationFn: ({ email, tag }: { email: string; tag: string }) =>
      customersApi.addTag(email, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Tag ajouté');
      setNewTag('');
    },
    onError: () => {
      toast.error('Erreur lors de l\'ajout du tag');
    }
  });

  const removeTagMutation = useMutation({
    mutationFn: ({ email, tag }: { email: string; tag: string }) =>
      customersApi.removeTag(email, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Tag supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du tag');
    }
  });

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'customer_name',
      header: 'Nom',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('customer_name')}</div>
      ),
    },
    {
      accessorKey: 'customer_email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{row.getValue('customer_email')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'customer_phone',
      header: 'Téléphone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{row.getValue('customer_phone')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.getValue('tags') as string[] | null;
        return (
          <div className="flex gap-1 flex-wrap">
            {tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'booking_count',
      header: 'Réservations',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{row.getValue('booking_count')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'total_spent',
      header: 'Total dépensé',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="font-medium">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF'
            }).format(row.getValue('total_spent'))}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'last_booking_date',
      header: 'Dernière réservation',
      cell: ({ row }) => {
        const date = row.getValue('last_booking_date') as string | null;
        return date ? (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{formatDate(date)}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate(`/customers/${customer.customer_email}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomer(customer);
                  setNotes(customer.notes || '');
                  setNotesDialogOpen(true);
                }}
              >
                <StickyNote className="mr-2 h-4 w-4" />
                Modifier notes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomer(customer);
                  setTagsDialogOpen(true);
                }}
              >
                <Tag className="mr-2 h-4 w-4" />
                Gérer tags
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredCustomers = React.useMemo(() => {
    if (!customers?.data) return [];
    if (!search) return customers.data;
    
    const searchLower = search.toLowerCase();
    return customers.data.filter((customer) => 
      customer.customer_name.toLowerCase().includes(searchLower) ||
      customer.customer_email.toLowerCase().includes(searchLower) ||
      customer.customer_phone.includes(search) ||
      customer.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, [customers, search]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Gérez vos clients et suivez leur historique de réservations
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={filteredCustomers}
          loading={isLoading}
        />
      </div>

      {/* Dialog Notes */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCustomer?.customer_name} ({selectedCustomer?.customer_email})
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Ajoutez des notes sur ce client..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotesDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (selectedCustomer) {
                  updateNotesMutation.mutate({
                    email: selectedCustomer.customer_email,
                    notes,
                  });
                }
              }}
              isLoading={updateNotesMutation.isPending}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tags */}
      <Dialog open={tagsDialogOpen} onOpenChange={setTagsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer les tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCustomer?.customer_name} ({selectedCustomer?.customer_email})
              </p>
            </div>
            <div>
              <Label>Tags actuels</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {selectedCustomer?.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-sm cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                    onClick={() => {
                      if (selectedCustomer) {
                        removeTagMutation.mutate({
                          email: selectedCustomer.customer_email,
                          tag,
                        });
                      }
                    }}
                  >
                    {tag} ×
                  </Badge>
                ))}
                {(!selectedCustomer?.tags || selectedCustomer.tags.length === 0) && (
                  <p className="text-sm text-gray-500">Aucun tag</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="new-tag">Ajouter un tag</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="new-tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="VIP, Fidèle, etc."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTag && selectedCustomer) {
                      addTagMutation.mutate({
                        email: selectedCustomer.customer_email,
                        tag: newTag,
                      });
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newTag && selectedCustomer) {
                      addTagMutation.mutate({
                        email: selectedCustomer.customer_email,
                        tag: newTag,
                      });
                    }
                  }}
                  isLoading={addTagMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTagsDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
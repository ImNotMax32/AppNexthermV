'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from '@/utils/supabase/client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Trash2, Filter, SlidersHorizontal, Pencil } from "lucide-react";
import { ChevronDown, ChevronUp, Check, X, Send } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";


interface DevisInfo {
  id: string;
  reference: string;
  creation_date: string;
  validity_date: string;
  client_info: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
    email: string;
  };
  company_info: {
    name: string;
    address: string;
    zipCode: string;
    city: string;
    phone: string;
    email: string;
    siret: string;
  };
  products: Array<{
    id: number;
    code: string;
    description: string;
    quantity: number;
    priceHT: number;
    tva: number;
    totalHT: number;
  }>;
  totals: {
    totalHT: number;
    totalTTC: number;
    totalTVA: number;
  };
  status: string;
  created_at: string;
  tva_number: string;
}

type SortOrder = 'newest' | 'oldest';

const ExpandableQuoteRow = ({ 
  devis, 
  onEdit, 
  onDelete, 
  onUpdateStatus 
}: { 
  devis: DevisInfo;
  onEdit: (devis: DevisInfo) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'sent': return 'Envoyé';
      default: return 'Brouillon';
    }
  };

  const renderActionButtons = () => (
    <div className="flex items-center justify-end gap-2">
      {!isExpanded && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-[#86BC29]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(devis);
            }}
            title="Modifier le devis"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(devis.id);
            }}
            title="Supprimer le devis"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
      {isExpanded ? 
        <ChevronUp className="h-4 w-4 text-gray-400" /> : 
        <ChevronDown className="h-4 w-4 text-gray-400" />
      }
    </div>
  );

  const renderDetailedActions = () => (
    <div className="flex justify-between items-center pt-4 border-t">
      <div className="space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="hover:text-[#86BC29] hover:border-[#86BC29]"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(devis);
          }}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="hover:text-red-600 hover:border-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(devis.id);
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </Button>
      </div>
      <div className="space-x-2">
        {devis.status === 'draft' && (
          <Button
            size="sm"
            variant="outline"
            className="hover:text-blue-600 hover:border-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(devis.id, 'sent');
            }}
          >
            <Send className="h-4 w-4 mr-2" />
            Marquer comme envoyé
          </Button>
        )}
        {devis.status === 'sent' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="hover:text-green-600 hover:border-green-600"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(devis.id, 'accepted');
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Marquer comme accepté
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:text-red-600 hover:border-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(devis.id, 'rejected');
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Marquer comme refusé
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <TableRow className="group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <TableCell className="font-medium">{devis.reference}</TableCell>
        <TableCell>{devis.client_info?.name}</TableCell>
        <TableCell>{new Date(devis.created_at).toLocaleDateString('fr-FR')}</TableCell>
        <TableCell>
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
          }).format(devis.totals?.totalTTC || 0)}
        </TableCell>
        <TableCell>
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(devis.status)}`}>
            {getStatusText(devis.status)}
          </span>
        </TableCell>
        <TableCell className="text-right pr-4">
          {renderActionButtons()}
        </TableCell>
      </TableRow>
      
      <AnimatePresence>
        {isExpanded && (
          <TableRow>
            <TableCell colSpan={6} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-50"
              >
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Informations client</h4>
                      <div className="text-sm space-y-1">
                        <p>{devis.client_info?.name}</p>
                        <p>{devis.client_info?.address}</p>
                        <p>{devis.client_info?.zipCode} {devis.client_info?.city}</p>
                        <p>{devis.client_info?.email}</p>
                        <p>{devis.client_info?.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Détails du devis</h4>
                      <div className="text-sm space-y-1">
                        <p>Total HT: {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(devis.totals?.totalHT || 0)}</p>
                        <p>TVA: {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(devis.totals?.totalTVA || 0)}</p>
                        <p>Nombre de produits: {devis.products?.length || 0}</p>
                        <p>Date de validité: {new Date(devis.validity_date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                  {renderDetailedActions()}
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
};

export default function QuoteList() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [searchTerm, setSearchTerm] = useState('');
    const [devis, setDevis] = useState<DevisInfo[]>([]);
    const [filteredDevis, setFilteredDevis] = useState<DevisInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [timeFilter, setTimeFilter] = useState<string>('all');const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const { toast } = useToast();

    const updateDevisStatus = async (id: string, newStatus: string) => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Utilisateur non authentifié');
        }
    
        const { error } = await supabase
          .from('devis')
          .update({ status: newStatus })
          .eq('id', id)
          .eq('user_id', user.id);  // Ajouter cette condition
    
        if (error) throw error;
    
        setDevis(prevDevis => 
          prevDevis.map(d => 
            d.id === id ? { ...d, status: newStatus } : d
          )
        );
    
        toast({
          title: "Succès",
          description: "Le statut du devis a été mis à jour",
        });
      } catch (error) {
        console.error('Error updating quote status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut du devis",
          variant: "destructive",
        });
      }
    };

  const fetchDevis = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Récupérer l'utilisateur courant
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
  
      // Récupérer uniquement les devis de l'utilisateur connecté
      const { data, error } = await supabase
        .from('devis')
        .select('*')
        .eq('user_id', user.id)  // Filtrer par user_id
        .order('created_at', { ascending: false });
  
      if (error) throw error;
  
      if (data) {
        setDevis(data);
        setFilteredDevis(data);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les devis sauvegardés",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  // Filtre et tri des devis
  const filterAndSortDevis = useCallback(() => {
    let filtered = [...devis];

    if (searchTerm) {
      filtered = filtered.filter(devis => {
        const searchTermLower = searchTerm.toLowerCase();
        const searchableFields = [
          devis.reference,
          devis.client_info?.name,
          devis.client_info?.city,
          devis.company_info?.name,
        ].map(field => (field || '').toLowerCase());

        return searchableFields.some(field => field.includes(searchTermLower));
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(devis => devis.status === statusFilter);
    }

    // Filtrage par période
    const now = new Date();
    const timeFilters = {
      'week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      'month': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      'sixMonths': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    };

    if (timeFilter !== 'all') {
      filtered = filtered.filter(devis => 
        new Date(devis.created_at) >= timeFilters[timeFilter as keyof typeof timeFilters]
      );
    }

    // Tri par date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredDevis(filtered);
  }, [devis, searchTerm, statusFilter, timeFilter, sortOrder]);

  // Charger les devis au montage
  useEffect(() => {
    fetchDevis();
  }, [fetchDevis]);

  // Appliquer les filtres quand les dépendances changent
  useEffect(() => {
    if (devis.length > 0) {
      filterAndSortDevis();
    }
  }, [devis, searchTerm, statusFilter, timeFilter, sortOrder, filterAndSortDevis]);

  const deleteDevis = async (id: string) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { error } = await supabase
      .from('devis')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);  // Ajouter cette condition

    if (error) throw error;
    
    toast({
      title: "Succès",
      description: "Le devis a été supprimé avec succès",
    });
    setDevis(devis.filter(d => d.id !== id));
  } catch (error) {
    console.error('Error deleting quote:', error);
    toast({
      title: "Erreur",
      description: "Impossible de supprimer le devis",
      variant: "destructive",
    });
  }
};

  const handleEdit = (devis: DevisInfo) => {
    try {
      // Redirection vers la page de devis avec l'ID en paramètre
      router.push(`/protected/devis?id=${devis.id}`);
    } catch (error) {
      console.error('Error navigating to edit devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à l'édition du devis",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 max-w-7xl"
    >
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Devis sauvegardés</h1>
        <p className="text-gray-600">
          Retrouvez et gérez tous vos devis
        </p>
      </div>
  
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#86BC29]">
              {devis.length}
            </CardTitle>
            <CardDescription>Devis totaux</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#86BC29]">
              {devis.filter(d => {
                const createdDate = new Date(d.created_at);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() &&
                      createdDate.getFullYear() === now.getFullYear();
              }).length}
            </CardTitle>
            <CardDescription>Devis ce mois</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#86BC29]">
              {devis.filter(d => {
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return new Date(d.created_at) >= lastWeek;
              }).length}
            </CardTitle>
            <CardDescription>Devis cette semaine</CardDescription>
          </CardHeader>
        </Card>
      </div>
  
      {/* Barre de recherche et filtres */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un devis..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtres
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <h4 className="font-semibold mb-2">Statut</h4>
                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                      <DropdownMenuRadioItem value="all">Tous</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="draft">Brouillon</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="sent">Envoyé</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="accepted">Accepté</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="rejected">Refusé</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </div>
                  <div className="p-2 border-t">
                    <h4 className="font-semibold mb-2">Période</h4>
                    <DropdownMenuRadioGroup value={timeFilter} onValueChange={setTimeFilter}>
                      <DropdownMenuRadioItem value="all">Tout</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="week">Cette semaine</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="month">Dernier mois</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="sixMonths">6 derniers mois</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
  
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Trier par
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                <DropdownMenuRadioGroup 
                    value={sortOrder} 
                    onValueChange={(value: string) => {
                      setSortOrder(value as SortOrder);
                    }}
                  >
                    <DropdownMenuRadioItem value="newest">Plus récent</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Plus ancien</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
  
              <Button 
                className="flex items-center gap-2"
                onClick={() => router.push('/protected/devis')}
              >
                <FileText className="h-4 w-4" />
                Nouveau devis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  
      {/* Table des devis */}
      <Card>
        <CardHeader>
          <CardTitle>Vos devis</CardTitle>
          <CardDescription>
            Liste de tous vos devis sauvegardés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredDevis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Aucun devis trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevis.map((devis) => (
                  <ExpandableQuoteRow
                    key={devis.id}
                    devis={devis}
                    onEdit={handleEdit}
                    onDelete={deleteDevis}
                    onUpdateStatus={updateDevisStatus}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
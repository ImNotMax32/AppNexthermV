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
import { motion } from "framer-motion";
import { Search, FileText, Trash2, Filter, SlidersHorizontal, Pencil } from "lucide-react";
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

export default function QuoteList() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [searchTerm, setSearchTerm] = useState('');
    const [devis, setDevis] = useState<DevisInfo[]>([]);
    const [filteredDevis, setFilteredDevis] = useState<DevisInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [timeFilter, setTimeFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const { toast } = useToast();

  // Fonction pour récupérer les devis
  const fetchDevis = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('devis')
        .select('*')
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
        description: "Impossible de charger les devis sauvegardés",
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

  // Fonction de suppression
  const deleteDevis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('devis')
        .delete()
        .eq('id', id);

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

  const handleEdit = async (devis: DevisInfo) => {
    try {
      // Store the devis data in localStorage for the edit page
      localStorage.setItem('editDevisData', JSON.stringify({
        quoteInfo: {
          reference: devis.reference,
          creationDate: devis.creation_date,
          validityDate: devis.validity_date,
          tvaNumber: devis.tva_number
        },
        clientInfo: devis.client_info,
        companyInfo: devis.company_info,
        products: devis.products.map(product => ({
          ...product,
          totalHT: product.quantity * product.priceHT
        }))
      }));

      // Navigate to the edit page
      router.push(`/protected/devis/new?id=${devis.id}`);
    } catch (error) {
      console.error('Error preparing devis for editing:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le devis pour modification",
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
                  <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                    <DropdownMenuRadioItem value="newest">Plus récent</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Plus ancien</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
  
              <Button 
                className="flex items-center gap-2"
                onClick={() => router.push('/protected/devis/new')}
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
                  <TableRow key={devis.id}>
                    <TableCell className="font-medium">
                      {devis.reference}
                    </TableCell>
                    <TableCell>
                      {devis.client_info?.name}
                    </TableCell>
                    <TableCell>
                      {new Date(devis.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(devis.totals?.totalTTC || 0)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        devis.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        devis.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        devis.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {devis.status === 'accepted' ? 'Accepté' :
                         devis.status === 'rejected' ? 'Refusé' :
                         devis.status === 'sent' ? 'Envoyé' :
                         'Brouillon'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-[#86BC29]"
                            onClick={() => handleEdit(devis)}
                            title="Modifier le devis"
                            >
                            <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-red-600"
                            onClick={() => deleteDevis(devis.id)}
                            title="Supprimer le devis"
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};
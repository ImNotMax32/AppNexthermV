'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Globe,
  Users,
  Briefcase,
  ShoppingCart,
  Truck,
  Wrench,
  Heart,
  MoreHorizontal,
  PenSquare,
  Trash2
} from "lucide-react";

// Types de contacts
const categories = [
  "Tous",
  "Clients",
  "Prospects",
  "Fournisseurs",
  "Partenaires",
  "SAV",
  "Favoris"
];

// Données des contacts
const contacts = [
  {
    id: 1,
    nom: "Entreprise ABC",
    category: "Clients",
    contact: "Jean Dupont",
    fonction: "Directeur Commercial",
    email: "j.dupont@abc.fr",
    telephone: "01 23 45 67 89",
    mobile: "06 12 34 56 78",
    adresse: "123 rue de la République",
    codePostal: "75001",
    ville: "Paris",
    pays: "France",
    site: "www.abc.fr",
    notes: "Client premium - Contrat maintenance annuel",
    favori: true
  },
  {
    id: 2,
    nom: "Fournisseur XYZ",
    category: "Fournisseurs",
    contact: "Marie Martin",
    fonction: "Responsable Comptes Clés",
    email: "m.martin@xyz.com",
    telephone: "01 98 76 54 32",
    mobile: "07 98 76 54 32",
    adresse: "45 avenue des Champs-Élysées",
    codePostal: "75008",
    ville: "Paris",
    pays: "France",
    site: "www.xyz.com",
    notes: "Fournisseur principal composants PAC",
    favori: false
  },
  {
    id: 3,
    nom: "Tech Services",
    category: "SAV",
    contact: "Pierre Durand",
    fonction: "Technicien SAV",
    email: "p.durand@techservices.fr",
    telephone: "01 45 67 89 10",
    mobile: "06 45 67 89 10",
    adresse: "78 rue du Service",
    codePostal: "69001",
    ville: "Lyon",
    pays: "France",
    site: "www.techservices.fr",
    notes: "Intervention sous 24h garantie",
    favori: true
  }
];

// Helper function pour obtenir l'icône appropriée
const getIconForCategory = (category: string) => {
  switch(category) {
    case "Clients":
      return <Users />;
    case "Prospects":
      return <Briefcase />;
    case "Fournisseurs":
      return <ShoppingCart />;
    case "Partenaires":
      return <Truck />;
    case "SAV":
      return <Wrench />; // Au lieu de <Tool />
    case "Favoris":
      return <Heart />;
    default:
      return <Building />;
  }
};

export default function CarnetAdresses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 max-w-7xl"
    >
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Carnet d'Adresses</h1>
          <p className="text-gray-600">
            Gérez vos contacts professionnels : clients, fournisseurs, partenaires...
          </p>
        </div>
        
        {/* Bouton Nouveau Contact */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#86BC29] hover:bg-[#75a625]">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau contact</DialogTitle>
              <DialogDescription>
                Remplissez les informations du contact ci-dessous.
              </DialogDescription>
            </DialogHeader>
            {/* Formulaire de contact */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Société</label>
                <Input placeholder="Nom de l'entreprise" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(1).map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact</label>
                <Input placeholder="Nom du contact" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fonction</label>
                <Input placeholder="Fonction/Poste" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" placeholder="Email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <Input placeholder="Téléphone" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <Input placeholder="Adresse" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code Postal</label>
                <Input placeholder="Code postal" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ville</label>
                <Input placeholder="Ville" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pays</label>
                <Input placeholder="Pays" defaultValue="France" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site Web</label>
                <Input placeholder="www.example.com" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input placeholder="Notes additionnelles" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <DialogTrigger asChild>
                <Button variant="outline">Annuler</Button>
              </DialogTrigger>
              <Button className="bg-[#86BC29] hover:bg-[#75a625]">
                Ajouter le contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {categories.slice(1).map((category) => (
          <Card key={category} className="bg-gray-50">
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-5 w-5 text-[#86BC29]">
                  {getIconForCategory(category)}
                </div>
                <span className="text-sm font-medium">{category}</span>
              </CardTitle>
              <CardDescription className="text-2xl font-bold text-[#86BC29]">
                {contacts.filter(contact => contact.category === category).length}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un contact..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedCategory === category 
                    ? "bg-[#86BC29] hover:bg-[#75a625]" 
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des contacts */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="hover:bg-gray-50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Informations principales */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="h-6 w-6 text-[#86BC29]">
                      {getIconForCategory(contact.category)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{contact.nom}</h3>
                      <Badge variant="outline">{contact.category}</Badge>
                      {contact.favori && (
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {contact.contact} - {contact.fonction}
                    </div>
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {contact.telephone}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {contact.ville}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4" />
                      {contact.site}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="h-9"
                    >
                      <PenSquare className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-9 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {contacts.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun contact trouvé</p>
        </Card>
      )}
    </motion.div>
  );
}
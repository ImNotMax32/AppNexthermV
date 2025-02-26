// /app/dashboard/remplacement/page.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Check, 
  ThermometerSun,
  ArrowRight,
  ArrowDownToLine,
  FileText,
  Phone,
  History,
  Zap
} from 'lucide-react';

interface ReplacementSolution {
  model: string;
  power: string;
  cop: string;
  benefits: string[];
  imageUrl: string;
}

const replacementSolutions: Record<string, ReplacementSolution> = {
  '6': {
    model: 'Optipack',
    power: '6kW',
    cop: '4.8',
    benefits: [
      'Installation rapide sur supports existants',
      'Amélioration du COP de 30%',
      'Réduction de la consommation électrique',
      'Régulation intelligente nouvelle génération'
    ],
    imageUrl: '/assets/img/OPTICD.png'
  },
  '8': {
    model: 'SmartPack',
    power: '8kW',
    cop: '5.0',
    benefits: [
      'Performance énergétique optimisée',
      'Adaptation automatique selon les besoins',
      'Installation plug & play',
      'Monitoring à distance intégré'
    ],
    imageUrl: '/assets/img/SPCD.png'
  },
  '10': {
    model: 'OptiPack',
    power: '10kW',
    cop: '5.2',
    benefits: [
      'Haute performance énergétique',
      'Système multi-zones',
      'Contrôle intelligent via smartphone',
      'Design compact et moderne'
    ],
    imageUrl: '/assets/img/OPTICD.png'
  }
};

export default function ReplacementPage() {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [reference, setReference] = useState('');
  const [selectedPower, setSelectedPower] = useState('');

  const solution = replacementSolutions[selectedPower];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* En-tête avec explications */}
      <div className="bg-gradient-to-r from-[#86BC29] to-[#75a625] rounded-lg p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold mb-3">
          Remplacement de Pompes à Chaleur Existantes
        </h1>
        <p className="mb-4">
          Profitez de notre expertise unique dans le remplacement des anciennes pompes à chaleur. 
          Nos solutions NEXTHERM sont spécialement conçues pour s'adapter parfaitement à votre installation existante.
        </p>
        <div className="flex items-center space-x-4">
          <Badge className="bg-white text-[#86BC29] hover:bg-gray-100">
            <Shield className="w-4 h-4 mr-2" />
            Solutions 100% compatibles
          </Badge>
          <Badge className="bg-white text-[#86BC29] hover:bg-gray-100">
            <ThermometerSun className="w-4 h-4 mr-2" />
            Performance améliorée
          </Badge>
        </div>
      </div>

      {/* Mini cartes d'avantages */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <History className="w-10 h-10 text-[#86BC29] mb-3" />
            <h3 className="text-lg font-semibold mb-2">30+ ans d'expertise</h3>
            <p className="text-gray-600 text-sm">
              Notre équipe maîtrise parfaitement les anciennes installations et leurs spécificités.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Zap className="w-10 h-10 text-[#86BC29] mb-3" />
            <h3 className="text-lg font-semibold mb-2">Économies garanties</h3>
            <p className="text-gray-600 text-sm">
              Réduisez votre consommation énergétique grâce à nos solutions nouvelle génération.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <ThermometerSun className="w-10 h-10 text-[#86BC29] mb-3" />
            <h3 className="text-lg font-semibold mb-2">Installation simplifiée</h3>
            <p className="text-gray-600 text-sm">
              Remplacement rapide et adapté sur vos raccordements existants.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sélection de l'équipement existant */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Votre équipement actuel</CardTitle>
          <CardDescription>
            Indiquez les caractéristiques de votre pompe à chaleur existante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Marque
              </label>
              <Select onValueChange={setSelectedBrand} value={selectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une marque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sofath">Sofath</SelectItem>
                  <SelectItem value="avenir-energie">Avenir Energie</SelectItem>
                  <SelectItem value="enalsa">Enalsa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Référence
              </label>
              <Input 
                placeholder="Entrez la référence" 
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Puissance
              </label>
              <Select onValueChange={setSelectedPower} value={selectedPower}>
                <SelectTrigger>
                  <SelectValue placeholder="Indiquer la puissance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 kW</SelectItem>
                  <SelectItem value="8">8 kW</SelectItem>
                  <SelectItem value="10">10 kW</SelectItem>
                  <SelectItem value="12">12 kW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solution de remplacement */}
      {solution && (
        <Card className="mb-8 border-[#86BC29]/20">
          <CardHeader>
            <CardTitle className="text-[#86BC29]">
              Solution de remplacement recommandée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={solution.imageUrl}
                    alt={`NEXTHERM ${solution.model}`}
                    className="object-contain w-full h-full p-4"
                  />
                </div>
                <div className="flex gap-4">
                  <Badge className="bg-[#86BC29]">
                    {solution.power}
                  </Badge>
                  <Badge variant="outline">
                    COP {solution.cop}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">NEXTHERM {solution.model}</h3>
                  <p className="text-gray-600">
                    Solution nouvelle génération parfaitement adaptée à votre installation
                  </p>
                </div>

                <div className="space-y-3">
                  {solution.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#86BC29]" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="bg-[#86BC29] hover:bg-[#75a625]">
                    Demander un devis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact expert
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation et support */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-[#86BC29]" />
                <div>
                  <h3 className="font-semibold">Documentation technique</h3>
                  <p className="text-sm text-gray-600">Guide d'installation et spécifications</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <ArrowDownToLine className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Phone className="w-8 h-8 text-[#86BC29]" />
                <div>
                  <h3 className="font-semibold">Support technique</h3>
                  <p className="text-sm text-gray-600">Assistance à l'installation</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Contacter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
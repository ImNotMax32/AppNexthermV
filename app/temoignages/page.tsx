'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2, CheckCircle2, Mail, Camera } from 'lucide-react';

interface ImagePreview {
  file: File;
  preview: string;
}

export default function TemoignagesPage() {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isReplacement, setIsReplacement] = useState<string>('');
  const [replacementBrand, setReplacementBrand] = useState('');
  const [replacementBrandOther, setReplacementBrandOther] = useState('');
  const [installerName, setInstallerName] = useState('');
  const [department, setDepartment] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Liste des départements français
  const departments = [
    '01 - Ain', '02 - Aisne', '03 - Allier', '04 - Alpes-de-Haute-Provence', '05 - Hautes-Alpes',
    '06 - Alpes-Maritimes', '07 - Ardèche', '08 - Ardennes', '09 - Ariège', '10 - Aube',
    '11 - Aude', '12 - Aveyron', '13 - Bouches-du-Rhône', '14 - Calvados', '15 - Cantal',
    '16 - Charente', '17 - Charente-Maritime', '18 - Cher', '19 - Corrèze', '21 - Côte-d\'Or',
    '22 - Côtes-d\'Armor', '23 - Creuse', '24 - Dordogne', '25 - Doubs', '26 - Drôme',
    '27 - Eure', '28 - Eure-et-Loir', '29 - Finistère', '2A - Corse-du-Sud', '2B - Haute-Corse',
    '30 - Gard', '31 - Haute-Garonne', '32 - Gers', '33 - Gironde', '34 - Hérault',
    '35 - Ille-et-Vilaine', '36 - Indre', '37 - Indre-et-Loire', '38 - Isère', '39 - Jura',
    '40 - Landes', '41 - Loir-et-Cher', '42 - Loire', '43 - Haute-Loire', '44 - Loire-Atlantique',
    '45 - Loiret', '46 - Lot', '47 - Lot-et-Garonne', '48 - Lozère', '49 - Maine-et-Loire',
    '50 - Manche', '51 - Marne', '52 - Haute-Marne', '53 - Mayenne', '54 - Meurthe-et-Moselle',
    '55 - Meuse', '56 - Morbihan', '57 - Moselle', '58 - Nièvre', '59 - Nord',
    '60 - Oise', '61 - Orne', '62 - Pas-de-Calais', '63 - Puy-de-Dôme', '64 - Pyrénées-Atlantiques',
    '65 - Hautes-Pyrénées', '66 - Pyrénées-Orientales', '67 - Bas-Rhin', '68 - Haut-Rhin', '69 - Rhône',
    '70 - Haute-Saône', '71 - Saône-et-Loire', '72 - Sarthe', '73 - Savoie', '74 - Haute-Savoie',
    '75 - Paris', '76 - Seine-Maritime', '77 - Seine-et-Marne', '78 - Yvelines', '79 - Deux-Sèvres',
    '80 - Somme', '81 - Tarn', '82 - Tarn-et-Garonne', '83 - Var', '84 - Vaucluse',
    '85 - Vendée', '86 - Vienne', '87 - Haute-Vienne', '88 - Vosges', '89 - Yonne',
    '90 - Territoire de Belfort', '91 - Essonne', '92 - Hauts-de-Seine', '93 - Seine-Saint-Denis',
    '94 - Val-de-Marne', '95 - Val-d\'Oise', '971 - Guadeloupe', '972 - Martinique', '973 - Guyane',
    '974 - La Réunion', '976 - Mayotte'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: ImagePreview = {
            file,
            preview: reader.result as string,
          };
          setImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage: ImagePreview = {
        file,
        preview: reader.result as string,
      };
      setImages((prev) => [...prev, newImage]);
    };
    reader.readAsDataURL(file);
    // Réinitialiser l'input pour permettre de prendre plusieurs photos
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir la description',
        variant: 'destructive',
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez ajouter au moins une photo',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertir les images en base64
      const imagesBase64 = await Promise.all(
        images.map(async (img) => {
          return new Promise<{ filename: string; base64: string }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              // Extraire seulement la partie base64 (sans le préfixe data:image/...;base64,)
              const base64Data = base64.split(',')[1] || base64;
              resolve({
                filename: img.file.name,
                base64: base64Data,
              });
            };
            reader.readAsDataURL(img.file);
          });
        })
      );

      const response = await fetch('/api/send-testimonial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          images: imagesBase64,
          isReplacement,
          replacementBrand: isReplacement === 'oui' 
            ? (replacementBrand === 'Autre' ? replacementBrandOther : replacementBrand)
            : null,
          installerName,
          department: department || null,
          clientEmail: clientEmail.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      toast({
        title: 'Succès !',
        description: 'Votre dépôt a été envoyé avec succès. Merci !',
      });

      // Réinitialiser le formulaire
      setDescription('');
      setImages([]);
      setIsReplacement('');
      setReplacementBrand('');
      setReplacementBrandOther('');
      setInstallerName('');
      setDepartment('');
      setClientEmail('');
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'envoi',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mise en avant témoignage
          </h1>
          <div className="bg-[#86BC29]/10 border-l-4 border-[#86BC29] p-6 rounded-lg mb-6 text-left">
            <p className="text-lg text-gray-800 mb-3 font-semibold">
              Mise en avant professionnelle
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-3">
              Cette interface est destinée aux <strong>installateurs et professionnels</strong> pour déposer leurs réalisations et descriptions d'installations. Vos dépôts seront <strong>mis en avant sur notre site web</strong> et bénéficieront de <strong>notre communication pour avoir une visibilité accrue</strong>, vous permettant d'attirer de nouveaux clients et de développer votre activité.
            </p>
            <p className="text-sm text-gray-600 mt-3 italic">
              <strong>Conseil :</strong> Indiquez tous les détails dans la description (type d'installation, modèle remplacé, résultats obtenus, satisfaction client, etc.). Notre équipe se chargera de rédiger l'article final pour une mise en avant optimale sur notre site.
            </p>
          </div>
        </div>

        <Card className="border-2 border-[#86BC29]/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-[#86BC29] flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Formulaire de dépôt
            </CardTitle>
            <CardDescription>
              Remplissez le formulaire ci-dessous avec vos photos et votre description. Votre dépôt sera directement envoyé à notre équipe pour mise en avant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Remplacement */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  S'agit-il d'un remplacement ? <span className="text-red-500">*</span>
                </Label>
                <RadioGroup value={isReplacement} onValueChange={setIsReplacement} required>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oui" id="replacement-oui" />
                      <label htmlFor="replacement-oui" className="cursor-pointer">Oui</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non" id="replacement-non" />
                      <label htmlFor="replacement-non" className="cursor-pointer">Non</label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Marque de remplacement */}
              {isReplacement === 'oui' && (
                <div className="space-y-2">
                  <Label htmlFor="replacementBrand" className="text-base font-semibold">
                    Marque remplacée <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Select 
                        value={replacementBrand} 
                        onValueChange={(value) => {
                          setReplacementBrand(value);
                          if (value !== 'Autre') {
                            setReplacementBrandOther('');
                          }
                        }} 
                        required
                      >
                        <SelectTrigger id="replacementBrand">
                          <SelectValue placeholder="Sélectionner la marque" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sofath">Sofath</SelectItem>
                          <SelectItem value="France Géothermie">France Géothermie</SelectItem>
                          <SelectItem value="Enalsa">Enalsa</SelectItem>
                          <SelectItem value="Ciat">Ciat</SelectItem>
                          <SelectItem value="De Dietrich">De Dietrich</SelectItem>
                          <SelectItem value="France Avenir">France Avenir</SelectItem>
                          <SelectItem value="Amzair">Amzair</SelectItem>
                          <SelectItem value="Nextherm">Nextherm</SelectItem>
                          <SelectItem value="Avenir Énergie">Avenir Énergie</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {replacementBrand === 'Autre' && (
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Préciser la marque"
                          value={replacementBrandOther}
                          onChange={(e) => setReplacementBrandOther(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nom d'installateur et département */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Votre nom / Nom de votre entreprise
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="installerName"
                      type="text"
                      placeholder="Ex: Jean Dupont - ABC Installation"
                      value={installerName}
                      onChange={(e) => setInstallerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Département (optionnel)" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Optionnel - Ce dépôt vous permettra d'être mis en avant sur notre site pour attirer de nouveaux clients et développer votre visibilité professionnelle
                </p>
              </div>

              {/* Email client (copie) */}
              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-base font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Votre adresse email (pour recevoir une copie)
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="votre.email@exemple.fr"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Optionnel - Vous recevrez une copie du témoignage et serez averti lorsque l'article sera publié
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description de l'installation (détails à inclure) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Exemple : &quot;Nous avons remplacé un module Sofath de 2023, tout s'est bien passé, client content. Installation réalisée en 2 jours, aucun problème technique rencontré.&quot; Indiquez tous les détails : type d'installation, modèle remplacé, résultats obtenus, satisfaction client, etc. Notre équipe se chargera de rédiger l'article final pour une mise en avant optimale."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={10}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-gray-500">
                  Plus vous détaillez, mieux nous pourrons mettre en valeur votre dépôt. Minimum 100 caractères recommandés.
                </p>
              </div>

              {/* Upload d'images */}
              <div className="space-y-2">
                <Label htmlFor="images" className="text-base font-semibold">
                  Photos <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 flex items-center justify-center">
                    <label
                      htmlFor="images"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG jusqu'à 10MB par image</p>
                      </div>
                      <input
                        id="images"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <label
                    htmlFor="camera-capture"
                    className="h-32 px-6 flex flex-col items-center justify-center gap-2 border-2 border-[#86BC29] rounded-lg cursor-pointer bg-white hover:bg-[#86BC29] hover:text-white transition-colors"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="text-sm font-semibold text-center">Prendre<br />une photo</span>
                    <input
                      id="camera-capture"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCameraCapture}
                    />
                  </label>
                </div>

                {/* Prévisualisation des images */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
                      >
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                          {image.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {images.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Au moins une photo est requise
                  </p>
                )}
              </div>

              {/* Bouton de soumission */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    !description.trim() || 
                    images.length === 0 ||
                    !isReplacement ||
                    (isReplacement === 'oui' && (!replacementBrand || (replacementBrand === 'Autre' && !replacementBrandOther.trim())))
                  }
                  className="bg-[#86BC29] hover:bg-[#75a625] text-white px-8 py-6 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Envoyer mon dépôt
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <Card className="mt-6 border border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-semibold text-gray-800">ℹ️ Informations :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Vos dépôts seront mis en avant sur notre site web et nos réseaux sociaux</li>
                <li>Vous bénéficierez d'une visibilité accrue grâce à notre communication pour attirer de nouveaux clients</li>
                <li>Toutes les photos seront traitées de manière confidentielle</li>
                <li>Notre équipe rédigera l'article final à partir de vos informations</li>
                <li>Vous serez averti par email lorsque votre dépôt sera publié (si vous avez renseigné votre email)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


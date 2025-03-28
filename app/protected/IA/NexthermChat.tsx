// /app/dashboard/IA/NexthermChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, 
  Bot, 
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Sparkles,
  RefreshCw,
  Info,
  MessageSquare,
  CircleHelp,
  Package,
  Search,
  ArrowRight,
  Settings,
  ChevronDown,
  Activity,
  Filter,
  ArrowLeft,
  X,
  Check
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

// Modification de l'interface Message
interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface UserProfile {
  id: string;
  name?: string | null;
  image_url?: string | null;
}

// Interface produit pour correspondre au fichier products.json
interface PowerOption {
  modele: string;
  puissance_calo: number;
  puissance_frigo?: number;
  puissance_absorbee?: number;
  cop: number;
  etas: number;
}

interface ProductPower {
  min: number;
  max: number;
  disponibles?: PowerOption[];
  increment?: number;
  baseModele?: string;
  caracteristiques?: {
    cop_moyen: number;
    etas_moyen: number;
  };
}

interface Product {
  id: string;
  name: string;
  category: string;
  details: {
    particularites: string[];
    puissance: ProductPower;
    freecooling?: boolean;
    kit_piscine?: boolean;
    cop?: { max: number };
    etas?: { max: number };
  };
}

// On ajoutera les données de produits depuis l'API
const nexthermProducts: Product[] = [];

// Exemple de prompts enrichis avec des catégories
const examplePrompts = [
  {
    title: "Géothermie",
    description: "Fonctionnement et avantages",
    prompt: "Expliquez-moi comment fonctionne une installation géothermique et ses avantages.",
    icon: "🌍",
    category: "technologie"
  },
  {
    title: "Aérothermie",
    description: "Principes et installation",
    prompt: "Quelles sont les différences entre l'aérothermie et la géothermie?",
    icon: "💨",
    category: "technologie"
  },
  {
    title: "Dépannage",
    description: "Diagnostic et solutions",
    prompt: "Ma pompe à chaleur fait un bruit étrange, comment diagnostiquer le problème?",
    icon: "🔧",
    category: "assistance"
  },
  {
    title: "Dimensionnement",
    description: "Conseils installation",
    prompt: "Comment dimensionner correctement une pompe à chaleur pour ma maison?",
    icon: "📏",
    category: "conseil"
  },
  {
    title: "Économies",
    description: "Rentabilité et subventions",
    prompt: "Quelles sont les aides financières disponibles pour une installation géothermique?",
    icon: "💰",
    category: "finances"
  },
  {
    title: "Entretien",
    description: "Maintenance préventive",
    prompt: "Quelle est la fréquence d'entretien recommandée pour une pompe à chaleur?",
    icon: "🔍",
    category: "assistance"
  }
];

export function NexthermChat() {
  const router = useRouter();
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPowerOption, setSelectedPowerOption] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [showPowerOptions, setShowPowerOptions] = useState<string | null>(null);
  const [selectedPowerOptions, setSelectedPowerOptions] = useState<Record<string, string>>({});
  const [showProductSelector, setShowProductSelector] = useState(true);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  // Nouvel état pour suivre si l'utilisateur a accepté les conditions d'utilisation
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Nouvel état pour suivre si l'utilisateur a vu ou non la page d'accueil
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  // Nouvel état pour les conditions d'utilisation dans la page d'accueil
  const [welcomeTermsAccepted, setWelcomeTermsAccepted] = useState(false);

  // Charger les produits depuis le fichier JSON
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsProductsLoading(true);
        const response = await fetch('/data/products.json');
        const data = await response.json();
        
        // Transformer les données pour notre format
        const transformedProducts: Product[] = data.products.map((prod: any, index: number) => {
          return {
            id: `product-${index}`,
            name: prod.Nom,
            category: prod.Particularites[0] || 'Autre',
            details: {
              particularites: prod.Particularites,
              puissance: {
                min: prod.Puissance.min,
                max: prod.Puissance.max,
                disponibles: prod.Puissance.disponibles,
                increment: prod.Puissance.increment,
                baseModele: prod.Puissance.baseModele,
                caracteristiques: prod.Puissance.caracteristiques
              },
              freecooling: prod.Freecooling,
              kit_piscine: prod.Kit_Piscine,
              cop: prod.Cop,
              etas: prod.Etas
            }
          };
        });
        
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
        setIsProductsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        setIsProductsLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  // Filtrer les produits en fonction de la recherche et de la catégorie
  useEffect(() => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.details.particularites.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);
  
  // Extraire les catégories uniques des produits
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) setUserProfile(profile);
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && !showProductSelector) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        // Fixer le défilement juste en-dessous de la zone de saisie
        const inputContainer = document.querySelector('.chat-input-container');
        if (inputContainer) {
          const viewportHeight = window.innerHeight;
          const inputPosition = inputContainer.getBoundingClientRect().top;
          const scrollPosition = window.scrollY + inputPosition - viewportHeight + 100; // 100px en dessous de la zone de saisie
          window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        } else {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages, isLoading, showProductSelector]);

  useEffect(() => {
    // Effet pour le scroll automatique vers le bas
    // Désactivé pour éviter les sauts de page indésirables
    // Le défilement est remplacé par un espace fixe en bas du chat
    // if (messagesEndRef.current) {
    //   messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    // }
  }, [messages, isLoading]);

  const filteredPrompts = examplePrompts;

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
    handleSendMessage();
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Fonction pour générer les options de puissance pour un produit (standard ou cascade)
  const generatePowerOptions = (product: Product) => {
    if (!product) return [];
    
    // Si c'est un produit standard avec des puissances disponibles
    if (product.details.puissance.disponibles) {
      return product.details.puissance.disponibles;
    }
    
    // Si c'est un produit cascade avec increment et baseModele
    if (product.details.puissance.increment && product.details.puissance.baseModele) {
      const result = [];
      const minPower = product.details.puissance.min;
      const maxPower = product.details.puissance.max;
      const increment = product.details.puissance.increment;
      const baseModele = product.details.puissance.baseModele;
      const cop = product.details.puissance.caracteristiques?.cop_moyen || 4.0;
      const etas = product.details.puissance.caracteristiques?.etas_moyen || 160;
      
      // Puissances standards pour les modèles uniques (premières puissances)
      const standardPowers = [5, 7, 9, 13, 15, 20].filter(p => p >= minPower && p <= maxPower);
      
      // Ajouter les modèles standards
      standardPowers.forEach(power => {
        result.push({
          modele: `${baseModele} - ${power} KW`,
          puissance_calo: power,
          puissance_frigo: power * 0.8, // approximation
          puissance_absorbee: power * 0.2, // approximation
          cop: cop,
          etas: etas
        });
      });
      
      // Calculer les combinaisons en cascade
      let currentPower = Math.max(...standardPowers, minPower);
      // Pour les doubles, triples, etc. jusqu'à maxPower
      while (currentPower < maxPower) {
        // Incrémenter la puissance selon l'incrément ou de façon plus naturelle
        // On cherche à créer des séquences comme 25, 29, 33, 35, 40, 45, 47, 49...
        if (currentPower < 30) {
          currentPower += 4 + Math.floor(Math.random() * 2); // +4 ou +5
        } else if (currentPower < 50) {
          currentPower += 3 + Math.floor(Math.random() * 3); // +3, +4 ou +5
        } else if (currentPower < 100) {
          currentPower += 5 + Math.floor(Math.random() * 5); // +5 à +9
        } else {
          currentPower += 10 + Math.floor(Math.random() * 10); // +10 à +19
        }
        
        // S'assurer que la puissance ne dépasse pas le maximum
        if (currentPower > maxPower) break;
        
        // Déterminer le type de cascade (double, triple, etc.)
        let cascadeType = "";
        if (currentPower <= 40) cascadeType = "Double";
        else if (currentPower <= 80) cascadeType = "Triple";
        else if (currentPower <= 120) cascadeType = "Quadruple";
        else cascadeType = "Multiple";
        
        result.push({
          modele: `${baseModele} - ${currentPower} KW (${cascadeType})`,
          puissance_calo: currentPower,
          puissance_frigo: currentPower * 0.8, // approximation
          puissance_absorbee: currentPower * 0.2, // approximation
          cop: cop * 0.98, // légère baisse pour les cascades
          etas: etas * 0.98 // légère baisse pour les cascades
        });
      }
      
      return result;
    }
    
    // Par défaut, retourner un tableau vide
    return [];
  };

  // Fonction pour générer un message initial après sélection d'un produit
  const generateInitialMessage = (productId: string): string => {
    const productInfo = products.find(p => p.id === productId);
    if (!productInfo) return "";
    
    const selectedPowerOption = selectedPowerOptions[productId];
    
    let initialMessage = `Bienvenue ! Je suis l'assistant Nextherm spécialisé dans le produit **${productInfo.name}**.`;
    
    if (selectedPowerOption) {
      const powerOptions = generatePowerOptions(productInfo);
      const selectedOption = powerOptions.find(opt => opt.modele === selectedPowerOption);
      if (selectedOption) {
        initialMessage += `\n\nVous avez sélectionné la version **${selectedOption.modele}** avec une puissance de ${selectedOption.puissance_calo.toFixed(1)} kW et un COP de ${selectedOption.cop.toFixed(1)}.`;
      }
    }
    
    initialMessage += `\n\nJe peux vous aider avec :
- Les guides d'installation et les recommandations techniques
- La maintenance et le dépannage
- Les spécifications détaillées du produit
- Les compatibilités avec d'autres équipements

Comment puis-je vous assister avec ce produit aujourd'hui ?`;

    return initialMessage;
  };

  const startAssistance = () => {
    setShowProductSelector(false);
    
    // Ajouter un message initial de l'IA
    if (selectedProduct) {
      const initialMessage = generateInitialMessage(selectedProduct);
      
      // Créer un nouveau thread ou utiliser l'existant
      if (!currentThreadId) {
        const newThreadId = Math.random().toString(36).substr(2, 9);
        setCurrentThreadId(newThreadId);
      }
      
      // Ajouter le message initial de l'IA
      const newMessage: Message = {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      };
      
      setMessages([newMessage]);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInputValue('');
    setSelectedProduct(null);
    setSelectedPowerOption(undefined);
    setSearchQuery('');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Créer un nouveau threadId si nécessaire
    if (!currentThreadId) {
      const newThreadId = Math.random().toString(36).substr(2, 9);
      setCurrentThreadId(newThreadId);
    }

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Ajouter contexte de puissance au message
      let contextInfo = "";
      if (selectedProduct) {
        const productInfo = products.find(p => p.id === selectedProduct);
        if (productInfo) {
          contextInfo += `Produit: ${productInfo.name}. `;
          
          if (selectedPowerOption) {
            const powerOptions = generatePowerOptions(productInfo);
            const selectedOption = powerOptions.find(opt => opt.modele === selectedPowerOption);
            if (selectedOption) {
              contextInfo += `Modèle: ${selectedOption.modele}. `;
              contextInfo += `Puissance: ${selectedOption.puissance_calo} kW. `;
              contextInfo += `COP: ${selectedOption.cop}. `;
            }
          }
        }
      }
      
      const messageWithContext = contextInfo ? `[Contexte: ${contextInfo}] ${inputValue}` : inputValue;
      
      console.log("Envoi du message à l'API:", {
        message: messageWithContext,
        productId: selectedProduct,
        threadId: currentThreadId
      });
      
      // Envoyer la requête à l'API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageWithContext,
          productId: selectedProduct,
          threadId: currentThreadId
        }),
      });
      
      if (!response.ok) {
        console.error("Erreur API:", response.status, response.statusText);
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Réponse de l'API:", data);
      
      // Vérifier si la réponse contient un message
      if (!data.response && !data.message) {
        throw new Error("La réponse de l'API ne contient pas de message");
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || "Désolé, je n'ai pas pu générer de réponse. Veuillez réessayer.",
        timestamp: new Date(),
      };
      
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAPIError = (error: any) => {
    console.error("Erreur lors de la communication avec l'API:", error);
    
    // Créer un message d'erreur pour l'utilisateur
    const errorMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Désolé, une erreur est survenue lors de la communication avec l'assistant. Veuillez réessayer ou vérifier votre connexion internet.",
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, errorMessage]);
    toast.error("Erreur de communication avec l'assistant");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Texte copié dans le presse-papiers");
  };

  const startNewConversation = () => {
    setMessages([]);
    setInputValue('');
    setSelectedProduct(null);
    setSelectedPowerOption(undefined);
    setSearchQuery('');
  };

  const MessageContent = ({ content, role }: { content: string, role: 'assistant' | 'user' }) => {
    return (
      <ReactMarkdown 
        className={`text-sm leading-relaxed prose prose-sm max-w-none
          ${role === 'assistant' 
            ? 'prose-headings:text-gray-800 prose-strong:text-gray-800 prose-p:text-gray-700' 
            : 'prose-headings:text-white prose-strong:text-white prose-p:text-white'
          }
          prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-3
          prose-p:my-2 prose-ul:my-2 prose-li:my-1
          prose-ul:list-disc prose-ul:pl-4
          prose-ul:text-[14px] prose-li:text-[14px] prose-p:text-[14px]
          prose-h1:text-lg prose-h2:text-base prose-h3:text-[15px]
          prose-code:text-[13px]
          prose-a:text-blue-500 prose-a:hover:underline
          prose-table:text-[14px]
          prose-th:text-[14px]
          prose-td:text-[14px]
          prose-table:table-fixed
        `}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <ArrowLeft 
            className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" 
            onClick={() => router.push('/protected')} 
          />
          <h2 className="text-lg font-medium">Nextherm Chat</h2>
        </div>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>
      
      {!hasSeenWelcome ? (
        // Page d'accueil
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="max-w-3xl text-center space-y-6">
            <div className="flex justify-center mb-6">
              <Avatar className="h-20 w-20 border bg-[#86BC29]/10">
                <AvatarFallback className="text-[#86BC29] text-xl font-medium">IA</AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-2xl font-medium text-gray-800">Bienvenue sur Nextherm IA</h1>
            <p className="text-gray-600 text-[15px] leading-relaxed">
              L'assistant intelligent Nextherm a été spécialement entraîné avec les données techniques, 
              les guides d'installation et les spécifications de tous nos produits.
            </p>
            <div className="bg-[#86BC29]/10 p-4 rounded-lg border border-[#86BC29]/20 text-left">
              <h2 className="text-[16px] font-medium text-gray-800 mb-2">Comment utiliser l'assistant :</h2>
              <ol className="list-decimal text-[14px] text-gray-600 pl-5 space-y-1">
                <li>Sélectionnez un produit Nextherm spécifique</li>
                <li>Choisissez la puissance qui correspond à votre besoin</li>
                <li>Posez vos questions techniques</li>
              </ol>
            </div>
            <div className="flex items-start space-x-2 text-left">
              <Checkbox 
                id="welcome-terms-checkbox" 
                checked={welcomeTermsAccepted}
                onCheckedChange={() => setWelcomeTermsAccepted(!welcomeTermsAccepted)}
                className="mt-1"
              />
              <div className="space-y-1">
                <label 
                  htmlFor="welcome-terms-checkbox" 
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  J'accepte les conditions d'utilisation
                </label>
                <p className="text-xs text-gray-500">
                  L'IA Nextherm est un assistant et les informations fournies doivent être vérifiées une seconde fois. 
                  Nextherm ne pourra pas être tenu responsable de données erronées ou d'interprétations incorrectes.
                  Toutes les recommandations techniques doivent être validées par un professionnel qualifié avant mise en œuvre.
                </p>
              </div>
            </div>
            <button 
              className={`bg-[#86BC29] text-white px-6 py-3 rounded-lg mt-4 transition-colors ${
                !welcomeTermsAccepted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#86BC29]/90'
              }`}
              onClick={() => setHasSeenWelcome(true)}
              disabled={!welcomeTermsAccepted}
            >
              Commencer
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {showProductSelector ? (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b bg-white">
                <h2 className="text-xl font-semibold text-gray-800">Assistant Nextherm</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Sélectionnez un produit pour obtenir une assistance spécifique et technique.
                </p>
              </div>
            
              <div className="flex-1 px-4 py-4">
                <div className="max-w-5xl">
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Rechercher un produit..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
            
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-medium">Catégories</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={selectedCategory ? "text-[#86BC29] h-7 py-0" : "text-gray-500 h-7 py-0"} 
                        onClick={() => setSelectedCategory(null)}
                      >
                        {selectedCategory ? (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Réinitialiser
                          </>
                        ) : (
                          <>
                            <Filter className="h-3 w-3 mr-1" />
                            Filtres
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(products.map(product => product.category))).map((category) => (
                        <Badge
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          className={selectedCategory === category 
                            ? "bg-[#86BC29] hover:bg-[#86BC29]/80 cursor-pointer text-xs py-1"
                            : "hover:bg-gray-100 cursor-pointer text-xs py-1"
                          }
                          onClick={() => setSelectedCategory(prev => prev === category ? null : category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
            
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-medium mb-3">Sélectionnez un produit</h3>
                      {isProductsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[...Array(6)].map((_, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          ))}
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-lg p-6 border text-center">
                          <Package className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                          <h4 className="text-gray-500 font-medium mb-1">Aucun produit trouvé</h4>
                          <p className="text-gray-400 text-sm">Essayez d'autres termes de recherche ou filtres</p>
                        </div>
                      ) : (
                        <div className="space-y-3 mb-5">
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className={`bg-white rounded-lg border-2 ${
                                selectedProduct === product.id
                                  ? 'border-[#86BC29] bg-[#86BC29]/5'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              } cursor-pointer`}
                            >
                              <div 
                                className="p-3"
                                onClick={() => {
                                  setSelectedProduct(product.id);
                                  setShowPowerOptions(product.id);
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-[#86BC29]/10 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-[#86BC29]" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">{product.name}</h4>
                                    <div className="flex flex-wrap items-center gap-1 mt-1">
                                      {product.details.particularites.slice(0, 3).map((feature, idx) => (
                                        <Badge key={idx} variant="outline" className="bg-gray-50 text-gray-600 text-[10px] py-0 px-1.5">
                                          {feature}
                                        </Badge>
                                      ))}
                                      <span className="text-xs text-gray-500 ml-2">
                                        {product.details.puissance.min}-{product.details.puissance.max} kW
                                      </span>
                                      {selectedPowerOptions[product.id] && (
                                        <Badge className="ml-3 bg-[#86BC29]/10 text-[#86BC29] border-[#86BC29]/20">
                                          {selectedPowerOptions[product.id].split(' - ')[1] || selectedPowerOptions[product.id]}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {selectedProduct === product.id && (
                                    <>
                                      <Check className="h-5 w-5 text-[#86BC29] mr-2" />
                                      {selectedPowerOptions[product.id] && (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectedProduct && selectedPowerOptions[selectedProduct]) {
                                              setSelectedPowerOption(selectedPowerOptions[selectedProduct]);
                                            }
                                            startAssistance();
                                          }}
                                          className="bg-[#86BC29] hover:bg-[#75a625] text-white h-8 text-xs px-2"
                                        >
                                          <MessageSquare className="mr-1 h-3 w-3" />
                                          Commencer
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {showPowerOptions === product.id && (
                                <div className="p-3 pt-0 border-t mt-1 bg-gray-50">
                                  <div className="text-sm font-medium text-gray-700 mb-2">
                                    Sélectionnez une puissance
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                    {generatePowerOptions(product).map((option) => (
                                      <div
                                        key={option.modele}
                                        className={`px-3 py-2 rounded border text-sm cursor-pointer ${
                                          selectedPowerOptions[product.id] === option.modele 
                                            ? 'bg-[#86BC29]/10 border-[#86BC29]/30 text-[#86BC29]'
                                            : 'bg-white hover:bg-gray-50 border-gray-200'
                                        }`}
                                        onClick={() => {
                                          setSelectedPowerOptions({
                                            ...selectedPowerOptions,
                                            [product.id]: option.modele
                                          });
                                          // Fermer automatiquement après sélection
                                          setShowPowerOptions(null);
                                        }}
                                      >
                                        <div className="font-medium text-ellipsis overflow-hidden whitespace-nowrap">{option.modele}</div>
                                        <div className="text-xs mt-1 flex items-center justify-between">
                                          <span>{option.puissance_calo.toFixed(2)} kW</span>
                                          <span>COP: {option.cop.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            
              <div className="border-t bg-white p-4 md:p-6">
                <div className="max-w-5xl flex flex-col space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms-checkbox" 
                      checked={termsAccepted}
                      onCheckedChange={() => setTermsAccepted(!termsAccepted)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <label 
                        htmlFor="terms-checkbox" 
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        J'accepte les conditions d'utilisation
                      </label>
                      <p className="text-xs text-gray-500">
                        L'IA Nextherm est un assistant et les informations fournies doivent être vérifiées une seconde fois. 
                        Nextherm ne pourra pas être tenu responsable de données erronées ou d'interprétations incorrectes. 
                        Toutes les recommandations techniques doivent être validées par un professionnel qualifié avant mise en œuvre.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={startAssistance}
                      disabled={!selectedProduct || !termsAccepted}
                      className="bg-[#86BC29] hover:bg-[#75a625] text-white"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Commencer la conversation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="border-b bg-white p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-900"
                    onClick={resetChat}
                  >
                    <MessageSquare className="h-5 w-5 mr-1.5" />
                    Nouvelle conversation
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  {selectedProduct && (
                    <div className="bg-[#86BC29]/10 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#86BC29] flex items-center">
                      <Package className="h-3.5 w-3.5 mr-1" />
                      {products.find(p => p.id === selectedProduct)?.name || ""}
                      {selectedPowerOptions[selectedProduct] && (
                        <Badge variant="outline" className="ml-1 bg-transparent border-[#86BC29]/20 text-[#86BC29] text-[10px] px-1 py-0">
                          {selectedPowerOptions[selectedProduct].split(' - ')[1]}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="ml-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => setShowProductSelector(true)}
                    >
                      <Package className="h-4 w-4 mr-1.5" />
                      Changer de produit
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-4xl space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'assistant' ? 'justify-start pl-2' : 'justify-end pr-2'}`}
                    >
                      <div
                        className={`flex ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'} max-w-[90%] group`}
                      >
                        {message.role === 'assistant' && (
                          <div className="mr-2 mt-1">
                            <Avatar className="h-8 w-8 border bg-[#86BC29]/10">
                              <AvatarFallback className="text-[#86BC29] text-xs font-medium">IA</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        
                        <div
                          className={`px-4 py-3 rounded-lg ${
                            message.role === 'assistant'
                              ? 'bg-white border text-gray-800'
                              : 'bg-[#86BC29] text-white mr-2'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <ReactMarkdown
                              components={{
                                a: ({ node, ...props }) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />,
                                p: ({ node, ...props }) => <p {...props} className="mb-3 last:mb-0 text-[14px] leading-relaxed" />,
                                ul: ({ node, ...props }) => <ul {...props} className="mb-3 list-disc pl-5 text-[14px]" />,
                                ol: ({ node, ...props }) => <ol {...props} className="mb-3 list-decimal pl-5 text-[14px]" />,
                                li: ({ node, ...props }) => <li {...props} className="mb-1 text-[14px]" />,
                                h1: ({ node, ...props }) => <h1 {...props} className="text-lg font-medium mb-3 mt-4" />,
                                h2: ({ node, ...props }) => <h2 {...props} className="text-base font-medium mb-3 mt-4" />,
                                h3: ({ node, ...props }) => <h3 {...props} className="text-[15px] font-medium mb-2 mt-3" />,
                                code: ({ node, ...props }) => <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-[13px]" />,
                                table: ({ node, ...props }) => <table {...props} className="border-collapse w-full mb-3 text-[14px]" />,
                                th: ({ node, ...props }) => <th {...props} className="border border-gray-300 px-2 py-1 bg-gray-100" />,
                                td: ({ node, ...props }) => <td {...props} className="border border-gray-300 px-2 py-1" />,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="text-[14px] leading-relaxed">{message.content}</div>
                          )}
                        </div>
                      
                        {message.role === 'user' && (
                          <div className="ml-2 mt-1">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={userProfile?.image_url || ''} alt="User" />
                              <AvatarFallback className="bg-gray-100">{getInitials(userProfile?.name)}</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start pl-2">
                      <div className="flex flex-row max-w-[90%]">
                        <div className="mr-2 mt-1">
                          <Avatar className="h-8 w-8 border bg-[#86BC29]/10">
                            <AvatarFallback className="text-[#86BC29] text-xs font-medium">IA</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="bg-white border px-4 py-3 rounded-lg">
                          <div className="flex items-center h-6">
                            <div className="flex space-x-1.5">
                              <div className="h-2 w-2 rounded-full bg-[#86BC29] animate-pulse"></div>
                              <div className="h-2 w-2 rounded-full bg-[#86BC29] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="h-2 w-2 rounded-full bg-[#86BC29] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="h-12" /> {/* Espace en bas pour éviter que le dernier message soit caché par l'input */}
                </div>
              </div>
              
              <div className="border-t bg-white p-3 md:p-4 sticky bottom-0">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-end rounded-lg border bg-white p-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={selectedProduct 
                        ? `Posez votre question sur ${products.find(p => p.id === selectedProduct)?.name || ""}...` 
                        : "Posez votre question sur la géothermie, l'aérothermie ou nos produits..."}
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                      disabled={isLoading}
                    />
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-[#86BC29] hover:bg-[#75a625] text-white shadow-sm h-8 w-8"
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-center mt-2">
                    <p className="text-xs text-gray-500">
                      L'assistant Nextherm peut faire des erreurs. Vérifiez les informations importantes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
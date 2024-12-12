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
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

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
    imageUrl?: string | null;
  }

  const examplePrompts = [
    {
      title: "Dépannage",
      description: "Assistance technique",
      prompt: "J'ai besoin d'aide pour un dépannage sur une installation",
      icon: "🔧",
    },
    {
      title: "Produits Nextherm",
      description: "Informations & spécifications",
      prompt: "Je voudrais des informations sur un produit de la gamme",
      icon: "📋",
    },
    {
      title: "Fonctionnement",
      description: "Comprendre nos solutions",
      prompt: "Comment fonctionne une pompe à chaleur Nextherm ?",
      icon: "💡",
    },
    {
      title: "Questions diverses",
      description: "Autres demandes",
      prompt: "J'ai une question générale sur Nextherm",
      icon: "❓",
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
  
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  
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

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
    // Optionnel : déclencher automatiquement l'envoi
    handleSend();
    
  };
  


  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

   const handleSend = async () => {
    if (!inputValue.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Session expirée, veuillez vous reconnecter");
      router.push('/login');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: inputValue,
          threadId: currentThreadId
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expirée, veuillez vous reconnecter");
          router.push('/login');
          return;
        }
        throw new Error('Erreur de communication avec Nextherm');
      }

      const data = await response.json();
      
      if (data.threadId) {
        setCurrentThreadId(data.threadId);
      }
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Erreur lors de la communication avec Nextherm");
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Texte copié dans le presse-papiers");
  };

    const startNewConversation = () => {
    setMessages([]);
    setInputValue('');
    setCurrentThreadId(null); // Réinitialiser le threadId
    inputRef.current?.focus();
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
          prose-a:text-blue-500 prose-a:hover:underline`}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] max-w-6xl mx-auto">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 flex items-center justify-between bg-gradient-to-r from-[#86BC29]/10 to-transparent rounded-t-lg">
          <div className="flex items-center space-x-4">
            <div className="relative">
            <Avatar className="h-12 w-12 shadow-md">
              <Bot className="h-8 w-8 text-[#86BC29]" />
              <AvatarFallback className="bg-[#86BC29] text-white">NT</AvatarFallback>
            </Avatar>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-800">Nextherm AI</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-[#86BC29]" />
                <span>Intelligence Artificielle Nextherm</span>
              </div>
            </div>
          </div>
          <Button
            onClick={startNewConversation}
            variant="outline"
            className="gap-2 text-gray-700 hover:text-[#86BC29] hover:border-[#86BC29]"
          >
            <Bot className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 py-16">
            {/* Section d'accueil (quand pas de messages) */}
            {messages.length === 0 && (
              <div className="text-center max-w-2xl mx-auto">
                <div className="bg-gradient-to-b from-[#86BC29]/5 to-transparent p-8 rounded-2xl mb-8">
                  
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                    Bienvenue sur Nextherm AI
                  </h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Je suis l'intelligence artificielle spécialisée dans les technologies Nextherm. 
                      Je peux vous aider sur tous les aspects techniques de nos solutions.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      {examplePrompts.map((prompt) => (
                        <button
                          key={prompt.title}
                          onClick={() => handleExampleClick(prompt.prompt)}
                          className="flex items-start gap-4 p-4 text-left bg-white rounded-xl border border-gray-100 hover:border-[#86BC29] hover:shadow-md transition-all duration-200"
                        >
                          <span className="text-2xl">{prompt.icon}</span>
                          <div>
                            <h4 className="font-semibold text-gray-800">{prompt.title}</h4>
                            <p className="text-sm text-gray-600">{prompt.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Messages de la conversation */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-4 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-1">
                    <Bot className="h-5 w-5 text-[#86BC29]" />
                    <AvatarFallback className="bg-[#86BC29] text-white">NT</AvatarFallback>
                  </Avatar>
                    )}
                <div className={`space-y-1 max-w-[80%] ${
                  message.role === 'user' ? 'ml-auto' : 'mr-auto'
                }`}>
                  <div className={`rounded-2xl p-4 shadow-sm ${
                    message.role === 'assistant' 
                        ? 'bg-white border border-gray-100' 
                        : 'bg-[#86BC29] text-white'
                    }`}>
                    <MessageContent content={message.content} role={message.role} />
                    </div>
                                            
                  <div className={`flex items-center space-x-2 text-xs text-gray-500 ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2">
                        <button
                          className="hover:text-[#86BC29] transition-colors p-1 rounded hover:bg-[#86BC29]/10"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button className="hover:text-[#86BC29] transition-colors p-1 rounded hover:bg-[#86BC29]/10">
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className="hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50">
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 mt-1">
                    {userProfile?.imageUrl ? (
                      <AvatarImage src={userProfile.imageUrl} alt={userProfile?.name || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        {getInitials(userProfile?.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
              </div>
            ))}

            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyse en cours...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question sur les technologies Nextherm..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="bg-[#86BC29] hover:bg-[#75a625] text-white shadow-sm"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Touche Entrée pour envoyer • Shift + Entrée pour un nouveau paragraphe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
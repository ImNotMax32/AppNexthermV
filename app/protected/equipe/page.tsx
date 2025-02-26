"use client"

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Loader2,
  PlusCircle,
  Users,
  Mail,
  Shield,
  MessageSquare,
  UserPlus,
  Activity,
  Building,
  Link as LinkIcon,
  Send
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  invite_code?: string;
  owner_id: string;
  role?: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  user?: {
    email: string;
    full_name: string;
  };
}

interface Message {
  id: string;
  team_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

export default function TeamManagement() {
  // useContext hooks
  const router = useRouter();

  // useRef hooks
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  // useState hooks - regroupés ensemble
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [joinTeamCode, setJoinTeamCode] = useState('');
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);

  // Fonctions
  const fetchTeams = async () => {
    const supabase = createClient();
    setIsLoading(true);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Erreur authentification:', userError);
        router.push('/sign-in');
        return;
      }

      const { data: memberships, error: membershipError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams:team_id (
            id,
            name,
            description,
            created_at,
            invite_code,
            owner_id
          )
        `)
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;

      
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedTeam) return;
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:user_id (
          email,
          full_name
        )
      `)
      .eq('team_id', selectedTeam.id)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error("Erreur lors du chargement des messages");
      return;
    }

    setMessages(data || []);
  };

  const fetchTeamMembers = async () => {
    if (!selectedTeam) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:user_id (
          email,
          full_name
        )
      `)
      .eq('team_id', selectedTeam.id);

    if (error) {
      toast.error("Erreur lors du chargement des membres");
      return;
    }

    setTeamMembers(data || []);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingTeam(true);
    const supabase = createClient();
    
    try {
      const { data: newTeam, error } = await supabase
        .rpc('create_team', {
          team_name: newTeamName,
          team_description: newTeamDescription
        });

      if (error) throw error;

      await fetchTeams();
      toast.success("Équipe créée avec succès");
      setNewTeamName('');
      setNewTeamDescription('');
      dialogCloseRef.current?.click();
    } catch (error) {
      console.error('Erreur lors de la création de l\'équipe:', error);
      toast.error("Erreur lors de la création de l'équipe");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoiningTeam(true);
    const supabase = createClient();

    try {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('invite_code', joinTeamCode)
        .single();

      if (teamError || !team) throw new Error('Code d\'invitation invalide');

      const { error: joinError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      await fetchTeams();
      toast.success("Vous avez rejoint l'équipe avec succès");
      setJoinTeamCode('');
      dialogCloseRef.current?.click();
    } catch (error) {
      console.error('Erreur lors de la jointure de l\'équipe:', error);
      toast.error("Erreur lors de la jointure de l'équipe");
    } finally {
      setIsJoiningTeam(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !newMessage.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('messages')
      .insert({
        content: newMessage.trim(),
        team_id: selectedTeam.id
      });

    if (error) {
      toast.error("Erreur lors de l'envoi du message");
      return;
    }

    setNewMessage('');
    fetchMessages();
  };

  // Effects
  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchMessages();
      fetchTeamMembers();
    }
  }, [selectedTeam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#86BC29]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select 
            value={selectedTeam?.id || ''} 
            onValueChange={(value) => {
              const team = teams.find(t => t.id === value);
              setSelectedTeam(team || null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sélectionner une équipe" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="w-4 h-4 mr-2" />
                Créer une équipe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle équipe</DialogTitle>
                <DialogDescription>
                  Donnez un nom à votre équipe pour commencer
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTeam}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Nom de l'équipe"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Description (optionnel)"
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={isCreatingTeam}>
                    {isCreatingTeam ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Building className="w-4 h-4 mr-2" />
                        Créer l'équipe
                      </>
                    )}
                  </Button>
                </div>
              </form>
              <DialogClose ref={dialogCloseRef} />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LinkIcon className="w-4 h-4 mr-2" />
                Rejoindre une équipe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rejoindre une équipe</DialogTitle>
                <DialogDescription>
                  Entrez le code d'invitation fourni par votre équipe
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleJoinTeam}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Code d'invitation"
                      value={joinTeamCode}
                      onChange={(e) => setJoinTeamCode(e.target.value)}
                      required
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={isJoiningTeam}>
                    {isJoiningTeam ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Jointure en cours...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Rejoindre
                      </>
                    )}
                  </Button>
                </div>
              </form>
              <DialogClose ref={dialogCloseRef} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedTeam ? (
        <Tabs defaultValue="chat" className="w-full">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Membres
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Activité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Discussion de l'équipe</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {message.user?.full_name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">{message.user?.full_name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <form onSubmit={sendMessage} className="mt-4 flex space-x-2">
                  <Input
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="members" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Membres de l'équipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.user?.full_name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.full_name}</p>
                          <p className="text-sm text-gray-500">{member.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${member.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                            member.role === 'admin' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Activité de l'équipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  Historique des activités à venir
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sélectionnez une équipe
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Choisissez une équipe dans la liste déroulante ou créez-en une nouvelle pour commencer
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  BookOpen,
  Settings,
  Users,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Home,
  Wrench,
  FileText
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from('user')
    .select('name')
    .eq('id', user.id)
    .single();

  const firstName = profile?.name?.split(' ')[0] || 'utilisateur';

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      {/* En-tête avec message de bienvenue */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Bonjour {firstName} 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Bienvenue dans votre espace Nextherm. Que souhaitez-vous faire aujourd'hui ?
        </p>
      </div>

      {/* Section des actions rapides */}
      <section className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {[
          {
            title: "IA Assistant",
            description: "Posez vos questions techniques à notre IA",
            icon: <Bot className="h-6 w-6 text-emerald-500" />,
            href: "/dashboard/IA",
            color: "bg-emerald-50 dark:bg-emerald-950/30"
          },
          {
            title: "Documentation",
            description: "Accédez aux guides et manuels techniques",
            icon: <BookOpen className="h-6 w-6 text-blue-500" />,
            href: "/documentation",
            color: "bg-blue-50 dark:bg-blue-950/30"
          },
          {
            title: "Mon équipe",
            description: "Gérez votre équipe et vos collaborateurs",
            icon: <Users className="h-6 w-6 text-purple-500" />,
            href: "/team",
            color: "bg-purple-50 dark:bg-purple-950/30"
          },
          {
            title: "Paramètres",
            description: "Configurez votre profil et préférences",
            icon: <Settings className="h-6 w-6 text-gray-500" />,
            href: "/settings",
            color: "bg-gray-50 dark:bg-gray-900"
          }
        ].map((item) => (
          <Card key={item.title} className="group hover:shadow-md transition-all">
            <CardHeader className={`${item.color} rounded-t-lg p-4`}>
              {item.icon}
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {item.description}
              </p>
              <Button
                variant="ghost"
                className="group-hover:translate-x-1 transition-transform w-full justify-between"
                asChild
              >
                <a href={item.href}>
                  Accéder
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Section des statistiques et informations */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Carte des outils */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#86BC29]" />
              Outils disponibles
            </CardTitle>
            <CardDescription>
              Accédez rapidement à vos outils essentiels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Calculateur de dimensionnement",
                "Simulateur de performance",
                "Configurateur de système",
                "Diagnostic en ligne"
              ].map((tool) => (
                <li key={tool} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-[#86BC29]" />
                  {tool}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Carte des ressources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#86BC29]" />
              Ressources utiles
            </CardTitle>
            <CardDescription>
              Documentation et supports techniques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Guide d'installation",
                "Fiches techniques",
                "Manuels d'utilisation",
                "Vidéos tutorielles"
              ].map((resource) => (
                <li key={resource} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-[#86BC29]" />
                  {resource}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
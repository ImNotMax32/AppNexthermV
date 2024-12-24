import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  BookOpen,
  FileText,
  Calculator,
  Save,
  FileSpreadsheet,
  Building2,
  BrainCircuit,
  ArrowRight,
  Library,
  LibraryBig
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

  const mainWorkflow = [
    {
      title: "Dimensionnement",
      description: "Créez un dimensionnement de pompe à chaleur et générez des documents professionnels (PDF résumé, PDF format CEE)",
      icon: <Calculator className="h-6 w-6 text-blue-500" />,
      href: "/protected/dimensionnement",
      color: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      title: "Devis",
      description: "Créez un devis à partir d'un dimensionnement ou directement. Page personnalisable pour vos offres commerciales",
      icon: <LibraryBig className="h-6 w-6 text-purple-500" />,
      href: "/protected/devis",
      color: "bg-purple-50 dark:bg-purple-950/30"
    }
  ];

  const additionalFeatures = [
    {
      title: "IA Nextherm",
      description: "Votre assistant virtuel pour toutes vos questions techniques",
      icon: <BrainCircuit className="h-6 w-6 text-emerald-500" />,
      href: "/protected/IA",
      color: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      title: "Mes Projets",
      description: "Accédez à vos dimensionnements et devis sauvegardés",
      icon: <Save className="h-6 w-6 text-amber-500" />,
      href: "/protected/dimensionnement/save",
      color: "bg-amber-50 dark:bg-amber-950/30"
    },
    {
      title: "Documentation Technique",
      description: "Consultez les guides et fiches techniques",
      icon: <BookOpen className="h-6 w-6 text-indigo-500" />,
      href: "/protected/schema/guide",
      color: "bg-indigo-50 dark:bg-indigo-950/30"
    },
    {
      title: "Schémathèque",
      description: "Accédez à notre bibliothèque de schémas techniques",
      icon: <Library className="h-6 w-6 text-orange-500" />,
      href: "/protected/schema/schematheque",
      color: "bg-orange-50 dark:bg-orange-950/30"
    }
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Bonjour, {firstName}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Que souhaitez-vous faire aujourd'hui ?
        </p>
      </div>

      {/* Workflow Principal */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Outils principaux
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {mainWorkflow.map((item) => (
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
        </div>
      </section>

      {/* Fonctionnalités Additionnelles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Autres fonctionnalités
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {additionalFeatures.map((item) => (
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
        </div>
      </section>
    </div>
  );
}
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      </div>

      <div className="grid gap-6">
        {/* Message de bienvenue */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <InfoIcon size={24} className="text-[#86BC29]" />
            <h2 className="text-xl font-semibold">Bienvenue sur votre espace Nextherm</h2>
          </div>
          <p className="text-gray-600">
            Cette page est protégée et uniquement accessible aux utilisateurs authentifiés.
            Vous avez maintenant accès à tous les outils et fonctionnalités de la plateforme.
          </p>
        </div>

        {/* Suggestions d'actions */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Prochaines étapes suggérées</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#86BC29]" />
              Complétez votre profil dans les paramètres
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#86BC29]" />
              Explorez les outils techniques disponibles
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#86BC29]" />
              Consultez la documentation technique
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#86BC29]" />
              Découvrez l'IA Nextherm pour une assistance personnalisée
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
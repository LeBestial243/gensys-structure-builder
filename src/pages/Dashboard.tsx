import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowRightCircle,
  Users,
  FileText,
  AlertCircle,
  Calendar as CalendarIcon,
  Mic,
  Plus,
  Bell,
  FileEdit,
  AlertTriangle
} from "lucide-react";
import { DashboardService } from "@/services/DashboardService";
import type { Alerte, DashboardStats, Evenement, Structure } from "@/types/dashboard";
import { useMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const isMobile = useMobile();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Récupérer les informations de la structure
  const { data: structure } = useQuery<Structure | null>({
    queryKey: ["structure", currentUser?.structure_id],
    queryFn: () => 
      currentUser?.structure_id 
        ? DashboardService.getStructureInfo(currentUser.structure_id)
        : Promise.resolve(null),
    enabled: !!currentUser?.structure_id,
  });

  // Récupérer les statistiques du dashboard
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => DashboardService.getStats(),
    enabled: true,
  });

  // Récupérer les événements à venir
  const { data: evenements = [] } = useQuery<Evenement[]>({
    queryKey: ["evenements"],
    queryFn: () => DashboardService.getEvenements(7),
    enabled: true,
  });

  // Récupérer les alertes
  const { data: alertes = [] } = useQuery<Alerte[]>({
    queryKey: ["alertes"],
    queryFn: () => DashboardService.getAlertes(),
    enabled: true,
  });

  // Récupérer les événements pour la date sélectionnée
  const evenementsDuJour = evenements.filter(evt => {
    if (!selectedDate) return false;
    const dateEvt = new Date(evt.date);
    return (
      dateEvt.getDate() === selectedDate.getDate() &&
      dateEvt.getMonth() === selectedDate.getMonth() &&
      dateEvt.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Formater les dates pour les événements du calendrier
  const evenementDates = evenements.reduce((acc, evt) => {
    const date = new Date(evt.date);
    const dateString = date.toISOString().split("T")[0];
    acc[dateString] = true;
    return acc;
  }, {} as Record<string, boolean>);

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* En-tête personnalisée */}
      <header className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center gap-4">
          {structure?.logo_url ? (
            <Avatar className="h-16 w-16">
              <AvatarImage src={structure.logo_url} alt={structure.name} />
              <AvatarFallback>{structure.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xl font-bold text-purple-800">
                {structure?.name.substring(0, 2).toUpperCase() || "GS"}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Bonjour {currentUser?.name?.split(' ')[0] || currentUser?.email}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {structure?.name || "Structure éducative"}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button
            variant="outline"
            className="shadow-sm dark:shadow-slate-800"
            onClick={() => {/* Ouvrir les préférences */}}
          >
            <Bell className="h-4 w-4 mr-2" />
            {stats?.nombreAlertes || 0} alertes
          </Button>
        </div>
      </header>

      <Separator className="my-6" />

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm dark:shadow-slate-800 bg-white dark:bg-slate-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Jeunes suivis</CardTitle>
            <CardDescription>Nombre total de dossiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                {stats?.nombreJeunes || 0}
              </p>
              <Users className="h-12 w-12 text-purple-200 dark:text-purple-950" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs text-purple-600 dark:text-purple-400">
              <Link to="/mes-jeunes" className="flex items-center gap-1">
                Voir tous les jeunes
                <ArrowRightCircle className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-sm dark:shadow-slate-800 bg-white dark:bg-slate-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Notes générées</CardTitle>
            <CardDescription>Cette année</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                {stats?.nombreNotes || 0}
              </p>
              <FileText className="h-12 w-12 text-indigo-200 dark:text-indigo-950" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-400">
              <Link to="/notes" className="flex items-center gap-1">
                Consulter les notes
                <ArrowRightCircle className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-sm dark:shadow-slate-800 bg-white dark:bg-slate-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Alertes à traiter</CardTitle>
            <CardDescription>Actions requises</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                {stats?.nombreAlertes || 0}
              </p>
              <AlertCircle className="h-12 w-12 text-rose-200 dark:text-rose-950" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs text-rose-600 dark:text-rose-400" 
              onClick={() => document.getElementById('alertes-section')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="flex items-center gap-1">
                Voir les alertes
                <ArrowRightCircle className="h-3 w-3 ml-1" />
              </span>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Corps du Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendrier et Événements */}
        <Card className="lg:col-span-3 shadow-sm dark:shadow-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-500" />
              <span>Calendrier</span>
            </CardTitle>
            <CardDescription>Échéances et événements à venir</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border shadow-sm dark:shadow-slate-800"
                modifiers={{
                  event: Object.keys(evenementDates).map(date => new Date(date)),
                }}
                modifiersClassNames={{
                  event: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 font-bold",
                }}
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">
                {selectedDate ? `Événements du ${selectedDate.toLocaleDateString()}` : "Événements à venir"}
              </h3>
              {evenementsDuJour.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                  Aucun événement prévu pour cette date
                </p>
              ) : (
                <div className="space-y-3">
                  {evenementsDuJour.map(evt => (
                    <Link key={evt.id} to={`/mes-jeunes/${evt.jeune_id}`}>
                      <div className="p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border text-sm">
                        <div className="font-medium">{evt.titre}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{evt.description}</div>
                        <div className="flex mt-2 items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${
                            evt.type === 'rdv' ? 'bg-green-500' : 
                            evt.type === 'anniversaire' ? 'bg-blue-500' : 
                            evt.type === 'echeance' ? 'bg-amber-500' : 'bg-gray-500'
                          }`}></span>
                          <span className="text-xs text-gray-500 capitalize">{evt.type}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertes prioritaires */}
        <Card id="alertes-section" className="lg:col-span-2 shadow-sm dark:shadow-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Alertes prioritaires</span>
            </CardTitle>
            <CardDescription>Actions requises</CardDescription>
          </CardHeader>
          <CardContent>
            {alertes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                <p>Aucune alerte en cours</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {alertes.map(alerte => (
                  <Link key={alerte.id} to={alerte.lien}>
                    <div className={`p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border text-sm ${
                      alerte.type === 'transcription' ? 'border-l-4 border-l-blue-500' : 
                      alerte.type === 'note' ? 'border-l-4 border-l-amber-500' : 
                      'border-l-4 border-l-rose-500'
                    }`}>
                      <div className="font-medium">{alerte.titre}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{alerte.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Boutons d'action rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Link to="/mes-jeunes">
          <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-sm dark:shadow-slate-800">
            <Users className="h-4 w-4 mr-2" />
            Mes Jeunes
          </Button>
        </Link>
        
        <Button variant="outline" className="w-full shadow-sm dark:shadow-slate-800">
          <FileEdit className="h-4 w-4 mr-2" />
          Nouvelle note
        </Button>
        
        <Button variant="outline" className="w-full shadow-sm dark:shadow-slate-800">
          <Mic className="h-4 w-4 mr-2" />
          Nouvelle transcription
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
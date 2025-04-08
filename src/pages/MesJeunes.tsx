import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { JeuneService } from "@/services/JeuneService";
import { StructureService } from "@/services/StructureService";
import { Jeune, Structure } from "@/types/dashboard";
import { STRUCTURES_OPTIONS } from "@/constants/structures";
import { useFilters } from "@/hooks/use-filters";
import { supabase } from "@/integrations/supabase/client";
// Import date-fns
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Icônes
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Mic, 
  FileText, 
  MoreVertical, 
  ExternalLink,
  X,
  Upload
} from "lucide-react";

// Composants UI
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types pour les dossiers
interface DossierOption {
  id: string;
  label: string;
  custom?: boolean;
}

const typesOptionsInitiaux: DossierOption[] = [
  { id: "administratif", label: "Administratif" },
  { id: "éducatif", label: "Éducatif" },
  { id: "médical", label: "Médical" },
  { id: "scolaire", label: "Scolaire" },
];

const MesJeunes = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [jeunes, setJeunes] = useState<Jeune[]>([]);
  const [filteredJeunes, setFilteredJeunes] = useState<Jeune[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // États pour le nouveau jeune
  const [typesOptions, setTypesOptions] = useState<DossierOption[]>(typesOptionsInitiaux);
  const [nouveauDossier, setNouveauDossier] = useState("");
  const [structures, setStructures] = useState<Structure[]>([]);
  
  const [newJeune, setNewJeune] = useState({
    prenom: "",
    nom: "",
    date_naissance: "",
    date_entree: new Date().toISOString().split('T')[0],
    structure_manuelle: "",
    photo: null as File | null,
    dossiers: [] as string[],
  });

  // Utilisation du hook personnalisé pour gérer les filtres
  const { 
    filters: activeFilters, 
    updateFilter,
    resetFilters,
    filteredItems,
    hasActiveFilters
  } = useFilters(
    {
      search: "",
      typeDossier: "",
      dateEntree: "",
      status: ""
    },
    jeunes,
    (jeune, filters) => {
      // Filtrer par recherche texte
      const matchesSearch = !filters.search || 
        `${jeune.prenom} ${jeune.nom}`.toLowerCase().includes(filters.search.toLowerCase());
      
      // Filtrer par type de dossier
      const matchesTypeDossier = !filters.typeDossier || 
        (jeune.dossiers && Array.isArray(jeune.dossiers) && 
        jeune.dossiers.includes(filters.typeDossier));
      
      // Filtrer par date d'entrée
      const matchesDateEntree = !filters.dateEntree ||
        new Date(jeune.created_at).toISOString().split('T')[0] === filters.dateEntree;
      
      // Filtrer par statut
      const matchesStatus = !filters.status || 
        (filters.status === 'complet' ? jeune.dossier_complet : !jeune.dossier_complet);
      
      return matchesSearch && matchesTypeDossier && matchesDateEntree && matchesStatus;
    }
  );
  
  // Utiliser les résultats filtrés du hook pour mettre à jour notre state
  useEffect(() => {
    setFilteredJeunes(filteredItems);
  }, [filteredItems]);

  // Effectuer la recherche quand le terme change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateFilter('search', value);
  };

  useEffect(() => {
    const fetchJeunes = async () => {
      try {
        setIsLoading(true);
        const jeunesData = await JeuneService.getAllJeunes();
        setJeunes(jeunesData);
        setFilteredJeunes(jeunesData);
      } catch (error) {
        console.error("Erreur lors de la récupération des jeunes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJeunes();
  }, []);
  
  // Récupérer les structures disponibles
  useEffect(() => {
    const fetchStructures = async () => {
      try {
        // Créer une structure par défaut si aucune n'existe
        await StructureService.createDefaultStructureIfNoneExist();
        
        // Récupérer toutes les structures
        const structuresData = await StructureService.getAllStructures();
        setStructures(structuresData);
      } catch (error) {
        console.error("Erreur lors de la récupération des structures:", error);
      }
    };
    
    fetchStructures();
  }, []);

  // Vérifier si le nom de la structure est valide
  const isValidStructure = (structure: string) => {
    return !!structure && structure.length >= 2;
  };

  // Fonction auxiliaire pour valider un UUID
  function isValidUUID(uuid: string) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  // Méthode de création alternative plus directe
  const createJeuneDirectement = async () => {
    console.log("Méthode alternative - Création du jeune");
    
    // Vérifier d'abord tous les champs requis
    if (!newJeune.prenom || !newJeune.nom || !newJeune.date_naissance) {
      console.error("Champs obligatoires manquants");
      alert("Veuillez remplir tous les champs obligatoires (nom, prénom, date de naissance)");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Données à envoyer:", {
        prenom: newJeune.prenom,
        nom: newJeune.nom,
        date_naissance: newJeune.date_naissance,
        structure_manuelle: newJeune.structure_manuelle,
        dossiers: newJeune.dossiers
      });
      
      // Appel direct à Supabase pour déboguer
      // Option 1: Utiliser l'insertion directe
      const jeuneData = {
        prenom: newJeune.prenom,
        nom: newJeune.nom,
        date_naissance: newJeune.date_naissance,
        structure_manuelle: newJeune.structure_manuelle || null,
        dossiers: newJeune.dossiers.length > 0 ? newJeune.dossiers : null
      };
      
      // Option 2: Utiliser la fonction RPC (décommenter si la fonction est activée sur Supabase)
      // const { data, error } = await supabase.rpc('create_jeune_without_structure', {
      //   jeune_data: jeuneData
      // });
      
      // Pour l'instant, utilisons l'insertion directe
      const { data, error } = await supabase
        .from('jeunes')
        .insert(jeuneData)
        .select()
        .single();
      
      if (error) {
        console.error("Erreur Supabase:", error);
        alert("Erreur lors de la création: " + error.message);
        return;
      }
      
      console.log("Jeune créé avec succès:", data);
      alert("Jeune créé avec succès!");
      
      // Fermer le modal
      setShowAddModal(false);
      
      // Réinitialiser le formulaire
      setNewJeune({
        prenom: "",
        nom: "",
        date_naissance: "",
        date_entree: new Date().toISOString().split('T')[0],
        structure_manuelle: "",
        photo: null,
        dossiers: [],
      });
      
      // Conserver uniquement les types de dossiers par défaut
      setTypesOptions(typesOptionsInitiaux);
      
      // Réinitialiser le champ de nouveau dossier
      setNouveauDossier("");
      
      // Rafraîchir la liste des jeunes
      const jeunesData = await JeuneService.getAllJeunes();
      setJeunes(jeunesData);
    } catch (error) {
      console.error("Exception non gérée:", error);
      alert("Exception non gérée: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la soumission du formulaire de nouveau jeune
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Soumission du formulaire");
    
    // On utilise la méthode alternative
    await createJeuneDirectement();
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewJeune(prev => {
      const newState = { ...prev, [name]: value };
      console.log(`Champ ${name} mis à jour:`, value);
      console.log("Nouvel état:", newState);
      return newState;
    });
  };

  // Gérer l'upload de photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewJeune(prev => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  // Gérer la sélection/désélection d'un type de dossier
  const toggleDossierType = (type: string) => {
    setNewJeune(prev => {
      const dossiers = [...prev.dossiers];
      const index = dossiers.indexOf(type);
      
      if (index === -1) {
        dossiers.push(type);
      } else {
        dossiers.splice(index, 1);
      }
      
      return { ...prev, dossiers };
    });
  };
  
  // Ajouter un nouveau type de dossier personnalisé
  const ajouterDossierPersonnalise = () => {
    if (nouveauDossier.trim() !== '') {
      // Créer un ID unique en normalisant et en transformant le nom du dossier
      const id = nouveauDossier.trim().toLowerCase().replace(/\s+/g, '_');
      
      // Vérifier si ce dossier existe déjà
      if (!typesOptions.some(d => d.id === id || d.label.toLowerCase() === nouveauDossier.trim().toLowerCase())) {
        const newOption: DossierOption = { 
          id, 
          label: nouveauDossier.trim(),
          custom: true 
        };
        
        setTypesOptions(prev => [...prev, newOption]);
        setNouveauDossier('');
      }
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Mes Jeunes</h1>

      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Rechercher par nom, prénom..." 
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            className={`gap-2 ${hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : ''}`}
            onClick={() => {
              // TODO: Implémenter un modal ou dropdown de filtres avancés
              if (hasActiveFilters) {
                resetFilters();
              }
            }}
          >
            <Filter size={16} />
            {hasActiveFilters ? 'Réinitialiser filtres' : 'Filtres'}
          </Button>
          
          <Button className="gap-2" onClick={() => setShowAddModal(true)}>
            <PlusCircle size={16} />
            Ajouter un jeune
          </Button>
        </div>
      </div>

      {/* Tableau des jeunes - Version desktop */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Nom et prénom</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead>Date d'entrée</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead>Dossiers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loading centered text="Chargement des jeunes..." />
                </TableCell>
              </TableRow>
            ) : filteredJeunes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Aucun jeune trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredJeunes.map((jeune) => (
                <TableRow key={jeune.id} className="hover:bg-gray-50 transition-all">
                  <TableCell>
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {/* Placeholder pour la photo */}
                      {jeune.prenom.charAt(0).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {jeune.nom} {jeune.prenom}
                  </TableCell>
                  <TableCell>{formatDate(jeune.date_naissance)}</TableCell>
                  <TableCell>{formatDate(jeune.created_at)}</TableCell>
                  <TableCell>
                    {jeune.structure_manuelle || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {jeune.dossiers && jeune.dossiers.map(dossier => (
                        <Badge key={dossier} variant="secondary" className="cursor-pointer">{dossier}</Badge>
                      ))}
                      {(!jeune.dossiers || jeune.dossiers.length === 0) && (
                        <>
                          <Badge variant="secondary" className="cursor-pointer">Administratif</Badge>
                          <Badge variant="secondary" className="cursor-pointer">Éducatif</Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Ouvrir la fiche">
                        <ExternalLink size={16} />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Transcription vocale">
                        <Mic size={16} />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Générer une note">
                        <FileText size={16} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Modifier</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Archiver</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Affichage des jeunes - Version mobile */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredJeunes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun jeune trouvé
          </div>
        ) : (
          filteredJeunes.map((jeune) => (
            <Card key={jeune.id} className="overflow-hidden hover:shadow-md transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {jeune.prenom.charAt(0).toUpperCase()}
                  </div>
                  <CardTitle className="text-lg">
                    {jeune.nom} {jeune.prenom}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
                  <div className="text-gray-500">Date de naissance:</div>
                  <div>{formatDate(jeune.date_naissance)}</div>
                  <div className="text-gray-500">Date d'entrée:</div>
                  <div>{formatDate(jeune.created_at)}</div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  <Badge variant="secondary" className="cursor-pointer">Administratif</Badge>
                  <Badge variant="secondary" className="cursor-pointer">Éducatif</Badge>
                </div>
                
                <div className="flex justify-between gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <ExternalLink size={14} /> Ouvrir
                  </Button>
                  <Button variant="outline" size="sm" className="w-9 p-0">
                    <Mic size={14} />
                  </Button>
                  <Button variant="outline" size="sm" className="w-9 p-0">
                    <FileText size={14} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-9 p-0">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Archiver</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Modal d'ajout d'un jeune */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogTrigger className="hidden" />
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau jeune</DialogTitle>
          </DialogHeader>
          
          <form className="space-y-6 py-4">
            <div className="flex flex-col items-center mb-6">
              <div className="relative h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
                {newJeune.photo ? (
                  <img 
                    src={URL.createObjectURL(newJeune.photo)} 
                    alt="Aperçu" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload size={24} className="text-gray-500" />
                )}
                <input 
                  type="file" 
                  id="photo" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </div>
              <label htmlFor="photo" className="text-sm text-blue-600 cursor-pointer">
                Ajouter une photo
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="nom" className="text-sm font-medium">Nom</label>
                <Input 
                  id="nom" 
                  name="nom"
                  value={newJeune.nom}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="prenom" className="text-sm font-medium">Prénom</label>
                <Input 
                  id="prenom" 
                  name="prenom"
                  value={newJeune.prenom}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date_naissance" className="text-sm font-medium">Date de naissance</label>
                <Input 
                  id="date_naissance" 
                  name="date_naissance"
                  type="date"
                  value={newJeune.date_naissance}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date_entree" className="text-sm font-medium">Date d'entrée</label>
                <Input 
                  id="date_entree" 
                  name="date_entree"
                  type="date"
                  value={newJeune.date_entree}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="structure_manuelle" className="text-sm font-medium">Structure manuelle</label>
                <Input 
                  id="structure_manuelle" 
                  name="structure_manuelle"
                  placeholder="Entrez le nom de la structure..."
                  value={newJeune.structure_manuelle}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500">Facultatif: saisissez manuellement le nom de la structure si elle n'est pas dans la liste.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dossiers à créer</label>
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    placeholder="Ajouter un nouveau type de dossier..."
                    value={nouveauDossier}
                    onChange={(e) => setNouveauDossier(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={ajouterDossierPersonnalise} 
                    disabled={nouveauDossier.trim() === ''}
                    size="sm"
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {typesOptions.map((option) => (
                    <label 
                      key={option.id} 
                      className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                        newJeune.dossiers.includes(option.id) 
                          ? 'bg-blue-50 border-blue-300' 
                          : option.custom 
                            ? 'bg-purple-50 border-purple-200' 
                            : 'bg-white border-gray-200'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="mr-2"
                        checked={newJeune.dossiers.includes(option.id)}
                        onChange={() => toggleDossierType(option.id)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Annuler</Button>
              </DialogClose>
              {/* Utilisons un bouton de type button pour contourner les problèmes de soumission de formulaire */}
              <Button 
                type="button" 
                onClick={createJeuneDirectement}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                    Création...
                  </>
                ) : 'Créer le jeune'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MesJeunes;
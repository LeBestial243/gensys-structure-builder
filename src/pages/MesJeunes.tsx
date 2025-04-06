import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { JeuneService } from "@/services/JeuneService";
import { StructureService } from "@/services/StructureService";
import { Jeune, Structure } from "@/types/dashboard";
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
    photo: null as File | null,
    structure_id: currentUser?.structure_id || "",
    dossiers: [] as string[],
  });

  // État pour le filtrage
  const [activeFilters, setActiveFilters] = useState({
    typeDossier: "",
    dateEntree: "",
    status: "",
  });

  useEffect(() => {
    const fetchJeunes = async () => {
      if (!currentUser?.structure_id) {
        setIsLoading(false);
        return;
      }

      try {
        const jeunesData = await JeuneService.getJeunesByStructure(currentUser.structure_id);
        setJeunes(jeunesData);
        setFilteredJeunes(jeunesData);
      } catch (error) {
        console.error("Erreur lors de la récupération des jeunes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJeunes();
  }, [currentUser]);
  
  // Récupérer les structures disponibles
  useEffect(() => {
    const fetchStructures = async () => {
      try {
        // Créer une structure par défaut si aucune n'existe
        await StructureService.createDefaultStructureIfNoneExist();
        
        // Récupérer toutes les structures
        const structuresData = await StructureService.getAllStructures();
        console.log("Structures disponibles:", structuresData);
        setStructures(structuresData);
        
        // Si l'utilisateur n'a pas de structure_id défini et qu'une structure existe, utiliser la première
        if (!newJeune.structure_id && structuresData.length > 0) {
          setNewJeune(prev => ({ ...prev, structure_id: structuresData[0].id }));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des structures:", error);
      }
    };
    
    fetchStructures();
  }, []);

  // Filtrage des jeunes selon la recherche
  useEffect(() => {
    if (!searchQuery.trim() && !activeFilters.typeDossier && !activeFilters.dateEntree && !activeFilters.status) {
      setFilteredJeunes(jeunes);
      return;
    }

    const filtered = jeunes.filter((jeune) => {
      const matchesSearch = searchQuery.trim() === "" || 
        `${jeune.prenom} ${jeune.nom}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Appliquer d'autres filtres ici quand ils seront implémentés
      
      return matchesSearch;
    });

    setFilteredJeunes(filtered);
  }, [searchQuery, jeunes, activeFilters]);

  // Vérifier si une chaîne est un UUID valide
  const isValidUUID = (uuid: string) => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Gérer la soumission du formulaire de nouveau jeune
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Soumission du formulaire");
    
    // Vérifier d'abord tous les champs requis
    if (!newJeune.prenom || !newJeune.nom || !newJeune.date_naissance) {
      console.error("Champs obligatoires manquants");
      alert("Veuillez remplir tous les champs obligatoires (nom, prénom, date de naissance)");
      return;
    }
    
    // Vérifier la structure_id - utiliser la structure de l'utilisateur si aucune n'est spécifiée
    const structureId = newJeune.structure_id || currentUser?.structure_id;
    
    if (!structureId) {
      console.error("ID de structure manquant");
      alert("Veuillez sélectionner ou saisir une structure");
      return;
    }
    
    // Vérifier que la structure ID est un UUID valide
    if (!isValidUUID(structureId)) {
      console.error("ID de structure invalide, pas au format UUID");
      alert("L'ID de structure doit être au format UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)");
      return;
    }
    
    console.log("Structure ID finalement utilisée:", structureId);

    try {
      setIsLoading(true);
      
      console.log("Données du formulaire:", {
        ...newJeune,
        structure_id: structureId
      });
      
      // Créer le nouveau jeune en utilisant l'API
      const nouveauJeune = await JeuneService.createJeune({
        prenom: newJeune.prenom,
        nom: newJeune.nom,
        date_naissance: newJeune.date_naissance,
        structure_id: structureId,
        dossiers: newJeune.dossiers
      });
      
      if (nouveauJeune) {
        console.log("Jeune créé avec succès:", nouveauJeune);
      }
      
      // Fermer le modal
      setShowAddModal(false);
      
      // Réinitialiser le formulaire
      setNewJeune({
        prenom: "",
        nom: "",
        date_naissance: "",
        date_entree: new Date().toISOString().split('T')[0],
        photo: null,
        structure_id: currentUser?.structure_id || "",
        dossiers: [],
      });
      // Conserver uniquement les types de dossiers par défaut
      setTypesOptions(typesOptionsInitiaux);
      // Réinitialiser le champ de nouveau dossier
      setNouveauDossier("");
      
      // Rafraîchir la liste des jeunes
      const jeunesData = await JeuneService.getJeunesByStructure(currentUser.structure_id);
      setJeunes(jeunesData);
      setFilteredJeunes(jeunesData);
    } catch (error) {
      console.error("Erreur lors de la création du jeune:", error);
    } finally {
      setIsLoading(false);
    }
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Filtres
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
              <TableHead>Dossiers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredJeunes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="cursor-pointer">Administratif</Badge>
                      <Badge variant="secondary" className="cursor-pointer">Éducatif</Badge>
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
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
              
              {/* Sélection de la structure */}
              <div className="space-y-2">
                <label htmlFor="structure_id" className="text-sm font-medium">Structure</label>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sélectionner une structure existante</label>
                  <Select
                    value={newJeune.structure_id}
                    onValueChange={(value) => setNewJeune(prev => ({ ...prev, structure_id: value }))}
                  >
                    <SelectTrigger id="structure_select">
                      <SelectValue placeholder="Sélectionner une structure" />
                    </SelectTrigger>
                    <SelectContent>
                      {structures.map(structure => (
                        <SelectItem key={structure.id} value={structure.id}>
                          {structure.name} ({structure.type} - {structure.city})
                        </SelectItem>
                      ))}
                      {structures.length === 0 && (
                        <SelectItem value="" disabled>
                          Aucune structure disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {/* Avancé: saisie manuelle d'un ID */}
                  <details className="mt-4">
                    <summary className="text-sm font-medium cursor-pointer">
                      Avancé: saisir un ID de structure manuellement
                    </summary>
                    <div className="mt-2 p-3 border rounded-md bg-gray-50">
                      <Input
                        id="structure_id_manual"
                        name="structure_id_manual"
                        placeholder="ID de structure (format UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
                        value={!structures.some(s => s.id === newJeune.structure_id) ? newJeune.structure_id : ""}
                        onChange={(e) => {
                          console.log("Valeur saisie:", e.target.value);
                          setNewJeune(prev => ({ ...prev, structure_id: e.target.value }));
                        }}
                      />
                      <p className="text-xs text-red-500 mt-1">
                        L'ID doit être un UUID valide (ex: 123e4567-e89b-12d3-a456-426614174000)
                      </p>
                    </div>
                  </details>
                </div>
                <p className="text-xs text-gray-500 italic mt-1">
                  Choisissez la structure dans laquelle le jeune est suivi.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Annuler</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isLoading}
                onClick={(e) => {
                  console.log("Bouton cliqué");
                  if (!newJeune.prenom || !newJeune.nom || !newJeune.date_naissance) {
                    e.preventDefault();
                    alert("Veuillez remplir tous les champs obligatoires");
                    return;
                  }
                }}
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
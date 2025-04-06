import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Copy, 
  Upload, 
  Building2, 
  Shield, 
  Users, 
  AtSign, 
  MapPin 
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";
import { StructureService } from "@/services/StructureService";

const formSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .refine(name => !/^\s*$/.test(name), "Le nom ne peut pas être uniquement des espaces"),
  city: z.string()
    .min(2, "La ville doit contenir au moins 2 caractères")
    .max(50, "La ville ne peut pas dépasser 50 caractères")
    .refine(city => !/^\d+$/.test(city), "La ville ne peut pas être uniquement des chiffres"),
  type: z.enum(["MECS", "SISEIP", "ITEP", "Autre"], {
    required_error: "Veuillez sélectionner un type de structure",
  }),
  email: z.string()
    .email("Adresse email invalide")
    .refine(email => /@.+\..+$/.test(email), "Format d'email invalide"),
  maxUsers: z.number()
    .int("Le nombre d'utilisateurs doit être un nombre entier")
    .min(1, "Au moins 1 utilisateur requis")
    .max(500, "Maximum 500 utilisateurs"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateStructure = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [createdStructure, setCreatedStructure] = useState<{ id: string; name: string } | null>(null);
  const [inviteLink, setInviteLink] = useState<string>("");
  
  // Vérifier que l'utilisateur est admin ou super_admin
  if (currentUser?.role !== "admin" && currentUser?.role !== "super_admin") {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6">
        <Alert variant="destructive">
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous n'avez pas les droits nécessaires pour créer une structure.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={() => navigate("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      city: "",
      type: "MECS",
      email: "",
      maxUsers: 50,
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.match(/image\/(png|jpeg|jpg|svg\+xml)/)) {
        toast({
          title: "Format invalide",
          description: "Veuillez télécharger un fichier PNG, JPG ou SVG",
          variant: "destructive",
        });
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!logoFile) {
      toast({
        title: "Logo requis",
        description: "Veuillez télécharger un logo pour la structure",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error("Erreur lors de la vérification des buckets:", bucketError);
        throw new Error(`Erreur lors de la vérification des buckets: ${bucketError.message}`);
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === 'structures');
      
      if (!bucketExists) {
        console.warn("Le bucket 'structures' n'existe pas. Tentative de création...");
        toast({
          title: "Configuration en cours",
          description: "Configuration du stockage pour les logos...",
        });
      }
      
      const structureId = uuidv4();
      
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo.${fileExt}`;
      const filePath = `${structureId}/${fileName}`;
      
      console.log("Téléchargement du logo vers:", filePath);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('structures')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: logoFile.type
        });
        
      if (uploadError) {
        console.error("Erreur de téléchargement:", uploadError);
        throw new Error(`Erreur de téléchargement: ${uploadError.message}`);
      }
      
      console.log("Téléchargement réussi:", uploadData);
      
      const { data: urlData } = supabase.storage
        .from('structures')
        .getPublicUrl(filePath);
        
      const logoUrl = urlData.publicUrl;
      console.log("URL du logo:", logoUrl);
      
      console.log("Insertion de la structure avec les données:", {
        id: structureId,
        name: data.name,
        city: data.city,
        type: data.type,
        email: data.email,
        max_users: data.maxUsers,
        logo_url: logoUrl,
      });
      
      const { error: insertError } = await supabase
        .from('structures')
        .insert({
          id: structureId,
          name: data.name,
          city: data.city,
          type: data.type,
          email: data.email,
          max_users: data.maxUsers,
          logo_url: logoUrl,
        });
        
      if (insertError) {
        console.error("Erreur d'insertion:", insertError);
        throw new Error(`Erreur d'insertion: ${insertError.message}`);
      }
      
      console.log("Structure créée avec succès avec l'ID:", structureId);
      
      // Utiliser le service pour générer un lien d'invitation officiel
      try {
        const inviteResponse = await StructureService.generateInviteLink(structureId);
        
        setCreatedStructure({
          id: inviteResponse.structure.id,
          name: data.name,
        });
        
        setInviteLink(inviteResponse.invite_link);
      } catch (inviteError) {
        console.error("Erreur lors de la génération du lien d'invitation:", inviteError);
        
        // Fallback en cas d'erreur
        setCreatedStructure({
          id: structureId,
          name: data.name,
        });
        
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/inscription?structure_id=${structureId}`;
        setInviteLink(link);
      }
      
      toast({
        title: "Structure créée avec succès",
        description: "Lien d'inscription généré",
      });
    } catch (error) {
      console.error('Erreur lors de la création de la structure:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Un problème est survenu lors de la création de la structure",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      description: "Lien copié dans le presse-papier",
    });
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
          Créer une nouvelle structure
        </h1>
        
        {createdStructure ? (
          <Card className="border-green-200 bg-gradient-to-br from-white to-purple-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <CardTitle>Structure créée avec succès</CardTitle>
              </div>
              <CardDescription>
                La structure <span className="font-semibold">{createdStructure.name}</span> a été créée avec succès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-purple-50 border-purple-200 mb-4">
                <AlertTitle className="text-purple-800">Lien d'invitation</AlertTitle>
                <AlertDescription className="text-sm text-gray-700">
                  Partagez ce lien avec les personnes que vous souhaitez inviter à rejoindre la structure.
                  Ils pourront créer un compte et seront automatiquement associés à cette structure.
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                <div className="text-sm font-mono text-gray-700 truncate flex-1">
                  {inviteLink}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-1.5"
                  onClick={copyInviteLink}
                >
                  <Copy className="h-4 w-4" />
                  <span>Copier</span>
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Prochaines étapes :</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 bg-green-100 text-green-800 p-1 rounded-full flex-shrink-0">
                      <Users className="h-3 w-3" />
                    </div>
                    <span>Partagez le lien d'invitation pour ajouter des éducateurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 bg-purple-100 text-purple-800 p-1 rounded-full flex-shrink-0">
                      <Shield className="h-3 w-3" />
                    </div>
                    <span>Configurez les droits et rôles dans votre tableau de bord</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                Retour au tableau de bord
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-white shadow-md border-t-4 border-t-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-purple-500" />
                <div>
                  <CardTitle>Créer une nouvelle structure</CardTitle>
                  <CardDescription>
                    Complétez le formulaire ci-dessous pour ajouter une structure éducative
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800">
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Les structures disposent d'espaces de données séparés et sécurisés. Toutes les données des utilisateurs sont isolées par structure.
                  </span>
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-gray-500" />
                            Nom de la structure
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Centre éducatif Saint-Joseph" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                            Ville
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Lyon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de structure</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MECS">MECS</SelectItem>
                              <SelectItem value="SISEIP">SISEIP</SelectItem>
                              <SelectItem value="ITEP">ITEP</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Type de structure éducative
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <AtSign className="h-3.5 w-3.5 text-gray-500" />
                            Email de référence
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Ex: contact@structure.fr" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Pour les communications importantes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="maxUsers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-gray-500" />
                          Nombre maximal d'utilisateurs
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            max="500"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Limite le nombre d'éducateurs pouvant rejoindre la plateforme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="border rounded-md p-4 bg-gray-50">
                    <FormLabel className="block mb-2">Logo de la structure</FormLabel>
                    <div className="flex items-start space-x-4">
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white transition-colors">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="w-full h-full object-contain p-2" 
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-2">
                            <Upload className="w-10 h-10 text-gray-400" />
                            <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".svg,.png,.jpg,.jpeg" 
                          onChange={handleFileChange}
                        />
                      </label>
                      
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Logo de la structure</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Formats acceptés: SVG, PNG, JPG</li>
                          <li>Taille recommandée: 200x200px minimum</li>
                          <li>Fond transparent recommandé</li>
                          <li>Maximum 2 Mo</li>
                        </ul>
                        {logoFile && (
                          <p className="text-green-600 font-medium mt-2 text-xs">
                            ✓ {logoFile.name} ({Math.round(logoFile.size / 1024)} Ko)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent mr-2 rounded-full"></div>
                        Création en cours...
                      </>
                    ) : (
                      "Créer la structure"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateStructure;

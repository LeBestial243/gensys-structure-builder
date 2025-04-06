import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StructureService } from "@/services/StructureService";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Lock, AtSign, User, Shield, Building } from "lucide-react";

// UI Components
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Validation schema
const formSchema = z.object({
  firstName: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .refine(name => /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name), "Le prénom ne doit contenir que des lettres, espaces, apostrophes ou tirets"),
  lastName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .refine(name => /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name), "Le nom ne doit contenir que des lettres, espaces, apostrophes ou tirets"),
  email: z.string()
    .email("Adresse email invalide")
    .refine(email => /@.+\..+$/.test(email), "Format d'email invalide"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .refine(password => /[A-Z]/.test(password), "Le mot de passe doit contenir au moins une majuscule")
    .refine(password => /[0-9]/.test(password), "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

type StructureData = {
  id: string;
  name: string;
  city: string;
  type: string;
  logo_url: string;
  loading: boolean;
  error: string | null;
};

const Inscription = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, refreshUser } = useAuth();
  const [structureId, setStructureId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [structure, setStructure] = useState<StructureData>({
    id: "",
    name: "",
    city: "",
    type: "",
    logo_url: "",
    loading: true,
    error: null,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  // Get structure_id from URL and fetch structure data
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("structure_id");

    if (!id) {
      setStructure(prev => ({
        ...prev,
        loading: false,
        error: "Identifiant de structure manquant. Veuillez utiliser un lien d'invitation valide.",
      }));
      return;
    }

    setStructureId(id);
    
    const fetchStructure = async () => {
      try {
        // Vérifier que la structure existe
        const structureExists = await StructureService.checkStructureExists(id);
        
        if (!structureExists) {
          setStructure(prev => ({
            ...prev,
            loading: false,
            error: "Structure non trouvée. Veuillez utiliser un lien d'invitation valide.",
          }));
          return;
        }
        
        // Vérifier que le quota d'utilisateurs n'est pas dépassé
        const isQuotaExceeded = await StructureService.isUserQuotaExceeded(id);
        
        if (isQuotaExceeded) {
          setStructure(prev => ({
            ...prev,
            loading: false,
            error: "Cette structure a atteint son nombre maximal d'utilisateurs. Veuillez contacter l'administrateur.",
          }));
          return;
        }

        // Récupérer les données de la structure
        const { data, error } = await supabase
          .from("structures")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Erreur lors de la récupération de la structure:", error);
          setStructure(prev => ({
            ...prev,
            loading: false,
            error: "Structure non trouvée. Veuillez utiliser un lien d'invitation valide.",
          }));
          return;
        }

        // Mettre à jour les données de la structure
        setStructure({
          id: data.id,
          name: data.name,
          city: data.city,
          type: data.type,
          logo_url: data.logo_url,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error("Erreur inattendue:", err);
        setStructure(prev => ({
          ...prev,
          loading: false,
          error: "Une erreur s'est produite lors de la récupération des informations de la structure.",
        }));
      }
    };

    fetchStructure();
  }, [location.search]);

  // Check if user is already logged in
  useEffect(() => {
    if (currentUser && !structure.loading) {
      toast({
        title: "Déjà connecté",
        description: "Vous êtes déjà connecté. Vous avez été redirigé vers le tableau de bord.",
      });
      navigate("/dashboard");
    }
  }, [currentUser, navigate, toast, structure.loading]);

  const onSubmit = async (data: FormValues) => {
    if (!structureId) {
      toast({
        title: "Erreur",
        description: "Identifiant de structure manquant",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            structure_id: structureId,
            role: "educateur"
          },
        },
      });

      if (error) {
        console.error("❌ Erreur inscription :", error.message);
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData?.user) {
        console.warn("❌ Aucun utilisateur créé !");
        toast({
          title: "Inscription échouée",
          description: "L'inscription a échoué. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Utilisateur inscrit :", authData.user);
      
      // Refresh the user data
      await refreshUser();

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous allez être redirigé vers le tableau de bord.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error 
          ? error.message 
          : "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (structure.loading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (structure.error) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              {structure.error}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={() => navigate("/")}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          {structure.logo_url && (
            <img 
              src={structure.logo_url} 
              alt={`Logo ${structure.name}`}
              className="h-20 mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Inscription à {structure.name}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {structure.city} · {structure.type}
          </p>
        </div>
        
        <Card className="border-opacity-50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-purple-800">Créer votre compte éducateur</CardTitle>
            </div>
            <CardDescription>
              Remplissez le formulaire ci-dessous pour rejoindre <span className="font-medium">{structure.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                          Prénom
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                          Nom
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mb-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Vous rejoignez {structure.name}</p>
                      <p className="text-xs">{structure.city} · {structure.type}</p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <AtSign className="h-3.5 w-3.5 text-gray-500" />
                        Email professionnel
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jean.dupont@exemple.fr" {...field} />
                      </FormControl>
                      <FormDescription>
                        Cet email sera utilisé pour vous connecter
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-gray-500" />
                        Mot de passe
                      </FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Au moins 8 caractères, 1 majuscule et 1 chiffre
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-gray-500" />
                        Confirmer le mot de passe
                      </FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border border-purple-200 bg-purple-50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          J'accepte les conditions d'utilisation et la politique de confidentialité
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Inscription en cours...</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      <span>Créer mon compte éducateur</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <div className="text-sm text-gray-600">
              Vous avez déjà un compte?{" "}
              <a href="/" className="text-purple-600 hover:underline">
                Se connecter
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Inscription;

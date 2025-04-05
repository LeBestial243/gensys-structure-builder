
import { useState, FormEvent, ChangeEvent } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Copy, Upload } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  type: z.enum(["MECS", "SISEIP", "ITEP", "Autre"], {
    required_error: "Veuillez sélectionner un type de structure",
  }),
  email: z.string().email("Adresse email invalide"),
  maxUsers: z.number().min(1, "Au moins 1 utilisateur requis").max(500),
});

type FormValues = z.infer<typeof formSchema>;

const CreateStructure = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [createdStructure, setCreatedStructure] = useState<{ id: string; name: string } | null>(null);
  const [inviteLink, setInviteLink] = useState<string>("");

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

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match(/image\/(png|svg\+xml)/)) {
        toast({
          title: "Format invalide",
          description: "Veuillez télécharger un fichier PNG ou SVG",
          variant: "destructive",
        });
        return;
      }
      
      // Set file and preview
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission handler
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
      // Generate a unique ID for the structure
      const structureId = uuidv4();
      
      // Upload logo to Supabase Storage
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${structureId}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('structures')
        .upload(filePath, logoFile);
        
      if (uploadError) {
        throw new Error(`Erreur d'upload: ${uploadError.message}`);
      }
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('structures')
        .getPublicUrl(filePath);
        
      const logoUrl = urlData.publicUrl;
      
      // Create structure in the database
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
        throw new Error(`Erreur d'insertion: ${insertError.message}`);
      }
      
      // Set created structure info
      setCreatedStructure({
        id: structureId,
        name: data.name,
      });
      
      // Generate invite link
      const link = `https://gensys.app/inscription?structure_id=${structureId}`;
      setInviteLink(link);
      
      toast({
        title: "Structure créée avec succès",
        description: "Lien d'inscription généré",
      });
    } catch (error) {
      console.error('Error creating structure:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Un problème est survenu lors de la création de la structure",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy invite link to clipboard
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
          <Card className="border-green-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <CardTitle>Structure créée avec succès</CardTitle>
              </div>
              <CardDescription>
                La structure {createdStructure.name} a été créée avec succès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-lavender-50 border-lavender-200 mb-4">
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
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                onClick={() => navigate("/dashboard")}
              >
                Retour au tableau de bord
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Informations de la structure</CardTitle>
              <CardDescription>
                Veuillez remplir les informations ci-dessous pour créer une nouvelle structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la structure</FormLabel>
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
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Lyon" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de référence</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Ex: contact@structure.fr" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Cet email sera utilisé pour les communications importantes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxUsers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre maximal d'utilisateurs</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            max="500"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel className="block mb-2">Logo de la structure</FormLabel>
                    <div className="flex items-center space-x-4">
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="w-full h-full object-contain p-2" 
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-2">
                            <Upload className="w-10 h-10 text-gray-400" />
                            <p className="text-xs text-gray-500 mt-1">SVG ou PNG</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".svg,.png" 
                          onChange={handleFileChange}
                        />
                      </label>
                      
                      <div className="text-sm text-gray-500">
                        <p>Formats acceptés: SVG, PNG</p>
                        <p>Fond transparent recommandé</p>
                        {logoFile && (
                          <p className="text-green-600 font-medium mt-1">
                            {logoFile.name} ({Math.round(logoFile.size / 1024)} Ko)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
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

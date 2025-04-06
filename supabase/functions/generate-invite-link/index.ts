// Edge Function pour générer un lien d'invitation pour une structure
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer un client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Vérifier le rôle de l'utilisateur
    const userRole = user.user_metadata.role

    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Insufficient permissions' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      )
    }

    // Récupérer le structure_id depuis le body de la requête
    const { structure_id } = await req.json()

    if (!structure_id) {
      return new Response(
        JSON.stringify({ error: 'Missing structure_id parameter' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Vérifier que la structure existe
    const { data: structure, error: structureError } = await supabaseClient
      .from('structures')
      .select('id, name')
      .eq('id', structure_id)
      .single()

    if (structureError || !structure) {
      return new Response(
        JSON.stringify({ error: 'Structure not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Vérifier que l'utilisateur admin a accès à cette structure
    if (userRole === 'admin') {
      const userStructureId = user.user_metadata.structure_id
      
      if (userStructureId !== structure_id) {
        return new Response(
          JSON.stringify({ error: 'Forbidden - You cannot generate invites for other structures' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        )
      }
    }

    // Générer le lien d'invitation
    const baseUrl = req.headers.get('Origin') || 'https://app.gensys.fr'
    const inviteLink = `${baseUrl}/inscription?structure_id=${structure_id}`

    // Retourner le lien d'invitation
    return new Response(
      JSON.stringify({ 
        invite_link: inviteLink,
        structure: {
          id: structure.id,
          name: structure.name
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
// Documentation API Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GenSys API - Documentation</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-purple-800">GenSys Structure API</h1>
      <p class="text-gray-600">Documentation des points d'accès API pour la gestion des structures éducatives</p>
    </header>

    <main>
      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Authentification</h2>
        <p class="mb-4">Toutes les requêtes API nécessitent un token JWT valide dans l'en-tête <code class="bg-gray-100 px-1 py-0.5 rounded">Authorization</code>.</p>
        <pre class="bg-gray-800 text-white p-4 rounded overflow-x-auto">
Authorization: Bearer [your-jwt-token]</pre>
      </div>

      <div class="space-y-8">
        <!-- Endpoint: Generate Invite Link -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">Générer un lien d'invitation</h3>
            <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">POST</span>
          </div>
          <p class="text-gray-600 my-2">Générer un lien d'invitation pour une structure spécifique</p>
          
          <h4 class="font-medium text-gray-700 mt-4">Endpoint</h4>
          <pre class="bg-gray-100 p-2 rounded">/generate-invite-link</pre>
          
          <h4 class="font-medium text-gray-700 mt-4">Body</h4>
          <pre class="bg-gray-800 text-white p-4 rounded overflow-x-auto">
{
  "structure_id": "uuid-de-la-structure"
}</pre>
          
          <h4 class="font-medium text-gray-700 mt-4">Réponse</h4>
          <pre class="bg-gray-800 text-white p-4 rounded overflow-x-auto">
{
  "invite_link": "https://app.gensys.fr/inscription?structure_id=uuid-de-la-structure",
  "structure": {
    "id": "uuid-de-la-structure",
    "name": "Nom de la structure"
  }
}</pre>
          
          <h4 class="font-medium text-gray-700 mt-4">Permissions</h4>
          <ul class="list-disc list-inside text-gray-600">
            <li>Rôle requis: 'admin' ou 'super_admin'</li>
            <li>Les admins peuvent uniquement générer des liens pour leur propre structure</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="mt-12 text-center text-gray-600 text-sm">
      <p>© 2025 GenSys - Système de Gestion pour Structures Éducatives</p>
    </footer>
  </div>
</body>
</html>`;

serve((_req) => {
  return new Response(html, {
    headers: {
      "content-type": "text/html",
    },
  });
});
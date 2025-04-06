<<<<<<< HEAD
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Assurer que l'élément root existe
const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
    console.log("Application rendue avec succès");
  } catch (error) {
    console.error("Erreur lors du rendu de l'application:", error);
    // Afficher l'erreur directement dans le DOM
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; border: 1px solid red;">
        <h2>Erreur React</h2>
        <p>${error?.message || 'Erreur inconnue'}</p>
        <pre>${error?.stack || ''}</pre>
      </div>
    `;
  }
} else {
  console.error("L'élément root n'existe pas dans le DOM!");
}
=======

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// This ensures the app will still render even if WebSocket connection fails
window.__WS_TOKEN__ = window.__WS_TOKEN__ || 'fallback-token';

createRoot(document.getElementById("root")!).render(<App />);
>>>>>>> 4cdcce7c25244790c554bde60d8c924ea1ebf32e

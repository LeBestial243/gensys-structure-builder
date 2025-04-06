
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// This ensures the app will still render even if WebSocket connection fails
window.__WS_TOKEN__ = window.__WS_TOKEN__ || 'fallback-token';

createRoot(document.getElementById("root")!).render(<App />);

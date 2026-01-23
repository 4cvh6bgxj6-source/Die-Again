
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (!container) {
  console.error("Errore fatale: Elemento #root non trovato nel DOM.");
} else {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Errore durante il mounting dell'app:", error);
    container.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Errore di Caricamento</h1>
      <p>L'applicazione non è riuscita ad avviarsi. Controlla la console del browser per i dettagli.</p>
    </div>`;
  }
}

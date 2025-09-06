import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.debug.tsx";

console.log('main.tsx is loading...');

const rootElement = document.getElementById("root");
console.log('Root element found:', rootElement);

if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: Arial;">ERROR: Root element not found in HTML</div>';
} else {
  try {
    console.log('Creating React root...');
    const root = createRoot(rootElement);
    
    console.log('Rendering App...');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial;">
        <h1>Rendering Error</h1>
        <p>Error: ${error.message}</p>
        <p>Check console for details</p>
      </div>
    `;
  }
}

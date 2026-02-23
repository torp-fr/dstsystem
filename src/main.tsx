import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Supabase runtime BEFORE React rendering
import { initializeSupabaseRuntime } from "./bootstrap/supabase.runtime";

// Top-level await: wait for SupabaseAdapter before rendering React
await initializeSupabaseRuntime().catch(error => {
  console.error('[MAIN] Supabase initialization failed:', error);
  // Continue anyway - some features may still work
});

console.log('[MAIN] React render starting...');
createRoot(document.getElementById("root")!).render(<App />);
console.log('[MAIN] React rendered ✓');

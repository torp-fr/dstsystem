import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Supabase adapter is initialized directly via ESM import
import { supabaseAdapter } from "./infra/supabase.adapter";

// Planning domain bootstrap (SYNCHRONOUS)
import { bootstrapPlanningDomain } from "./domain/planning.bootstrap";

console.log('[MAIN] Supabase adapter loaded ✓');

// Initialize planning domain BEFORE React render
await bootstrapPlanningDomain().catch(error => {
  console.error('[MAIN] Domain bootstrap failed:', error);
});

console.log('[MAIN] React render starting...');
createRoot(document.getElementById("root")!).render(<App />);
console.log('[MAIN] React rendered ✓');

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Supabase adapter is initialized directly via ESM import
// No bootstrap runtime needed — pure module initialization
import { supabaseAdapter } from "./infra/supabase.adapter";

console.log('[MAIN] Supabase adapter loaded ✓');
console.log('[MAIN] React render starting...');
createRoot(document.getElementById("root")!).render(<App />);
console.log('[MAIN] React rendered ✓');

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Supabase runtime BEFORE React rendering
import { initializeSupabaseRuntime } from "./bootstrap/supabase.runtime";
initializeSupabaseRuntime();

createRoot(document.getElementById("root")!).render(<App />);


  // @ts-ignore: Missing type declarations for react-dom/client
import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  // @ts-ignore: side-effect import for CSS module without type declarations
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  
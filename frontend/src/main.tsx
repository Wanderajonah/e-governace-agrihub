
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById("splash");
      if (el) el.classList.add("hidden");
    });
  });
  
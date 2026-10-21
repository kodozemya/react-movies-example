import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";

/*
  StrictMode — режим суворої перевірки. У розробці він навмисно виконує
  ефекти двічі, щоб виявити ті, які не вміють прибирати за собою.
  Якщо в консолі два запити замість одного — це не помилка, а перевірка:
  саме тому в useTmdb стоїть AbortController.
  У продакшн-збірці StrictMode нічого не подвоює.
*/
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);

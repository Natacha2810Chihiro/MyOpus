import { createContext, useContext, useState } from "react";

export const couleursClaires = {
  fond: "#ffffff",
  fondSecondaire: "#f7f6ff",
  fondTertiaire: "#cbc5f5",
  texte: "#0f0939",
  texteSous: "#5647bf",
  texteGris: "#8b85c1",
  carte: "#ffffff",
  bordure: "#ede9ff",
  accent: "#ffe594",
  accentTexte: "#0f0939",
  violet: "#5647bf",
  turquoise: "#47c8bc",
};

export const couleursSombres = {
  fond: "#0f0939",
  fondSecondaire: "#1a1456",
  fondTertiaire: "#241d6e",
  texte: "#ffffff",
  texteSous: "#cbc5f5",
  texteGris: "#8b85c1",
  carte: "#1a1456",
  bordure: "#2d2580",
  accent: "#f1bc14",
  accentTexte: "#0f0939",
  violet: "#cbc5f5",
  turquoise: "#47c8bc",
};

type Theme = typeof couleursClaires;

interface ThemeContextType {
  sombre: boolean;
  toggleTheme: () => void;
  couleurs: Theme;
}

const ThemeContext = createContext<ThemeContextType>({
  sombre: false,
  toggleTheme: () => {},
  couleurs: couleursClaires,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [sombre, setSombre] = useState(false);

  const toggleTheme = () => setSombre(!sombre);
  const couleurs = sombre ? couleursSombres : couleursClaires;

  return (
    <ThemeContext.Provider value={{ sombre, toggleTheme, couleurs }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
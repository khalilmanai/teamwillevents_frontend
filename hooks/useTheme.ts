import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "ecoplus" | "ecoplus-dark";

export function useTheme(initial?: Theme) {
  const [theme, setTheme] = useState<Theme>(initial || "light");

  // Apply theme classes to <body>
  useEffect(() => {
    const body = document.body;

    // Remove all previous theme classes
    body.classList.remove("light", "dark", "ecoplus", "ecoplus-dark");

    // Add the current theme class
    if (theme !== "light") {
      body.classList.add(theme);
    }
  }, [theme]);

  // Change theme function
  const changeTheme = (newTheme: Theme) => setTheme(newTheme);

  return { theme, setTheme: changeTheme };
}

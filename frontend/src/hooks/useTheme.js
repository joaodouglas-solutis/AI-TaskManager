import { useEffect, useState } from "react";

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("taskflow-theme") || "light";
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("taskflow-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light"
        );
    };

    return {
        theme,
        toggleTheme
    };
}
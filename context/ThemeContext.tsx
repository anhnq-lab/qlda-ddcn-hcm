import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type DataDensity = 'compact' | 'comfortable';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    density: DataDensity;
    setDensity: (density: DataDensity) => void;
    stickyHeader: boolean;
    setStickyHeader: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    setTheme: () => { },
    density: 'comfortable',
    setDensity: () => { },
    stickyHeader: false,
    setStickyHeader: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme');
        return (saved === 'dark' ? 'dark' : 'light') as Theme;
    });

    const [density, setDensityState] = useState<DataDensity>(() => {
        const saved = localStorage.getItem('data_density');
        return (saved === 'compact' ? 'compact' : 'comfortable') as DataDensity;
    });

    const [stickyHeader, setStickyHeaderState] = useState<boolean>(() => {
        const saved = localStorage.getItem('sticky_header');
        return saved === 'true'; // Default is false
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('data_density', density);
    }, [density]);

    useEffect(() => {
        localStorage.setItem('sticky_header', String(stickyHeader));
    }, [stickyHeader]);

    const setTheme = (newTheme: Theme) => setThemeState(newTheme);
    const setDensity = (newDensity: DataDensity) => setDensityState(newDensity);
    const setStickyHeader = (newVal: boolean) => setStickyHeaderState(newVal);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, density, setDensity, stickyHeader, setStickyHeader }}>
            {children}
        </ThemeContext.Provider>
    );
};


import { useEffect } from 'react';

// Light mode only - no dark mode support
export type Appearance = 'light';

const applyTheme = () => {
    // Always use light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

export function initializeTheme() {
    // Always apply light mode
    applyTheme();
}

export function useAppearance() {
    useEffect(() => {
        // Ensure light mode is always applied
        applyTheme();
    }, []);

    return { appearance: 'light' as const, updateAppearance: () => {} } as const;
}

// Theme configuration store

// Available themes - Premium fintech style with lime accent
export const THEMES = {
    estetica: {
        id: 'estetica',
        name: 'Estética',
        description: 'Verde azulado elegante',
        colors: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
        },
    },
    barberia: {
        id: 'barberia',
        name: 'Barbería Dorado',
        description: 'Dorado clásico masculino',
        colors: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#eab308',
            600: '#ca8a04',
            700: '#a16207',
            800: '#854d0e',
            900: '#713f12',
        },
    },
    clasico: {
        id: 'clasico',
        name: 'Barbería Clásico',
        description: 'Azul marino con cobre',
        colors: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
        },
    },
    oceano: {
        id: 'oceano',
        name: 'Océano',
        description: 'Azul profundo profesional',
        colors: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
        },
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        description: 'Verde lima fintech',
        colors: {
            50: '#f7fee7',
            100: '#ecfccb',
            200: '#d9f99d',
            300: '#bef264',
            400: '#a3e635',
            500: '#84cc16',
            600: '#65a30d',
            700: '#4d7c0f',
            800: '#3f6212',
            900: '#365314',
        },
    },
}

export const MODES = ['light', 'dark', 'system']

// Get current theme
export function getConfigTheme() {
    return localStorage.getItem('config_theme') || 'premium'
}

export function saveConfigTheme(theme) {
    localStorage.setItem('config_theme', theme)
    applyTheme(theme)
}

// Get current mode
export function getConfigMode() {
    return localStorage.getItem('config_mode') || 'dark'
}

export function saveConfigMode(mode) {
    localStorage.setItem('config_mode', mode)
    applyMode(mode)
}

// Apply theme colors - Force update CSS immediately
export function applyTheme(themeId) {
    const theme = THEMES[themeId] || THEMES.premium
    const root = document.documentElement

    // Apply each color as CSS variable
    Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--primary-${key}`, value)
    })

    // Force repaint
    root.style.display = 'none'
    root.offsetHeight // trigger reflow
    root.style.display = ''
}

// Apply dark/light mode
export function applyMode(mode) {
    const root = document.documentElement

    if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
    } else {
        root.classList.toggle('dark', mode === 'dark')
    }
}

// Initialize theme on app load
export function initializeTheme() {
    const theme = getConfigTheme()
    const mode = getConfigMode()

    applyTheme(theme)
    applyMode(mode)

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (getConfigMode() === 'system') {
            document.documentElement.classList.toggle('dark', e.matches)
        }
    })
}

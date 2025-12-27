import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react'
import { THEMES, MODES, getConfigTheme, saveConfigTheme, getConfigMode, saveConfigMode } from '../../data/themeStore'

function ThemeSettings() {
    const [currentTheme, setCurrentTheme] = useState(getConfigTheme())
    const [currentMode, setCurrentMode] = useState(getConfigMode())

    const handleThemeChange = (themeId) => {
        setCurrentTheme(themeId)
        saveConfigTheme(themeId)
    }

    const handleModeChange = (mode) => {
        setCurrentMode(mode)
        saveConfigMode(mode)
    }

    const modeIcons = {
        light: Sun,
        dark: Moon,
        system: Monitor,
    }

    const modeLabels = {
        light: 'Claro',
        dark: 'Oscuro',
        system: 'Sistema',
    }

    return (
        <div className="space-y-8">
            {/* Mode Selection */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Modo de Visualización</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {MODES.map((mode) => {
                        const Icon = modeIcons[mode]
                        const isActive = currentMode === mode

                        return (
                            <button
                                key={mode}
                                onClick={() => handleModeChange(mode)}
                                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${isActive
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                                    }`}
                            >
                                <div className={`w-16 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${mode === 'dark'
                                        ? 'bg-slate-800 text-white'
                                        : mode === 'light'
                                            ? 'bg-slate-100 text-slate-600'
                                            : 'bg-gradient-to-r from-slate-100 to-slate-800 text-white'
                                    }`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <p className={`text-sm font-medium ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {modeLabels[mode]}
                                </p>
                                {isActive && (
                                    <div className="flex items-center justify-center mt-2">
                                        <Check className="w-4 h-4 text-primary-500" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </section>

            {/* Theme Selection */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Tema de Colores</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {Object.values(THEMES).map((theme) => {
                        const isActive = currentTheme === theme.id

                        return (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeChange(theme.id)}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isActive
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                                    }`}
                            >
                                {/* Color Preview */}
                                <div className="flex gap-1 mb-3">
                                    {[theme.colors[400], theme.colors[500], theme.colors[600]].map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 rounded-lg shadow-sm"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={`font-medium ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-800 dark:text-white'}`}>
                                            {theme.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{theme.description}</p>
                                    </div>
                                    {isActive && <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}

export default ThemeSettings

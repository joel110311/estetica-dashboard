import { useState } from 'react'
import { Settings, Package, Server, Palette, ChevronRight, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ServicesCatalog from '../components/settings/ServicesCatalog'
import SystemConfig from '../components/settings/SystemConfig'
import ThemeSettings from '../components/settings/ThemeSettings'
import UserManagement from '../components/settings/UserManagement'

function SettingsPage() {
    const { hasPermission, getRoleName } = useAuth()
    const [activeSection, setActiveSection] = useState('theme')

    const canEditServices = hasPermission('canEditServices')
    const canEditSystem = hasPermission('canEditStaff') || hasPermission('canEditCurrency') || hasPermission('canEditWebhooks')
    const canManageUsers = hasPermission('canManageOperators') || hasPermission('canManageGerentes') || hasPermission('canManageAdmins')

    const sections = [
        {
            id: 'theme',
            label: 'Diseño',
            icon: Palette,
            description: 'Tema de colores y modo claro/oscuro',
            visible: true, // Everyone can access
            color: 'from-violet-500 to-purple-500',
        },
        {
            id: 'users',
            label: 'Usuarios y Roles',
            icon: Users,
            description: 'Gestionar usuarios y permisos',
            visible: canManageUsers || true, // Everyone can at least change their password
            color: 'from-blue-500 to-indigo-500',
        },
        {
            id: 'services',
            label: 'Catálogo de Servicios',
            icon: Package,
            description: 'Gestiona servicios, precios y asignaciones',
            visible: canEditServices,
            color: 'from-primary-400 to-primary-600',
        },
        {
            id: 'system',
            label: 'Configuración del Sistema',
            icon: Server,
            description: 'Staff, moneda y conexiones API',
            visible: canEditSystem,
            color: 'from-orange-500 to-red-500',
        },
    ].filter(s => s.visible)

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Settings className="w-6 h-6 text-primary-500" />
                    Configuración
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rol: {getRoleName()}</p>
            </div>

            {/* Section Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {(Array.isArray(sections) ? sections : []).map((section) => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id

                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isActive
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-800 dark:text-white'}`}>
                                        {section.label}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{section.description}</p>
                                </div>
                                <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500' : 'text-slate-300 dark:text-slate-600'}`} />
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 md:p-6">
                {activeSection === 'theme' && <ThemeSettings />}
                {activeSection === 'users' && <UserManagement />}
                {activeSection === 'services' && <ServicesCatalog />}
                {activeSection === 'system' && <SystemConfig />}
            </div>
        </div>
    )
}

export default SettingsPage

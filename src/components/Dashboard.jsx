import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, Calendar, Settings, Menu, Scissors } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import StatsPage from '../pages/StatsPage'
import AppointmentsPage from '../pages/AppointmentsPage'
import SettingsPage from '../pages/SettingsPage'
import pb from '../lib/pocketbase'

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
    const [businessName, setBusinessName] = useState('Administración')
    const { hasPermission } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    // Get current page from URL
    const getCurrentPage = () => {
        const path = location.pathname
        if (path.includes('appointments')) return 'appointments'
        if (path.includes('settings')) return 'settings'
        return 'stats'
    }

    const currentPage = getCurrentPage()

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024
            setIsMobile(mobile)
            if (!mobile) setSidebarOpen(false)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Load business name
    useEffect(() => {
        async function loadBusiness() {
            try {
                const config = await pb.collection('config').getFirstListItem('key="business"')
                if (config?.value?.name) {
                    setBusinessName(config.value.name)
                }
            } catch (err) {
                console.log('Could not load business name')
            }
        }
        loadBusiness()
    }, [])

    // Build nav items based on permissions
    const navItems = []

    // Stats only for users who can view dashboard
    if (hasPermission('canViewDashboard')) {
        navItems.push({ id: 'stats', label: 'Estadísticas', icon: BarChart3, path: '/' })
    }

    // Appointments for everyone who can create them
    if (hasPermission('canCreateAppointments')) {
        navItems.push({ id: 'appointments', label: 'Gestión de Citas', icon: Calendar, path: hasPermission('canViewDashboard') ? '/appointments' : '/' })
    }

    // Add settings if user has any config permission
    if (hasPermission('canEditServices') || hasPermission('canEditStaff') || hasPermission('canEditCurrency') || hasPermission('canManageOperators')) {
        navItems.push({ id: 'settings', label: 'Configuración', icon: Settings, path: '/settings' })
    }

    const handleNavigate = (path) => {
        navigate(path)
        if (isMobile) setSidebarOpen(false)
    }

    const sidebarWidth = sidebarCollapsed ? 72 : 256

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D10]">
            {/* Mobile Header */}
            {isMobile && (
                <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-[#0E1014] border-b border-slate-200 dark:border-[#1e2328] px-4 py-3 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1e2328] rounded-xl">
                        <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                            <Scissors className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-white">{businessName}</span>
                    </div>
                    <div className="w-10" />
                </header>
            )}

            {/* Sidebar Overlay */}
            {isMobile && sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`${isMobile
                ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                : 'fixed left-0 top-0 h-screen'
                }`}>
                <Sidebar
                    navItems={navItems}
                    currentPage={currentPage}
                    onNavigate={handleNavigate}
                    isMobile={isMobile}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Main Content */}
            <main
                className={`min-h-screen transition-all duration-300 ${isMobile ? 'pt-16' : ''}`}
                style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
            >
                <div className="p-4 md:p-6 lg:p-8">
                    {!isMobile && (
                        <header className="mb-6 lg:mb-8 select-none">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1">
                                {currentPage === 'stats' ? 'Panel de Estadísticas' :
                                    currentPage === 'appointments' ? 'Gestión de Citas' : 'Configuración'}
                            </h1>
                            <p className="text-sm md:text-base text-slate-500">
                                {currentPage === 'stats' ? 'Visualiza el rendimiento de tu negocio' :
                                    currentPage === 'appointments' ? 'Administra las citas de tus clientes' :
                                        'Personaliza tu sistema'}
                            </p>
                        </header>
                    )}

                    {isMobile && (
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            {currentPage === 'stats' ? 'Estadísticas' :
                                currentPage === 'appointments' ? 'Gestión de Citas' : 'Configuración'}
                        </h1>
                    )}

                    <div className="animate-fadeIn">
                        <Routes>
                            {hasPermission('canViewDashboard') ? (
                                <>
                                    <Route path="/" element={<StatsPage />} />
                                    <Route path="/appointments" element={<AppointmentsPage />} />
                                </>
                            ) : (
                                <>
                                    <Route path="/" element={<AppointmentsPage />} />
                                    <Route path="/appointments" element={<AppointmentsPage />} />
                                </>
                            )}
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard

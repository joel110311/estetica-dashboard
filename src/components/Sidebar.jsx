import { useState, useEffect } from 'react'
import { Scissors, X, LogOut, User, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import pb from '../lib/pocketbase'

function Sidebar({ navItems, currentPage, onNavigate, isMobile = false, onClose, isCollapsed, onToggleCollapse }) {
    const { user, logout, getRoleName } = useAuth()
    const navigate = useNavigate()
    const collapsed = isCollapsed && !isMobile
    const [businessName, setBusinessName] = useState({ line1: 'Administración', line2: '' })

    useEffect(() => {
        async function loadBusiness() {
            try {
                const config = await pb.collection('config').getFirstListItem('key="business"')
                if (config?.value?.name) {
                    // Split name for two lines if it has a space
                    const parts = config.value.name.split(' ')
                    if (parts.length > 2) {
                        const midpoint = Math.ceil(parts.length / 2)
                        setBusinessName({
                            line1: parts.slice(0, midpoint).join(' '),
                            line2: parts.slice(midpoint).join(' ')
                        })
                    } else if (parts.length === 2) {
                        setBusinessName({ line1: parts[0], line2: parts[1] })
                    } else {
                        setBusinessName({ line1: config.value.name, line2: config.value.typeName || '' })
                    }
                }
            } catch (err) {
                console.log('Could not load business name')
            }
        }
        loadBusiness()
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <aside className={`h-screen flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-64'
            } ${isMobile ? 'shadow-xl' : ''} bg-white dark:bg-[#0E1014] border-r border-slate-200 dark:border-[#1e2328]`}>

            {/* Header */}
            <div className={`p-4 border-b border-slate-200 dark:border-[#1e2328] ${collapsed ? 'px-3' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
                            <Scissors className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <h2 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{businessName.line1}</h2>
                                {businessName.line2 && (
                                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{businessName.line2}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {isMobile ? (
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1e2328] rounded-xl transition-colors">
                            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </button>
                    ) : (
                        <button
                            onClick={onToggleCollapse}
                            className={`p-1.5 hover:bg-slate-100 dark:hover:bg-[#1e2328] rounded-lg transition-colors ${collapsed ? 'mx-auto mt-2' : ''}`}
                        >
                            {collapsed ? (
                                <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            ) : (
                                <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Search (only when expanded) */}
            {!collapsed && (
                <div className="p-3 border-b border-slate-200 dark:border-[#1e2328]">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-[#14171C] rounded-lg border border-slate-200 dark:border-[#2A2E35]">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
                {!collapsed && (
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
                        Menú
                    </p>
                )}
                <ul className="space-y-1">
                    {(Array.isArray(navItems) ? navItems : []).map((item) => {
                        const Icon = item.icon
                        const isActive = currentPage === item.id

                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onNavigate(item.path)}
                                    title={collapsed ? item.label : ''}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${collapsed ? 'justify-center' : ''
                                        } ${isActive
                                            ? 'bg-primary-50 dark:bg-[#14171C] text-primary-700 dark:text-primary-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#14171C] hover:text-slate-800 dark:hover:text-white'
                                        }`}
                                >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive
                                        ? 'bg-primary-500 dark:bg-primary-500/20 text-white dark:text-primary-400'
                                        : 'bg-slate-100 dark:bg-transparent text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    {!collapsed && (
                                        <>
                                            <span className={`font-medium text-sm ${isActive ? 'text-primary-700 dark:text-primary-400' : ''}`}>
                                                {item.label}
                                            </span>
                                            {isActive && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400" />
                                            )}
                                        </>
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* User Info & Logout */}
            <div className={`p-3 border-t border-slate-200 dark:border-[#1e2328] space-y-2 ${collapsed ? 'px-2' : ''}`}>
                {/* User Card */}
                {!collapsed && (
                    <div className="flex items-center gap-3 px-3 py-2 bg-slate-100 dark:bg-[#14171C] rounded-xl">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500">{getRoleName()}</p>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    title={collapsed ? 'Cerrar Sesión' : ''}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ${collapsed ? 'justify-center' : ''
                        }`}
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center">
                        <LogOut className="w-5 h-5" />
                    </div>
                    {!collapsed && <span className="font-medium text-sm">Cerrar Sesión</span>}
                </button>

                {/* Copyright */}
                {!collapsed && (
                    <div className="text-center pt-2">
                        <p className="text-xs text-slate-400 dark:text-slate-600">© 2026 Estética Integral</p>
                    </div>
                )}
            </div>
        </aside>
    )
}

export default Sidebar

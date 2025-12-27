import { useState, useEffect } from 'react'
import { Users, Globe, Link, Plus, Trash2, Save, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import {
    getConfigStaff, saveConfigStaff,
    getConfigCurrency, saveConfigCurrency,
    getConfigWebhooks, saveConfigWebhooks,
    clearConfigCache
} from '../../data/configStore'

const CURRENCIES = [
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
]

function SystemConfig() {
    const { hasPermission } = useAuth()
    const [staff, setStaff] = useState([])
    const [newStaffName, setNewStaffName] = useState('')
    const [currency, setCurrency] = useState('ARS')
    const [webhooks, setWebhooks] = useState({
        dashboard: '',
        calendar: '',
        delete: '',
    })

    useEffect(() => {
        async function loadData() {
            const [staffData, currencyData, webhooksData] = await Promise.all([
                getConfigStaff(),
                getConfigCurrency(),
                getConfigWebhooks()
            ])
            setStaff(staffData)
            setCurrency(currencyData)
            setWebhooks(webhooksData)
        }
        loadData()
    }, [])

    // Staff Management
    const handleAddStaff = () => {
        if (!newStaffName.trim()) {
            toast.error('Ingresa un nombre')
            return
        }
        if (staff.includes(newStaffName.trim())) {
            toast.error('Este nombre ya existe')
            return
        }
        setStaff([...staff, newStaffName.trim()])
        setNewStaffName('')
        toast.success('Especialista agregado')
    }

    const handleRemoveStaff = (name) => {
        if (confirm(`¿Eliminar a ${name}?`)) {
            setStaff(staff.filter(s => s !== name))
            toast.success('Especialista eliminado')
        }
    }

    const handleSaveStaff = async () => {
        const success = await saveConfigStaff(staff)
        if (success) {
            clearConfigCache()
            toast.success('Staff guardado en Supabase')
        } else {
            toast.error('Error al guardar')
        }
    }

    // Currency
    const handleSaveCurrency = async () => {
        const success = await saveConfigCurrency(currency)
        if (success) {
            clearConfigCache()
            toast.success('Moneda actualizada')
        } else {
            toast.error('Error al guardar')
        }
    }

    // Webhooks
    const handleSaveWebhooks = async () => {
        const success = await saveConfigWebhooks(webhooks)
        if (success) {
            clearConfigCache()
            toast.success('Webhooks guardados')
        } else {
            toast.error('Error al guardar')
        }
    }

    return (
        <div className="space-y-8">
            {/* Staff Section */}
            {hasPermission('canEditStaff') && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Gestión de Staff</h3>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                        {/* Add Staff */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newStaffName}
                                onChange={(e) => setNewStaffName(e.target.value)}
                                placeholder="Nombre del especialista"
                                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddStaff()}
                            />
                            <button
                                onClick={handleAddStaff}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Agregar
                            </button>
                        </div>

                        {/* Staff List */}
                        <div className="space-y-2">
                            {staff.map((person, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{person}</span>
                                    <button
                                        onClick={() => handleRemoveStaff(person)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {staff.length === 0 && (
                                <p className="text-center text-slate-400 py-4">No hay especialistas</p>
                            )}
                        </div>

                        <button
                            onClick={handleSaveStaff}
                            className="mt-4 w-full py-2 bg-slate-800 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Guardar Staff
                        </button>
                    </div>
                </section>
            )}

            {/* Currency Section */}
            {hasPermission('canEditCurrency') && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Moneda del Sistema</h3>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                            {CURRENCIES.map((cur) => (
                                <button
                                    key={cur.code}
                                    onClick={() => setCurrency(cur.code)}
                                    className={`p-3 rounded-lg border-2 text-center transition-all ${currency === cur.code
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300'
                                        }`}
                                >
                                    <span className={`text-lg font-bold ${currency === cur.code ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{cur.code}</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{cur.name}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSaveCurrency}
                            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Aplicar Moneda
                        </button>

                        <p className="text-xs text-slate-400 mt-2 text-center">
                            Solo cambia el símbolo visible, no convierte precios existentes.
                        </p>
                    </div>
                </section>
            )}

            {/* Webhooks Section */}
            {hasPermission('canEditWebhooks') && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Link className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Conexiones API (Webhooks)</h3>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Webhook - Dashboard (Estadísticas)
                            </label>
                            <input
                                type="url"
                                value={webhooks.dashboard}
                                onChange={(e) => setWebhooks({ ...webhooks, dashboard: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Webhook - Agendar Cita
                            </label>
                            <input
                                type="url"
                                value={webhooks.calendar}
                                onChange={(e) => setWebhooks({ ...webhooks, calendar: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Webhook - Eliminar Cita
                            </label>
                            <input
                                type="url"
                                value={webhooks.delete}
                                onChange={(e) => setWebhooks({ ...webhooks, delete: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <button
                            onClick={handleSaveWebhooks}
                            className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Guardar Webhooks
                        </button>
                    </div>
                </section>
            )}
        </div>
    )
}

export default SystemConfig

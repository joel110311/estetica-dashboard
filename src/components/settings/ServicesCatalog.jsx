import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, DollarSign, Clock, Users, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { getConfigServices, saveConfigServices, getConfigStaff, clearConfigCache } from '../../data/configStore'

function ServicesCatalog() {
    const [services, setServices] = useState([])
    const [staff, setStaff] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newService, setNewService] = useState({ nombre: '', precio: '', duracion: 60, categoria: 'Facial', staff: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const [servicesData, staffData] = await Promise.all([
                getConfigServices(),
                getConfigStaff()
            ])
            setServices(servicesData)
            setStaff(staffData)
            setLoading(false)
        }
        loadData()
    }, [])

    const categories = ['Facial', 'Corporal', 'Masaje', 'Regenerativo', 'Otro']

    const handleSave = async () => {
        const success = await saveConfigServices(services)
        if (success) {
            clearConfigCache()
            toast.success('Cambios guardados en Supabase')
        } else {
            toast.error('Error al guardar')
        }
    }

    const handleAddService = () => {
        if (!newService.nombre || !newService.precio) {
            toast.error('Nombre y precio son requeridos')
            return
        }

        const service = {
            id: Date.now(),
            nombre: newService.nombre,
            precio: parseFloat(newService.precio),
            duracion: parseInt(newService.duracion) || 60,
            categoria: newService.categoria,
            staff: newService.staff,
        }

        setServices([...services, service])
        setNewService({ nombre: '', precio: '', duracion: 60, categoria: 'Facial', staff: [] })
        setShowAddForm(false)
        toast.success('Servicio agregado')
    }

    const handleDeleteService = (id) => {
        if (confirm('¿Eliminar este servicio?')) {
            setServices(services.filter(s => s.id !== id))
            toast.success('Servicio eliminado')
        }
    }

    const handleEditService = (id, field, value) => {
        setServices(services.map(s =>
            s.id === id ? { ...s, [field]: field === 'precio' ? parseFloat(value) : value } : s
        ))
    }

    const toggleStaffAssignment = (serviceId, staffName) => {
        setServices(services.map(s => {
            if (s.id === serviceId) {
                const currentStaff = s.staff || []
                const newStaff = currentStaff.includes(staffName)
                    ? currentStaff.filter(n => n !== staffName)
                    : [...currentStaff, staffName]
                return { ...s, staff: newStaff }
            }
            return s
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Catálogo de Servicios</h2>
                    <p className="text-sm text-slate-500">{services.length} servicios registrados</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Guardar
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                    <h3 className="font-medium text-primary-800 mb-3">Nuevo Servicio</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        <input
                            type="text"
                            placeholder="Nombre del servicio"
                            value={newService.nombre}
                            onChange={(e) => setNewService({ ...newService, nombre: e.target.value })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <input
                            type="number"
                            placeholder="Precio"
                            value={newService.precio}
                            onChange={(e) => setNewService({ ...newService, precio: e.target.value })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <input
                            type="number"
                            placeholder="Duración (min)"
                            value={newService.duracion}
                            onChange={(e) => setNewService({ ...newService, duracion: e.target.value })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <select
                            value={newService.categoria}
                            onChange={(e) => setNewService({ ...newService, categoria: e.target.value })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddService}
                                className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-1"
                            >
                                <Check className="w-4 h-4" /> Agregar
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Services List */}
            <div className="space-y-2">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600"
                    >
                        <div className="flex flex-wrap items-start gap-3">
                            {/* Name & Category */}
                            <div className="flex-1 min-w-[200px]">
                                {editingId === service.id ? (
                                    <input
                                        type="text"
                                        value={service.nombre}
                                        onChange={(e) => handleEditService(service.id, 'nombre', e.target.value)}
                                        className="w-full px-2 py-1 border border-primary-300 rounded text-sm"
                                    />
                                ) : (
                                    <p className="font-medium text-slate-800 dark:text-white">{service.nombre}</p>
                                )}
                                <span className="text-xs text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50 px-2 py-0.5 rounded-full">
                                    {service.categoria}
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-slate-400" />
                                {editingId === service.id ? (
                                    <input
                                        type="number"
                                        value={service.precio}
                                        onChange={(e) => handleEditService(service.id, 'precio', e.target.value)}
                                        className="w-24 px-2 py-1 border border-primary-300 rounded text-sm"
                                    />
                                ) : (
                                    <span className="font-bold text-slate-800">${service.precio?.toLocaleString()}</span>
                                )}
                            </div>

                            {/* Duration */}
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                <Clock className="w-4 h-4" />
                                {editingId === service.id ? (
                                    <input
                                        type="number"
                                        value={service.duracion || 60}
                                        onChange={(e) => handleEditService(service.id, 'duracion', parseInt(e.target.value) || 60)}
                                        className="w-16 px-2 py-1 border border-primary-300 rounded text-sm"
                                    />
                                ) : (
                                    <span>{service.duracion || 60}</span>
                                )}
                                <span>min</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setEditingId(editingId === service.id ? null : service.id)}
                                    className={`p-2 rounded-lg transition-colors ${editingId === service.id ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                >
                                    {editingId === service.id ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleDeleteService(service.id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Staff Assignment */}
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Asignar a:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {staff.map((person) => (
                                    <button
                                        key={person}
                                        onClick={() => toggleStaffAssignment(service.id, person)}
                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${(service.staff || []).includes(person)
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'
                                            }`}
                                    >
                                        {person}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {services.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    No hay servicios. Agrega uno nuevo.
                </div>
            )}
        </div>
    )
}

export default ServicesCatalog

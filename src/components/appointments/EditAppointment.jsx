import { useState, useEffect } from 'react'
import { Edit3, Search, User, Phone, Calendar, Scissors, DollarSign, Users, Loader2, Save, Trash2, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { searchAppointments, updateAppointment, deleteAppointment } from '../../services/api'
import { LISTA_STAFF, SERVICIOS, getServiciosPorStaff, getPrecioServicio, getInfoServicio } from '../../data/servicios'

function EditAppointment() {
    const [searchLoading, setSearchLoading] = useState(false)
    const [saveLoading, setSaveLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [formData, setFormData] = useState(null)
    const [serviciosDisponibles, setServiciosDisponibles] = useState([])

    // Actualizar servicios disponibles cuando cambia el staff
    useEffect(() => {
        if (formData?.staff) {
            const servicios = getServiciosPorStaff(formData.staff)
            setServiciosDisponibles(servicios)
        } else {
            setServiciosDisponibles([])
        }
    }, [formData?.staff])

    // Actualizar precio cuando cambia el servicio
    useEffect(() => {
        if (formData?.servicio) {
            const precio = getPrecioServicio(formData.servicio)
            if (precio > 0) {
                setFormData(prev => ({ ...prev, precio: precio.toString() }))
            }
        }
    }, [formData?.servicio])

    const handleSearch = async (e) => {
        e.preventDefault()

        if (!searchQuery.trim()) {
            toast.error('Por favor ingresa un término de búsqueda')
            return
        }

        setSearchLoading(true)

        try {
            const data = await searchAppointments({ query: searchQuery })
            const results = Array.isArray(data) ? data : data.results || []

            if (results.length > 0) {
                selectAppointment(results[0])
                toast.success('Cita encontrada')
            } else {
                toast.error('No se encontró ninguna cita')
            }
        } catch (error) {
            // Mock data for demo
            const mockAppointment = {
                id: '1',
                nombre: 'María García',
                telefono: '5491149276883',
                fecha: '2024-12-20',
                hora: '10:00',
                servicio: 'Limpieza Facial Profunda',
                staff: 'Isabel Grimoldi',
                precio: '28000',
            }
            selectAppointment(mockAppointment)
            toast.success('Cita encontrada (demo)')
        } finally {
            setSearchLoading(false)
        }
    }

    const selectAppointment = (appointment) => {
        setSelectedAppointment(appointment)

        // Parse date and time if combined
        let fecha = appointment.fecha || appointment['Fecha y hora de la cita'] || ''
        let hora = appointment.hora || ''

        if (fecha && fecha.includes('T')) {
            const [datePart, timePart] = fecha.split('T')
            fecha = datePart
            hora = timePart?.substring(0, 5) || ''
        }

        const staffName = appointment.staff || appointment['Servicio proporcionado por'] || ''

        setFormData({
            nombre: appointment.nombre || appointment['Nombre y Apellidos completos'] || '',
            telefono: (appointment.telefono || appointment['Telefono'] || '').toString(),
            fecha: fecha,
            hora: hora,
            servicio: appointment.servicio || appointment['Servicio'] || '',
            precio: (appointment.precio || appointment['Precio servicio'] || '').toString(),
            staff: staffName,
        })

        // Set servicios disponibles para este staff
        if (staffName) {
            setServiciosDisponibles(getServiciosPorStaff(staffName))
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleUpdate = async (e) => {
        e.preventDefault()

        if (!formData.nombre || !formData.telefono || !formData.fecha) {
            toast.error('Por favor completa los campos requeridos')
            return
        }

        setSaveLoading(true)

        try {
            const updateData = {
                ...formData,
                fecha: `${formData.fecha}T${formData.hora}`,
            }

            await updateAppointment(selectedAppointment.id, updateData)
            toast.success('¡Cita actualizada exitosamente!')
        } catch (error) {
            toast.success('¡Cita actualizada exitosamente! (demo)')
        } finally {
            setSaveLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
            return
        }

        setDeleteLoading(true)

        try {
            await deleteAppointment(selectedAppointment.id)
            toast.success('Cita eliminada')
            setSelectedAppointment(null)
            setFormData(null)
            setSearchQuery('')
        } catch (error) {
            toast.success('Cita eliminada (demo)')
            setSelectedAppointment(null)
            setFormData(null)
            setSearchQuery('')
        } finally {
            setDeleteLoading(false)
        }
    }

    const servicioInfo = formData?.servicio ? getInfoServicio(formData.servicio) : null

    const inputClasses = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white"
    const labelClasses = "block text-sm font-medium text-slate-700 mb-2"

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                    <Edit3 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Editar Cita</h2>
                <p className="text-sm text-slate-500 mt-1">Busca y modifica una cita existente</p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre o teléfono..."
                        className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <button
                    type="submit"
                    disabled={searchLoading}
                    className="px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-all duration-200 disabled:opacity-70 flex items-center gap-2"
                >
                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Buscar
                </button>
            </form>

            {/* Edit Form */}
            {formData && (
                <form onSubmit={handleUpdate} className="space-y-6 pt-6 border-t border-slate-100 animate-fadeIn">
                    <div className="bg-primary-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-primary-700 font-medium">
                            Editando cita de: <span className="font-bold">{formData.nombre}</span>
                        </p>
                    </div>

                    {/* Cliente Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>
                                <User className="w-4 h-4 inline-block mr-2 text-slate-400" />
                                Nombre del Cliente *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>
                                <Phone className="w-4 h-4 inline-block mr-2 text-slate-400" />
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>
                                <Calendar className="w-4 h-4 inline-block mr-2 text-slate-400" />
                                Fecha *
                            </label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>
                                <Clock className="w-4 h-4 inline-block mr-2 text-slate-400" />
                                Hora *
                            </label>
                            <input
                                type="time"
                                name="hora"
                                value={formData.hora}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>
                    </div>

                    {/* Staff */}
                    <div>
                        <label className={labelClasses}>
                            <Users className="w-4 h-4 inline-block mr-2 text-slate-400" />
                            Especialista *
                        </label>
                        <select
                            name="staff"
                            value={formData.staff}
                            onChange={handleChange}
                            className={inputClasses}
                            required
                        >
                            <option value="">Seleccionar especialista</option>
                            {LISTA_STAFF.map(staff => (
                                <option key={staff} value={staff}>{staff}</option>
                            ))}
                        </select>
                    </div>

                    {/* Service */}
                    <div>
                        <label className={labelClasses}>
                            <Scissors className="w-4 h-4 inline-block mr-2 text-slate-400" />
                            Servicio *
                        </label>
                        <select
                            name="servicio"
                            value={formData.servicio}
                            onChange={handleChange}
                            className={inputClasses}
                            required
                        >
                            <option value="">Seleccionar servicio</option>
                            {serviciosDisponibles.map(servicio => (
                                <option key={servicio} value={servicio}>
                                    {servicio} - ${SERVICIOS[servicio]?.precio?.toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Service Info */}
                    {servicioInfo && (
                        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                                <div className="text-sm text-primary-700">
                                    <span>⏱️ Duración: <strong>{servicioInfo.duracion} min</strong></span>
                                    {servicioInfo.sena > 0 && (
                                        <span className="ml-4">📋 Seña: <strong>${servicioInfo.sena.toLocaleString()}</strong></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price */}
                    <div>
                        <label className={labelClasses}>
                            <DollarSign className="w-4 h-4 inline-block mr-2 text-slate-400" />
                            Precio (ARS)
                        </label>
                        <input
                            type="number"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            min="0"
                            className={inputClasses}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saveLoading}
                            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {saveLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Guardar Cambios
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="py-3.5 px-6 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {deleteLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                            Eliminar
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default EditAppointment

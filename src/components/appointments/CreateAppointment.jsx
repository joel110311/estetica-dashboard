import { useState, useEffect } from 'react'
import { CalendarPlus, User, Phone, Calendar, Scissors, DollarSign, Users, Loader2, Clock, AlertCircle, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { createAppointment } from '../../services/api'
import { getConfigServices, getConfigStaff, getServicesForStaff, getCurrencySymbol, calculateSena } from '../../data/configStore'

function CreateAppointment() {
    const [loading, setLoading] = useState(false)
    const [serviciosDisponibles, setServiciosDisponibles] = useState([])
    const [staffList, setStaffList] = useState([])
    const [allServices, setAllServices] = useState([])
    const { code: currencyCode, symbol: currencySymbol } = getCurrencySymbol()

    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        fecha: '',
        hora: '',
        servicio: '',
        precio: '',
        staff: '',
    })

    // Load staff and services on mount
    useEffect(() => {
        async function loadConfig() {
            const [staff, services] = await Promise.all([
                getConfigStaff(),
                getConfigServices()
            ])
            setStaffList(Array.isArray(staff) ? staff : [])
            setAllServices(Array.isArray(services) ? services : [])
        }
        loadConfig()
    }, [])

    // Update available services when staff changes
    useEffect(() => {
        if (formData.staff) {
            const services = getServicesForStaff(formData.staff)
            setServiciosDisponibles(services)
            // Clear service if not available for this staff
            if (formData.servicio) {
                const stillAvailable = services.find(s => s.nombre === formData.servicio)
                if (!stillAvailable) {
                    setFormData(prev => ({ ...prev, servicio: '', precio: '' }))
                }
            }
        } else {
            setServiciosDisponibles([])
        }
    }, [formData.staff, allServices])

    // Suggest price when service changes (but don't lock it)
    useEffect(() => {
        if (formData.servicio && !formData.precio) {
            const service = serviciosDisponibles.find(s => s.nombre === formData.servicio)
            if (service) {
                setFormData(prev => ({ ...prev, precio: service.precio.toString() }))
            }
        }
    }, [formData.servicio])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleServiceChange = (e) => {
        const serviceName = e.target.value
        const service = serviciosDisponibles.find(s => s.nombre === serviceName)
        setFormData(prev => ({
            ...prev,
            servicio: serviceName,
            precio: service ? service.precio.toString() : prev.precio
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation - now includes price
        if (!formData.nombre || !formData.telefono || !formData.fecha || !formData.hora || !formData.servicio || !formData.staff || !formData.precio) {
            toast.error('Por favor completa todos los campos requeridos')
            return
        }

        setLoading(true)

        try {
            const appointmentData = {
                nombre: formData.nombre,
                telefono: formData.telefono,
                fecha: `${formData.fecha}T${formData.hora}`,
                servicio: formData.servicio,
                precio: formData.precio,
                staff: formData.staff,
            }

            await createAppointment(appointmentData)
            toast.success('¡Cita agendada exitosamente!')

            // Reset form
            setFormData({
                nombre: '',
                telefono: '',
                fecha: '',
                hora: '',
                servicio: '',
                precio: '',
                staff: '',
            })
        } catch (error) {
            toast.error('Error al agendar la cita')
        } finally {
            setLoading(false)
        }
    }

    const selectedService = serviciosDisponibles.find(s => s.nombre === formData.servicio)
    const senaCalculada = formData.precio ? calculateSena(parseFloat(formData.precio)) : 0

    // Check if all required fields are filled
    const isFormComplete = formData.nombre && formData.telefono && formData.fecha && formData.hora && formData.servicio && formData.staff && formData.precio

    const inputClasses = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white"
    const labelClasses = "block text-sm font-medium text-slate-700 mb-2"

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                    <CalendarPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Nueva Cita</h2>
                <p className="text-sm text-slate-500 mt-1">Completa los datos para agendar</p>
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
                        placeholder="Nombre completo"
                        className={inputClasses}
                        autoComplete="off"
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
                        placeholder="Ej: 5491149276883"
                        className={inputClasses}
                        autoComplete="off"
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

            {/* Staff first */}
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
                    {staffList.map(staff => (
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
                    onChange={handleServiceChange}
                    className={inputClasses}
                    required
                    disabled={!formData.staff}
                >
                    <option value="">
                        {formData.staff ? 'Seleccionar servicio' : 'Primero selecciona un especialista'}
                    </option>
                    {serviciosDisponibles.map(servicio => (
                        <option key={servicio.id || servicio.nombre} value={servicio.nombre}>
                            {servicio.nombre} - {currencySymbol}{servicio.precio?.toLocaleString()}
                        </option>
                    ))}
                </select>
            </div>

            {/* Price - EDITABLE and REQUIRED */}
            <div>
                <label className={labelClasses}>
                    <DollarSign className="w-4 h-4 inline-block mr-2 text-slate-400" />
                    Precio ({currencyCode}) *
                </label>
                <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    placeholder="Ingresa el precio"
                    min="0"
                    className={inputClasses}
                    required
                />
            </div>

            {/* Auto-calculated Seña */}
            {formData.precio && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-sm text-amber-800">
                                <strong>Seña a cobrar (35%):</strong> {currencySymbol}{senaCalculada.toLocaleString()}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                                Se calcula automáticamente sobre el precio ingresado
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Info (duration) */}
            {selectedService && (
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-primary-800">{formData.servicio}</p>
                            <p className="text-primary-700 mt-1">
                                ⏱️ Duración estimada: <strong>{selectedService.duracion || 60} min</strong>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !isFormComplete}
                className={`w-full py-3.5 px-6 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isFormComplete && !loading
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Agendando...
                    </>
                ) : (
                    <>
                        <CalendarPlus className="w-5 h-5" />
                        {isFormComplete ? 'Agendar Cita' : 'Completa todos los campos'}
                    </>
                )}
            </button>
        </form>
    )
}

export default CreateAppointment

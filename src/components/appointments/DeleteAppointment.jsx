import { useState } from 'react'
import { Trash2, Search, User, Phone, Calendar, Scissors, Users, Loader2, AlertTriangle, Check } from 'lucide-react'
import toast from 'react-hot-toast'

// Webhook para eliminar citas
const DELETE_API = "https://n8nluxentia.luxentia.cloud/webhook/elimina";

function DeleteAppointment() {
    const [searchLoading, setSearchLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState([])
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()

        setSearchLoading(true)
        setResults([])
        setSelectedAppointment(null)
        setHasSearched(true)

        try {
            // Buscar citas - el webhook devuelve todas las filas
            const response = await fetch(DELETE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'search',
                    query: searchQuery,
                }),
            })

            const data = await response.json()
            console.log('Search response:', data)

            // Normalize to array
            let appointments = Array.isArray(data) ? data : [data]

            // Map Google Sheets column names to our format
            appointments = appointments.map((apt, index) => ({
                id: apt.row_number || apt.id || index + 2, // row_number from sheets (starts at 2)
                nombre: apt['Nombre y Apellidos completos'] || apt.nombre || 'Sin nombre',
                telefono: (apt['Telefono'] || apt.telefono || '').toString(),
                fecha: apt['Fecha y hora de la cita'] || apt.fecha || '',
                servicio: apt['Servicio'] || apt.servicio || '',
                staff: apt['Servicio proporcionado por'] || apt.staff || '',
                precio: parseFloat(apt['Precio servicio'] || apt.precio || 0),
            })).filter(apt => apt.nombre !== 'Sin nombre') // Filter out empty rows

            // Filter: only show appointments from today onwards
            const today = new Date()
            today.setHours(0, 0, 0, 0) // Start of today

            appointments = appointments.filter(apt => {
                if (!apt.fecha) return false

                // Parse date (handle DD/MM/YYYY format)
                let aptDate = null
                const ddmmMatch = apt.fecha.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
                if (ddmmMatch) {
                    const [, day, month, year] = ddmmMatch
                    aptDate = new Date(year, month - 1, day)
                } else {
                    aptDate = new Date(apt.fecha)
                }

                return aptDate && !isNaN(aptDate.getTime()) && aptDate >= today
            })

            // Filter by query if provided
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                appointments = appointments.filter(apt =>
                    apt.nombre.toLowerCase().includes(query) ||
                    apt.telefono.includes(query)
                )
            }

            setResults(appointments)

            if (appointments.length > 0) {
                toast.success(`${appointments.length} cita(s) encontrada(s)`)
            } else {
                toast.error('No se encontraron citas')
            }
        } catch (error) {
            console.error('Search error:', error)
            toast.error('Error al buscar. Verifica la conexión.')
        } finally {
            setSearchLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedAppointment) {
            toast.error('Selecciona una cita primero')
            return
        }

        if (!confirm(`¿Eliminar la cita de ${selectedAppointment.nombre}? Esta acción no se puede deshacer.`)) {
            return
        }

        setDeleteLoading(true)

        try {
            const response = await fetch(DELETE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    row_number: selectedAppointment.id,
                    nombre: selectedAppointment.nombre,
                    telefono: selectedAppointment.telefono,
                }),
            })

            const data = await response.json()
            console.log('Delete response:', data)

            toast.success('¡Cita eliminada exitosamente!')

            // Remove from results
            setResults(prev => prev.filter(apt => apt.id !== selectedAppointment.id))
            setSelectedAppointment(null)
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Error al eliminar. Verifica el webhook.')
        } finally {
            setDeleteLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha'
        try {
            // Handle DD/MM/YYYY format
            const ddmmyyyyMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
            if (ddmmyyyyMatch) {
                const [, day, month, year] = ddmmyyyyMatch
                const date = new Date(year, month - 1, day)
                return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
            }
            const date = new Date(dateString)
            return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
        } catch {
            return dateString
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
                    <Trash2 className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-800">Eliminar Cita</h2>
                <p className="text-sm text-slate-500 mt-1">Busca, selecciona y elimina</p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre o teléfono (vacío = ver todas)"
                        className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <button
                    type="submit"
                    disabled={searchLoading}
                    className="px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Buscar
                </button>
            </form>

            {/* Results List */}
            {hasSearched && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-500">
                        {results.length} cita(s) encontrada(s). Selecciona una para eliminar:
                    </p>

                    {results.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-xl">
                            <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500">No se encontraron citas</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {results.map((apt) => (
                                <div
                                    key={apt.id}
                                    onClick={() => setSelectedAppointment(apt)}
                                    className={`p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedAppointment?.id === apt.id
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Selection indicator */}
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAppointment?.id === apt.id
                                            ? 'border-red-500 bg-red-500'
                                            : 'border-slate-300'
                                            }`}>
                                            {selectedAppointment?.id === apt.id && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-800 text-sm truncate flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                {apt.nombre}
                                            </p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {apt.telefono}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(apt.fecha)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-slate-700 text-sm">${apt.precio?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Delete Section */}
            {selectedAppointment && (
                <div className="animate-fadeIn space-y-4 pt-4 border-t border-slate-200">
                    {/* Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-800 font-medium text-sm">¿Eliminar cita de {selectedAppointment.nombre}?</p>
                            <p className="text-red-600 text-xs">{selectedAppointment.servicio} - {formatDate(selectedAppointment.fecha)}</p>
                        </div>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="w-full py-3 md:py-3.5 px-6 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {deleteLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-5 h-5" />
                                Eliminar Cita
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

export default DeleteAppointment

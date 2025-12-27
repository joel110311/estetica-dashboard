import { useState } from 'react'
import { Search, Calendar, User, Phone, Scissors, Users, X, Loader2, DollarSign, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { searchAppointments } from '../../services/api'

function SearchAppointments() {
    const [loading, setLoading] = useState(false)
    const [query, setQuery] = useState('')
    const [searchType, setSearchType] = useState('nombre')
    const [results, setResults] = useState([])
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()

        if (!query.trim()) {
            toast.error('Por favor ingresa un término de búsqueda')
            return
        }

        setLoading(true)
        setHasSearched(true)

        try {
            const searchQuery = { [searchType]: query }
            const data = await searchAppointments(searchQuery)
            const rawResults = Array.isArray(data) ? data : data.results || []

            // Normalize field names from Google Sheets format
            const normalizedResults = rawResults.map((apt, index) => ({
                id: apt.id || apt.row_number || index + 1,
                nombre: apt.nombre || apt['Nombre y Apellidos completos'] || 'Cliente',
                telefono: (apt.telefono || apt['Telefono'] || '').toString(),
                fecha: apt.fecha || apt['Fecha y hora de la cita'] || '',
                servicio: apt.servicio || apt['Servicio'] || '',
                staff: apt.staff || apt['Servicio proporcionado por'] || '',
                precio: parseFloat(apt.precio || apt['Precio servicio'] || 0),
            }))

            setResults(normalizedResults)
            toast.success(`${normalizedResults.length} resultado(s) encontrado(s)`)
        } catch (error) {
            toast.error('Error al buscar citas')
            // Mock results for demo
            setResults([
                {
                    id: '1',
                    nombre: 'Joel Venegas Vargas',
                    telefono: '5214772683928',
                    fecha: '2025-10-10T11:00:00',
                    servicio: 'Corte de Cabello Hombre',
                    staff: 'Luis',
                    precio: 25000,
                },
                {
                    id: '2',
                    nombre: 'Juan Peron',
                    telefono: '5493541377457',
                    fecha: '2025-11-25T10:00:00',
                    servicio: 'Drenaje Linfático Facial',
                    staff: 'Isabel Grimoldi',
                    precio: 26000,
                },
                {
                    id: '3',
                    nombre: 'Isabel Grimoldi',
                    telefono: '5491149276883',
                    fecha: '2025-11-21T10:10:00',
                    servicio: 'Drenaje Linfático Facial',
                    staff: 'Isabel Grimoldi',
                    precio: 26000,
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    const clearSearch = () => {
        setQuery('')
        setResults([])
        setHasSearched(false)
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('es-AR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateString
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                    <Search className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Buscar Citas</h2>
                <p className="text-sm text-slate-500 mt-1">Encuentra citas por nombre, teléfono o fecha</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                    >
                        <option value="nombre">Nombre</option>
                        <option value="telefono">Teléfono</option>
                        <option value="fecha">Fecha</option>
                    </select>

                    <div className="relative flex-1">
                        <input
                            type={searchType === 'fecha' ? 'date' : 'text'}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={searchType === 'nombre' ? 'Nombre del cliente...' : searchType === 'telefono' ? 'Número de teléfono...' : ''}
                            className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        {query && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all duration-200 disabled:opacity-70 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Buscar
                    </button>
                </div>
            </form>

            {/* Results */}
            {hasSearched && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No se encontraron citas</p>
                            <p className="text-sm text-slate-400">Intenta con otro término de búsqueda</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {results.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors border border-slate-100"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                                                {appointment.nombre.split(' ').slice(0, 2).map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    {appointment.nombre}
                                                </h4>
                                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                                    <Phone className="w-3 h-3" />
                                                    {appointment.telefono}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-primary-600">
                                            ${appointment.precio?.toLocaleString() || 0}
                                        </span>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-sm text-slate-600">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {formatDate(appointment.fecha)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Scissors className="w-4 h-4 text-slate-400" />
                                            {appointment.servicio}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            {appointment.staff}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchAppointments

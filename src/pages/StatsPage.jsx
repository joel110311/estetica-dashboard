import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { getStats } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import KPICards from '../components/KPICards'
import { RevenueByStaffChart, TopServicesChart, HourlyOccupancyChart } from '../components/Charts'
import { WeeklySummary, TodayAppointments } from '../components/WeeklySummary'
import TopClients from '../components/TopClients'

function StatsPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const hasFetched = useRef(false)

    const fetchData = async (isManual = false) => {
        // Prevent double fetch from strict mode, but allow manual refresh
        if (!isManual && hasFetched.current) return
        hasFetched.current = true

        setLoading(true)
        setError(null)

        try {
            const result = await getStats()
            setData(result)

            if (result.totalCitas > 0) {
                toast.success(`${result.totalCitas} cita(s) cargadas`)
            } else {
                toast.success('Conectado - Sin datos de citas')
            }
        } catch (err) {
            console.error('API Error:', err)
            setError('Error al conectar con la API')
            toast.error('Error al conectar - Datos de ejemplo')
            // Mock data
            setData({
                ingresosTotal: 125000,
                ingresosSemana: 45600,
                ingresosMes: 125000,
                ingresosHoy: 28000,
                totalCitas: 12,
                totalCitasSemana: 8,
                totalCitasMes: 12,
                totalCitasHoy: 3,
                ticketPromedio: 10417,
                cambioIngresos: '+12.5%',
                cambioCitas: '+8.3%',
                cambioTicket: '+3.2%',
                ingresosPorEstilista: [
                    { name: 'Isabel', ingresos: 52000 },
                    { name: 'Gastón', ingresos: 38000 },
                    { name: 'Lucero', ingresos: 25000 },
                ],
                serviciosMasSolicitados: [
                    { name: 'Limpieza Facial', value: 8 },
                    { name: 'Drenaje Linfático', value: 5 },
                    { name: 'Masaje Relajante', value: 4 },
                ],
                ocupacionPorHora: [
                    { hora: '9:00', ocupacion: 30 },
                    { hora: '10:00', ocupacion: 65 },
                    { hora: '11:00', ocupacion: 85 },
                    { hora: '12:00', ocupacion: 70 },
                    { hora: '14:00', ocupacion: 50 },
                    { hora: '15:00', ocupacion: 90 },
                    { hora: '16:00', ocupacion: 80 },
                    { hora: '17:00', ocupacion: 60 },
                ],
                topClientes: [
                    { id: 1, nombre: 'María García', visitas: 8, gasto: 256000, telefono: '5491149276883' },
                ],
                resumenSemanal: [
                    { dia: 'Lun', citas: 2, ingresos: 64000 },
                    { dia: 'Mar', citas: 3, ingresos: 99000 },
                    { dia: 'Mié', citas: 1, ingresos: 45000 },
                    { dia: 'Jue', citas: 4, ingresos: 132000 },
                    { dia: 'Vie', citas: 2, ingresos: 56000 },
                    { dia: 'Sáb', citas: 3, ingresos: 102000 },
                    { dia: 'Dom', citas: 0, ingresos: 0 },
                ],
                citasHoyDetalle: [
                    { hora: '10:00', nombre: 'María García', servicio: 'Limpieza Facial', staff: 'Isabel', precio: 28000 },
                    { hora: '14:30', nombre: 'Ana López', servicio: 'Drenaje Linfático', staff: 'Gastón', precio: 26000 },
                ],
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                <LoadingSpinner text="Cargando..." />
            </div>
        )
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Error banner */}
            {error && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 md:p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-amber-300 font-medium text-sm">{error}</p>
                        <p className="text-amber-400/70 text-xs">Datos de ejemplo</p>
                    </div>
                </div>
            )}

            {/* Warning for single appointment */}
            {!error && data?.totalCitas === 1 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 md:p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-blue-300 font-medium text-sm">Solo 1 cita recibida</p>
                        <p className="text-blue-400/70 text-xs">Revisa n8n</p>
                    </div>
                </div>
            )}

            {/* Refresh button */}
            <div className="flex justify-end">
                <button
                    onClick={() => fetchData(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-xl transition-all duration-200"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Actualizar</span>
                </button>
            </div>

            {/* KPI Cards */}
            <KPICards data={data} />

            {/* Today + Weekly Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <TodayAppointments data={data} />
                <WeeklySummary data={data} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <RevenueByStaffChart data={data?.ingresosPorEstilista} />
                <TopServicesChart data={data?.serviciosMasSolicitados} />
            </div>

            {/* Hourly Occupancy Chart */}
            <HourlyOccupancyChart data={data?.ocupacionPorHora} />

            {/* Top Clients Table */}
            <TopClients data={data?.topClientes} />
        </div>
    )
}

export default StatsPage

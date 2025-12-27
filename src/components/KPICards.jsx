import { DollarSign, Calendar, TrendingUp, Clock, CalendarDays, CalendarRange } from 'lucide-react'
import { getCurrencySymbol } from '../data/configStore'

function KPICards({ data }) {
    const { code: currencyCode, symbol: currencySymbol } = getCurrencySymbol()

    const citasCards = [
        {
            id: 'citasHoy',
            label: 'Citas Hoy',
            value: data?.totalCitasHoy?.toString() || '0',
            subtext: `${data?.ingresosHoy?.toLocaleString() || 0} ${currencyCode}`,
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            id: 'citasSemana',
            label: 'Esta Semana',
            value: data?.totalCitasSemana?.toString() || '0',
            subtext: `${data?.totalCitas || 0} totales`,
            icon: CalendarDays,
            gradient: 'from-primary-400 to-primary-600',
        },
        {
            id: 'citasMes',
            label: 'Este Mes',
            value: data?.totalCitasMes?.toString() || '0',
            subtext: 'acumulado',
            icon: CalendarRange,
            gradient: 'from-primary-500 to-primary-700',
        },
    ]

    const ingresosCards = [
        {
            id: 'ingresosSemana',
            label: 'Ingresos Semanales',
            value: data?.ingresosSemana ? `${currencySymbol}${data.ingresosSemana.toLocaleString()}` : `${currencySymbol}0`,
            change: data?.cambioIngresos || '+0%',
            positive: true,
            icon: DollarSign,
            gradient: 'from-primary-400 to-primary-600',
        },
        {
            id: 'ingresosMes',
            label: 'Ingresos Mensuales',
            value: data?.ingresosMes ? `${currencySymbol}${data.ingresosMes.toLocaleString()}` : `${currencySymbol}0`,
            change: data?.cambioCitas || '+0%',
            positive: true,
            icon: Calendar,
            gradient: 'from-primary-500 to-primary-700',
        },
        {
            id: 'ticket',
            label: 'Ticket Promedio',
            value: data?.ticketPromedio ? `${currencySymbol}${data.ticketPromedio.toLocaleString()}` : `${currencySymbol}0`,
            change: data?.cambioTicket || '+0%',
            positive: true,
            icon: TrendingUp,
            gradient: 'from-primary-600 to-primary-800',
        },
    ]

    return (
        <div className="space-y-4">
            {/* Citas Row */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible">
                {citasCards.map((card, index) => {
                    const Icon = card.icon
                    return (
                        <div
                            key={card.id}
                            className="flex-shrink-0 w-36 md:w-auto bg-white dark:bg-[#14171C] rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm dark:shadow-lg dark:shadow-black/20 border border-slate-100 dark:border-[#2A2E35]/50 card-hover"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-slate-500">{card.label}</p>
                                    <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{card.value}</p>
                                    {card.subtext && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{card.subtext}</p>}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Ingresos Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {ingresosCards.map((card, index) => {
                    const Icon = card.icon
                    return (
                        <div
                            key={card.id}
                            className="bg-white dark:bg-[#14171C] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 border border-slate-100 dark:border-[#2A2E35]/50 card-hover"
                            style={{ animationDelay: `${(index + 3) * 100}ms` }}
                        >
                            <div className="flex items-start justify-between mb-3 md:mb-4">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                {card.change && (
                                    <span className={`text-xs md:text-sm font-semibold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full ${card.positive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                        }`}>
                                        {card.change}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-slate-500 mb-1">{card.label}</p>
                                <p className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">{card.value}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default KPICards

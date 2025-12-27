import { Users, Phone, Calendar, TrendingUp } from 'lucide-react'
import { getCurrencySymbol } from '../data/configStore'

function TopClients({ data }) {
    const clients = data || []
    const { symbol } = getCurrencySymbol()

    if (clients.length === 0) {
        return (
            <div className="bg-white dark:bg-[#14171C] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 border border-slate-100 dark:border-[#2A2E35]/50">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
                    <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white">Top Clientes</h3>
                </div>
                <div className="h-32 flex items-center justify-center text-slate-500">
                    <p className="text-sm">Sin datos de clientes</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-[#14171C] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 border border-slate-100 dark:border-[#2A2E35]/50">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
                    <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white">Top Clientes</h3>
                </div>
                <span className="text-xs md:text-sm text-slate-500">{clients.length} clientes</span>
            </div>

            {/* Mobile: Cards layout */}
            <div className="space-y-3 md:hidden">
                {clients.slice(0, 5).map((client) => (
                    <div
                        key={client.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1a1d22] rounded-xl border border-transparent dark:border-[#2A2E35]"
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {client.nombre?.split(' ').slice(0, 2).map(n => n[0]).join('') || 'C'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{client.nombre}</p>
                            <p className="text-xs text-slate-500">{client.visitas} visitas</p>
                        </div>

                        {/* Gasto */}
                        <div className="text-right flex-shrink-0">
                            <p className="font-bold text-primary-600 dark:text-primary-400 text-sm">{symbol}{client.gasto?.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitas</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gasto Total</th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Última Visita</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.slice(0, 5).map((client) => (
                            <tr
                                key={client.id}
                                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                            >
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar without rank number */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                                            {client.nombre?.split(' ').slice(0, 2).map(n => n[0]).join('') || 'C'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{client.nombre}</p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {client.telefono}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
                                        <TrendingUp className="w-3 h-3" />
                                        {client.visitas}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <span className="font-bold text-slate-800">{symbol}{client.gasto?.toLocaleString()}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        {client.ultimaVisita || 'Reciente'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TopClients

import { useState, useEffect } from 'react'
import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getCurrencySymbol } from '../data/configStore'
import { getConfigTheme, THEMES } from '../data/themeStore'

// Get colors from current theme
function useThemeColors() {
    const [colors, setColors] = useState(THEMES.estetica.colors)

    useEffect(() => {
        const updateColors = () => {
            const themeId = getConfigTheme()
            const theme = THEMES[themeId] || THEMES.estetica
            setColors(theme.colors)
        }

        updateColors()
        window.addEventListener('storage', updateColors)
        const interval = setInterval(updateColors, 500)

        return () => {
            window.removeEventListener('storage', updateColors)
            clearInterval(interval)
        }
    }, [])

    return colors
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
    const { symbol } = getCurrencySymbol()
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-semibold">
                            {entry.dataKey === 'ingresos' ? `${symbol}${entry.value.toLocaleString()}` : entry.value}
                        </span>
                    </p>
                ))}
            </div>
        )
    }
    return null
}

// Weekly Summary Chart
export function WeeklySummary({ data }) {
    const chartData = data?.resumenSemanal || []
    const { symbol } = getCurrencySymbol()
    const themeColors = useThemeColors()

    const totalSemana = chartData.reduce((sum, day) => sum + day.ingresos, 0)
    const totalCitas = chartData.reduce((sum, day) => sum + day.citas, 0)

    return (
        <div className="bg-white dark:bg-[#14171C] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 border border-slate-100 dark:border-[#2A2E35]/50">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
                        Resumen Semanal
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Lun - Vie</p>
                </div>
                <div className="text-right">
                    <p className="text-lg md:text-2xl font-bold text-primary-600">{symbol}{totalSemana.toLocaleString()}</p>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{totalCitas} citas</p>
                </div>
            </div>

            {chartData.length > 0 ? (
                <div className="h-36 md:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="weeklyBarGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={themeColors[500]} />
                                    <stop offset="100%" stopColor={themeColors[600]} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="dia"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                                width={35}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="ingresos"
                                name="Ingresos"
                                fill="url(#weeklyBarGradient)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={30}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-36 md:h-48 flex items-center justify-center text-slate-400">
                    <p className="text-sm">Sin datos esta semana</p>
                </div>
            )}
        </div>
    )
}

// Today's Appointments
export function TodayAppointments({ data }) {
    const citas = data?.citasHoyDetalle || []
    const { symbol } = getCurrencySymbol()

    return (
        <div className="bg-white dark:bg-[#14171C] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 border border-slate-100 dark:border-[#2A2E35]/50">
            <div className="flex items-center justify-between mb-3 md:mb-4">
                <div>
                    <h3 className="text-base md:text-lg font-semibold text-white mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                        Citas de Hoy
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500">
                        {new Date().toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <div className="bg-amber-500/10 px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                    <span className="text-amber-400 font-semibold text-sm">{citas.length}</span>
                </div>
            </div>

            {citas.length > 0 ? (
                <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
                    {citas.map((cita, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-2.5 md:p-3 bg-slate-50 dark:bg-[#1a1d22] rounded-lg md:rounded-xl border border-transparent dark:border-[#2A2E35]"
                        >
                            <div className="flex-shrink-0">
                                <div className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 font-bold text-xs py-1 px-2 rounded-md">
                                    {cita.hora}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                                    {cita.nombre}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {cita.servicio}
                                </p>
                            </div>

                            <div className="flex-shrink-0 text-right">
                                <p className="font-bold text-primary-600 dark:text-primary-400 text-sm">{symbol}{cita.precio?.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-32 md:h-40 flex flex-col items-center justify-center text-slate-400">
                    <Clock className="w-8 h-8 md:w-10 md:h-10 mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-medium text-sm">Sin citas hoy</p>
                </div>
            )}
        </div>
    )
}

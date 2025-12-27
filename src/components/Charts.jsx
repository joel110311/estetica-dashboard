import { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area
} from 'recharts'
import { Users, Scissors, Clock } from 'lucide-react'
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
        // Listen for storage changes (theme updates)
        window.addEventListener('storage', updateColors)
        // Also check periodically for local updates
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
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#14171C] px-3 py-2 rounded-lg shadow-lg border border-slate-100 dark:border-[#2A2E35]">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{label || payload[0]?.name}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs" style={{ color: entry.color || entry.payload?.fill }}>
                        {entry.dataKey || 'Valor'}: <span className="font-semibold">
                            {typeof entry.value === 'number'
                                ? (entry.value >= 1000 ? `$${entry.value.toLocaleString()}` : entry.value)
                                : entry.value}
                        </span>
                    </p>
                ))}
            </div>
        )
    }
    return null
}

// Revenue by Staff Chart
export function RevenueByStaffChart({ data }) {
    const chartData = data || []
    const themeColors = useThemeColors()

    const COLORS = [themeColors[500], themeColors[400], themeColors[600], themeColors[300], themeColors[700], themeColors[800]]

    return (
        <div className="bg-white dark:bg-[#14171C] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 border border-slate-100 dark:border-[#2A2E35]/50">
            <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
                    Ingresos por Estilista
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Rendimiento del equipo</p>
            </div>

            {chartData.length > 0 ? (
                <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="staffBarGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={themeColors[500]} />
                                    <stop offset="100%" stopColor={themeColors[400]} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                width={70}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="ingresos"
                                name="Ingresos"
                                fill="url(#staffBarGradient)"
                                radius={[0, 6, 6, 0]}
                                maxBarSize={25}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-48 md:h-64 flex items-center justify-center text-slate-400">
                    <p className="text-sm">Sin datos</p>
                </div>
            )}
        </div>
    )
}

// Top Services Chart (Pie)
export function TopServicesChart({ data }) {
    const chartData = data || []
    const themeColors = useThemeColors()

    const COLORS = [themeColors[500], themeColors[400], themeColors[600], themeColors[300], themeColors[700], themeColors[800]]

    return (
        <div className="bg-white dark:bg-[#14171C] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 border border-slate-100 dark:border-[#2A2E35]/50">
            <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                    <Scissors className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
                    Servicios Populares
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Distribución</p>
            </div>

            {chartData.length > 0 ? (
                <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={3}
                                dataKey="value"
                                nameKey="name"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="#14171C"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '11px' }}
                                iconSize={8}
                                formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-48 md:h-64 flex items-center justify-center text-slate-400">
                    <p className="text-sm">Sin datos</p>
                </div>
            )}
        </div>
    )
}

// Hourly Occupancy Chart
export function HourlyOccupancyChart({ data }) {
    const chartData = data || []
    const themeColors = useThemeColors()

    return (
        <div className="bg-white dark:bg-[#14171C] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 border border-slate-100 dark:border-[#2A2E35]/50">
            <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
                    Ocupación por Hora
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Tendencia del día</p>
            </div>

            {chartData.length > 0 ? (
                <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={themeColors[500]} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={themeColors[500]} stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="hora"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                                width={40}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="ocupacion"
                                name="Ocupación"
                                stroke={themeColors[500]}
                                strokeWidth={2}
                                fill="url(#occupancyGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-48 md:h-64 flex items-center justify-center text-slate-400">
                    <p className="text-sm">Sin datos</p>
                </div>
            )}
        </div>
    )
}

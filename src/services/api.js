import { getConfigWebhooksSync } from '../data/configStore'

// Get API endpoints from config (allows dynamic configuration)
function getEndpoints() {
    const webhooks = getConfigWebhooksSync()
    return {
        ANALYTICS_API: webhooks.dashboard,
        CALENDAR_API: webhooks.calendar,
        DELETE_API: webhooks.delete,
    }
}

// Debug mode
const DEBUG = true;

function log(...args) {
    if (DEBUG) console.log('[API]', ...args);
}

// Generic fetch wrapper with CORS handling
async function apiRequest(url, options = {}) {
    log('Request:', url, options);

    try {
        const response = await fetch(url, {
            ...options,
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
        });

        log('Response status:', response.status);
        const text = await response.text();
        log('Response body:', text);

        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            data = { message: text, success: true };
        }

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        log('CORS request failed, trying form mode:', error.message);

        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            try {
                if (options.method === 'POST' && options.body) {
                    const formData = new URLSearchParams();
                    const jsonData = JSON.parse(options.body);
                    Object.entries(jsonData).forEach(([key, value]) => {
                        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
                    });

                    const response = await fetch(url, {
                        method: 'POST',
                        body: formData,
                    });

                    const text = await response.text();
                    log('Form response:', text);

                    try {
                        return JSON.parse(text);
                    } catch {
                        return { message: text, success: true };
                    }
                }
            } catch (formError) {
                log('Form request also failed:', formError.message);
            }
        }

        throw error;
    }
}

// Parse date from various formats (DD/MM/YYYY, ISO, etc.)
function parseDate(dateStr) {
    if (!dateStr) return null;

    // Try ISO format first (2025-12-16T17:00:00)
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // Try DD/MM/YYYY format (e.g., "16/12/2025, 5:00 p.m." or "16/12/2025")
    const ddmmyyyyMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (ddmmyyyyMatch) {
        const day = parseInt(ddmmyyyyMatch[1], 10);
        const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // JS months are 0-indexed
        const year = parseInt(ddmmyyyyMatch[3], 10);

        // Try to parse time
        let hours = 0, minutes = 0;
        const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)?/i);
        if (timeMatch) {
            hours = parseInt(timeMatch[1], 10);
            minutes = parseInt(timeMatch[2], 10);
            const period = timeMatch[3];
            if (period && period.toLowerCase().includes('p') && hours < 12) {
                hours += 12;
            } else if (period && period.toLowerCase().includes('a') && hours === 12) {
                hours = 0;
            }
        }

        date = new Date(year, month, day, hours, minutes, 0, 0);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    return null;
}

// Date helper functions
function getStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getStartOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}

function isInWeek(date, weekStart) {
    // Only count Monday to Friday (workdays)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 5); // Monday + 5 days = Saturday (exclusive)
    return date >= weekStart && date < weekEnd;
}

function isInMonth(date, monthStart) {
    return date.getMonth() === monthStart.getMonth() &&
        date.getFullYear() === monthStart.getFullYear();
}

// Analytics API calls
export async function getStats() {
    try {
        const { ANALYTICS_API } = getEndpoints();
        const rawData = await apiRequest(ANALYTICS_API, { method: 'GET' });
        const appointments = Array.isArray(rawData) ? rawData : [rawData];
        log('Appointments received:', appointments.length);
        return processAppointmentsToStats(appointments);
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
}

// Process raw appointments data into dashboard statistics
function processAppointmentsToStats(appointments) {
    if (!appointments || appointments.length === 0) {
        return getEmptyStats();
    }

    const today = getStartOfDay(new Date());
    const weekStart = getStartOfWeek(new Date());
    const monthStart = getStartOfMonth(new Date());

    // Parse all appointments with dates
    const parsedAppointments = appointments.map(apt => {
        const fechaStr = apt['Fecha y hora de la cita'] || apt.fecha || '';
        const fecha = parseDate(fechaStr);

        if (DEBUG && fechaStr) {
            log('Parsing date:', fechaStr, '->', fecha?.toISOString() || 'null');
        }

        return {
            ...apt,
            fechaParsed: fecha,
            precio: parseFloat(apt['Precio servicio'] || apt.precio || 0),
            staff: apt['Servicio proporcionado por'] || apt.staff || 'Sin asignar',
            servicio: apt['Servicio'] || apt.servicio || 'Otro',
            nombre: apt['Nombre y Apellidos completos'] || apt.nombre || 'Cliente',
            telefono: (apt['Telefono'] || apt.telefono || '').toString(),
        };
    });

    // Filter by time periods
    const citasHoy = parsedAppointments.filter(apt =>
        apt.fechaParsed && isSameDay(apt.fechaParsed, today)
    );

    const citasSemana = parsedAppointments.filter(apt =>
        apt.fechaParsed && isInWeek(apt.fechaParsed, weekStart)
    );

    const citasMes = parsedAppointments.filter(apt =>
        apt.fechaParsed && isInMonth(apt.fechaParsed, monthStart)
    );

    // Calculate totals
    const ingresosHoy = citasHoy.reduce((sum, apt) => sum + apt.precio, 0);
    const ingresosSemana = citasSemana.reduce((sum, apt) => sum + apt.precio, 0);
    const ingresosMes = citasMes.reduce((sum, apt) => sum + apt.precio, 0);
    const ingresosTotal = parsedAppointments.reduce((sum, apt) => sum + apt.precio, 0);

    // Total appointments by period
    const totalCitasHoy = citasHoy.length;
    const totalCitasSemana = citasSemana.length;
    const totalCitasMes = citasMes.length;
    const totalCitas = parsedAppointments.length;

    // Average ticket
    const ticketPromedio = totalCitas > 0 ? Math.round(ingresosTotal / totalCitas) : 0;

    // Revenue by staff (all time)
    const staffRevenue = {};
    parsedAppointments.forEach(apt => {
        staffRevenue[apt.staff] = (staffRevenue[apt.staff] || 0) + apt.precio;
    });
    const ingresosPorEstilista = Object.entries(staffRevenue)
        .map(([name, ingresos]) => ({ name, ingresos }))
        .sort((a, b) => b.ingresos - a.ingresos);

    // Services count (all time)
    const serviceCount = {};
    parsedAppointments.forEach(apt => {
        serviceCount[apt.servicio] = (serviceCount[apt.servicio] || 0) + 1;
    });
    const serviciosMasSolicitados = Object.entries(serviceCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    // Hourly occupancy
    const hourCount = {};
    parsedAppointments.forEach(apt => {
        if (apt.fechaParsed) {
            const hora = apt.fechaParsed.getHours();
            const horaStr = `${hora}:00`;
            hourCount[horaStr] = (hourCount[horaStr] || 0) + 1;
        }
    });

    const ocupacionPorHora = [];
    for (let h = 9; h <= 18; h++) {
        const horaStr = `${h}:00`;
        const count = hourCount[horaStr] || 0;
        const ocupacion = Math.min(count * 10, 100);
        ocupacionPorHora.push({ hora: horaStr, ocupacion });
    }

    // Top clients
    const clientData = {};
    parsedAppointments.forEach(apt => {
        if (!clientData[apt.nombre]) {
            clientData[apt.nombre] = {
                nombre: apt.nombre,
                telefono: apt.telefono,
                visitas: 0,
                gasto: 0,
            };
        }
        clientData[apt.nombre].visitas += 1;
        clientData[apt.nombre].gasto += apt.precio;
    });

    const topClientes = Object.values(clientData)
        .sort((a, b) => b.gasto - a.gasto)
        .slice(0, 5)
        .map((client, index) => ({ id: index + 1, ...client }));

    // Weekly breakdown (Monday to Friday of current week - workdays only)
    const resumenSemanal = [];
    const currentWeekMonday = getStartOfWeek(new Date()); // Gets Monday

    // Loop through Monday (0) to Friday (4) - 5 workdays
    for (let i = 0; i < 5; i++) {
        const day = new Date(currentWeekMonday);
        day.setDate(currentWeekMonday.getDate() + i);
        const dayStart = getStartOfDay(day);

        const citasDia = parsedAppointments.filter(apt =>
            apt.fechaParsed && isSameDay(apt.fechaParsed, dayStart)
        );

        resumenSemanal.push({
            dia: day.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }),
            citas: citasDia.length,
            ingresos: citasDia.reduce((sum, apt) => sum + apt.precio, 0),
        });
    }

    // Citas de hoy detalles
    const citasHoyDetalle = citasHoy.map(apt => ({
        hora: apt.fechaParsed ? apt.fechaParsed.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
        nombre: apt.nombre,
        servicio: apt.servicio,
        staff: apt.staff,
        precio: apt.precio,
    })).sort((a, b) => a.hora.localeCompare(b.hora));

    return {
        // KPIs principales
        ingresosTotal,
        ingresosSemana,
        ingresosMes,
        ingresosHoy,
        totalCitas,
        totalCitasSemana,
        totalCitasMes,
        totalCitasHoy,
        ticketPromedio,

        // Cambios (placeholder - necesitaría datos históricos)
        cambioIngresos: '+12.5%',
        cambioCitas: '+8.3%',
        cambioTicket: '+3.2%',

        // Charts data
        ingresosPorEstilista,
        serviciosMasSolicitados,
        ocupacionPorHora,
        topClientes,

        // Nuevos datos
        resumenSemanal,
        citasHoyDetalle,
    };
}

function getEmptyStats() {
    return {
        ingresosTotal: 0,
        ingresosSemana: 0,
        ingresosMes: 0,
        ingresosHoy: 0,
        totalCitas: 0,
        totalCitasSemana: 0,
        totalCitasMes: 0,
        totalCitasHoy: 0,
        ticketPromedio: 0,
        cambioIngresos: '+0%',
        cambioCitas: '+0%',
        cambioTicket: '+0%',
        ingresosPorEstilista: [],
        serviciosMasSolicitados: [],
        ocupacionPorHora: [],
        topClientes: [],
        resumenSemanal: [],
        citasHoyDetalle: [],
    };
}

// Calendar API calls
export async function createAppointment(data) {
    log('Creating appointment:', data);
    const { CALENDAR_API } = getEndpoints();

    const payload = {
        'Nombre y Apellidos completos': data.nombre,
        'Telefono': data.telefono,
        'Fecha y hora de la cita': data.fecha,
        'Servicio': data.servicio,
        'Precio servicio': data.precio,
        'Servicio proporcionado por': data.staff,
    };

    log('Formatted payload:', payload);

    return apiRequest(CALENDAR_API, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function searchAppointments(query) {
    log('Searching appointments:', query);
    const { CALENDAR_API } = getEndpoints();

    return apiRequest(CALENDAR_API, {
        method: 'POST',
        body: JSON.stringify({ action: 'search', ...query }),
    });
}

export async function updateAppointment(id, data) {
    log('Updating appointment:', id, data);
    const { CALENDAR_API } = getEndpoints();

    return apiRequest(CALENDAR_API, {
        method: 'POST',
        body: JSON.stringify({ action: 'update', id, ...data }),
    });
}

export async function deleteAppointment(id) {
    log('Deleting appointment:', id);
    const { DELETE_API } = getEndpoints();

    return apiRequest(DELETE_API, {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id }),
    });
}

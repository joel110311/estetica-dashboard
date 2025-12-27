// Config Store - Persistent storage for settings using PocketBase
import pb from '../lib/pocketbase'

// Default values (used when PocketBase is not available or no data exists)
const DEFAULT_SERVICES = [
    { id: 1, nombre: 'Limpieza Facial Profunda', precio: 28000, duracion: 60, categoria: 'Facial', staff: ['Isabel Grimoldi', 'Gabriela Cejas'] },
    { id: 2, nombre: 'Hidratación Intensiva con Ácido Hialurónico', precio: 32500, duracion: 50, categoria: 'Facial', staff: ['Isabel Grimoldi', 'Gastón Grimoldi'] },
    { id: 3, nombre: 'Drenaje Linfático Facial', precio: 26000, duracion: 45, categoria: 'Facial', staff: ['Isabel Grimoldi', 'Gastón Grimoldi', 'Gabriela Cejas'] },
    { id: 4, nombre: 'Radiofrecuencia Facial', precio: 42000, duracion: 45, categoria: 'Facial', staff: ['Isabel Grimoldi', 'Gastón Grimoldi'] },
    { id: 5, nombre: 'PRP Facial (Plasma Rico en Plaquetas)', precio: 85000, duracion: 90, categoria: 'Regenerativo', staff: ['Lucero Velasquez'] },
    { id: 6, nombre: 'PRP Capilar (Plasma Rico en Plaquetas)', precio: 75000, duracion: 75, categoria: 'Regenerativo', staff: ['Lucero Velasquez'] },
    { id: 7, nombre: 'Drenaje Linfático Manual (Cuerpo Completo)', precio: 34000, duracion: 60, categoria: 'Corporal', staff: ['Isabel Grimoldi', 'Gastón Grimoldi'] },
    { id: 8, nombre: 'Masaje Descontracturante Profundo', precio: 38000, duracion: 60, categoria: 'Masaje', staff: ['Gastón Grimoldi'] },
    { id: 9, nombre: 'Masaje Relajante con Aromaterapia', precio: 43000, duracion: 75, categoria: 'Masaje', staff: ['Gastón Grimoldi', 'Lucero Velasquez'] },
]

const DEFAULT_STAFF = [
    'Isabel Grimoldi',
    'Gastón Grimoldi',
    'Lucero Velasquez',
    'Gabriela Cejas',
]

const DEFAULT_CURRENCY = 'ARS'

const DEFAULT_WEBHOOKS = {
    dashboard: 'https://n8nluxentia.luxentia.cloud/webhook/dash',
    calendar: 'https://n8nluxentia.luxentia.cloud/webhook/calendar',
    delete: 'https://n8nluxentia.luxentia.cloud/webhook/elimina',
}

// In-memory cache for config values
let configCache = {
    services: null,
    staff: null,
    currency: null,
    webhooks: null,
}

// Generic function to get config from PocketBase
async function getConfigValue(key, defaultValue) {
    // Return cached value if available
    if (configCache[key] !== null) {
        return configCache[key]
    }

    try {
        const record = await pb.collection('config').getFirstListItem(`key="${key}"`)
        configCache[key] = record.value
        return record.value
    } catch (err) {
        // Record not found, create it with default value
        if (err.status === 404) {
            console.log(`Config '${key}' not found, creating with default`)
            try {
                await pb.collection('config').create({
                    key,
                    value: defaultValue,
                })
            } catch (createErr) {
                console.log(`Could not create config '${key}':`, createErr)
            }
        }
        configCache[key] = defaultValue
        return defaultValue
    }
}

// Generic function to save config to PocketBase
async function saveConfigValue(key, value) {
    configCache[key] = value

    try {
        // Try to find existing record
        const record = await pb.collection('config').getFirstListItem(`key="${key}"`)
        // Update existing
        await pb.collection('config').update(record.id, { value })
        return true
    } catch (err) {
        if (err.status === 404) {
            // Create new record
            try {
                await pb.collection('config').create({ key, value })
                return true
            } catch (createErr) {
                console.error(`Error creating config '${key}':`, createErr)
                return false
            }
        }
        console.error(`Error saving config '${key}':`, err)
        return false
    }
}

// Services
export async function getConfigServices() {
    return getConfigValue('services', DEFAULT_SERVICES)
}

export async function saveConfigServices(services) {
    return saveConfigValue('services', services)
}

// Synchronous version for components that can't use async
export function getConfigServicesSync() {
    return configCache.services || DEFAULT_SERVICES
}

// Staff
export async function getConfigStaff() {
    return getConfigValue('staff', DEFAULT_STAFF)
}

export async function saveConfigStaff(staff) {
    return saveConfigValue('staff', staff)
}

export function getConfigStaffSync() {
    return configCache.staff || DEFAULT_STAFF
}

// Currency
export async function getConfigCurrency() {
    return getConfigValue('currency', DEFAULT_CURRENCY)
}

export async function saveConfigCurrency(currency) {
    return saveConfigValue('currency', currency)
}

export function getConfigCurrencySync() {
    return configCache.currency || DEFAULT_CURRENCY
}

// Webhooks
export async function getConfigWebhooks() {
    return getConfigValue('webhooks', DEFAULT_WEBHOOKS)
}

export async function saveConfigWebhooks(webhooks) {
    return saveConfigValue('webhooks', webhooks)
}

export function getConfigWebhooksSync() {
    return configCache.webhooks || DEFAULT_WEBHOOKS
}

// Initialize config cache - call this on app load
export async function initializeConfig() {
    console.log('Initializing config from PocketBase...')
    try {
        const [services, staff, currency, webhooks] = await Promise.all([
            getConfigValue('services', DEFAULT_SERVICES),
            getConfigValue('staff', DEFAULT_STAFF),
            getConfigValue('currency', DEFAULT_CURRENCY),
            getConfigValue('webhooks', DEFAULT_WEBHOOKS),
        ])

        configCache = { services, staff, currency, webhooks }
        console.log('Config loaded successfully')
        return true
    } catch (err) {
        console.error('Error initializing config:', err)
        // Use defaults if PocketBase is not available
        configCache = {
            services: DEFAULT_SERVICES,
            staff: DEFAULT_STAFF,
            currency: DEFAULT_CURRENCY,
            webhooks: DEFAULT_WEBHOOKS,
        }
        return false
    }
}

// Clear cache (useful after updates)
export function clearConfigCache() {
    configCache = {
        services: null,
        staff: null,
        currency: null,
        webhooks: null,
    }
}

// Helper to get services for a specific staff member
export function getServicesForStaff(staffName) {
    const services = getConfigServicesSync()
    return services.filter(s => (s.staff || []).includes(staffName))
}

// Helper to get service by name
export function getServiceByName(name) {
    const services = getConfigServicesSync()
    return services.find(s => s.nombre === name)
}

// Currency symbol helper
export function getCurrencySymbol() {
    const currency = getConfigCurrencySync()
    const symbols = {
        'ARS': '$',
        'USD': 'US$',
        'MXN': 'MX$',
        'COP': 'COL$',
    }
    return { code: currency, symbol: symbols[currency] || '$' }
}

// Calculate seña (deposit) - typically 35% of price
export function calculateSena(precio) {
    return Math.round(precio * 0.35)
}

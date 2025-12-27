// Catálogo de Servicios - Centro Estética Isabel Grimoldi
// Precios en pesos argentinos (ARS)

export const SERVICIOS = {
    // TRATAMIENTOS FACIALES
    'Limpieza Facial Profunda': { precio: 28000, duracion: 60, sena: 9800, categoria: 'Facial' },
    'Hidratación Intensiva con Ácido Hialurónico': { precio: 32500, duracion: 50, sena: 11375, categoria: 'Facial' },
    'Peeling Químico Despigmentante': { precio: 38000, duracion: 45, sena: 13300, categoria: 'Facial' },
    'Microdermoabrasión con Punta de Diamante': { precio: 35000, duracion: 60, sena: 12250, categoria: 'Facial' },
    'Radiofrecuencia Facial': { precio: 45000, duracion: 50, sena: 15750, categoria: 'Facial' },
    'Tratamiento Anti-Acné con Terapia LED': { precio: 36000, duracion: 75, sena: 12600, categoria: 'Facial' },
    'Dermaplaning Facial': { precio: 31000, duracion: 45, sena: 10850, categoria: 'Facial' },
    'Drenaje Linfático Facial': { precio: 26000, duracion: 40, sena: 0, categoria: 'Facial' },

    // TERAPIAS REGENERATIVAS
    'PRP Facial (Plasma Rico en Plaquetas)': { precio: 85000, duracion: 90, sena: 29750, categoria: 'Regenerativo', requiereConsulta: true },
    'PRP Capilar (Plasma Rico en Plaquetas)': { precio: 95000, duracion: 75, sena: 33250, categoria: 'Regenerativo', requiereConsulta: true },

    // TRATAMIENTOS CORPORALES
    'Drenaje Linfático Manual (Cuerpo Completo)': { precio: 34000, duracion: 60, sena: 11900, categoria: 'Corporal' },
    'Tratamiento Reductor y Modelador': { precio: 42000, duracion: 75, sena: 14700, categoria: 'Corporal' },
    'Exfoliación e Hidratación Corporal': { precio: 30000, duracion: 50, sena: 10500, categoria: 'Corporal' },
    'Tratamiento Reafirmante para Glúteos y Abdomen': { precio: 48000, duracion: 60, sena: 16800, categoria: 'Corporal' },
    'Vendas Frías (Crioterapia)': { precio: 29000, duracion: 45, sena: 10150, categoria: 'Corporal' },
    'Yesoterapia Modeladora': { precio: 55000, duracion: 90, sena: 19250, categoria: 'Corporal' },
    'Tratamiento Anti-Celulitis con Ondas de Choque': { precio: 52000, duracion: 40, sena: 18200, categoria: 'Corporal' },

    // MASAJES TERAPÉUTICOS
    'Masaje Descontracturante Profundo': { precio: 38000, duracion: 60, sena: 13300, categoria: 'Masaje' },
    'Masaje Deportivo (Pre o Post Competencia)': { precio: 40000, duracion: 50, sena: 14000, categoria: 'Masaje' },
    'Masaje Relajante con Aromaterapia': { precio: 43000, duracion: 75, sena: 15050, categoria: 'Masaje' },
    'Masaje con Piedras Calientes': { precio: 49000, duracion: 80, sena: 17150, categoria: 'Masaje' },
    'Reflexología Podal': { precio: 29500, duracion: 45, sena: 0, categoria: 'Masaje' },
};

// Lista de servicios por nombre
export const LISTA_SERVICIOS = Object.keys(SERVICIOS);

// Staff y sus servicios autorizados
export const STAFF = {
    'Isabel Grimoldi': [
        'Limpieza Facial Profunda',
        'Hidratación Intensiva con Ácido Hialurónico',
        'Peeling Químico Despigmentante',
        'Microdermoabrasión con Punta de Diamante',
        'Radiofrecuencia Facial',
        'Tratamiento Anti-Acné con Terapia LED',
        'Dermaplaning Facial',
        'Drenaje Linfático Facial',
        'Drenaje Linfático Manual (Cuerpo Completo)',
        'Tratamiento Reductor y Modelador',
        'Exfoliación e Hidratación Corporal',
        'Tratamiento Reafirmante para Glúteos y Abdomen',
        'Vendas Frías (Crioterapia)',
        'Yesoterapia Modeladora',
        'Tratamiento Anti-Celulitis con Ondas de Choque',
    ],
    'Gastón Grimoldi': [
        'Limpieza Facial Profunda',
        'Hidratación Intensiva con Ácido Hialurónico',
        'Peeling Químico Despigmentante',
        'Microdermoabrasión con Punta de Diamante',
        'Radiofrecuencia Facial',
        'Tratamiento Anti-Acné con Terapia LED',
        'Dermaplaning Facial',
        'Drenaje Linfático Facial',
        'Drenaje Linfático Manual (Cuerpo Completo)',
        'Tratamiento Reductor y Modelador',
        'Exfoliación e Hidratación Corporal',
        'Tratamiento Reafirmante para Glúteos y Abdomen',
        'Vendas Frías (Crioterapia)',
        'Yesoterapia Modeladora',
        'Tratamiento Anti-Celulitis con Ondas de Choque',
    ],
    'Lucero Velasquez': [
        'PRP Facial (Plasma Rico en Plaquetas)',
        'PRP Capilar (Plasma Rico en Plaquetas)',
        'Masaje Descontracturante Profundo',
        'Masaje Deportivo (Pre o Post Competencia)',
        'Masaje Relajante con Aromaterapia',
        'Masaje con Piedras Calientes',
        'Reflexología Podal',
    ],
    'Gabriela Cejas': [
        'Limpieza Facial Profunda',
        'Hidratación Intensiva con Ácido Hialurónico',
        'Peeling Químico Despigmentante',
        'Microdermoabrasión con Punta de Diamante',
        'Radiofrecuencia Facial',
        'Tratamiento Anti-Acné con Terapia LED',
        'Dermaplaning Facial',
        'Drenaje Linfático Facial',
        'Drenaje Linfático Manual (Cuerpo Completo)',
        'Tratamiento Reductor y Modelador',
        'Exfoliación e Hidratación Corporal',
        'Tratamiento Reafirmante para Glúteos y Abdomen',
        'Vendas Frías (Crioterapia)',
        'Yesoterapia Modeladora',
        'Tratamiento Anti-Celulitis con Ondas de Choque',
    ],
};

// Lista de nombres del staff
export const LISTA_STAFF = Object.keys(STAFF);

// Obtener servicios disponibles para un especialista
export function getServiciosPorStaff(staffName) {
    return STAFF[staffName] || [];
}

// Obtener precio de un servicio
export function getPrecioServicio(servicioName) {
    return SERVICIOS[servicioName]?.precio || 0;
}

// Obtener info completa de un servicio
export function getInfoServicio(servicioName) {
    return SERVICIOS[servicioName] || null;
}

// Categorías para agrupar servicios
export const CATEGORIAS = [
    { id: 'Facial', nombre: 'Tratamientos Faciales' },
    { id: 'Regenerativo', nombre: 'Terapias Regenerativas' },
    { id: 'Corporal', nombre: 'Tratamientos Corporales' },
    { id: 'Masaje', nombre: 'Masajes Terapéuticos' },
];

// Obtener servicios por categoría
export function getServiciosPorCategoria(categoria) {
    return Object.entries(SERVICIOS)
        .filter(([_, info]) => info.categoria === categoria)
        .map(([nombre, info]) => ({ nombre, ...info }));
}

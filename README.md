# Sistema de Administración - Dashboard

Sistema de gestión para negocios de belleza (Estéticas, Peluquerías, Salón de Uñas, Lashistas, Spa).

## Características

- ✅ Gestión de citas con integración n8n
- ✅ Dashboard con KPIs y estadísticas
- ✅ Catálogo de servicios configurable
- ✅ Gestión de usuarios con roles
- ✅ Tema claro/oscuro
- ✅ Wizard de configuración inicial
- ✅ Auto-hospedado con PocketBase

## Stack Tecnológico

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** PocketBase (SQLite)
- **Despliegue:** Docker + Nginx + Traefik

## Despliegue Rápido

### Desarrollo Local

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/admin-dashboard.git
cd admin-dashboard

# 2. Instalar dependencias
npm install

# 3. Iniciar PocketBase
docker-compose -f docker-compose.dev.yml up -d

# 4. Configurar PocketBase (ver POCKETBASE_SETUP.md)

# 5. Iniciar frontend
npm run dev -- --host
```

### Producción con Docker

```bash
# 1. Configurar variables
cp .env.example .env.production
# Editar .env.production con tu URL de PocketBase

# 2. Desplegar
docker-compose up -d --build
```

## Documentación

- [Guía de Configuración de PocketBase](POCKETBASE_SETUP.md)

## Licencia

MIT
# Trigger rebuild  
# Trigger rebuild 

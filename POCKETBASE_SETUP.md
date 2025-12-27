# Guía de Despliegue - Sistema de Administración

## Despliegue Local (Desarrollo)

### 1. Iniciar PocketBase

```bash
# Usando Docker Compose
docker-compose -f docker-compose.dev.yml up
```

### 2. Configurar PocketBase (solo primera vez)

Abre http://localhost:8090/_/ y crea la cuenta de admin de PocketBase.

Luego crea estas colecciones:

#### Colección `users` (modificar la existente)
Agregar campos:
- `name` (Text)
- `role` (Select: `operador,gerente,superadmin`)

#### Colección `config` (nueva)
Campos:
- `key` (Text, Unique, Required)
- `value` (JSON, Required)

API Rules (para usuarios autenticados):
- List/Search/View/Create/Update: `@request.auth.id != ""`

### 3. Iniciar Frontend

```bash
npm run dev -- --host
```

### 4. Configuración Inicial

Al abrir la app por primera vez, aparecerá el **Wizard de Configuración** donde podrás:
- Ingresar el nombre de tu negocio
- Seleccionar el tipo (Estética, Peluquería, Uñas, etc.)
- Crear tu usuario administrador
- Elegir el color del tema

¡Todo lo demás se configura desde la app!

---

## Despliegue en Producción (Docker + Traefik)

### 1. Subir archivos al servidor

```bash
scp -r . usuario@servidor:/opt/estetica-dashboard
```

### 2. Crear archivo de producción

```bash
# .env.production
VITE_POCKETBASE_URL=https://api-estetica.tudominio.com
```

### 3. Desplegar

```bash
docker-compose up -d --build
```

### URLs:
- **Frontend:** https://estetica.tudominio.com
- **PocketBase Admin:** https://api-estetica.tudominio.com/_/

---

## Replicar para Nuevo Cliente

Para cada cliente nuevo:

1. Crear nuevo proyecto Docker (copiar archivos)
2. Cambiar dominios en `docker-compose.yml`
3. Ejecutar `docker-compose up -d --build`
4. Acceder al wizard y configurar el negocio

Los datos de cada cliente se guardan en su propio volumen `pb_data`.

---

## Backup

```bash
# Crear backup
docker cp estetica-backend:/pb/pb_data ./backup_$(date +%Y%m%d)

# Restaurar
docker cp ./backup estetica-backend:/pb/pb_data
docker restart estetica-backend
```

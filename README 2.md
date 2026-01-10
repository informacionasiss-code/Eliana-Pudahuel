# 🏪 Negocio Pudahuel - Sistema de Gestión Integral

Sistema completo de gestión empresarial para el Negocio Pudahuel, desarrollado con tecnologías modernas y diseño profesional.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e.svg)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Base de Datos](#-base-de-datos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Despliegue](#-despliegue)
- [Licencia](#-licencia)

---

## ✨ Características

### 📊 Dashboard Empresarial
- Métricas en tiempo real de ventas, inventario y turnos
- Gráficos interactivos con Recharts
- Vista rápida de productos con bajo stock
- Resumen de ventas por método de pago
- Top productos más vendidos

### 🛒 Sistema POS (Point of Sale)
- Interfaz moderna y táctil
- Búsqueda rápida de productos con autocompletado
- Filtrado por categorías
- Múltiples métodos de pago (Efectivo, Tarjeta, Transferencia, Fiado, Consumo Personal)
- Gestión de cambio automática
- Asociación con clientes para ventas a crédito

### 📦 Gestión de Inventario
- Catálogo completo de productos con tablas responsivas
- Alertas automáticas de stock bajo con badges visuales
- Modal de resumen de productos críticos con métricas detalladas
- Importación/Exportación de productos (Excel y PDF)
- Sistema de categorías dinámico
- Búsqueda y filtrado avanzado
- Badges de estado de stock (Normal, Bajo, Crítico)

### 👥 Gestión de Clientes
- Registro de clientes con límite de crédito
- Sistema de fiado/crédito completo
- Historial de movimientos (cargos y pagos)
- Vista de deuda actual y crédito disponible
- Alertas de límite de crédito

### 💰 Control de Turnos
- Apertura y cierre de turnos por vendedor
- Registro de efectivo inicial
- Seguimiento de ventas en efectivo vs otros métodos
- Resumen detallado al cierre
- Listado de productos vendidos en el turno
- Cálculo automático de totales

### 📈 Reportes y Analytics
- Reportes de ventas por período
- Análisis por método de pago
- Top productos más vendidos
- Ventas por vendedor
- Gráficos de tendencias
- Exportación de reportes

### 🎨 Diseño Profesional
- Interfaz moderna con Mantine UI
- Diseño responsive total (Desktop, Tablet, Móvil)
- Modo oscuro/claro
- Animaciones suaves
- Iconos con Lucide React
- Gradientes y sombras profesionales

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **Mantine UI** - Componentes de interfaz
- **Recharts** - Gráficos interactivos
- **Lucide React** - Iconos modernos
- **Day.js** - Manejo de fechas

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Row Level Security (RLS)** - Seguridad a nivel de fila
- **Realtime Subscriptions** - Actualizaciones en tiempo real

### Herramientas
- **ESLint** - Linter de código
- **Git** - Control de versiones
- **npm** - Gestor de paquetes

---

## 📥 Instalación

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn
- Cuenta de Supabase

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/iag-lol/Eliana-Pudahuel.git
cd Eliana-Pudahuel
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno (opcional)**
Crear archivo `.env` en la raíz:
```env
VITE_SUPABASE_URL=https://tcmtxvuucjttngcazgff.supabase.co
VITE_SUPABASE_ANON_KEY=tu_api_key_aqui
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## ⚙️ Configuración

### Supabase Setup

1. **Crear proyecto en Supabase**
   - Ve a https://supabase.com
   - Crea un nuevo proyecto

2. **Ejecutar el script SQL**
   - Abre el SQL Editor en tu proyecto de Supabase
   - Copia y pega el contenido de `pudahuel_database.sql`
   - Ejecuta el script (Run)

3. **Obtener credenciales**
   - Ve a Project Settings > API
   - Copia la URL y la anon/public key
   - Actualiza `src/lib/supabaseClient.ts` o crea un archivo `.env`

---

## 🗄️ Base de Datos

### Tablas Principales

#### `pudahuel_products`
Catálogo de productos del inventario
- `id`, `name`, `barcode`, `category`
- `cost`, `price`, `stock`, `stock_min`
- Índices en: name, barcode, category, stock bajo

#### `pudahuel_clients`
Clientes con sistema de crédito
- `id`, `name`, `contact`
- `credit_limit`, `balance`
- Índices en: name, balance

#### `pudahuel_shifts`
Turnos de trabajo de vendedores
- `id`, `seller`, `type`
- `cash_initial`, `cash_sales`, `total_sales`
- `is_open`, `opened_at`, `closed_at`

#### `pudahuel_sales`
Registro de todas las ventas
- `id`, `shift_id`, `client_id`
- `total`, `payment_method`
- `items` (JSONB con detalles de productos)

#### `pudahuel_client_movements`
Movimientos de crédito de clientes
- `id`, `client_id`, `sale_id`
- `type` (cargo/pago), `amount`, `notes`

### Vistas

- **`pudahuel_low_stock_products`** - Productos con stock bajo
- **`pudahuel_clients_with_debt`** - Clientes con deuda pendiente
- **`pudahuel_active_shifts`** - Turnos actualmente abiertos

### Funciones

- `pudahuel_update_client_balance()` - Actualizar balance de cliente
- `pudahuel_update_updated_at_column()` - Trigger para timestamps

---

## 📁 Estructura del Proyecto

```
Eliana-Pudahuel/
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts    # Cliente de Supabase
│   ├── data/
│   │   └── fallback.ts          # Datos de respaldo
│   ├── utils/
│   │   └── format.ts            # Utilidades de formato
│   ├── App.tsx                  # Componente principal
│   ├── App.css                  # Estilos globales
│   ├── types.ts                 # Tipos TypeScript
│   └── main.tsx                 # Punto de entrada
├── public/
│   └── favicon.svg              # Ícono de la app
├── pudahuel_database.sql        # Script SQL completo
├── .gitignore                   # Archivos ignorados por Git
├── package.json                 # Dependencias del proyecto
├── tsconfig.json                # Configuración TypeScript
├── vite.config.ts               # Configuración Vite
└── README.md                    # Este archivo
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo

# Build
npm run build        # Compilar para producción

# Preview
npm run preview      # Previsualizar build de producción

# Linting
npm run lint         # Ejecutar ESLint
```

---

## 🚀 Despliegue

### Netlify

1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build command: `npm run build`
4. Publish directory: `dist`

### Vercel

1. Importa el proyecto desde GitHub
2. Configura las variables de entorno
3. Deploy automático

### Otras Plataformas

El proyecto es compatible con cualquier servicio que soporte aplicaciones React estáticas:
- GitHub Pages
- Render
- Railway
- Cloudflare Pages

---

## 📊 Características de Inventario

### Tablas Responsivas
- ✅ Scroll horizontal y vertical automático
- ✅ Headers sticky con fondo primary
- ✅ Scrollbars personalizados con gradiente
- ✅ Indicadores visuales de scroll

### Badges de Estado
- 🟢 **Normal** - Stock saludable
- 🟡 **Bajo** - Stock por debajo del mínimo
- 🔴 **Crítico** - Sin stock (con animación pulse)

### Modal de Bajo Stock
- Grid responsivo de cards
- Métricas detalladas (stock actual, mínimo, déficit)
- Barras de progreso visuales
- Ordenamiento por criticidad
- Botón de ajuste directo de inventario

### Funcionalidades Avanzadas
- Importación masiva desde Excel
- Exportación a Excel y PDF
- Búsqueda en tiempo real
- Filtrado por categoría
- Detección automática de scroll

---

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Validación de datos en frontend y backend
- Sanitización de inputs
- Políticas de acceso configurables
- Credenciales nunca expuestas en el código

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Isaac Ávila**
- GitHub: [@iag-lol](https://github.com/iag-lol)
- Proyecto: [Eliana-Pudahuel](https://github.com/iag-lol/Eliana-Pudahuel)

---

## 📞 Soporte

Si tienes alguna pregunta o problema:
- Abre un [Issue](https://github.com/iag-lol/Eliana-Pudahuel/issues)
- Contacta al autor

---

## 🙏 Agradecimientos

- Mantine UI por los componentes increíbles
- Supabase por el backend poderoso
- Lucide por los iconos modernos
- La comunidad de React y TypeScript

---

<div align="center">
  <strong>Desarrollado con ❤️ para el Negocio Pudahuel</strong>
</div>

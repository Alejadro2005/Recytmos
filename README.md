# EcoEdu - Plataforma de Gestión Ambiental Educativa

## Descripción
EcoEdu es una plataforma digital educativa y gamificada diseñada para gestionar y motivar el reciclaje y compostaje en instituciones educativas. La plataforma combina tecnología, educación ambiental y gamificación para crear un impacto ambiental positivo mientras involucra a los estudiantes en prácticas sostenibles.

## Características Principales

### Para Instituciones Educativas
- Reducción de residuos
- Informes digitales de impacto ambiental
- Certificaciones de "Colegio Verde"
- Gestión eficiente de residuos (reciclaje y compostaje)
- Generación de datos verificables para metas de sostenibilidad

### Para Estudiantes
- Sistema de gamificación con bonificaciones
- Foros comunitarios para compartir logros
- Tips de reciclaje
- Recompensas tangibles

## Segmentos de Clientes
- Instituciones educativas
- Estudiantes (Usuarios Activos)
- Empresas locales
- ONGs ambientales

## Canales de Distribución
- Redes sociales
- Ferias estudiantiles
- Convenios
- Colaboraciones con organizaciones ambientales (ONG)

## Modelo de Negocio

### Fuentes de Ingresos
- Suscripciones anuales
- Publicidad
- Medios digitales

### Estructura de Costos
- Desarrollo tecnológico (app + servidores)
- Marketing
- Recursos Humanos
- Soporte técnico

## Recursos Clave
- Tecnológicos: plataformas, servidores
- Humanos: Equipo de desarrollo, aliados comerciales
- Alianzas: Convenios

## Actividades Clave
- Campañas educativas
- Talleres ambientales
- Capacitaciones
- Ferias estudiantiles

## Socios Clave
- Instituciones educativas
- Empresas de reciclaje
- Gobiernos
- Proveedores de servicios en la nube

## Relaciones con Clientes
- Soporte técnico
- Programa de fidelización
- Comunidad activa
- Foros en la app

## Requisitos Técnicos
- Servidor en la nube
- Plataforma web/móvil
- Base de datos para seguimiento de métricas
- Sistema de autenticación

## Instalación y Configuración

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm (incluido con Node.js)
- Python 3.8 o superior
- Git

### Backend
```bash
# Clonar el repositorio (si aún no lo has hecho)
git clone [URL_DEL_REPOSITORIO]

# Entrar al directorio del backend
cd backend

# Crear y activar entorno virtual (recomendado)
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar el archivo .env con tus configuraciones

# Iniciar el servidor
python app.py
```

### Frontend
```bash
# En una nueva terminal, desde la raíz del proyecto
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar el archivo .env con tus configuraciones

# Iniciar el servidor de desarrollo
npm run dev

# Para producción
npm run build
npm start
```

### Ejecutar ambos servicios (desarrollo)
Para ejecutar tanto el frontend como el backend en modo desarrollo, necesitarás dos terminales:

Terminal 1 (Backend):
```bash
cd backend
# Activar entorno virtual si no está activado
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

python app.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

El backend estará disponible en: http://localhost:5000
El frontend estará disponible en: http://localhost:5173

## Contribución
Para contribuir al proyecto, por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia [TIPO_DE_LICENCIA] - ver el archivo LICENSE.md para más detalles.

## Contacto
[INFORMACIÓN_DE_CONTACTO] 
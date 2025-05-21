# Recytmos

Recytmos es una aplicación web que permite gestionar y visualizar datos de manera eficiente. El proyecto está estructurado en una arquitectura cliente-servidor con un backend en Flask y un frontend moderno.

## Estructura del Proyecto

```
Recytmos/
├── backend/         # Servidor Flask
├── frontend/        # Interfaz de usuario
├── data/           # Datos y recursos
├── .venv/          # Entorno virtual de Python
└── requirements.txt # Dependencias del proyecto
```

## Requisitos Técnicos

### Requisitos del Sistema
- Python 3.8 o superior
- Node.js 16.x o superior
- npm 8.x o superior
- Git
- 4GB RAM mínimo
- 1GB de espacio en disco
- Conexión a internet para dependencias

### Lenguajes de Programación
- **Backend**: Python 3.8+
- **Frontend**: JavaScript/TypeScript
- **HTML5/CSS3** para la interfaz de usuario

### Base de Datos
- SQLite (desarrollo)
- PostgreSQL (producción)
- ORM: SQLAlchemy

### Frameworks y Bibliotecas Principales

#### Backend
- Flask 2.3.2 (Framework web)
- Flask-CORS 3.0.10 (Manejo de CORS)
- Flask-SQLAlchemy 3.0.5 (ORM)
- SQLAlchemy (ORM para base de datos)
- Python-dotenv (Manejo de variables de entorno)
- JWT (Autenticación)

#### Frontend
- React.js (Framework de UI)
- Material-UI (Componentes de interfaz)
- Axios (Cliente HTTP)
- Redux (Gestión de estado)
- React Router (Enrutamiento)
- Chart.js (Visualización de datos)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Alejadro2005/Recytmos.git
cd Recytmos
```

2. Configurar el entorno virtual:
```bash
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

3. Configurar la base de datos:
```bash
# Para desarrollo (SQLite)
flask db init
flask db migrate
flask db upgrade

# Para producción (PostgreSQL)
# Configurar variables de entorno y ejecutar migraciones
```

4. Iniciar la aplicación:
- En Windows: Ejecutar `iniciar_app.bat`
- Manualmente:
  ```bash
  # Terminal 1 (Backend)
  cd backend
  python app.py

  # Terminal 2 (Frontend)
  cd frontend
  npm install
  npm start
  ```

## Tecnologías Utilizadas

### Backend
- Flask 2.3.2
- Flask-CORS 3.0.10
- Flask-SQLAlchemy 3.0.5
- SQLAlchemy
- Python-dotenv
- JWT

### Frontend
- React.js
- Material-UI
- Axios
- Redux
- React Router
- Chart.js

### Base de Datos
- SQLite (desarrollo)
- PostgreSQL (producción)

## Características Principales

- Interfaz de usuario moderna y responsiva
- API RESTful para gestión de datos
- Sistema de autenticación JWT
- Visualización de datos en tiempo real
- Gestión de sesiones de usuario
- Sistema de roles y permisos
- Exportación de datos en múltiples formatos
- Dashboard interactivo
- Búsqueda avanzada y filtros
- Sistema de notificaciones en tiempo real

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Alejandro - [@Alejadro2005](https://github.com/Alejadro2005) 
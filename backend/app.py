from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
import os
from datetime import datetime
from random import randint

app = Flask(__name__)
CORS(app)

# Configuración de SQLite
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.abspath(os.path.join(BASE_DIR, '../data/ecoapp.db'))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelos
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    documento = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'estudiante' o 'encargado'

class Residuo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    documento = db.Column(db.String(20), nullable=False)
    tipo_residuo = db.Column(db.String(20), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

class Bonificacion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    documento = db.Column(db.String(20), nullable=False)
    materia = db.Column(db.String(50), nullable=False)
    bonificacion = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

class Materia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)

class DatoCurioso(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    texto = db.Column(db.String(255), nullable=False)

class Logro(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    estudiante_documento = db.Column(db.String(20), nullable=False)
    descripcion = db.Column(db.String(100), nullable=False)
    medalla = db.Column(db.String(10), nullable=True)  # Ej: 🥇, 🥈, 🥉
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

class Noticia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

class Reporte(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(50), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    responsable = db.Column(db.String(50), nullable=False)

# Agregar código para crear las tablas faltantes al iniciar la aplicación
with app.app_context():
    db.create_all()

with app.app_context():
    # Solo agregar usuarios de prueba si no existen
    if not Usuario.query.filter_by(documento='12345678').first():
        estudiante = Usuario(documento='12345678', password='estudiante', tipo='estudiante')
        db.session.add(estudiante)
    if not Usuario.query.filter_by(documento='99999999').first():
        encargado = Usuario(documento='99999999', password='encargado', tipo='encargado')
        db.session.add(encargado)
    db.session.commit()

# Cargar datos curiosos desde un archivo JSON
with open(os.path.join(BASE_DIR, 'datos_curiosos.json'), 'r', encoding='utf-8') as f:
    datos_curiosos = json.load(f)

# Ejemplo de ranking (puedes cambiarlo por datos reales después)
RANKING = [
    {"nombre": "Estudiante 1", "puntos": 120},
    {"nombre": "Estudiante 2", "puntos": 100},
    {"nombre": "Estudiante 3", "puntos": 80}
]

@app.route('/')
def index():
    return jsonify({"message": "¡Bienvenido a la API de Recytmos!"})

@app.route('/api/datos_curiosos')
def get_datos_curiosos():
    return jsonify(datos_curiosos)

@app.route('/api/ranking')
def get_ranking():
    return jsonify(RANKING)

@app.route('/api/login_estudiante', methods=['POST'])
def login_estudiante():
    data = request.get_json()
    documento = data.get('documento')
    password = data.get('password')
    user = Usuario.query.filter_by(documento=documento, tipo='estudiante').first()
    if user and user.password == password:
        return jsonify({"success": True, "message": "Login exitoso"})
    else:
        return jsonify({"success": False, "message": "Documento o contraseña incorrectos"}), 401

@app.route('/api/depositar_residuo', methods=['POST'])
def depositar_residuo():
    data = request.get_json()
    residuo = Residuo(
        documento=data.get('documento'),
        tipo_residuo=data.get('tipo_residuo'),
        fecha=datetime.fromisoformat(data.get('fecha')) if data.get('fecha') else datetime.utcnow()
    )
    db.session.add(residuo)
    db.session.commit()
    return jsonify({"success": True})

@app.route('/api/aplicar_bonificacion', methods=['POST'])
def aplicar_bonificacion():
    data = request.get_json()
    bonif = Bonificacion(
        documento=data.get('documento'),
        materia=data.get('materia'),
        bonificacion=float(data.get('bonificacion', 0)),
        fecha=datetime.fromisoformat(data.get('fecha')) if data.get('fecha') else datetime.utcnow()
    )
    db.session.add(bonif)
    db.session.commit()
    return jsonify({"success": True})

@app.route('/api/registrar_usuario', methods=['POST'])
def registrar_usuario():
    data = request.get_json()
    documento = data.get('documento')
    password = data.get('password')
    if not documento or not password:
        return jsonify({'success': False, 'message': 'Documento y contraseña requeridos'}), 400
    if Usuario.query.filter_by(documento=documento).first():
        return jsonify({'success': False, 'message': 'El usuario ya existe'}), 400
    nuevo_usuario = Usuario(documento=documento, password=password, tipo='estudiante')
    db.session.add(nuevo_usuario)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Usuario registrado correctamente'})

@app.route('/api/recuperar_password', methods=['POST'])
def recuperar_password():
    data = request.get_json()
    documento = data.get('documento')
    user = Usuario.query.filter_by(documento=documento).first()
    if not user:
        return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404
    nueva_password = f'nueva{randint(1000,9999)}'
    user.password = nueva_password
    db.session.commit()
    return jsonify({'success': True, 'nueva_password': nueva_password})

# --- CRUD Materia ---
@app.route('/api/materias', methods=['GET'])
def listar_materias():
    materias = Materia.query.all()
    return jsonify([{'id': m.id, 'nombre': m.nombre} for m in materias])

@app.route('/api/materias', methods=['POST'])
def crear_materia():
    data = request.get_json()
    nombre = data.get('nombre')
    if not nombre:
        return jsonify({'success': False, 'message': 'Nombre requerido'}), 400
    if Materia.query.filter_by(nombre=nombre).first():
        return jsonify({'success': False, 'message': 'Ya existe'}), 400
    m = Materia(nombre=nombre)
    db.session.add(m)
    db.session.commit()
    return jsonify({'success': True, 'id': m.id})

@app.route('/api/materias/<int:id>', methods=['PUT'])
def editar_materia(id):
    m = Materia.query.get(id)
    if not m:
        return jsonify({'success': False, 'message': 'No encontrada'}), 404
    data = request.get_json()
    m.nombre = data.get('nombre', m.nombre)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/materias/<int:id>', methods=['DELETE'])
def borrar_materia(id):
    m = Materia.query.get(id)
    if not m:
        return jsonify({'success': False, 'message': 'No encontrada'}), 404
    db.session.delete(m)
    db.session.commit()
    return jsonify({'success': True})

# --- CRUD DatoCurioso ---
@app.route('/api/datos_curiosos_db', methods=['GET'])
def listar_datos_curiosos():
    datos = DatoCurioso.query.all()
    return jsonify([{'id': d.id, 'texto': d.texto} for d in datos])

@app.route('/api/datos_curiosos_db', methods=['POST'])
def crear_dato_curioso():
    data = request.get_json()
    texto = data.get('texto')
    if not texto:
        return jsonify({'success': False, 'message': 'Texto requerido'}), 400
    d = DatoCurioso(texto=texto)
    db.session.add(d)
    db.session.commit()
    return jsonify({'success': True, 'id': d.id})

@app.route('/api/datos_curiosos_db/<int:id>', methods=['PUT'])
def editar_dato_curioso(id):
    d = DatoCurioso.query.get(id)
    if not d:
        return jsonify({'success': False, 'message': 'No encontrado'}), 404
    data = request.get_json()
    d.texto = data.get('texto', d.texto)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/datos_curiosos_db/<int:id>', methods=['DELETE'])
def borrar_dato_curioso(id):
    d = DatoCurioso.query.get(id)
    if not d:
        return jsonify({'success': False, 'message': 'No encontrado'}), 404
    db.session.delete(d)
    db.session.commit()
    return jsonify({'success': True})

# --- CRUD Logro ---
@app.route('/api/logros', methods=['GET'])
def listar_logros():
    logros = Logro.query.all()
    return jsonify([{'id': l.id, 'estudiante_documento': l.estudiante_documento, 'descripcion': l.descripcion, 'medalla': l.medalla, 'fecha': l.fecha.isoformat()} for l in logros])

@app.route('/api/logros', methods=['POST'])
def crear_logro():
    data = request.get_json()
    l = Logro(
        estudiante_documento=data.get('estudiante_documento'),
        descripcion=data.get('descripcion'),
        medalla=data.get('medalla'),
        fecha=datetime.fromisoformat(data.get('fecha')) if data.get('fecha') else datetime.utcnow()
    )
    db.session.add(l)
    db.session.commit()
    return jsonify({'success': True, 'id': l.id})

@app.route('/api/logros/<int:id>', methods=['PUT'])
def editar_logro(id):
    l = Logro.query.get(id)
    if not l:
        return jsonify({'success': False, 'message': 'No encontrado'}), 404
    data = request.get_json()
    l.descripcion = data.get('descripcion', l.descripcion)
    l.medalla = data.get('medalla', l.medalla)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/logros/<int:id>', methods=['DELETE'])
def borrar_logro(id):
    l = Logro.query.get(id)
    if not l:
        return jsonify({'success': False, 'message': 'No encontrado'}), 404
    db.session.delete(l)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/logros_estudiante/<documento>', methods=['GET'])
def logros_estudiante(documento):
    logros = Logro.query.filter_by(estudiante_documento=documento).order_by(Logro.fecha.desc()).all()
    return jsonify([
        {
            'id': l.id,
            'descripcion': l.descripcion,
            'medalla': l.medalla,
            'fecha': l.fecha.isoformat()
        } for l in logros
    ])

# --- CRUD Noticia ---
@app.route('/api/noticias', methods=['GET'])
def listar_noticias():
    noticias = Noticia.query.all()
    return jsonify([{'id': n.id, 'titulo': n.titulo, 'contenido': n.contenido, 'fecha': n.fecha.isoformat()} for n in noticias])

@app.route('/api/noticias', methods=['POST'])
def crear_noticia():
    data = request.get_json()
    n = Noticia(
        titulo=data.get('titulo'),
        contenido=data.get('contenido'),
        fecha=datetime.fromisoformat(data.get('fecha')) if data.get('fecha') else datetime.utcnow()
    )
    db.session.add(n)
    db.session.commit()
    return jsonify({'success': True, 'id': n.id})

@app.route('/api/noticias/<int:id>', methods=['PUT'])
def editar_noticia(id):
    n = Noticia.query.get(id)
    if not n:
        return jsonify({'success': False, 'message': 'No encontrada'}), 404
    data = request.get_json()
    n.titulo = data.get('titulo', n.titulo)
    n.contenido = data.get('contenido', n.contenido)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/noticias/<int:id>', methods=['DELETE'])
def borrar_noticia(id):
    n = Noticia.query.get(id)
    if not n:
        return jsonify({'success': False, 'message': 'No encontrada'}), 404
    db.session.delete(n)
    db.session.commit()
    return jsonify({'success': True})

# --- CRUD Reporte ---
@app.route('/api/reportes', methods=['GET'])
def listar_reportes():
    reportes = Reporte.query.all()
    return jsonify([{'id': r.id, 'tipo': r.tipo, 'fecha': r.fecha.isoformat(), 'responsable': r.responsable} for r in reportes])

@app.route('/api/reportes', methods=['POST'])
def crear_reporte():
    data = request.get_json()
    r = Reporte(
        tipo=data.get('tipo'),
        fecha=datetime.fromisoformat(data.get('fecha')) if data.get('fecha') else datetime.utcnow(),
        responsable=data.get('responsable')
    )
    db.session.add(r)
    db.session.commit()
    return jsonify({'success': True, 'id': r.id})

@app.route('/api/reportes/<int:id>', methods=['PUT'])
def editar_reporte(id):
    r = Reporte.query.get(id)
    if not r:
        return jsonify({'success': False, 'message': 'No encontrado'}), 404
    data = request.get_json()
    r.tipo = data.get('tipo', r.tipo)
    r.responsable = data.get('responsable', r.responsable)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/reportes/<int:id>', methods=['DELETE'])
def borrar_reporte(id):
    r = Reporte.query.get(id)
    if not r:
        return jsonify({'success': False, 'message': 'No encontrado'}), 404
    db.session.delete(r)
    db.session.commit()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True) 
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuración de SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecoapp.db'
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

# Inicializar la base de datos si no existe
if not os.path.exists('ecoapp.db'):
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
with open('datos_curiosos.json', 'r', encoding='utf-8') as f:
    datos_curiosos = json.load(f)

# Ejemplo de ranking (puedes cambiarlo por datos reales después)
RANKING = [
    {"nombre": "Estudiante 1", "puntos": 120},
    {"nombre": "Estudiante 2", "puntos": 100},
    {"nombre": "Estudiante 3", "puntos": 80}
]

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

if __name__ == '__main__':
    app.run(debug=True) 
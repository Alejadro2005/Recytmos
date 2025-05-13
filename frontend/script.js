const API_URL = 'http://127.0.0.1:5000/api';

let datosCuriosos = [];
let ranking = [];
let indiceDato = 0;

// Mensajes de concientización
const mensajesConciencia = [
    "Reciclar hoy es salvar el planeta mañana.",
    "Cada residuo cuenta para un mundo mejor.",
    "¡Gracias por cuidar el medio ambiente!",
    "Separar residuos es un acto de amor por la Tierra.",
    "Tus acciones verdes inspiran a otros.",
    "Reciclar es dar una segunda vida a los materiales.",
    "¡Juntos hacemos la diferencia!"
];

// --- LOGIN ---
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const slideContainer = document.getElementById('slide-container');
const mainStudent = document.getElementById('main-student');
const loginError = document.getElementById('login-error');

let bonus = 0.0;
let materias = [
    'Matemáticas', 'Ciencias', 'Lengua', 'Historia', 'Arte', 'Educación Física', 'Tecnología', 'Inglés'
];
let documentoEstudiante = null;

if (loginForm) {
    loginForm.onsubmit = async function(e) {
        e.preventDefault();
        const documento = document.getElementById('documento').value;
        const password = document.getElementById('password').value;
        loginError.textContent = '';
        try {
            const res = await fetch(`${API_URL}/login_estudiante`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documento, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                loginContainer.style.display = 'none';
                mainStudent.style.display = 'flex';
                cargarMaterias();
                actualizarBonus();
                documentoEstudiante = documento;
                // Mostrar nombre del estudiante
                document.getElementById('student-name').textContent = `Estudiante: ${documento}`;
            } else {
                loginError.textContent = data.message || 'Documento o contraseña incorrectos';
            }
        } catch (err) {
            loginError.textContent = 'Error de conexión con el servidor';
        }
    }
}

// --- Lógica pantalla principal estudiante ---
function actualizarBonus() {
    document.getElementById('bonus-counter').textContent = bonus.toFixed(1);
}

function cargarMaterias() {
    const lista = document.getElementById('materias-list');
    lista.innerHTML = '';
    materias.forEach(m => {
        const li = document.createElement('li');
        li.textContent = m;
        li.onclick = () => aplicarBonificacion(m, li);
        lista.appendChild(li);
    });
}

// Menú lateral
const menuIcon = document.getElementById('menu-icon');
const sideMenu = document.getElementById('side-menu');
let menuAbierto = false;
if (menuIcon) {
    menuIcon.onclick = () => {
        menuAbierto = !menuAbierto;
        sideMenu.classList.toggle('open', menuAbierto);
    };
}

const closeMenuBtn = document.getElementById('close-menu-btn');
if (closeMenuBtn) {
    closeMenuBtn.onclick = () => {
        sideMenu.classList.remove('open');
        menuAbierto = false;
    };
}

// Depositar residuo
const residueCards = document.querySelectorAll('.residue-card');
residueCards.forEach(card => {
    card.onclick = () => depositarResiduo(card);
});

function mensajeConcientizacionAleatorio() {
    const idx = Math.floor(Math.random() * mensajesConciencia.length);
    return mensajesConciencia[idx];
}

function depositarResiduo(card) {
    residueCards.forEach(c => c.classList.add('disabled'));
    card.classList.add('selected');
    mostrarOverlay(`Deposite el residuo <br><b>${card.dataset.type}</b> <div class="spinner"></div>`);
    setTimeout(async () => {
        // Enviar al backend (simulado)
        if (documentoEstudiante) {
            await fetch(`${API_URL}/depositar_residuo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documento: documentoEstudiante,
                    tipo_residuo: card.dataset.type,
                    fecha: new Date().toISOString()
                })
            });
        }
        // Mensaje de concientización
        mostrarOverlay(`<span class="check">✔</span><div style='margin-top:12px;font-size:1em;'>${mensajeConcientizacionAleatorio()}</div>`);
        bonus += 0.1;
        actualizarBonus();
        setTimeout(() => {
            ocultarOverlay();
            residueCards.forEach(c => c.classList.remove('disabled', 'selected'));
        }, 1800);
    }, 1500);
}

// Overlay para animaciones y mensajes
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlay-content');
function mostrarOverlay(html) {
    overlayContent.innerHTML = html;
    overlay.style.display = 'flex';
}
function ocultarOverlay() {
    overlay.style.display = 'none';
}

// Aplicar bonificación a materia
function aplicarBonificacion(materia, li) {
    if (bonus <= 0) return;
    // Enviar al backend (simulado)
    if (documentoEstudiante) {
        fetch(`${API_URL}/aplicar_bonificacion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documento: documentoEstudiante,
                materia: materia,
                bonificacion: bonus,
                fecha: new Date().toISOString()
            })
        });
    }
    mostrarOverlay(`Bonificación aplicada a <b>${materia}</b> <span class="check">✔</span>`);
    bonus = 0.0;
    actualizarBonus();
    setTimeout(() => {
        ocultarOverlay();
        sideMenu.classList.remove('open');
        menuAbierto = false;
    }, 1200);
}

// --- SLIDE ---
async function cargarDatosCuriosos() {
    const res = await fetch(`${API_URL}/datos_curiosos`);
    datosCuriosos = await res.json();
    mostrarDatoCurioso();
}

async function cargarRanking() {
    const res = await fetch(`${API_URL}/ranking`);
    ranking = await res.json();
    mostrarRanking();
}

function mostrarDatoCurioso() {
    const contenedor = document.getElementById('datos-curiosos');
    if (datosCuriosos.length > 0) {
        contenedor.textContent = datosCuriosos[indiceDato].texto;
    } else {
        contenedor.textContent = 'Cargando...';
    }
}

function mostrarRanking() {
    const contenedor = document.getElementById('ranking');
    if (ranking.length > 0) {
        let html = '<ul>';
        ranking.forEach((item, idx) => {
            html += `<li>${idx + 1}. ${item.nombre} - ${item.puntos} pts</li>`;
        });
        html += '</ul>';
        contenedor.innerHTML = html;
    } else {
        contenedor.textContent = 'Cargando...';
    }
}

function siguienteDato() {
    if (datosCuriosos.length > 0) {
        indiceDato = (indiceDato + 1) % datosCuriosos.length;
        mostrarDatoCurioso();
    }
}

function anteriorDato() {
    if (datosCuriosos.length > 0) {
        indiceDato = (indiceDato - 1 + datosCuriosos.length) % datosCuriosos.length;
        mostrarDatoCurioso();
    }
}

if (document.getElementById('next'))
    document.getElementById('next').onclick = siguienteDato;
if (document.getElementById('next-bottom'))
    document.getElementById('next-bottom').onclick = siguienteDato;
if (document.getElementById('prev'))
    document.getElementById('prev').onclick = anteriorDato;

// Cambiar automáticamente cada 5 segundos
setInterval(siguienteDato, 5000);

// Inicializar
cargarDatosCuriosos();
cargarRanking();

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        mainStudent.style.display = 'none';
        loginContainer.style.display = 'flex';
        document.getElementById('student-name').textContent = '';
        document.getElementById('bonus-counter').textContent = '0.0';
        bonus = 0.0;
        documentoEstudiante = null;
        // Limpiar campos de login
        document.getElementById('documento').value = '';
        document.getElementById('password').value = '';
    };
} 
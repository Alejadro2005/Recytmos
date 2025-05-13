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
let bonificaciones = [
    // Ejemplo inicial
    { estudiante: '1001', materia: 'Matemáticas', bonificacion: 0.5, fecha: '2025-06-01 10:30' },
    { estudiante: '1002', materia: 'Ciencias', bonificacion: 0.3, fecha: '2025-06-01 11:00' }
];
let documentoEstudiante = null;

if (loginForm) {
    loginForm.onsubmit = async function(e) {
        e.preventDefault();
        const documento = document.getElementById('documento').value;
        const password = document.getElementById('password').value;
        loginError.textContent = '';
        // Credenciales fijas para admin
        if (documento === 'admin' && password === 'admin123') {
            loginContainer.style.display = 'none';
            document.getElementById('main-admin').style.display = 'flex';
            document.getElementById('main-student').style.display = 'none';
            document.getElementById('admin-name').textContent = 'Administrador';
            return;
        }
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
                document.getElementById('main-admin').style.display = 'none';
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
        // Guardar registro local para el informe admin
        bonificaciones.push({
            estudiante: documentoEstudiante,
            materia: materia,
            bonificacion: bonus,
            fecha: new Date().toLocaleString()
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

// Cerrar sesión admin
const logoutBtnAdmin = document.getElementById('logout-btn-admin');
if (logoutBtnAdmin) {
    logoutBtnAdmin.onclick = () => {
        document.getElementById('main-admin').style.display = 'none';
        loginContainer.style.display = 'flex';
        document.getElementById('admin-name').textContent = '';
        // Limpiar campos de login
        document.getElementById('documento').value = '';
        document.getElementById('password').value = '';
    };
}

// --- GESTIÓN DE MATERIAS Y BONIFICACIONES (ADMIN) ---
// Abrir modal de materias
const btnAsignarMaterias = document.getElementById('btn-asignar-materias');
if (btnAsignarMaterias) {
    btnAsignarMaterias.onclick = () => {
        renderMateriasAdmin();
        document.getElementById('modal-materias').style.display = 'flex';
    };
}
// Cerrar modal materias
const cerrarModalMaterias = document.getElementById('cerrar-modal-materias');
if (cerrarModalMaterias) {
    cerrarModalMaterias.onclick = () => {
        document.getElementById('modal-materias').style.display = 'none';
    };
}
// Renderizar lista de materias en admin
function renderMateriasAdmin() {
    const ul = document.getElementById('lista-materias-admin');
    ul.innerHTML = '';
    materias.forEach((m, idx) => {
        const li = document.createElement('li');
        li.textContent = m;
        const btnDel = document.createElement('button');
        btnDel.textContent = 'Eliminar';
        btnDel.onclick = () => {
            materias.splice(idx, 1);
            renderMateriasAdmin();
            cargarMaterias(); // Actualiza menú estudiante
        };
        li.appendChild(btnDel);
        ul.appendChild(li);
    });
}
// Agregar materia
const btnAgregarMateria = document.getElementById('agregar-materia');
if (btnAgregarMateria) {
    btnAgregarMateria.onclick = () => {
        const input = document.getElementById('nueva-materia');
        const val = input.value.trim();
        if (val && !materias.includes(val)) {
            materias.push(val);
            input.value = '';
            renderMateriasAdmin();
            cargarMaterias(); // Actualiza menú estudiante
        }
    };
}

// --- REGISTRO Y REPORTE DE BONIFICACIONES ---
// Abrir modal de bonificaciones
const btnInformes = document.getElementById('btn-informes');
if (btnInformes) {
    btnInformes.onclick = () => {
        renderTablaBonificaciones();
        document.getElementById('modal-bonificaciones').style.display = 'flex';
    };
}
// Cerrar modal bonificaciones
const cerrarModalBonificaciones = document.getElementById('cerrar-modal-bonificaciones');
if (cerrarModalBonificaciones) {
    cerrarModalBonificaciones.onclick = () => {
        document.getElementById('modal-bonificaciones').style.display = 'none';
    };
}
// Renderizar tabla de bonificaciones
function renderTablaBonificaciones() {
    const tbody = document.querySelector('#tabla-bonificaciones tbody');
    tbody.innerHTML = '';
    bonificaciones.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${b.estudiante}</td><td>${b.materia}</td><td>${b.bonificacion}</td><td>${b.fecha}</td>`;
        tbody.appendChild(tr);
    });
}
// Descargar CSV
const btnDescargarInforme = document.getElementById('descargar-informe');
if (btnDescargarInforme) {
    btnDescargarInforme.onclick = () => {
        let csv = 'Estudiante,Materia,Bonificación,Fecha\n';
        bonificaciones.forEach(b => {
            csv += `${b.estudiante},${b.materia},${b.bonificacion},${b.fecha}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'informe_bonificaciones.csv';
        a.click();
        URL.revokeObjectURL(url);
    };
}

// --- MODALES DE LOS DEMÁS BOTONES ADMIN ---
const btnInfoAmbiental = document.getElementById('btn-info-ambiental');
if (btnInfoAmbiental) btnInfoAmbiental.onclick = () => {
    document.getElementById('modal-info-ambiental').style.display = 'flex';
    setTimeout(dibujarGraficoResiduos, 100);
};
document.getElementById('volver-info-ambiental').onclick = () => {
    document.getElementById('modal-info-ambiental').style.display = 'none';
};

const btnLogros = document.getElementById('btn-logros');
if (btnLogros) btnLogros.onclick = () => {
    document.getElementById('modal-logros').style.display = 'flex';
};
document.getElementById('volver-logros').onclick = () => {
    document.getElementById('modal-logros').style.display = 'none';
};

const btnNoticias = document.getElementById('btn-noticias');
if (btnNoticias) btnNoticias.onclick = () => {
    document.getElementById('modal-noticias').style.display = 'flex';
};
document.getElementById('volver-noticias').onclick = () => {
    document.getElementById('modal-noticias').style.display = 'none';
};

const btnTop = document.getElementById('btn-top');
if (btnTop) btnTop.onclick = () => {
    document.getElementById('modal-top').style.display = 'flex';
    setTimeout(dibujarGraficoTop, 100);
};
document.getElementById('volver-top').onclick = () => {
    document.getElementById('modal-top').style.display = 'none';
};

const btnReportes = document.getElementById('btn-reportes');
if (btnReportes) btnReportes.onclick = () => {
    document.getElementById('modal-reportes').style.display = 'flex';
};
document.getElementById('volver-reportes').onclick = () => {
    document.getElementById('modal-reportes').style.display = 'none';
};

// --- GRÁFICOS DE EJEMPLO EN MODALES ---
function dibujarGraficoResiduos() {
    const canvas = document.getElementById('grafico-residuos');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Datos de ejemplo
    const datos = [120, 80, 60, 150];
    const colores = ['#c7e6ff','#ffe066','#c7ffd6','#ffe7a0'];
    const etiquetas = ['Papel','Plástico','Vidrio','Orgánico'];
    const max = Math.max(...datos);
    for(let i=0;i<datos.length;i++){
        ctx.fillStyle = colores[i];
        ctx.fillRect(40+i*65, canvas.height-30-datos[i]/max*120, 40, datos[i]/max*120);
        ctx.fillStyle = '#222';
        ctx.fillText(etiquetas[i], 40+i*65, canvas.height-10);
        ctx.fillText(datos[i]+'kg', 40+i*65, canvas.height-35-datos[i]/max*120);
    }
}
function dibujarGraficoTop() {
    const canvas = document.getElementById('grafico-top');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Datos de ejemplo
    const datos = [100,80,60,40,30];
    const nombres = ['Ana','Luis','María','Pedro','Lucía'];
    const colores = ['#4caf50','#388e3c','#b2e6b2','#ffe066','#c7e6ff'];
    const max = Math.max(...datos);
    for(let i=0;i<datos.length;i++){
        ctx.fillStyle = colores[i];
        ctx.fillRect(40+i*50, canvas.height-30-datos[i]/max*120, 32, datos[i]/max*120);
        ctx.fillStyle = '#222';
        ctx.fillText(nombres[i], 40+i*50, canvas.height-10);
        ctx.fillText(datos[i]+'kg', 40+i*50, canvas.height-35-datos[i]/max*120);
    }
}
// --- DESCARGA DE REPORTE DE EJEMPLO ---
const btnDescargarReporteEjemplo = document.getElementById('descargar-reporte-ejemplo');
if (btnDescargarReporteEjemplo) {
    btnDescargarReporteEjemplo.onclick = () => {
        let csv = 'Tipo,Fecha,Responsable\nSemanal,2025-06-01,Admin\nMensual,2025-05-31,Admin\n';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_ejemplo.csv';
        a.click();
        URL.revokeObjectURL(url);
    };
}

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